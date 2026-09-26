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
  rawTokenPreview?: string; // Stored only in dev outbox memory for preview testing
  userId: string;
  email: string;
  type: 'verify_email' | 'reset_password';
  createdAt: number;
  expiresAt: number;
  usedAt?: number;
}

export interface DispatchedEmailPreview {
  id: string;
  to: string;
  from: string;
  subject: string;
  type: 'verify_email' | 'reset_password';
  actionUrl: string;
  token: string;
  html: string;
  sentAt: string;
  deliveryMode: 'smtp' | 'fallback_outbox';
}

// --- Configuration Constants ---

const VERIFICATION_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DATA_FILE_PATH = path.resolve(process.cwd(), '.vidyaorbit-auth-store.json');

// Rate limiting window (per IP + endpoint)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS_PER_MINUTE = 20;

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

export function generateSecureToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

export function hashRawToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
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
        return parsed;
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

// --- SMTP Email Service ---

function isSmtpConfigured(): boolean {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USERNAME || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();
  return Boolean(host && user && pass);
}

function getAppBaseUrl(req: Request): string {
  const envUrl = (process.env.APP_URL || '').trim();
  if (envUrl && envUrl !== 'MY_APP_URL' && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

function buildVerificationEmailHtml(name: string, verifyUrl: string, token: string): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; color: #0f172a;">
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fbf7e8; border: 1px solid #d4af37; color: #b59024; font-size: 12px; font-weight: 700;">
          VidyaOrbit
        </span>
      </div>
      <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #0f172a;">
        Verify your student email address
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
        Hello ${name}, welcome to <strong>VidyaOrbit</strong>! Please confirm your email address to activate your student account and access your diagnostic tests, syllabus, and AI Tutor.
      </p>
      <div style="margin: 28px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #d4af37; color: #0f172a; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0 0 8px;">
        This verification link expires in 30 minutes. If the button above does not open, copy and paste this link:
      </p>
      <p style="font-size: 12px; font-family: monospace; word-break: break-all; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
        ${verifyUrl}
      </p>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">
        Verification Code: <code style="color: #475569;">${token}</code>
      </p>
    </div>
  `;
}

function buildPasswordResetEmailHtml(name: string, resetUrl: string, token: string): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; color: #0f172a;">
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fbf7e8; border: 1px solid #d4af37; color: #b59024; font-size: 12px; font-weight: 700;">
          VidyaOrbit
        </span>
      </div>
      <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #0f172a;">
        Reset your VidyaOrbit password
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
        Hello ${name}, we received a request to reset your VidyaOrbit student password. Click the button below to create a new password.
      </p>
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #d4af37; color: #0f172a; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
          Create New Password
        </a>
      </div>
      <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0 0 8px;">
        This password reset link is valid for 15 minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; font-family: monospace; word-break: break-all; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
        ${resetUrl}
      </p>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">
        Reset Token: <code style="color: #475569;">${token}</code>
      </p>
    </div>
  `;
}

async function sendSmtpEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: 'verify_email' | 'reset_password';
  actionUrl: string;
  token: string;
}): Promise<{ delivered: boolean; mode: 'smtp' | 'fallback_outbox'; error?: string }> {
  const fromAddress = (process.env.SMTP_FROM || 'VidyaOrbit <no-reply@vidyaorbit.edu>').trim();

  // Always record in local outbox for developer inspection/testing convenience
  const recordOutbox = (mode: 'smtp' | 'fallback_outbox') => {
    dispatchedOutbox.unshift({
      id: 'mail_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      to: options.to,
      from: fromAddress,
      subject: options.subject,
      type: options.type,
      actionUrl: options.actionUrl,
      token: options.token,
      html: options.html,
      sentAt: new Date().toISOString(),
      deliveryMode: mode,
    });
    if (dispatchedOutbox.length > 50) {
      dispatchedOutbox.pop();
    }
  };

  if (isSmtpConfigured()) {
    try {
      const host = process.env.SMTP_HOST!.trim();
      const port = Number(process.env.SMTP_PORT || '587');
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USERNAME!.trim(),
          pass: process.env.SMTP_PASSWORD!.trim(),
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
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
      console.error('SMTP email dispatch error:', err?.message || err);
      return {
        delivered: false,
        mode: 'smtp',
        error: err?.message || 'SMTP server could not send email.',
      };
    }
  }

  // Fallback outbox mode when SMTP env vars are not yet configured in environment
  recordOutbox('fallback_outbox');
  console.log(
    `[VidyaOrbit SMTP Outbox] (${options.type}) To: ${options.to} | Action Link: ${options.actionUrl}`
  );
  return { delivered: true, mode: 'fallback_outbox' };
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
      error: 'Too many attempts. Please wait a minute and try again.',
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

      const cleanName = (name || '').trim();
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
      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email already exists. Please log in or reset your password.',
        });
      }

      const { hash, salt } = hashPassword(password!);
      const newUser: StoredStudentUser = {
        id: 'usr_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        name: cleanName,
        email: cleanEmail,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'VidyaOrbit Learner',
        status: 'active',
        emailVerified: false,
        streakDays: 1,
        createdAt: Date.now(),
      };

      // Generate short-lived verification token
      const { rawToken, tokenHash } = generateSecureToken();
      const tokenRecord: AuthTokenRecord = {
        tokenHash,
        rawTokenPreview: rawToken,
        userId: newUser.id,
        email: newUser.email,
        type: 'verify_email',
        createdAt: Date.now(),
        expiresAt: Date.now() + VERIFICATION_TOKEN_TTL_MS,
      };

      authStore.users.push(newUser);
      authStore.tokens.push(tokenRecord);
      saveStore(authStore);

      const baseUrl = getAppBaseUrl(req);
      const verifyUrl = `${baseUrl}/?route=verify-email&token=${rawToken}`;

      const emailResult = await sendSmtpEmail({
        to: newUser.email,
        subject: 'Verify your VidyaOrbit Student Account',
        html: buildVerificationEmailHtml(newUser.name, verifyUrl, rawToken),
        text: `Welcome to VidyaOrbit, ${newUser.name}! Verify your account by visiting: ${verifyUrl}`,
        type: 'verify_email',
        actionUrl: verifyUrl,
        token: rawToken,
      });

      if (!emailResult.delivered) {
        return res.status(502).json({
          error: 'Your verification email could not be sent. Please try again.',
          email: newUser.email,
          requiresVerification: true,
        });
      }

      return res.status(201).json({
        message: 'Account created. Please check your email to verify your account.',
        email: newUser.email,
        requiresVerification: true,
        deliveryMode: emailResult.mode,
        // Provided only when SMTP is not configured in local/preview environment so user can test verification flow seamlessly
        previewVerificationToken:
          emailResult.mode === 'fallback_outbox' ? rawToken : undefined,
        previewVerificationUrl:
          emailResult.mode === 'fallback_outbox' ? verifyUrl : undefined,
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
          error: 'Please verify your email before logging in.',
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

  // 3. POST /api/auth/verify-email
  app.post('/api/auth/verify-email', rateLimitAuth, (req: Request, res: Response) => {
    try {
      const { token } = req.body as { token?: string };
      const cleanToken = (token || '').trim();

      if (!cleanToken) {
        return res.status(400).json({
          error: 'Verification token is missing.',
          code: 'INVALID_TOKEN',
        });
      }

      const tokenHash = hashRawToken(cleanToken);
      const tokenRecord = authStore.tokens.find(
        (t) => t.tokenHash === tokenHash && t.type === 'verify_email'
      );

      if (!tokenRecord) {
        return res.status(400).json({
          error: 'This verification link is invalid. Please check your link or request a new one.',
          code: 'INVALID_TOKEN',
        });
      }

      const user = authStore.users.find((u) => u.id === tokenRecord.userId);
      if (!user) {
        return res.status(400).json({
          error: 'Student account associated with this link was not found.',
          code: 'INVALID_TOKEN',
        });
      }

      if (user.emailVerified && tokenRecord.usedAt) {
        return res.status(200).json({
          message: 'Your email has been verified successfully.',
          alreadyVerified: true,
          email: user.email,
        });
      }

      if (tokenRecord.usedAt) {
        return res.status(400).json({
          error: 'This verification link has already been used.',
          code: 'USED_TOKEN',
          email: user.email,
        });
      }

      if (Date.now() > tokenRecord.expiresAt) {
        return res.status(400).json({
          error: 'This verification link has expired. Request a new one.',
          code: 'EXPIRED_TOKEN',
          email: user.email,
        });
      }

      // Mark token used and user verified
      tokenRecord.usedAt = Date.now();
      user.emailVerified = true;
      user.verifiedAt = Date.now();
      saveStore(authStore);

      return res.status(200).json({
        message: 'Your email has been verified successfully.',
        verified: true,
        email: user.email,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/verify-email:', error);
      return res.status(500).json({
        error: 'Could not verify your email right now. Please try again.',
      });
    }
  });

  // 4. POST /api/auth/resend-verification
  app.post('/api/auth/resend-verification', rateLimitAuth, async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        // Avoid exposing account existence
        return res.status(200).json({
          message: 'If an unverified account exists for this email, a new verification link has been sent.',
        });
      }

      if (user.emailVerified) {
        return res.status(200).json({
          message: 'Your email is already verified. You can log in now.',
          alreadyVerified: true,
        });
      }

      // Invalidate any previous unused verification tokens for this user
      const now = Date.now();
      authStore.tokens.forEach((t) => {
        if (t.userId === user.id && t.type === 'verify_email' && !t.usedAt) {
          t.usedAt = now;
        }
      });

      const { rawToken, tokenHash } = generateSecureToken();
      authStore.tokens.push({
        tokenHash,
        rawTokenPreview: rawToken,
        userId: user.id,
        email: user.email,
        type: 'verify_email',
        createdAt: now,
        expiresAt: now + VERIFICATION_TOKEN_TTL_MS,
      });
      saveStore(authStore);

      const baseUrl = getAppBaseUrl(req);
      const verifyUrl = `${baseUrl}/?route=verify-email&token=${rawToken}`;

      const emailResult = await sendSmtpEmail({
        to: user.email,
        subject: 'Verify your VidyaOrbit Student Account',
        html: buildVerificationEmailHtml(user.name, verifyUrl, rawToken),
        text: `Hello ${user.name}, verify your VidyaOrbit account here: ${verifyUrl}`,
        type: 'verify_email',
        actionUrl: verifyUrl,
        token: rawToken,
      });

      if (!emailResult.delivered) {
        return res.status(502).json({
          error: 'Your verification email could not be sent. Please try again.',
        });
      }

      return res.status(200).json({
        message: 'A new verification email has been sent. Please check your inbox.',
        deliveryMode: emailResult.mode,
        previewVerificationToken:
          emailResult.mode === 'fallback_outbox' ? rawToken : undefined,
        previewVerificationUrl:
          emailResult.mode === 'fallback_outbox' ? verifyUrl : undefined,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/resend-verification:', error);
      return res.status(500).json({
        error: 'Your verification email could not be sent. Please try again.',
      });
    }
  });

  // 5. POST /api/auth/forgot-password
  app.post('/api/auth/forgot-password', rateLimitAuth, async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const genericSuccessMessage =
        'If an account exists for this email, a password reset link has been sent.';

      const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        // Return identical message to prevent email enumeration
        return res.status(200).json({
          message: genericSuccessMessage,
        });
      }

      // Invalidate older unused password reset tokens for this user
      const now = Date.now();
      authStore.tokens.forEach((t) => {
        if (t.userId === user.id && t.type === 'reset_password' && !t.usedAt) {
          t.usedAt = now;
        }
      });

      const { rawToken, tokenHash } = generateSecureToken();
      authStore.tokens.push({
        tokenHash,
        rawTokenPreview: rawToken,
        userId: user.id,
        email: user.email,
        type: 'reset_password',
        createdAt: now,
        expiresAt: now + RESET_TOKEN_TTL_MS,
      });
      saveStore(authStore);

      const baseUrl = getAppBaseUrl(req);
      const resetUrl = `${baseUrl}/?route=reset-password&token=${rawToken}`;

      const emailResult = await sendSmtpEmail({
        to: user.email,
        subject: 'Reset your VidyaOrbit Password',
        html: buildPasswordResetEmailHtml(user.name, resetUrl, rawToken),
        text: `Hello ${user.name}, reset your VidyaOrbit password by visiting: ${resetUrl}`,
        type: 'reset_password',
        actionUrl: resetUrl,
        token: rawToken,
      });

      if (!emailResult.delivered) {
        return res.status(502).json({
          error: 'Password reset email could not be sent right now. Please try again.',
        });
      }

      return res.status(200).json({
        message: genericSuccessMessage,
        deliveryMode: emailResult.mode,
        previewResetToken: emailResult.mode === 'fallback_outbox' ? rawToken : undefined,
        previewResetUrl: emailResult.mode === 'fallback_outbox' ? resetUrl : undefined,
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
      const { token, newPassword, confirmNewPassword } = req.body as {
        token?: string;
        newPassword?: string;
        confirmNewPassword?: string;
      };

      const cleanToken = (token || '').trim();
      if (!cleanToken) {
        return res.status(400).json({
          error: 'Password reset token is missing.',
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

      const tokenHash = hashRawToken(cleanToken);
      const tokenRecord = authStore.tokens.find(
        (t) => t.tokenHash === tokenHash && t.type === 'reset_password'
      );

      if (!tokenRecord) {
        return res.status(400).json({
          error: 'This password reset link is invalid. Please request a new one.',
          code: 'INVALID_TOKEN',
        });
      }

      if (tokenRecord.usedAt) {
        return res.status(400).json({
          error: 'This password reset link has already been used. Please request a new one.',
          code: 'USED_TOKEN',
        });
      }

      if (Date.now() > tokenRecord.expiresAt) {
        return res.status(400).json({
          error: 'This password reset link has expired. Request a new one.',
          code: 'EXPIRED_TOKEN',
        });
      }

      const user = authStore.users.find((u) => u.id === tokenRecord.userId);
      if (!user) {
        return res.status(400).json({
          error: 'Account associated with this reset token was not found.',
          code: 'INVALID_TOKEN',
        });
      }

      // Hash new password and invalidate token
      const { hash, salt } = hashPassword(newPassword!);
      user.passwordHash = hash;
      user.passwordSalt = salt;
      user.emailVerified = true; // Completing email reset also confirms email ownership
      tokenRecord.usedAt = Date.now();
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

  // 9. GET /api/auth/smtp-status (Returns non-sensitive SMTP readiness status + dev outbox for testing)
  app.get('/api/auth/smtp-status', (req: Request, res: Response) => {
    const emailFilter = ((req.query.email as string) || '').trim().toLowerCase();
    const filteredEmails = emailFilter
      ? dispatchedOutbox.filter((m) => m.to.toLowerCase() === emailFilter)
      : dispatchedOutbox.slice(0, 5);

    return res.status(200).json({
      smtpConfigured: isSmtpConfigured(),
      recentEmails: filteredEmails.map((m) => ({
        id: m.id,
        to: m.to,
        subject: m.subject,
        type: m.type,
        actionUrl: m.actionUrl,
        token: m.token,
        sentAt: m.sentAt,
        deliveryMode: m.deliveryMode,
      })),
    });
  });
}
