import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { registerSmtpAuthRoutes } from './src/server/smtpAuthController';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase body limit for base64 audio recording payloads
app.use(express.json({ limit: '25mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- Production SMTP & JWT Student Authentication Endpoints ---
registerSmtpAuthRoutes(app);

// --- Audio Transcription Endpoint using gemini-3.5-transcribe ---
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body as {
      audioBase64?: string;
      mimeType?: string;
    };

    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 payload.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Please ensure your Gemini API key is set in Secrets.',
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this audio accurately into text. Output only the spoken words without extra commentary.',
          },
        ],
      },
    });

    const transcript = (response.text || '').trim();
    return res.json({
      transcript,
      model: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    console.error('Audio transcription error (gemini-3.5-transcribe):', error);
    return res.status(500).json({
      error: error?.message || 'Failed to transcribe audio with gemini-3.5-transcribe.',
    });
  }
});

// --- AI Learning Support Endpoint (Pedagogical Assistant) ---
app.post('/api/ai/tutor', async (req, res) => {
  try {
    const {
      prompt,
      actionType,
      studentContext,
    }: {
      prompt: string;
      actionType?: string;
      studentContext?: {
        name?: string;
        level?: string;
        subject?: string;
        concept?: string;
        mastery?: number;
        status?: string;
        weaknesses?: string[];
        prerequisites?: string[];
        recentMistake?: string;
        explanationStyle?: string;
      };
    } = req.body;

    const ai = getGeminiClient();
    const ctx = studentContext || {};

    if (ai) {
      const systemInstruction = `You are VidyaOrbit AI Tutor, a friendly, beginner-friendly adaptive learning assistant inside the "VidyaOrbit — AI-Powered Personalized Learning Platform".
IMPORTANT PEDAGOGICAL RULES:
1. You do NOT compute scores, mastery percentages, or unlock prerequisites—that is handled by the platform's Deterministic Learning Engine.
2. Tailor your explanation strictly to the student's current profile:
   - Student Name: ${ctx.name || 'Alex Chen'}
   - Level: ${ctx.level || 'Intermediate'}
   - Subject: ${ctx.subject || 'C Programming'}
   - Current Concept: ${ctx.concept || 'Functions'} (Mastery: ${ctx.mastery ?? 52}%, Status: ${ctx.status || 'Weak'})
   - Identified Weaknesses / Gaps: ${(ctx.weaknesses || ['Functions', 'Pointers']).join(', ')}
   - Prerequisites: ${(ctx.prerequisites || ['Loops', 'Conditions']).join(', ')}
   - Recent Mistake Context: ${ctx.recentMistake || 'Confusing pass-by-value with pass-by-reference and missing return types'}
   - Preferred Explanation Style: ${ctx.explanationStyle || 'Step-by-step with concrete C code examples'}
3. Do NOT blindly hand out final quiz answers if the student is asking for help on an active question; guide them with conceptual clarity, analogies, short C code snippets, and a quick check-for-understanding question at the end.
4. Keep responses concise, structured, and easy to scan (120-220 words max).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      return res.json({
        reply: response.text || 'Let us break down this concept step by step.',
        source: 'gemini-3.8-flash',
      });
    }

    // Contextual pedagogical fallback if GEMINI_API_KEY is not configured in local demo environment
    const conceptName = ctx.concept || 'Functions';
    const mastery = ctx.mastery ?? 52;
    const level = ctx.level || 'Beginner';
    const lowerPrompt = (prompt || '').toLowerCase();

    let reply = '';

    if (actionType === 'explain_simply' || lowerPrompt.includes('simpl') || lowerPrompt.includes('recursion')) {
      if (lowerPrompt.includes('recursion')) {
        reply = `### Understanding Recursion (${level} Level)\n\nThink of **recursion** as a function that solves a large problem by solving a slightly smaller version of the *exact same problem* until it hits a simple stopping point (**base case**).\n\n\`\`\`c\nint factorial(int n) {\n    if (n <= 1) return 1; // 1. Base Case (stops recursion)\n    return n * factorial(n - 1); // 2. Recursive Step\n}\n\`\`\`\n\n**Why students get stuck:** Since your **${conceptName}** mastery is currently **${mastery}%**, focus on how each function call gets its own stack frame in memory. If you forget the base case \`if (n <= 1)\`, the stack overflows!\n\n**Quick Check:** In \`factorial(3)\`, how many times is \`factorial()\` called in total before returning \`6\`?`;
      } else {
        reply = `### ${conceptName} — Explained Simply (${level} Mode)\n\nSince your current **${conceptName}** mastery is **${mastery}%**, let's strip away the jargon:\n\nA **${conceptName}** block in C is like a reusable mini-machine. You feed it **inputs** (parameters), it performs a specific job in isolation, and it hands back an **output** (\`return\` value).\n\n\`\`\`c\n// Takes two integers, returns their sum\nint add(int a, int b) {\n    int result = a + b;\n    return result;\n}\n\`\`\`\n\n**Key takeaway before Pointers:** When you pass \`a\` and \`b\` into \`add()\`, C copies their values (**pass-by-value**). Changing \`a\` inside \`add\` does *not* change the original variable in \`main()\`.\n\n**Rapid Check:** What happens if a function declared as \`int compute(int x)\` reaches the closing \`}\` without a \`return\` statement?`;
      }
    } else if (actionType === 'give_example' || lowerPrompt.includes('example')) {
      reply = `### Concrete Code Example: ${conceptName}\n\nHere is a practical example connecting your strong area (**Loops — 73%**) with **${conceptName} (${mastery}%)**:\n\n\`\`\`c\n#include <stdio.h>\n\n// Function prototype\nint sumArrayUpTo(int limit) {\n    int total = 0;\n    for (int i = 1; i <= limit; i++) {\n        total += i;\n    }\n    return total; // Sends computed value back to caller\n}\n\nint main() {\n    int answer = sumArrayUpTo(5);\n    printf("Sum 1..5 = %d\\n", answer); // Prints 15\n    return 0;\n}\n\`\`\`\n\nNotice how \`main()\` doesn't need to know *how* the loop works—it only cares what \`sumArrayUpTo(5)\` returns!`;
    } else if (actionType === 'give_hint' || lowerPrompt.includes('hint')) {
      reply = `### Targeted Hint for ${conceptName}\n\n**Conceptual Clue:** Trace the **scope** and **lifetime** of the variables first.\n\n1. Check the function's **return type** and **parameter types**.\n2. Remember that in C, arguments are passed **by value** by default—so modifying a parameter inside a function only modifies the local copy unless a pointer (\`*\`) is dereferenced.\n3. Walk through the execution line by line starting from \`main()\`.`;
    } else if (actionType === 'explain_mistake' || lowerPrompt.includes('mistake')) {
      reply = `### Analyzing Your Recent Mistake in ${conceptName}\n\n${ctx.recentMistake ? `**Recent Error Pattern:** ${ctx.recentMistake}\n\n` : ''}When working with **${conceptName}**, the most common pitfall is assuming that modifying a parameter inside a helper function updates the variable in \`main()\`.\n\n\`\`\`c\nvoid doubleVal(int x) {\n    x = x * 2; // Only modifies local copy 'x'!\n}\n\`\`\`\n\n**How to fix it:** Either \`return x * 2;\` and assign it in \`main()\`, or (once you unlock **Pointers**) pass the memory address \`&x\`. Mastering return values here is the exact prerequisite needed to unlock **Pointers**!`;
    } else if (actionType === 'summarize' || lowerPrompt.includes('summar')) {
      reply = `### High-Yield Summary: ${conceptName}\n\n- **Declaration (Prototype):** Tells the compiler the function's name, return type, and parameter types before \`main()\`.\n- **Definition:** Contains the actual body \`{ ... }\` that executes when called.\n- **Pass-by-Value:** C copies arguments into local parameters; original variables in the caller stay untouched.\n- **Prerequisite Link:** Solidify **${conceptName}** (currently **${mastery}%**) to reach **60%+** and unlock **Pointers**.`;
    } else if (actionType === 'practice_question' || lowerPrompt.includes('question')) {
      reply = `### Targeted Practice Question (${conceptName})\n\nWhat is printed by the following C program?\n\n\`\`\`c\n#include <stdio.h>\n\nint transform(int n) {\n    if (n % 2 == 0) return n / 2;\n    return n * 3 + 1;\n}\n\nint main() {\n    int val = 4;\n    val = transform(val);\n    val = transform(val);\n    printf("%d", val);\n    return 0;\n}\n\`\`\`\n\n- **[A]** \`1\`\n- **[B]** \`2\`\n- **[C]** \`4\`\n- **[D]** \`7\`\n\nReply with **A, B, C, or D** and tell me what \`val\` becomes after the *first* call!`;
    } else {
      reply = `### VidyaOrbit AI Guidance — ${conceptName}\n\nBased on your current profile (**${conceptName}: ${mastery}% mastery**, Level: **${level}**), let's connect this directly to what you already know:\n\nYou have strong mastery in **Variables (91%)** and **Loops (73%)**. In C, **${conceptName}** encapsulate those variables and loops into isolated stack frames.\n\n\`\`\`c\nint clamp(int val, int min, int max) {\n    if (val < min) return min;\n    if (val > max) return max;\n    return val;\n}\n\`\`\`\n\nWould you like to **trace how stack memory works** during this call, or try a **2-minute adaptive practice question** to boost your ${conceptName} mastery above 60%?`;
    }

    return res.json({
      reply,
      source: 'pedagogical-engine',
    });
  } catch (error: any) {
    console.error('AI Tutor error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate AI tutor response.',
    });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  // --- Gemini Live API (gemini-3.8-live) Real-Time Voice Bridge over WebSocket (/live) ---
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // Let other upgrades (if any) pass through
  });

  wss.on('connection', async (clientWs: WebSocket, request) => {
    const url = new URL(request.url || '/live', `http://${request.headers.host || 'localhost'}`);
    const concept = url.searchParams.get('concept') || 'Functions';
    const mastery = url.searchParams.get('mastery') || '52';
    const level = url.searchParams.get('level') || 'Intermediate';
    const studentName = url.searchParams.get('name') || 'Alex Chen';
    const voiceName = url.searchParams.get('voice') || 'Zephyr';

    const ai = getGeminiClient();
    if (!ai) {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error:
              'GEMINI_API_KEY is not configured. Please attach a Gemini API key in the Settings > Secrets panel to start a live voice conversation with gemini-3.8-live.',
          })
        );
        clientWs.close();
      }
      return;
    }

    let liveSession: any = null;

    try {
      const systemInstruction = `You are VidyaOrbit AI Voice Tutor, a friendly, concise, real-time spoken coding coach inside the VidyaOrbit Personalized Learning Platform.
You are speaking directly with ${studentName} (${level} level in C Programming).
Their current concept focus is "${concept}" with ${mastery}% mastery.
Remember:
- Keep spoken answers clear, conversational, warm, and concise (2 to 4 sentences at a time).
- Explain C Programming concepts like ${concept}, pass-by-value, recursion, stack frames, and pointers using intuitive mental models.
- Never calculate grades or unlock prerequisites yourself—that is handled by the platform's deterministic learning engine.`;

      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    audio: part.inlineData.data,
                  })
                );
              }
              if (part.text) {
                clientWs.send(
                  JSON.stringify({
                    text: part.text,
                  })
                );
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }

            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }
          },
          onerror: (err: any) => {
            console.error('Gemini Live session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  error: err?.message || 'Live voice session encountered an error.',
                })
              );
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ status: 'closed' }));
            }
          },
        },
      });

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            status: 'connected',
            model: 'gemini-3.8-live',
            voice: voiceName,
          })
        );
      }

      clientWs.on('message', (rawData) => {
        try {
          const parsed = JSON.parse(rawData.toString());
          if (parsed.audio && liveSession) {
            liveSession.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          } else if (parsed.text && liveSession) {
            liveSession.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: parsed.text }] }],
              turnComplete: true,
            });
          }
        } catch (err) {
          console.error('Failed to process client WebSocket message:', err);
        }
      });

      clientWs.on('close', () => {
        try {
          liveSession?.close?.();
        } catch {
          // ignore close errors
        }
      });
    } catch (error: any) {
      console.error('Failed to initialize Gemini Live API (gemini-3.8-live):', error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: error?.message || 'Failed to connect to gemini-3.8-live.',
          })
        );
        clientWs.close();
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`VidyaOrbit Server (HTTP + Live WS) listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
