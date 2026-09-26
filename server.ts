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
    const subjectLabel = ctx.subject || 'C Programming (CS101)';
    const conceptName = ctx.concept || 'Functions';
    const mastery = ctx.mastery ?? 52;
    const level = ctx.level || 'Beginner';
    const recentMistake = ctx.recentMistake || 'Boundary and conceptual application checks';
    const prereqsText =
      ctx.prerequisites && ctx.prerequisites.length > 0
        ? ctx.prerequisites.join(', ')
        : 'foundational concepts';
    const lowerPrompt = (prompt || '').toLowerCase();
    const isCSubject = subjectLabel.toLowerCase().includes('c programming') || subjectLabel.includes('CS101');

    let reply = '';

    if (actionType === 'explain_simply' || lowerPrompt.includes('simpl') || lowerPrompt.includes('recursion')) {
      if (isCSubject && lowerPrompt.includes('recursion')) {
        reply = `### Understanding Recursion (${level} Level)\n\nThink of **recursion** as a function that solves a large problem by solving a slightly smaller version of the *exact same problem* until it hits a simple stopping point (**base case**).\n\n\`\`\`c\nint factorial(int n) {\n    if (n <= 1) return 1; // 1. Base Case (stops recursion)\n    return n * factorial(n - 1); // 2. Recursive Step\n}\n\`\`\`\n\n**Why students get stuck:** Since your **${conceptName}** mastery is currently **${mastery}%**, focus on how each function call gets its own stack frame in memory. If you forget the base case \`if (n <= 1)\`, the stack overflows!\n\n**Quick Check:** In \`factorial(3)\`, how many times is \`factorial()\` called in total before returning \`6\`?`;
      } else if (isCSubject) {
        reply = `### ${conceptName} — Explained Simply (${level} Mode)\n\nSince your current **${conceptName}** mastery is **${mastery}%**, let's strip away the jargon:\n\nA **${conceptName}** block in C is like a reusable mini-machine. You feed it **inputs** (parameters), it performs a specific job in isolation, and it hands back an **output** (\`return\` value).\n\n\`\`\`c\n// Takes two integers, returns their sum\nint add(int a, int b) {\n    int result = a + b;\n    return result;\n}\n\`\`\`\n\n**Key takeaway before Pointers:** When you pass \`a\` and \`b\` into \`add()\`, C copies their values (**pass-by-value**). Changing \`a\` inside \`add\` does *not* change the original variable in \`main()\`.\n\n**Rapid Check:** What happens if a function declared as \`int compute(int x)\` reaches the closing \`}\` without a \`return\` statement?`;
      } else {
        reply = `### ${conceptName} in ${subjectLabel} — Explained Simply (${level} Mode)\n\nSince your current **${conceptName}** mastery in **${subjectLabel}** is **${mastery}%**, let's break it down into three clear steps:\n\n1. **Core Idea:** **${conceptName}** builds directly upon **${prereqsText}** so you can solve structured problems systematically.\n2. **What to Watch Out For:** Pay special attention to *${recentMistake}*—this is the most common reason students lose marks on this topic.\n3. **Why It Matters:** Reaching **60%+** mastery in **${conceptName}** unlocks the next dependent modules in your **${subjectLabel}** learning path.\n\n**Quick Check:** Before applying **${conceptName}**, which prerequisite condition or constraint from **${prereqsText}** should you verify first?`;
      }
    } else if (actionType === 'give_example' || lowerPrompt.includes('example')) {
      if (isCSubject) {
        reply = `### Concrete Code Example: ${conceptName}\n\nHere is a practical example connecting your strong area (**Loops — 73%**) with **${conceptName} (${mastery}%)**:\n\n\`\`\`c\n#include <stdio.h>\n\n// Function prototype\nint sumArrayUpTo(int limit) {\n    int total = 0;\n    for (int i = 1; i <= limit; i++) {\n        total += i;\n    }\n    return total; // Sends computed value back to caller\n}\n\nint main() {\n    int answer = sumArrayUpTo(5);\n    printf("Sum 1..5 = %d\\n", answer); // Prints 15\n    return 0;\n}\n\`\`\`\n\nNotice how \`main()\` doesn't need to know *how* the loop works—it only cares what \`sumArrayUpTo(5)\` returns!`;
      } else {
        reply = `### Worked Example: ${conceptName} (${subjectLabel})\n\nHere is a step-by-step walkthrough for **${conceptName}** tailored to your **${level}** profile (**${mastery}% mastery**):\n\n- **Step 1 (Identify Given Parameters):** Start with the core definition of **${conceptName}** and verify prerequisites (${prereqsText}).\n- **Step 2 (Apply Core Formulation):** Execute the transformation step-by-step rather than skipping intermediate states.\n- **Step 3 (Guard Against Common Pitfall):** Double-check that *${recentMistake}* does not occur in your final step.\n\nTry applying this 3-step checklist on your next **${subjectLabel}** practice question!`;
      }
    } else if (actionType === 'give_hint' || lowerPrompt.includes('hint')) {
      reply = `### Targeted Hint for ${conceptName} (${subjectLabel})\n\n**Conceptual Clue:** Focus on the relationship between **${conceptName}** and **${prereqsText}**.\n\n1. Identify the exact input constraints and state transitions for **${conceptName}**.\n2. Watch out for the classic trap: *${recentMistake}*.\n3. Eliminate any option that violates the core invariant of **${conceptName}**, then verify the remaining choice step by step.`;
    } else if (actionType === 'explain_mistake' || lowerPrompt.includes('mistake')) {
      reply = `### Analyzing Your Mistake Pattern in ${conceptName} (${subjectLabel})\n\n**Identified Focus Area:** *${recentMistake}*\n\nWhen solving **${conceptName}** problems in **${subjectLabel}**, this error usually happens when an intermediate condition or boundary check is skipped.\n\n**How to fix it immediately:**\n1. Write down the state before and after applying **${conceptName}**.\n2. Check whether **${prereqsText}** assumptions hold.\n3. Verify the edge case (*${recentMistake}*) before locking in your final answer.`;
    } else if (actionType === 'summarize' || lowerPrompt.includes('summar')) {
      reply = `### High-Yield Summary: ${conceptName} (${subjectLabel})\n\n- **Core Topic:** ${conceptName} (Current Mastery: **${mastery}%**)\n- **Prerequisites:** ${prereqsText}\n- **Key Exam Pitfall to Avoid:** *${recentMistake}*\n- **Next Milestone:** Reach **60%+** mastery in **${conceptName}** to unlock dependent topics in **${subjectLabel}**.`;
    } else if (actionType === 'practice_question' || lowerPrompt.includes('question')) {
      reply = `### Targeted Check — ${conceptName} (${subjectLabel})\n\nWhen solving a **${level}** problem on **${conceptName}** in **${subjectLabel}**, which of the following is the most critical check to perform?\n\n- **[A]** Verify all boundary conditions and guard against *${recentMistake}*\n- **[B]** Skip intermediate steps and guess from the final expression\n- **[C]** Ignore prerequisite rules from ${prereqsText}\n\nReply with **A, B, or C** and explain why!`;
    } else {
      reply = `### VidyaOrbit AI Guidance — ${conceptName} (${subjectLabel})\n\nBased on your current profile (**${conceptName}: ${mastery}% mastery**, Level: **${level}**), let's connect **${conceptName}** directly to your foundation in **${prereqsText}**.\n\nYour primary focus area for **${conceptName}** is overcoming *${recentMistake}*. Would you like a **simple explanation**, a **worked example**, or a **progressive hint** for **${conceptName}** in **${subjectLabel}**?`;
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
