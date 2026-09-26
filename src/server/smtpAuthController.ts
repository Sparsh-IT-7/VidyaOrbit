import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// --- Types & Data Structures ---

export interface StoredStudentUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: string;
  status: 'active' | 'suspended';
  emailVerified: boolean;
  streakDays: number;
  createdAt: number;
  verifiedAt?: number;
}

export interface AuthTokenRecord {
  tokenHash: string;
  userId: string;
  email: string;
  type: 'verify_email' | 'reset_password';
  createdAt: number;
  expiresAt: number;
  usedAt?: number;
  failedAttempts: number;
}

export interface DispatchedEmailPreview {
  id: string;
  to: string;
  from: string;
  subject: string;
  type: 'verify_email' | 'reset_password';
  sentAt: string;
  deliveryMode: 'smtp' | 'fallback_outbox';
}

// --- Configuration Constants ---

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes validity for 6-digit OTP
const RESET_OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes validity for password reset OTP
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown between OTP resends
const MAX_OTP_ATTEMPTS = 5; // Maximum wrong OTP attempts before invalidation
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DATA_FILE_PATH = path.resolve(process.cwd(), '.vidyaorbit-auth-store.json');

// Rate limiting window (per IP + endpoint)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS_PER_MINUTE = 25;

// --- Cryptographic Helpers ---

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'vidyaorbit_secure_jwt_hmac_secret_2026';
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, usedSalt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt: usedSalt,
  };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  try {
    const { hash } = hashPassword(password, storedSalt);
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch {
    return false;
  }
}

export function generateSecureSixDigitOtp(): { rawOtp: string; tokenHash: string } {
  // Secure random 6-digit integer between 100000 and 999999 inclusive
  const otpNumber = crypto.randomInt(100000, 1000000);
  const rawOtp = otpNumber.toString();
  const tokenHash = hashRawToken(rawOtp);
  return { rawOtp, tokenHash };
}

export function hashRawToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

export function verifyTokenHashMatch(candidateRaw: string, storedHashHex: string): boolean {
  try {
    const candidateHash = hashRawToken(candidateRaw);
    const bufA = Buffer.from(candidateHash, 'hex');
    const bufB = Buffer.from(storedHashHex, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function signJwtToken(payload: {
  sub: string;
  email: string;
  name: string;
  role: string;
}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Date.now();
  const bodyPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_MS,
    jti: crypto.randomBytes(12).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(bodyPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJwtToken(token: string): {
  valid: boolean;
  payload?: {
    sub: string;
    email: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
    jti: string;
  };
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [header, body, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false };
    }

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (!decoded.exp || Date.now() > decoded.exp) {
      return { valid: false };
    }
    if (revokedTokens.has(token)) {
      return { valid: false };
    }
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false };
  }
}

// --- Persistent Store & In-Memory State ---

interface PersistedAuthData {
  users: StoredStudentUser[];
  tokens: AuthTokenRecord[];
}

const revokedTokens = new Set<string>();
const dispatchedOutbox: DispatchedEmailPreview[] = [];
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const resendCooldownMap = new Map<string, number>();

function createDefaultUsers(): StoredStudentUser[] {
  const demoCreds = hashPassword('Password123!');
  return [
    {
      id: 'usr_alex_01',
      name: 'Alex Chen',
      email: 'alex.chen@cityuniversity.edu',
      passwordHash: demoCreds.hash,
      passwordSalt: demoCreds.salt,
      role: 'VidyaOrbit Learner',
      status: 'active',
      emailVerified: true,
      streakDays: 14,
      createdAt: Date.now() - 14 * 86400000,
      verifiedAt: Date.now() - 14 * 86400000,
    },
  ];
}

function loadStore(): PersistedAuthData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as PersistedAuthData;
      if (Array.isArray(parsed.users) && Array.isArray(parsed.tokens)) {
        return {
          users: parsed.users,
          tokens: parsed.tokens.map((t) => ({
            ...t,
            failedAttempts: typeof t.failedAttempts === 'number' ? t.failedAttempts : 0,
          })),
        };
      }
    }
  } catch (err) {
    console.warn('Could not read auth store file, initializing default store:', err);
  }
  const initial: PersistedAuthData = {
    users: createDefaultUsers(),
    tokens: [],
  };
  saveStore(initial);
  return initial;
}

function saveStore(data: PersistedAuthData): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist auth store file:', err);
  }
}

const authStore = loadStore();

// --- Gmail SMTP Email Service ---

function isSmtpConfigured(): boolean {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const user = (process.env.SMTP_USERNAME || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();
  return Boolean(
    host &&
      user &&
      pass &&
      user !== 'your-email@gmail.com' &&
      pass !== 'your-gmail-app-password'
  );
}

function getFormattedFromAddress(): string {
  const rawFrom = (process.env.SMTP_FROM || process.env.SMTP_USERNAME || 'no-reply@vidyaorbit.edu').trim();
  if (rawFrom.includes('<') && rawFrom.includes('>')) {
    return rawFrom.replace(/Vaani(\s+AI)?/gi, 'VidyaOrbit');
  }
  return `VidyaOrbit <${rawFrom}>`;
}

function sanitizeDisplayText(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

function buildOtpVerificationEmailPlain(userName: string, otpCode: string): string {
  const safeName = sanitizeDisplayText(userName || 'Student');
  return `Hello ${safeName},

Thank you for registering with VidyaOrbit.

Use the verification code below to verify your email address and activate your account:

${otpCode}

This code will expire in 5 minutes.

If you did not request this verification code, please ignore this email.

— Team VidyaOrbit`;
}

function buildOtpVerificationEmailHtml(userName: string, otpCode: string): string {
  const safeName = sanitizeDisplayText(userName || 'Student');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;border:1px solid #e2e8f0;border-radius:14px;background:#FFFFFF;color:#0F172A;">
  <div style="text-align:center;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #f1f5f9;">
    <div style="display:inline-block;padding:4px 12px;border-radius:6px;background:#FBF7E8;border:1px solid #D4AF37;color:#0F172A;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-bottom:8px;">
      VIDYAORBIT
    </div>
    <h1 style="color:#0F172A;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px;">VIDYAORBIT</h1>
    <p style="color:#64748B;font-size:13px;margin:4px 0 0;font-weight:500;">Engineering Learning Platform</p>
  </div>
  <p style="color:#0F172A;font-size:15px;line-height:1.6;margin:0 0 12px;">Hello <b>${safeName}</b>,</p>
  <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 24px;">Thank you for registering with VidyaOrbit. Use the verification code below to verify your email address and activate your account:</p>
  <div style="text-align:center;margin:28px 0;">
    <div style="display:inline-block;background:#FBF7E8;padding:18px 32px;border-radius:12px;border:2px dashed #D4AF37;">
      <div style="letter-spacing:10px;font-size:32px;font-weight:800;color:#0F172A;font-family:monospace;">${otpCode}</div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#B59024;margin-top:6px;">Verification Code</div>
    </div>
  </div>
  <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 10px;text-align:center;">This code expires in <b>5 minutes</b>.</p>
  <p style="color:#64748B;font-size:12px;line-height:1.5;margin:0;text-align:center;">If you did not request this verification code, please ignore this email.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;" />
  <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;font-weight:600;">&copy; VidyaOrbit</p>
</div>`;
}

function buildPasswordResetOtpEmailPlain(userName: string, otpCode: string): string {
  const safeName = sanitizeDisplayText(userName || 'Student');
  return `Hello ${safeName},

We received a request to reset your VidyaOrbit student password.

Use the verification code below to reset your password:

${otpCode}

This code will expire in 5 minutes.

If you did not request a password reset, please ignore this email.

— Team VidyaOrbit`;
}

function buildPasswordResetOtpEmailHtml(userName: string, otpCode: string): string {
  const safeName = sanitizeDisplayText(userName || 'Student');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;border:1px solid #e2e8f0;border-radius:14px;background:#FFFFFF;color:#0F172A;">
  <div style="text-align:center;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #f1f5f9;">
    <div style="display:inline-block;padding:4px 12px;border-radius:6px;background:#FBF7E8;border:1px solid #D4AF37;color:#0F172A;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-bottom:8px;">
      VIDYAORBIT
    </div>
    <h1 style="color:#0F172A;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px;">VIDYAORBIT</h1>
    <p style="color:#64748B;font-size:13px;margin:4px 0 0;font-weight:500;">Engineering Learning Platform</p>
  </div>
  <p style="color:#0F172A;font-size:15px;line-height:1.6;margin:0 0 12px;">Hello <b>${safeName}</b>,</p>
  <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 24px;">We received a request to reset your VidyaOrbit password. Enter the 6-digit password reset code below to set a new password:</p>
  <div style="text-align:center;margin:28px 0;">
    <div style="display:inline-block;background:#FBF7E8;padding:18px 32px;border-radius:12px;border:2px dashed #D4AF37;">
      <div style="letter-spacing:10px;font-size:32px;font-weight:800;color:#0F172A;font-family:monospace;">${otpCode}</div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#B59024;margin-top:6px;">Password Reset Code</div>
    </div>
  </div>
  <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 10px;text-align:center;">This code expires in <b>5 minutes</b>.</p>
  <p style="color:#64748B;font-size:12px;line-height:1.5;margin:0;text-align:center;">If you did not request a password reset, please ignore this email.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;" />
  <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;font-weight:600;">&copy; VidyaOrbit</p>
</div>`;
}

async function sendSmtpEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: 'verify_email' | 'reset_password';
}): Promise<{ delivered: boolean; mode: 'smtp' | 'fallback_outbox'; error?: string }> {
  const fromAddress = getFormattedFromAddress();

  const recordOutbox = (mode: 'smtp' | 'fallback_outbox') => {
    dispatchedOutbox.unshift({
      id: 'mail_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      to: options.to,
      from: fromAddress,
      subject: options.subject,
      type: options.type,
      sentAt: new Date().toISOString(),
      deliveryMode: mode,
    });
    if (dispatchedOutbox.length > 50) {
      dispatchedOutbox.pop();
    }
  };

  if (!isSmtpConfigured()) {
    return {
      delivered: false,
      mode: 'smtp',
      error: 'Unable to send verification email. Please try again.',
    };
  }

  try {
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT || '465');
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USERNAME!.trim(),
        pass: process.env.SMTP_PASSWORD!.trim(),
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    recordOutbox('smtp');
    return { delivered: true, mode: 'smtp' };
  } catch (err: any) {
    console.error('Gmail SMTP email dispatch error:', err?.message || err);
    return {
      delivered: false,
      mode: 'smtp',
      error: 'Unable to send verification email. Please try again.',
    };
  }
}

// --- Validation Helpers ---

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

function checkResendCooldown(email: string): number {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const nextAllowedAt = resendCooldownMap.get(key) || 0;
  if (now < nextAllowedAt) {
    return Math.ceil((nextAllowedAt - now) / 1000);
  }
  return 0;
}

function setResendCooldown(email: string): void {
  const key = email.trim().toLowerCase();
  resendCooldownMap.set(key, Date.now() + RESEND_COOLDOWN_MS);
}

// --- Rate Limiting Middleware ---

function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'local';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > MAX_AUTH_REQUESTS_PER_MINUTE) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    });
  }

  return next();
}

// --- Route Protection Middleware ---

export function requireAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.slice(7).trim();
  const verification = verifyJwtToken(token);
  if (!verification.valid || !verification.payload) {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }

  const user = authStore.users.find((u) => u.id === verification.payload!.sub);
  if (!user || user.status !== 'active') {
    return res.status(403).json({ error: 'Student account is not active.' });
  }

  (req as any).authenticatedUser = user;
  (req as any).rawToken = token;
  return next();
}

// --- Register Auth Routes on Express App ---

export function registerSmtpAuthRoutes(app: express.Application): void {
  // 1. POST /api/auth/register
  app.post('/api/auth/register', rateLimitAuth, async (req: Request, res: Response) => {
    try {
      const { name, email, password, confirmPassword } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      };

      const cleanName = sanitizeDisplayText(name || '');
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ error: 'Please enter your full name.' });
      }

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid student email address.' });
      }

      const passwordError = validatePasswordStrength(password || '');
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const existingUser = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existingUser && existingUser.emailVerified) {
        return res.status(409).json({
          error: 'An account with this email already exists. Please log in or reset your password.',
        });
      }

      const now = Date.now();
      const { hash, salt } = hashPassword(password!);

      let targetUser: StoredStudentUser;
      if (existingUser && !existingUser.emailVerified) {
        // Update unverified student account details & issue a fresh OTP
        existingUser.name = cleanName;
        existingUser.passwordHash = hash;
        existingUser.passwordSalt = salt;
        targetUser = existingUser;

        // Invalidate previous OTPs for this user
        authStore.tokens.forEach((t) => {
          if (t.userId === targetUser.id && t.type === 'verify_email' && !t.usedAt) {
            t.usedAt = now;
          }
        });
      } else {
        targetUser = {
          id: 'usr_' + now + '_' + crypto.randomBytes(3).toString('hex'),
          name: cleanName,
          email: cleanEmail,
          passwordHash: hash,
          passwordSalt: salt,
          role: 'VidyaOrbit Learner',
          status: 'active',
          emailVerified: false,
          streakDays: 1,
          createdAt: now,
        };
        authStore.users.push(targetUser);
      }

      // Generate secure 6-digit OTP
      const { rawOtp, tokenHash } = generateSecureSixDigitOtp();
      const tokenRecord: AuthTokenRecord = {
        tokenHash,
        userId: targetUser.id,
        email: targetUser.email,
        type: 'verify_email',
        createdAt: now,
        expiresAt: now + OTP_TTL_MS,
        failedAttempts: 0,
      };

      authStore.tokens.push(tokenRecord);
      saveStore(authStore);

      const emailResult = await sendSmtpEmail({
        to: targetUser.email,
        subject: `Your VidyaOrbit Verification Passcode: ${rawOtp}`,
        html: buildOtpVerificationEmailHtml(targetUser.name, rawOtp),
        text: buildOtpVerificationEmailPlain(targetUser.name, rawOtp),
        type: 'verify_email',
      });

      if (!emailResult.delivered) {
        return res.status(502).json({
          error: 'Unable to send verification email. Please try again.',
          email: targetUser.email,
          requiresVerification: true,
        });
      }

      setResendCooldown(targetUser.email);

      return res.status(201).json({
        message: 'We sent a 6-digit verification code to your email. Your verification code expires in 5 minutes.',
        email: targetUser.email,
        requiresVerification: true,
        deliveryMode: emailResult.mode,
        expiresInSeconds: 300,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/register:', error);
      return res.status(500).json({
        error: 'Unable to complete registration right now. Please try again.',
      });
    }
  });

  // 2. POST /api/auth/login
  app.post('/api/auth/login', rateLimitAuth, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Please enter your password.' });
      }

      const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
        return res.status(401).json({ error: 'Incorrect email or password.' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          error: 'Your student account is currently suspended. Please contact support.',
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          error: 'Please verify your email with your 6-digit verification code before logging in.',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
        });
      }

      const token = signJwtToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(200).json({
        message: 'Logged in successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          streakDays: user.streakDays,
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      console.error('Error in POST /api/auth/login:', error);
      return res.status(500).json({
        error: 'Login service is temporarily unavailable. Please try again.',
      });
    }
  });

  // 3. POST /api/auth/verify-otp (and /api/auth/verify-email alias)
  const handleVerifyOtp = (req: Request, res: Response) => {
    try {
      const { email, otp, token } = req.body as {
        email?: string;
        otp?: string;
        token?: string;
      };

      const cleanEmail = (email || '').trim().toLowerCase();
      const rawCode = (otp || token || '').trim().replace(/\s+/g, '');

      if (!rawCode || !/^\d{6}$/.test(rawCode)) {
        return res.status(400).json({
          error: 'Incorrect verification code. Please enter the 6-digit code sent to your email.',
          code: 'INVALID_OTP',
        });
      }

      // 1. Verify student exists
      const user = cleanEmail
        ? authStore.users.find((u) => u.email.toLowerCase() === cleanEmail)
        : authStore.users.find((u) =>
            authStore.tokens.some(
              (t) =>
                t.userId === u.id &&
                t.type === 'verify_email' &&
                !t.usedAt &&
                verifyTokenHashMatch(rawCode, t.tokenHash)
            )
          );

      if (!user) {
        return res.status(400).json({
          error: 'Incorrect verification code. Please try again.',
          code: 'INVALID_OTP',
        });
      }

      if (user.emailVerified) {
        const sessionJwt = signJwtToken({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
        return res.status(200).json({
          message: 'Email verified successfully.',
          alreadyVerified: true,
          verified: true,
          email: user.email,
          token: sessionJwt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            streakDays: user.streakDays,
            emailVerified: true,
          },
        });
      }

      // 2. Find latest active OTP record belonging to this student
      const userOtpRecords = authStore.tokens
        .filter((t) => t.userId === user.id && t.type === 'verify_email')
        .sort((a, b) => b.createdAt - a.createdAt);

      const latestRecord = userOtpRecords[0];
      if (!latestRecord) {
        return res.status(400).json({
          error: 'No active verification code found. Please request a new code.',
          code: 'NO_OTP',
          email: user.email,
        });
      }

      // 3. Check if already used
      if (latestRecord.usedAt) {
        return res.status(400).json({
          error: 'Your verification code has expired or already been used. Please request a new code.',
          code: 'USED_OTP',
          email: user.email,
        });
      }

      // 4. Check if expired (5 minutes)
      if (Date.now() > latestRecord.expiresAt) {
        latestRecord.usedAt = Date.now();
        saveStore(authStore);
        return res.status(400).json({
          error: 'Your verification code has expired. Please request a new code.',
          code: 'EXPIRED_OTP',
          email: user.email,
        });
      }

      // 5. Check if too many incorrect attempts
      if (latestRecord.failedAttempts >= MAX_OTP_ATTEMPTS) {
        latestRecord.usedAt = Date.now();
        saveStore(authStore);
        return res.status(429).json({
          error: 'Too many incorrect attempts. Please request a new verification code.',
          code: 'TOO_MANY_ATTEMPTS',
          email: user.email,
        });
      }

      // 6. Verify OTP hash matches
      const matches = verifyTokenHashMatch(rawCode, latestRecord.tokenHash);
      if (!matches) {
        latestRecord.failedAttempts += 1;
        const remaining = MAX_OTP_ATTEMPTS - latestRecord.failedAttempts;
        if (remaining <= 0) {
          latestRecord.usedAt = Date.now();
          saveStore(authStore);
          return res.status(429).json({
            error: 'Too many incorrect attempts. Your code has been locked. Please request a new code.',
            code: 'TOO_MANY_ATTEMPTS',
            email: user.email,
          });
        }
        saveStore(authStore);
        return res.status(400).json({
          error: 'Incorrect verification code. Please try again.',
          code: 'INVALID_OTP',
          email: user.email,
        });
      }

      // Success: mark email verified, invalidate OTP, activate account
      latestRecord.usedAt = Date.now();
      user.emailVerified = true;
      user.verifiedAt = Date.now();
      user.status = 'active';
      saveStore(authStore);

      const sessionJwt = signJwtToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(200).json({
        message: 'Email verified successfully.',
        verified: true,
        email: user.email,
        token: sessionJwt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          streakDays: user.streakDays,
          emailVerified: true,
        },
      });
    } catch (error) {
      console.error('Error in POST /api/auth/verify-otp:', error);
      return res.status(500).json({
        error: 'Could not verify your code right now. Please try again.',
      });
    }
  };

  app.post('/api/auth/verify-otp', rateLimitAuth, handleVerifyOtp);
  app.post('/api/auth/verify-email', rateLimitAuth, handleVerifyOtp);

  // 4. POST /api/auth/resend-otp (and /api/auth/resend-verification alias)
  const handleResendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const cooldownSeconds = checkResendCooldown(cleanEmail);
      if (cooldownSeconds > 0) {
        return res.status(429).json({
          error: `You can request another code in ${cooldownSeconds} seconds.`,
          retryAfterSeconds: cooldownSeconds,
        });
      }

      const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        setResendCooldown(cleanEmail);
        return res.status(200).json({
          message: 'If an unverified account exists for this email, a new 6-digit verification code has been sent.',
          retryAfterSeconds: 30,
        });
      }

      if (user.emailVerified) {
        return res.status(200).json({
          message: 'Your email is already verified. You can log in now.',
          alreadyVerified: true,
        });
      }

      // Invalidate any previous unused OTPs for this user
      const now = Date.now();
      authStore.tokens.forEach((t) => {
        if (t.userId === user.id && t.type === 'verify_email' && !t.usedAt) {
          t.usedAt = now;
        }
      });

      // Generate new 6-digit OTP & reset 5-minute expiration
      const { rawOtp, tokenHash } = generateSecureSixDigitOtp();
      authStore.tokens.push({
        tokenHash,
        userId: user.id,
        email: user.email,
        type: 'verify_email',
        createdAt: now,
        expiresAt: now + OTP_TTL_MS,
        failedAttempts: 0,
      });
      saveStore(authStore);

      const emailResult = await sendSmtpEmail({
        to: user.email,
        subject: `Your VidyaOrbit Verification Passcode: ${rawOtp}`,
        html: buildOtpVerificationEmailHtml(user.name, rawOtp),
        text: buildOtpVerificationEmailPlain(user.name, rawOtp),
        type: 'verify_email',
      });

      if (!emailResult.delivered) {
        return res.status(502).json({
          error: 'Unable to send verification email. Please try again.',
        });
      }

      setResendCooldown(cleanEmail);

      return res.status(200).json({
        message: 'A new 6-digit verification code has been sent to your email. It expires in 5 minutes.',
        deliveryMode: emailResult.mode,
        retryAfterSeconds: 30,
        expiresInSeconds: 300,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/resend-otp:', error);
      return res.status(500).json({
        error: 'Unable to send verification email. Please try again.',
      });
    }
  };

  app.post('/api/auth/resend-otp', rateLimitAuth, handleResendOtp);
  app.post('/api/auth/resend-verification', rateLimitAuth, handleResendOtp);

  // 5. POST /api/auth/forgot-password
  app.post('/api/auth/forgot-password', rateLimitAuth, async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const genericSuccessMessage =
        'If an account exists for this email, a password reset message has been sent.';

      const cooldownSeconds = checkResendCooldown(`reset:${cleanEmail}`);
      if (cooldownSeconds > 0) {
        return res.status(429).json({
          error: `You can request another code in ${cooldownSeconds} seconds.`,
          retryAfterSeconds: cooldownSeconds,
        });
      }

      const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        setResendCooldown(`reset:${cleanEmail}`);
        return res.status(200).json({
          message: genericSuccessMessage,
        });
      }

      // Invalidate older unused password reset OTPs for this user
      const now = Date.now();
      authStore.tokens.forEach((t) => {
        if (t.userId === user.id && t.type === 'reset_password' && !t.usedAt) {
          t.usedAt = now;
        }
      });

      const { rawOtp, tokenHash } = generateSecureSixDigitOtp();
      authStore.tokens.push({
        tokenHash,
        userId: user.id,
        email: user.email,
        type: 'reset_password',
        createdAt: now,
        expiresAt: now + RESET_OTP_TTL_MS,
        failedAttempts: 0,
      });
      saveStore(authStore);

      const emailResult = await sendSmtpEmail({
        to: user.email,
        subject: `Your VidyaOrbit Password Reset Code: ${rawOtp}`,
        html: buildPasswordResetOtpEmailHtml(user.name, rawOtp),
        text: buildPasswordResetOtpEmailPlain(user.name, rawOtp),
        type: 'reset_password',
      });

      if (!emailResult.delivered) {
        return res.status(502).json({
          error: 'Unable to send password reset email. Please try again.',
        });
      }

      setResendCooldown(`reset:${cleanEmail}`);

      return res.status(200).json({
        message: genericSuccessMessage,
        deliveryMode: emailResult.mode,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/forgot-password:', error);
      return res.status(500).json({
        error: 'Unable to process password reset request right now. Please try again.',
      });
    }
  });

  // 6. POST /api/auth/reset-password
  app.post('/api/auth/reset-password', rateLimitAuth, (req: Request, res: Response) => {
    try {
      const { email, token, otp, newPassword, confirmNewPassword } = req.body as {
        email?: string;
        token?: string;
        otp?: string;
        newPassword?: string;
        confirmNewPassword?: string;
      };

      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanCode = (otp || token || '').trim().replace(/\s+/g, '');

      if (!cleanCode) {
        return res.status(400).json({
          error: 'Please enter the 6-digit password reset code sent to your email.',
          code: 'INVALID_TOKEN',
        });
      }

      const passwordError = validatePasswordStrength(newPassword || '');
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const candidateRecords = authStore.tokens
        .filter(
          (t) =>
            t.type === 'reset_password' &&
            (!cleanEmail || t.email.toLowerCase() === cleanEmail)
        )
        .sort((a, b) => b.createdAt - a.createdAt);

      const latestRecord = candidateRecords[0];
      if (!latestRecord) {
        return res.status(400).json({
          error: 'Incorrect or expired reset code. Please request a new code.',
          code: 'INVALID_TOKEN',
        });
      }

      if (latestRecord.usedAt) {
        return res.status(400).json({
          error: 'This reset code has already been used. Please request a new code.',
          code: 'USED_TOKEN',
        });
      }

      if (Date.now() > latestRecord.expiresAt) {
        latestRecord.usedAt = Date.now();
        saveStore(authStore);
        return res.status(400).json({
          error: 'Your reset code has expired. Please request a new code.',
          code: 'EXPIRED_TOKEN',
        });
      }

      if (latestRecord.failedAttempts >= MAX_OTP_ATTEMPTS) {
        latestRecord.usedAt = Date.now();
        saveStore(authStore);
        return res.status(429).json({
          error: 'Too many incorrect attempts. Please request a new password reset code.',
          code: 'TOO_MANY_ATTEMPTS',
        });
      }

      if (!verifyTokenHashMatch(cleanCode, latestRecord.tokenHash)) {
        latestRecord.failedAttempts += 1;
        saveStore(authStore);
        return res.status(400).json({
          error: 'Incorrect password reset code. Please try again.',
          code: 'INVALID_TOKEN',
        });
      }

      const user = authStore.users.find((u) => u.id === latestRecord.userId);
      if (!user) {
        return res.status(400).json({
          error: 'Student account was not found.',
          code: 'INVALID_TOKEN',
        });
      }

      // Hash new password and invalidate reset OTP
      const { hash, salt } = hashPassword(newPassword!);
      user.passwordHash = hash;
      user.passwordSalt = salt;
      user.emailVerified = true;
      latestRecord.usedAt = Date.now();
      saveStore(authStore);

      return res.status(200).json({
        message: 'Your password has been reset successfully.',
      });
    } catch (error) {
      console.error('Error in POST /api/auth/reset-password:', error);
      return res.status(500).json({
        error: 'Could not reset your password right now. Please try again.',
      });
    }
  });

  // 7. POST /api/auth/logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        revokedTokens.add(token);
      }
    }
    return res.status(200).json({ message: 'Logged out successfully.' });
  });

  // 8. GET /api/auth/me (Protected Route to verify current student session)
  app.get('/api/auth/me', requireAuthMiddleware, (req: Request, res: Response) => {
    const user = (req as any).authenticatedUser as StoredStudentUser;
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        streakDays: user.streakDays,
        emailVerified: user.emailVerified,
      },
    });
  });

  // 9. GET /api/auth/smtp-status (Non-sensitive status endpoint)
  app.get('/api/auth/smtp-status', (_req: Request, res: Response) => {
    return res.status(200).json({
      smtpConfigured: isSmtpConfigured(),
      host: 'smtp.gmail.com',
      port: 465,
      ssl: true,
    });
  });
}
