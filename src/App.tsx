import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AssistantState, ConnectionStatus, LiveMessage, PersonalityConfig } from './types/ai';
import { AudioMetrics, VisualSettings } from './types/audio';
import { RiskLevel } from './types/tools';
import { InterfaceMode, ResearchSession, TranscriptSegment } from './types/research';

import { NeuralCanvas } from './components/neural/NeuralCanvas';
import { MiniNeutron } from './components/neural/MiniNeutron';
import { Header } from './components/ui/Header';
import { VoiceController } from './components/voice/VoiceController';
import { LiveTranscript } from './components/conversation/LiveTranscript';
import { TextInputBar } from './components/conversation/TextInputBar';
import { ResearchWorkspace } from './components/conversation/ResearchWorkspace';

import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { OnboardingModal } from './components/modals/OnboardingModal';

import { ActivityConsole, AuditLogEntry } from './components/drawers/ActivityConsole';
import { MemoryDrawer } from './components/drawers/MemoryDrawer';
import { TaskDrawer } from './components/drawers/TaskDrawer';
import { ToolsDrawer } from './components/drawers/ToolsDrawer';
import { SettingsModal } from './components/drawers/SettingsModal';

import { globalAudioRecorder } from './lib/audio/AudioRecorder';
import { globalAudioPlayer } from './lib/audio/AudioPlayer';
import { globalAudioAnalyzer } from './lib/audio/AudioAnalyzer';
import { globalActionExecutor } from './lib/tools/executor';
import { PolicyEngine } from './lib/tools/policy';
import { globalMemoryStore } from './lib/memory/memoryStore';
import { globalTaskPlanner } from './lib/tasks/taskPlanner';
import { globalTranscriptProcessor } from './lib/conversation/TranscriptProcessor';
import { CyberHudOverlay } from './components/neural/CyberHudOverlay';
import { soundEffects } from './lib/audio/SoundEffects';
import { autonomousBrain } from './lib/conversation/AutonomousBrain';

export default function App() {
  // 1. Assistant & Connection State
  const [state, setState] = useState<AssistantState>('IDLE');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // 2. Presentation Modes (Section 1 & 13)
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>('IMMERSIVE');
  const [researchSession, setResearchSession] = useState<ResearchSession | null>(null);

  // 3. Transcripts & Progressive Text Stream (Section 6, 8, 20)
  const [currentInputText, setCurrentInputText] = useState('');
  const [currentOutputText, setCurrentOutputText] = useState('');
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [activePartialText, setActivePartialText] = useState('');
  const [history, setHistory] = useState<LiveMessage[]>([]);
  const [activeActionStatus, setActiveActionStatus] = useState<string | undefined>();

  // 4. Settings & Personality
  const [personality, setPersonality] = useState<PersonalityConfig>({
    name: 'NEUTRON',
    voice: 'Fenrir',
    tone: 'calm',
    verbosity: 'adaptive',
    proactivity: 'balanced',
    speechRate: 1.0,
  });

  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    quality: 'auto',
    animationIntensity: 1.0,
    particleDensity: 1.0,
    fluidIntensity: 1.0,
    glowIntensity: 1.0,
    reducedMotion: false,
    lowPowerMode: false,
  });

  // 5. Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    toolName: string;
    args: Record<string, any>;
    riskLevel: RiskLevel;
    onApprove: () => void;
    onReject: () => void;
  } | null>(null);

  // 6. Drawers Visibility
  const [showActivity, setShowActivity] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 7. Audio Metrics & Telemetry
  const [metrics, setMetrics] = useState<AudioMetrics>({
    amplitude: 0,
    low: 0,
    mid: 0,
    high: 0,
    speechActivity: 0,
    pitch: 0.5,
    isInputSpeaking: false,
    isOutputSpeaking: false,
  });
  const [fps, setFps] = useState(60);
  const [geminiLatency, setGeminiLatency] = useState(45);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  // 8. Store States
  const [memories, setMemories] = useState(globalMemoryStore.getAll());
  const [activeTask, setActiveTask] = useState(globalTaskPlanner.getActiveTask());
  const [taskHistory, setTaskHistory] = useState(globalTaskPlanner.getHistory());

  // WebSocket Ref & Research Ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const researchSessionRef = useRef<ResearchSession | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(soundEffects.getIsMuted());

  useEffect(() => {
    researchSessionRef.current = researchSession;
  }, [researchSession]);

  // Helper to add audit logs
  const addLog = useCallback(
    (
      type: AuditLogEntry['type'],
      message: string,
      details?: any,
      durationMs?: number
    ) => {
      const entry: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type,
        message,
        details,
        durationMs,
      };
      setLogs((prev) => [entry, ...prev.slice(0, 99)]);
    },
    []
  );

  // Subscribe to stores and transcript processor
  useEffect(() => {
    const unsubMem = globalMemoryStore.subscribe(() => {
      setMemories(globalMemoryStore.getAll());
    });
    const unsubTask = globalTaskPlanner.subscribe(() => {
      setActiveTask(globalTaskPlanner.getActiveTask());
      setTaskHistory(globalTaskPlanner.getHistory());
    });
    const unsubAudio = globalAudioAnalyzer.subscribe((m) => {
      setMetrics(m);
    });
    const unsubTranscript = globalTranscriptProcessor.subscribe((segs, partial) => {
      setTranscriptSegments(segs);
      setActivePartialText(partial);
    });

    // Check first-run onboarding
    const onboarded = localStorage.getItem('neutron_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }

    return () => {
      unsubMem();
      unsubTask();
      unsubAudio();
      unsubTranscript();
    };
  }, []);

  // Update Assistant State based on audio activity
  useEffect(() => {
    if (confirmDialog?.isOpen) {
      setState('WAITING_FOR_CONFIRMATION');
    } else if (metrics.isOutputSpeaking) {
      setState('SPEAKING');
    } else if (metrics.isInputSpeaking && isVoiceActive) {
      setState('LISTENING');
    } else if (activeActionStatus) {
      // Retain SEARCHING or EXECUTING state
    } else if (isVoiceActive) {
      setState('LISTENING');
    } else if (connectionStatus === 'OFFLINE') {
      setState('DISCONNECTED');
    } else {
      setState('IDLE');
    }
  }, [
    metrics.isOutputSpeaking,
    metrics.isInputSpeaking,
    isVoiceActive,
    activeActionStatus,
    confirmDialog,
    connectionStatus,
  ]);

  // Connect to Gemini Live WebSocket
  const connectWebSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setConnectionStatus('CONNECTING');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live?voice=${personality.voice}&tone=${personality.tone}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('ONLINE');
        addLog('INFO', 'Connected to NEUTRON server and Gemini Live bridge.');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'status') {
            if (data.status === 'ONLINE') {
              setConnectionStatus('ONLINE');
            } else if (data.status === 'OFFLINE') {
              setConnectionStatus('OFFLINE');
              addLog('INFO', data.message || 'Offline fallback mode active.');
            }
          }

          // Output Audio Stream Chunk (24kHz PCM)
          if (data.type === 'audio' && data.audio) {
            globalAudioPlayer.playPcmChunk(data.audio);
          }

          // Model transcription text - pass into TranscriptProcessor (Section 6 & 20)
          if (data.type === 'outputTranscription' && data.text) {
            globalTranscriptProcessor.appendChunk(data.text);
            setCurrentOutputText((prev) => prev + data.text);
          }

          // Fallback text response
          if (data.type === 'fallbackTextResponse') {
            globalTranscriptProcessor.clear();
            globalTranscriptProcessor.appendChunk(data.text);
            globalTranscriptProcessor.finalizeTurn();

            setCurrentOutputText(data.text);
            
if (data.text && 'speechSynthesis' in window) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(data.text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => setState('SPEAKING');

  utterance.onend = () => {
    setState('IDLE');
    setActiveActionStatus(undefined);
  };

  utterance.onerror = (event) => {
    console.error('Speech playback failed:', event.error);
    setActiveActionStatus(undefined);
  };

  window.speechSynthesis.speak(utterance);
}

            setHistory((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: data.text,
                timestamp: Date.now(),
              },
            ]);
            setActiveActionStatus(undefined);
          }

          // User Barge-In / Interruption (Section 21)
          if (data.type === 'interrupted') {
            globalAudioPlayer.interrupt();
            globalTranscriptProcessor.interrupt();
            setCurrentOutputText('');
            setState('LISTENING');
            addLog('INFO', 'User speech barge-in detected. Output halted immediately.');
          }

          // Turn complete
          if (data.type === 'turnComplete') {
            globalTranscriptProcessor.finalizeTurn();
            const fullTurnText = globalTranscriptProcessor.getFullText() || currentOutputText;

            if (fullTurnText) {
              setHistory((prev) => [
                ...prev,
                {
                  id: `msg-${Date.now()}`,
                  role: 'assistant',
                  content: fullTurnText,
                  timestamp: Date.now(),
                },
              ]);

              // Update research session summary if in research mode
              if (researchSessionRef.current) {
                setResearchSession((prev) =>
                  prev ? { ...prev, summary: fullTurnText, status: 'READY' } : null
                );
              }
            }

            setCurrentInputText('');
            setCurrentOutputText('');
            setActiveActionStatus(undefined);
          }

          // Tool Call from Gemini Live
          if (data.type === 'toolCall' && data.toolCall) {
            handleIncomingToolCall(data.toolCall);
          }
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Live WebSocket error:', err);
        setConnectionStatus('OFFLINE');
      };

      ws.onclose = () => {
        setConnectionStatus('OFFLINE');
        addLog('INFO', 'Gemini Live bridge disconnected. Retrying in 4s...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 4000);
      };
    } catch (e: any) {
      setConnectionStatus('OFFLINE');
      addLog('ERROR', `Failed to open connection: ${e.message}`);
    }
  }, [personality.voice, personality.tone, addLog, currentOutputText]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  // Handle Tool Calls (Automatic Mode Transition to RESEARCH if web-search)
  const handleIncomingToolCall = async (toolCall: any) => {
    const call = toolCall.functionCalls?.[0] || toolCall;
    const { name, args, id } = call;

    const risk = PolicyEngine.evaluateRisk(name, args);

    if (name === 'searchWeb') {
      setState('SEARCHING');
      setActiveActionStatus(`Searching for: ${args.query || 'information'}...`);

      // MODE B: Automatically transition to RESEARCH mode (Section 1, 13, 14)
      setInterfaceMode('RESEARCH');
      setResearchSession({
        id: `res-${Date.now()}`,
        query: args.query || 'Web Intelligence',
        summary: '',
        keyFindings: [],
        results: [],
        timestamp: Date.now(),
        status: 'SEARCHING',
      });
    } else if (name.toLowerCase().includes('search')) {
      setState('SEARCHING');
      setActiveActionStatus(`Searching for: ${args.query || 'information'}...`);
    } else {
      setState('EXECUTING');
      setActiveActionStatus(`Executing authorized tool: ${name}...`);
    }

    addLog('TOOL_CALL', `Gemini requested tool: ${name}`, args);

    const executeAndRespond = async () => {
      const startTime = performance.now();
      const res = await globalActionExecutor.executeTool(name, args);
      const durationMs = Math.round(performance.now() - startTime);

      addLog('TOOL_RESULT', `Tool ${name} completed: ${res.message || 'OK'}`, res, durationMs);
      setActiveActionStatus(undefined);

      // If web search, populate research session results
      if (name === 'searchWeb') {
        const rawResults = Array.isArray(res.data) ? res.data : [];
        setResearchSession((prev) =>
          prev
            ? {
                ...prev,
                status: 'READY',
                results: rawResults,
                summary: res.message || '',
                followUpQuestions: [
                  `Which ${args.query || 'source'} is most relevant?`,
                  `Compare key details across sources`,
                  `Summarize the primary takeaways`,
                  `What are the most notable recent updates?`,
                ],
              }
            : null
        );
      }

      // Send tool response back to Gemini Live
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'toolResponse',
            id: id || `call-${Date.now()}`,
            name,
            result: res.data || res.message,
          })
        );
      }
    };

    if (PolicyEngine.requiresConfirmation(risk)) {
      setConfirmDialog({
        isOpen: true,
        toolName: name,
        args,
        riskLevel: risk,
        onApprove: () => {
          setConfirmDialog(null);
          executeAndRespond();
        },
        onReject: () => {
          setConfirmDialog(null);
          setActiveActionStatus(undefined);
          addLog('INFO', `User declined execution of ${name}.`);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'toolResponse',
                id: id || `call-${Date.now()}`,
                name,
                result: 'Action declined: User chose not to authorize this operation.',
              })
            );
          }
        },
      });
    } else {
      await executeAndRespond();
    }
  };

  // Toggle Microphone / Voice Conversation
  const handleToggleVoice = async () => {
    if (isVoiceActive) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      globalAudioRecorder.stop();
      setIsVoiceActive(false);
      setState('IDLE');
      soundEffects.playClick();
      addLog('INFO', 'Voice capture paused by operator.');
    } else {
      soundEffects.playActivate();
      void globalAudioPlayer.unlock().catch(() => {});

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          await globalAudioRecorder.start((base64Chunk) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'audio',
                  audio: base64Chunk,
                })
              );
            }
          });
          setIsVoiceActive(true);
          setState('LISTENING');
          addLog('VOICE_INPUT', 'Real-time 16kHz microphone stream initialized.');
        } catch (err: any) {
          addLog('ERROR', `Could not access microphone: ${err.message}`);
        }
      } else {
        // Static Hosting / Offline Autonomous Voice Mode
        const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechClass) {
          try {
            const recognition = new SpeechClass();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
              setIsVoiceActive(true);
              setState('LISTENING');
              addLog('VOICE_INPUT', 'Web Speech Voice Recognition active.');
            };

            recognition.onresult = (event: any) => {
              const transcript = Array.from(event.results)
                .map((res: any) => res[0].transcript)
                .join('');
              setCurrentInputText(transcript);
              if (event.results[0].isFinal) {
                handleSendMessage(transcript);
              }
            };

            recognition.onerror = () => {
              setIsVoiceActive(false);
              setState('IDLE');
            };

            recognition.onend = () => {
              setIsVoiceActive(false);
            };

            recognition.start();
            speechRecognitionRef.current = recognition;

            // Also start audio recorder so 3D neural sphere reacts to voice amplitude!
            try {
              await globalAudioRecorder.start(() => {});
            } catch {}
          } catch (err: any) {
            addLog('ERROR', `Voice recognition error: ${err.message}`);
          }
        } else {
          addLog('INFO', 'SpeechRecognition not supported in this browser; using text input.');
        }
      }
    }
  };

  // User barge-in interrupt button (Section 21)
  const handleInterrupt = () => {
    globalAudioPlayer.interrupt();
    globalTranscriptProcessor.interrupt();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
    setState('LISTENING');
    setCurrentOutputText('');
    soundEffects.playClick();
    addLog('INFO', 'Operator interrupted vocal output.');
  };

  // Send Text Message or Follow-Up
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    void globalAudioPlayer.unlock().catch((err) => {
      console.error('Could not enable audio playback:', err);
    });

    soundEffects.playClick();

    // Check for conversational exit intent to return to IMMERSIVE mode (Section 15)
    const isExitIntent =
      /^(thanks|thank you|ok thanks|okay forget that|forget it|let's talk about something else|go back to normal|exit research|return to normal)/i.test(
        text.trim()
      );
    if (isExitIntent && interfaceMode === 'RESEARCH') {
      setInterfaceMode('IMMERSIVE');
    }

    // Check if query is explicitly asking for web search
    const isWebSearchQuery =
      /^(search the (web|internet)|look up|find information (on|online|about)|search online for)/i.test(
        text.trim()
      );
    if (isWebSearchQuery && interfaceMode !== 'RESEARCH') {
      setInterfaceMode('RESEARCH');
      const cleanTopic = text.replace(/^(search the (web|internet)|look up|find information (on|online|about)|search online for)\s*/i, '').replace(/^[for\s]+/, '');
      setResearchSession({
        id: `res-${Date.now()}`,
        query: cleanTopic || text,
        summary: '',
        keyFindings: [],
        results: [],
        timestamp: Date.now(),
        status: 'SEARCHING',
      });
    }

    setCurrentInputText(text);
    globalTranscriptProcessor.clear();

    setHistory((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      },
    ]);

    setState('THINKING');
    setActiveActionStatus('Synthesizing response...');
    addLog('INTENT', `User input: "${text}"`);

    // Maintain client-side research context in follow-ups (Section 11 & 12)
    let payloadText = text;
    if (
      interfaceMode === 'RESEARCH' &&
      researchSession &&
      researchSession.results.length > 0 &&
      !isExitIntent
    ) {
      const contextSummary = researchSession.results
        .slice(0, 3)
        .map((r) => `[Source: ${r.title} | ${r.snippet}]`)
        .join(' ');
      payloadText = `${text}\n[Context: Currently reviewing research for "${researchSession.query}". Sources: ${contextSummary}]`;
    }

    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: payloadText,
        })
      );
    } else {
      // Offline / Static Hosting Autonomous Neural Mode
      void (async () => {
        soundEffects.playTelemetry();
        const autonomousRes = await autonomousBrain.processQuery(payloadText);

        if (autonomousRes.modeChange) {
          setInterfaceMode(autonomousRes.modeChange);
        }
        if (autonomousRes.researchData) {
          setResearchSession({
            id: `res-${Date.now()}`,
            query: autonomousRes.researchData.query,
            summary: autonomousRes.researchData.summary,
            keyFindings: ['Autonomous ingestion complete', 'Telemetry synthesized'],
            results: autonomousRes.researchData.results,
            timestamp: Date.now(),
            status: 'READY',
          });
        }
        if (autonomousRes.toolExecuted) {
          addLog('TOOL_RESULT', `Autonomous execution: ${autonomousRes.toolExecuted.name}`);
        }

        setCurrentOutputText(autonomousRes.text);
        setHistory((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: autonomousRes.text,
            timestamp: Date.now(),
          },
        ]);

        setActiveActionStatus(undefined);
        soundEffects.playSuccess();

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(autonomousRes.text);
          utterance.rate = personality.speechRate || 1;
          utterance.onstart = () => setState('SPEAKING');
          utterance.onend = () => setState('IDLE');
          utterance.onerror = () => setState('IDLE');
          window.speechSynthesis.speak(utterance);
        } else {
          setState('IDLE');
        }
      })();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-neutral-100 flex flex-col font-sans select-none">
      {/* 1. Top Header with navigation & branding */}
      <Header
        state={state}
        connectionStatus={connectionStatus}
        onOpenActivity={() => setShowActivity(true)}
        onOpenMemory={() => setShowMemory(true)}
        onOpenTasks={() => setShowTasks(true)}
        onOpenTools={() => setShowTools(true)}
        onOpenSettings={() => setShowSettings(true)}
        activeTaskCount={activeTask ? 1 : 0}
      />

      {/* 2. Main Content Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* MODE A: FULL IMMERSIVE NEURAL CANVAS (Matching reference image) */}
        {interfaceMode === 'IMMERSIVE' && (
          <div className="absolute inset-0 z-0 bg-black transition-opacity duration-500">
            <NeuralCanvas
              state={state}
              settings={visualSettings}
              mode="full"
              onFpsUpdate={setFps}
            />
            <CyberHudOverlay
              state={state}
              connectionStatus={connectionStatus}
              metrics={metrics}
              fps={fps}
              latency={geminiLatency}
              interfaceMode={interfaceMode}
              onSetInterfaceMode={setInterfaceMode}
              isMuted={isMuted}
              onToggleMute={() => {
                const nextMute = !isMuted;
                soundEffects.setMuted(nextMute);
                setIsMuted(nextMute);
              }}
              onQuickCommand={(cmd) => handleSendMessage(cmd)}
            />
          </div>
        )}

        {/* MODE B: FLOATING MINI NEUTRON (Section 2, 3, 4) */}
        {interfaceMode === 'RESEARCH' && (
          <MiniNeutron
            state={state}
            settings={visualSettings}
            metrics={metrics}
            actionStatus={activeActionStatus}
            onExpand={() => setInterfaceMode('IMMERSIVE')}
          />
        )}

        {/* Dynamic Foreground Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 pointer-events-none">
          {/* Top Title (Immersive Mode Only) */}
          {interfaceMode === 'IMMERSIVE' ? (
            <div className="w-full max-w-2xl text-center pt-2">
              <h1 className="text-xs sm:text-sm font-mono tracking-[0.25em] text-white/60 uppercase font-medium">
                {state === 'IDLE' ? 'NEUTRON READY' : state}
              </h1>
            </div>
          ) : (
            <div className="h-4" />
          )}

          {/* Center Workspace Area */}
          <div className="w-full my-auto flex items-center justify-center">
            {interfaceMode === 'IMMERSIVE' ? (
              /* Immersive Floating Live Transcript HUD */
              <div className="w-full max-w-xl">
                <LiveTranscript
                  currentInputText={currentInputText}
                  currentOutputText={currentOutputText}
                  history={history}
                  activeActionStatus={activeActionStatus}
                  segments={transcriptSegments}
                  activePartialText={activePartialText}
                />
              </div>
            ) : (
              /* Research Mode: Dedicated Research Workspace (Section 5) */
              researchSession && (
                <div className="w-full">
                  <ResearchWorkspace
                    session={researchSession}
                    segments={transcriptSegments}
                    activePartialText={activePartialText}
                    isModelSpeaking={state === 'SPEAKING'}
                    onExitResearch={() => setInterfaceMode('IMMERSIVE')}
                    onSendFollowUp={handleSendMessage}
                  />
                </div>
              )
            )}
          </div>

          {/* Bottom Controls Area: Voice Controller & Text Input Bar */}
          <div className="w-full max-w-2xl space-y-4 pb-2">
            {/* Real-time Voice Button */}
            <div className="pointer-events-auto">
              <VoiceController
                state={state}
                isListening={isVoiceActive}
                metrics={metrics}
                onToggleVoice={handleToggleVoice}
                onInterrupt={handleInterrupt}
              />
            </div>

            {/* Secondary Text Input Bar */}
            <div className="pointer-events-auto">
              <TextInputBar onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </main>

      {/* 3. Sensitive & Destructive Action Confirmation Modal */}
      {confirmDialog && (
        <ConfirmationModal
          isOpen={confirmDialog.isOpen}
          toolName={confirmDialog.toolName}
          args={confirmDialog.args}
          riskLevel={confirmDialog.riskLevel}
          onConfirm={confirmDialog.onApprove}
          onCancel={confirmDialog.onReject}
        />
      )}

      {/* 4. First-Run Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onRequestMic={async () => {
          try {
            await globalAudioRecorder.start(() => {});
            globalAudioRecorder.stop();
            return true;
          } catch {
            return false;
          }
        }}
        onComplete={(newPersonality) => {
          setPersonality(newPersonality);
          localStorage.setItem('neutron_onboarded', 'true');
          setShowOnboarding(false);
          addLog('INFO', 'Onboarding completed. Voice & persona configured.');
        }}
      />

      {/* 5. Drawers */}
      <ActivityConsole
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
        logs={logs}
        metrics={metrics}
        fps={fps}
        geminiLatency={geminiLatency}
        webSocketStatus={connectionStatus}
      />

      <MemoryDrawer
        isOpen={showMemory}
        onClose={() => setShowMemory(false)}
        memories={memories}
      />

      <TaskDrawer
        isOpen={showTasks}
        onClose={() => setShowTasks(false)}
        activeTask={activeTask}
        history={taskHistory}
      />

      <ToolsDrawer
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        onRequestConfirm={(toolName, args, riskLevel, cb) => {
          setConfirmDialog({
            isOpen: true,
            toolName,
            args,
            riskLevel,
            onApprove: () => {
              setConfirmDialog(null);
              cb();
            },
            onReject: () => {
              setConfirmDialog(null);
            },
          });
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        personality={personality}
        onUpdatePersonality={setPersonality}
        visualSettings={visualSettings}
        onUpdateVisualSettings={setVisualSettings}
        onReconnect={() => {
          if (wsRef.current) wsRef.current.close();
          connectWebSocket();
        }}
      />
    </div>
  );
}
