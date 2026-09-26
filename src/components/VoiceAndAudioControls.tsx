import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  PhoneOff,
  Loader2,
  Volume2,
  AlertCircle,
} from 'lucide-react';

// Helper: Convert Float32Array [-1, 1] to 16-bit PCM Base64
function float32ToPcm16Base64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 16-bit PCM (24kHz) into Float32Array for Web Audio API playback
function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

// Helper: Convert Blob to Base64 string
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface AudioTranscribeMicButtonProps {
  onTranscribed: (text: string) => void;
  compact?: boolean;
}

/**
 * Microphone Recording & Transcription Button powered by gemini-3.5-transcribe
 */
export const AudioTranscribeMicButton: React.FC<AudioTranscribeMicButtonProps> = ({
  onTranscribed,
  compact = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const response = await fetch('/api/ai/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: mimeType.split(';')[0],
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Transcription failed.');
          }
          if (data.transcript) {
            onTranscribed(data.transcript);
          }
        } catch (err: any) {
          setErrorMsg(err?.message || 'Could not transcribe audio.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setErrorMsg('Microphone permission denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        title={
          isRecording
            ? 'Stop recording & transcribe (gemini-3.5-transcribe)'
            : 'Dictate with Microphone (gemini-3.5-transcribe)'
        }
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
          compact ? 'p-2 text-xs' : 'px-3 py-2 text-xs'
        } ${
          isRecording
            ? 'bg-red-50 text-red-700 border border-red-300 animate-pulse'
            : isTranscribing
            ? 'bg-[#FBF7E8] text-[#B59024] border border-[#D4AF37]'
            : 'bg-white hover:bg-[#FBF7E8] text-slate-700 hover:text-slate-900 border border-slate-200'
        }`}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B59024]" />
            {!compact && <span>Transcribing...</span>}
          </>
        ) : isRecording ? (
          <>
            <MicOff className="w-3.5 h-3.5 text-red-600" />
            {!compact && <span>Stop &amp; Transcribe</span>}
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-[#B59024]" />
            {!compact && <span>Voice Input</span>}
          </>
        )}
      </button>

      {errorMsg && (
        <div className="absolute bottom-full mb-2 right-0 w-64 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 shadow-lg z-50 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <div>{errorMsg}</div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="underline text-[10px] mt-1 font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface LiveVoiceCoachPanelProps {
  studentName: string;
  studentLevel: string;
  conceptName: string;
  conceptMastery: number;
}

/**
 * Real-Time Voice Conversation Panel powered by Gemini Live API (gemini-3.8-live)
 */
export const LiveVoiceCoachPanel: React.FC<LiveVoiceCoachPanelProps> = ({
  studentName,
  studentLevel,
  conceptName,
  conceptMastery,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Kore' | 'Fenrir' | 'Charon'>('Zephyr');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [liveTranscriptNote, setLiveTranscriptNote] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlaybackTimeRef = useRef<number>(0);
  const isMicMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // ignore already stopped
      }
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlaybackTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
  };

  const playAudioChunk = (base64Pcm24k: string) => {
    const outCtx = outputAudioCtxRef.current;
    if (!outCtx) return;

    const float32Data = pcm16Base64ToFloat32(base64Pcm24k);
    if (float32Data.length === 0) return;

    const audioBuffer = outCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = outCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    const startTime = Math.max(now, nextPlaybackTimeRef.current);
    source.start(startTime);
    nextPlaybackTimeRef.current = startTime + audioBuffer.duration;

    activeSourcesRef.current.push(source);
    setIsModelSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsModelSpeaking(false);
      }
    };
  };

  const cleanupSession = () => {
    stopAllPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  const startLiveVoiceSession = async () => {
    setErrorText(null);
    setLiveTranscriptNote('');
    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextPlaybackTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const params = new URLSearchParams({
        name: studentName,
        level: studentLevel,
        concept: conceptName,
        mastery: String(conceptMastery),
        voice: selectedVoice,
      });
      const ws = new WebSocket(`${protocol}//${window.location.host}/live?${params.toString()}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setErrorText(msg.error);
            setStatus('error');
            cleanupSession();
            return;
          }
          if (msg.status === 'connected') {
            setStatus('connected');
          }
          if (msg.audio) {
            playAudioChunk(msg.audio);
          }
          if (msg.text) {
            setLiveTranscriptNote((prev) => (prev + ' ' + msg.text).trim().slice(-240));
          }
          if (msg.interrupted) {
            stopAllPlayback();
          }
          if (msg.status === 'closed') {
            setStatus('idle');
            cleanupSession();
          }
        } catch (err) {
          console.error('Error parsing Live WS message:', err);
        }
      };

      ws.onerror = () => {
        setErrorText('Live voice WebSocket connection error.');
        setStatus('error');
        cleanupSession();
      };

      ws.onclose = () => {
        setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      };

      ws.onopen = () => {
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMicMutedRef.current) return;
          if (ws.readyState !== WebSocket.OPEN) return;
          const channelData = e.inputBuffer.getChannelData(0);
          const base64Audio = float32ToPcm16Base64(channelData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };
    } catch (err: any) {
      setErrorText(err?.message || 'Could not access microphone for Live Voice.');
      setStatus('error');
      cleanupSession();
    }
  };

  const stopLiveVoiceSession = () => {
    cleanupSession();
    setStatus('idle');
  };

  const sendSpokenIcebreaker = (promptText: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: promptText }));
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#FBF7E8]/70 border border-[#D4AF37]/40 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              status === 'connected'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : 'bg-white text-[#B59024] border border-[#D4AF37]/40'
            }`}
          >
            <Radio className={`w-5 h-5 ${status === 'connected' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Live Voice Tutor
              </span>
              <span className="font-mono text-[11px] text-[#B59024] font-semibold">
                gemini-3.8-live
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Talk out loud with VidyaOrbit AI about{' '}
              <strong className="text-slate-900">{conceptName}</strong> ({conceptMastery}% mastery).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === 'idle' || status === 'error' ? (
            <>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as any)}
                className="h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                title="Select AI Tutor Voice"
              >
                <option value="Zephyr">Voice: Zephyr</option>
                <option value="Puck">Voice: Puck</option>
                <option value="Kore">Voice: Kore</option>
                <option value="Fenrir">Voice: Fenrir</option>
                <option value="Charon">Voice: Charon</option>
              </select>

              <button
                type="button"
                onClick={startLiveVoiceSession}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Voice Session</span>
              </button>
            </>
          ) : status === 'connecting' ? (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl bg-white border border-[#D4AF37] text-[#B59024] text-xs font-bold flex items-center gap-2"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMicMuted((m) => !m)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                  isMicMuted
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-[#D4AF37] text-[#B59024]'
                }`}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isMicMuted ? 'Muted' : 'Mic On'}</span>
              </button>

              <button
                type="button"
                onClick={stopLiveVoiceSession}
                className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connected Active Bar */}
      {status === 'connected' && (
        <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((bar) => (
                <span
                  key={bar}
                  className={`w-1 rounded-full transition-all ${
                    isModelSpeaking
                      ? 'h-4 bg-[#D4AF37] animate-bounce'
                      : isMicMuted
                      ? 'h-1.5 bg-slate-300'
                      : 'h-3 bg-slate-700 animate-pulse'
                  }`}
                  style={{ animationDelay: `${bar * 90}ms` }}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-800">
              {isModelSpeaking
                ? `VidyaOrbit AI (${selectedVoice}) is speaking...`
                : isMicMuted
                ? 'Microphone is muted'
                : 'Listening... Ask a question out loud!'}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              sendSpokenIcebreaker(
                `Hi VidyaOrbit! Can you explain ${conceptName} to me in simple spoken terms?`
              )
            }
            className="px-2.5 py-1 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/50 text-[11px] font-semibold text-slate-800 hover:bg-[#D4AF37]/20 flex items-center gap-1 self-start sm:self-auto"
          >
            <Volume2 className="w-3 h-3 text-[#B59024]" />
            <span>Ask: Explain {conceptName}</span>
          </button>
        </div>
      )}

      {liveTranscriptNote && status === 'connected' && (
        <div className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded-lg border border-slate-200">
          <span className="text-[#B59024] font-bold">Live Audio: </span>
          {liveTranscriptNote}
        </div>
      )}

      {errorText && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3">
          <span>{errorText}</span>
          <button
            type="button"
            onClick={() => setErrorText(null)}
            className="underline font-bold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
