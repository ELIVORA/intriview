import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, LoaderCircle, Mic, MicOff, RotateCcw, Send, Volume2, VolumeX } from "lucide-react";
import { api } from "../../services/api";
import { getCandidateMemory } from "../../services/candidateMemory";

type Persona = { id: string; label: string; tone: string; voiceHints: RegExp };
type Turn = {
  speaker: "AI" | "Candidate";
  text: string;
  timestamp: string;
  coaching?: {
    encouragement?: string;
    naturalAlternative?: string;
    grammarErrors?: string[];
    pronunciationTip?: string;
  };
};

const PERSONAS: Persona[] = [
  { id: "Friendly Teacher", label: "Friendly Teacher", tone: "Warm and encouraging", voiceHints: /Samantha|Karen|Zira|Google UK English Female|Aria|Jenny/i },
  { id: "Supportive Mentor", label: "Supportive Mentor", tone: "Calm and confidence-building", voiceHints: /Daniel|David|Google UK English Male|Guy|Ryan/i },
  { id: "Professional Interviewer", label: "Professional Interviewer", tone: "Polished and clear", voiceHints: /Google US English|Mark|Alex|Andrew|Brian/i },
  { id: "Calm Coach", label: "Calm Coach", tone: "Gentle and focused", voiceHints: /Karen|Samantha|Hazel|Aria/i },
  { id: "Energetic Coach", label: "Energetic Coach", tone: "Positive and motivating", voiceHints: /Ava|Zira|Jenny|Google US English/i },
];

const SILENCE_MS = 5000;
const formatTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function mapMemoryHistory(history: any[]): Turn[] {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-12)
    .map((turn): Turn => ({
      speaker: turn?.role === "candidate" ? "Candidate" : "AI",
      text: String(turn?.text || "").trim(),
      timestamp: String(turn?.timestamp || new Date().toISOString()),
      coaching: turn?.coaching,
    }))
    .filter((turn) => turn.text);
}

function loadEnglishVoice(persona: Persona): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => /^en/i.test(voice.lang) && persona.voiceHints.test(voice.name)) ||
    voices.find((voice) => /^en-US$/i.test(voice.lang)) ||
    voices.find((voice) => /^en/i.test(voice.lang)) ||
    null
  );
}

function splitSpeech(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  const chunks: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= 180) chunks.push(sentence.trim());
    else {
      const words = sentence.trim().split(/\s+/);
      let part = "";
      for (const word of words) {
        const next = part ? `${part} ${word}` : word;
        if (next.length > 180) {
          if (part) chunks.push(part);
          part = word;
        } else part = next;
      }
      if (part) chunks.push(part);
    }
  }
  return chunks.filter(Boolean);
}

export function ConversationScreen() {
  const [chatHistory, setChatHistory] = useState<Turn[]>([]);
  const [inputText, setInputText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [memory, setMemory] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noSpeechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speechActiveRef = useRef(false);
  const speechRunRef = useRef(0);
  const activeRef = useRef(false);
  const startedRef = useRef(false);
  const submittingRef = useRef(false);
  const thinkingRef = useRef(false);
  const recognitionGenerationRef = useRef(0);
  const committedTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const inputTextRef = useRef("");
  const chatHistoryRef = useRef<Turn[]>([]);
  const selectedPersonaRef = useRef(PERSONAS[0]);

  const selectedPersona = useMemo(
    () => PERSONAS.find((item) => item.id === persona) || PERSONAS[0],
    [persona]
  );

  useEffect(() => { selectedPersonaRef.current = selectedPersona; }, [selectedPersona]);
  useEffect(() => { inputTextRef.current = inputText; }, [inputText]);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (noSpeechTimerRef.current) clearTimeout(noSpeechTimerRef.current);
    silenceTimerRef.current = null;
    noSpeechTimerRef.current = null;
  }, []);

  const stopSpeech = useCallback(() => {
    speechRunRef.current += 1;
    speechQueueRef.current = [];
    speechActiveRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string, afterSpeech?: () => void) => {
    if (!voiceEnabled || !text || typeof window === "undefined" || !window.speechSynthesis) {
      setSpeaking(false);
      afterSpeech?.();
      return;
    }

    const speechRun = ++speechRunRef.current;
    speechQueueRef.current = splitSpeech(text);
    speechActiveRef.current = true;
    window.speechSynthesis.cancel();

    const playNext = () => {
      if (speechRun !== speechRunRef.current) return;
      const next = speechQueueRef.current.shift();
      if (!next) {
        speechActiveRef.current = false;
        setSpeaking(false);
        window.setTimeout(() => { if (speechRun === speechRunRef.current) afterSpeech?.(); }, 100);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(next);
      const voice = loadEnglishVoice(selectedPersonaRef.current);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "en-US";
      utterance.rate = selectedPersonaRef.current.id === "Energetic Coach" ? 0.98 : 0.94;
      utterance.pitch = selectedPersonaRef.current.id === "Energetic Coach" ? 1.03 : 1;
      utterance.volume = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = playNext;
      utterance.onerror = () => playNext();
      window.speechSynthesis.speak(utterance);
    };

    // Some Chromium builds load voices asynchronously.
    if (window.speechSynthesis.getVoices().length === 0) {
      window.setTimeout(playNext, 180);
    } else {
      playNext();
    }
  }, [voiceEnabled]);

  const beginListening = useCallback((preserveTranscript = false) => {
    const Recognition = getRecognitionCtor();
    if (!Recognition || !activeRef.current || submittingRef.current || thinkingRef.current) return false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const generation = ++recognitionGenerationRef.current;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    if (!preserveTranscript) {
      committedTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      setInputText("");
    }
    clearSilenceTimers();

    recognition.onstart = () => {
      if (generation !== recognitionGenerationRef.current) return;
      setListening(true);
      noSpeechTimerRef.current = setTimeout(() => {
        if (!committedTranscriptRef.current.trim() && !interimTranscriptRef.current.trim() && !thinkingRef.current && activeRef.current) {
          setError("I did not hear a response. Take your time and try again when you are ready.");
          activeRef.current = false;
          try { recognition.stop(); } catch {}
          setListening(false);
        }
      }, SILENCE_MS);
    };

    recognition.onresult = (event: any) => {
      if (generation !== recognitionGenerationRef.current || submittingRef.current) return;
      let finalChunk = "";
      let interim = "";
      const startIndex = Number.isInteger(event?.resultIndex) ? event.resultIndex : 0;
      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = String(result?.[0]?.transcript || "").trim();
        if (!transcript) continue;
        if (result.isFinal) finalChunk += `${transcript} `;
        else interim += `${transcript} `;
      }

      if (finalChunk.trim()) {
        committedTranscriptRef.current = `${committedTranscriptRef.current} ${finalChunk}`.replace(/\s+/g, " ").trim();
      }
      interimTranscriptRef.current = interim.replace(/\s+/g, " ").trim();
      const visible = `${committedTranscriptRef.current} ${interimTranscriptRef.current}`.replace(/\s+/g, " ").trim();
      inputTextRef.current = visible;
      setInputText(visible);
      clearSilenceTimers();

      if (visible.length > 2) {
        silenceTimerRef.current = setTimeout(() => { void submitSpokenTurn(); }, SILENCE_MS);
      }
    };

    recognition.onerror = (event: any) => {
      if (generation !== recognitionGenerationRef.current || submittingRef.current) return;
      setListening(false);
      const code = String(event?.error || "");
      if (code === "not-allowed" || code === "service-not-allowed") {
        activeRef.current = false;
        setError("Microphone access was denied. Allow microphone access in your browser, then restart the conversation.");
      } else if (code !== "aborted" && code !== "no-speech") {
        setError("I could not hear that clearly. Your visible transcript was kept. You can continue or send it manually.");
      }
    };

    recognition.onend = () => {
      if (generation !== recognitionGenerationRef.current) return;
      setListening(false);
      if (!activeRef.current || submittingRef.current || thinkingRef.current) return;
      // Restart without clearing the transcript. This fixes the previous transcript-loss bug.
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (generation !== recognitionGenerationRef.current || !activeRef.current || submittingRef.current || thinkingRef.current) return;
        beginListening(true);
      }, 140);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      return true;
    } catch {
      setListening(false);
      setError("Voice input could not start. Check your browser microphone permission and try again.");
      return false;
    }
  }, [clearSilenceTimers]);

  const submitSpokenTurn = useCallback(async () => {
    clearSilenceTimers();
    if (submittingRef.current || thinkingRef.current) return;
    const message = `${committedTranscriptRef.current} ${interimTranscriptRef.current}`.replace(/\s+/g, " ").trim() || inputTextRef.current.trim();
    if (!message) return;

    submittingRef.current = true;
    activeRef.current = false;
    recognitionGenerationRef.current += 1;
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
    setError("");

    const now = new Date().toISOString();
    const candidateTurn: Turn = { speaker: "Candidate", text: message, timestamp: now };
    const nextHistory = [...chatHistoryRef.current, candidateTurn];
    chatHistoryRef.current = nextHistory;
    setChatHistory(nextHistory);
    setInputText(message);
    inputTextRef.current = message;
    thinkingRef.current = true;
    setThinking(true);

    try {
      const response = await api.post("/v1/communication/conversation", {
        message,
        persona,
        history: nextHistory.slice(-12),
      });
      const conversation = response.data?.conversation || {};
      const reply = String(conversation.reply || "").trim();
      if (!reply) throw new Error("The communication coach returned an empty response.");

      const aiTurn: Turn = { speaker: "AI", text: reply, timestamp: new Date().toISOString(), coaching: conversation };
      const updatedHistory = [...nextHistory, aiTurn];
      chatHistoryRef.current = updatedHistory;
      setChatHistory(updatedHistory);
      if (response.data?.communication) setMemory((current: any) => ({ ...(current || {}), communication: response.data.communication }));

      committedTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      inputTextRef.current = "";
      setInputText("");
      speak(reply, () => {
        submittingRef.current = false;
        thinkingRef.current = false;
        setThinking(false);
        activeRef.current = startedRef.current;
        if (activeRef.current) beginListening(false);
      });
    } catch (error: any) {
      setError(error?.message || "The communication coach is unavailable right now. Please try again.");
      setInputText(message);
      inputTextRef.current = message;
      submittingRef.current = false;
      thinkingRef.current = false;
      setThinking(false);
      activeRef.current = startedRef.current;
      if (activeRef.current) beginListening(true);
    }
  }, [beginListening, clearSilenceTimers, persona, speak]);

  const startConversation = useCallback(async () => {
    clearSilenceTimers();
    stopSpeech();
    recognitionGenerationRef.current += 1;
    try { recognitionRef.current?.stop(); } catch {}
    activeRef.current = false;
    startedRef.current = false;
    submittingRef.current = true;
    thinkingRef.current = true;
    setListening(false);
    setError("");
    setThinking(true);

    try {
      const response = await api.post("/v1/communication/conversation/start", { persona });
      const opening = String(response.data?.conversation?.opening || "").trim();
      if (!opening) throw new Error("The coach did not return an opening question.");
      const communication = response.data?.communication;
      const restoredHistory = mapMemoryHistory(communication?.conversation_history || []);
      const openingTurn: Turn = { speaker: "AI", text: opening, timestamp: new Date().toISOString() };
      const updatedHistory = [...restoredHistory, openingTurn].slice(-14);
      chatHistoryRef.current = updatedHistory;
      setChatHistory(updatedHistory);
      setStarted(true);
      startedRef.current = true;
      if (communication) setMemory((current: any) => ({ ...(current || {}), communication }));

      submittingRef.current = false;
      thinkingRef.current = false;
      setThinking(false);
      activeRef.current = true;
      speak(opening, () => { if (activeRef.current) beginListening(false); });
    } catch (error: any) {
      setError(error?.message || "The communication coach is unavailable right now.");
      submittingRef.current = false;
      thinkingRef.current = false;
      setThinking(false);
      activeRef.current = false;
      startedRef.current = false;
      setStarted(false);
    }
  }, [beginListening, clearSilenceTimers, persona, speak, stopSpeech]);

  const stopListening = useCallback(() => {
    clearSilenceTimers();
    activeRef.current = false;
    recognitionGenerationRef.current += 1;
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, [clearSilenceTimers]);

  useEffect(() => {
    let mounted = true;
    getCandidateMemory()
      .then((candidateMemory) => {
        if (!mounted) return;
        setMemory(candidateMemory);
        const previous = mapMemoryHistory(candidateMemory?.communication?.conversation_history || []);
        chatHistoryRef.current = previous;
        if (previous.length) setChatHistory(previous);
      })
      .catch(() => { if (mounted) setMemory(null); });

    setIsSupported(Boolean(getRecognitionCtor()));
    const onVoicesChanged = () => setIsSupported(Boolean(getRecognitionCtor()));
    window.speechSynthesis?.addEventListener?.("voiceschanged", onVoicesChanged);
    return () => {
      mounted = false;
      activeRef.current = false;
      startedRef.current = false;
      submittingRef.current = true;
      thinkingRef.current = false;
      clearSilenceTimers();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop?.(); } catch {}
      stopSpeech();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", onVoicesChanged);
    };
  }, [clearSilenceTimers, stopSpeech]);

  const lastAI = [...chatHistory].reverse().find((turn) => turn.speaker === "AI");
  const communication = memory?.communication;
  const currentTranscript = inputText.trim();

  return (
    <div className="coach-surface w-full min-w-0">
      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px]">
        <section className="flex min-h-[560px] min-w-0 flex-col">
          <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"><Bot className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{selectedPersona.label}</h3>
                  {listening && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Listening</span>}
                  {speaking && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Speaking</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{selectedPersona.tone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <select value={persona} onChange={(event) => setPersona(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-medium outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-900">
                  {PERSONAS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <button type="button" onClick={() => setVoiceEnabled((value) => !value)} className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900" title={voiceEnabled ? "Mute AI voice" : "Enable AI voice"}>
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button type="button" onClick={startConversation} disabled={thinking} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
                {thinking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                <span className="hidden sm:inline">{started ? "Restart" : "Start"}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50/60 px-3 py-3 dark:bg-zinc-950/50 sm:px-5">
            {!chatHistory.length ? (
              <div className="flex min-h-[430px] items-center justify-center px-4 text-center">
                <div className="max-w-md">
                  <h3 className="text-base font-semibold tracking-tight">Start a natural conversation</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">Speak normally. I’ll listen, respond, and give gentle feedback after each turn.</p>
                  <button type="button" onClick={startConversation} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"><Mic className="h-4 w-4" />Start conversation</button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-2.5">
                {chatHistory.map((turn, index) => (
                  <div key={`${turn.timestamp}-${index}`} className={`flex ${turn.speaker === "AI" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[92%] rounded-2xl px-3.5 py-3 sm:max-w-[82%] ${turn.speaker === "AI" ? "border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"}`}>
                      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-55">{turn.speaker === "AI" ? selectedPersona.label : "You"} · {formatTime(turn.timestamp)}</div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{turn.text}</p>
                      {turn.speaker === "AI" && turn.coaching && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs leading-5 dark:border-zinc-800">
                          {turn.coaching.encouragement && <p className="font-medium text-emerald-700 dark:text-emerald-400">{turn.coaching.encouragement}</p>}
                          {turn.coaching.naturalAlternative && <p><span className="font-semibold text-blue-700">More natural:</span> {turn.coaching.naturalAlternative}</p>}
                          {Array.isArray(turn.coaching.grammarErrors) && turn.coaching.grammarErrors.length > 0 && <p><span className="font-semibold">Improve:</span> {String(turn.coaching.grammarErrors[0])}</p>}
                          {turn.coaching.pronunciationTip && <p><span className="font-semibold">Pronunciation:</span> {turn.coaching.pronunciationTip}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-500 dark:border-zinc-800 dark:bg-zinc-900"><LoaderCircle className="h-4 w-4 animate-spin" />Preparing your next reply…</div>}
              </div>
            )}
          </div>

          {currentTranscript && started && (
            <div className="border-t border-slate-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950 sm:px-5">
              <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-1 flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Live transcript</span><span className="text-[10px] text-slate-400">{listening ? "Listening" : "Captured"}</span></div>
                <p className="text-sm leading-6 text-slate-800 dark:text-zinc-100">{currentTranscript}</p>
              </div>
            </div>
          )}

          {error && <div className="border-t border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 sm:px-5">{error}</div>}

          <div className="border-t border-slate-200 p-3 dark:border-zinc-800 sm:p-4">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <button type="button" onClick={listening ? stopListening : () => beginListening(false)} disabled={thinking || !started || !isSupported} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${listening ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"}`} title={listening ? "Pause listening" : "Resume listening"}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-2"><span className="truncate text-xs text-slate-500 dark:text-zinc-400">{listening ? "Speak naturally. Pause for about 5 seconds when finished." : started ? "Ready for your next response." : "Start the conversation first."}</span>{listening && <span className="shrink-0 text-[10px] font-semibold text-rose-600">LIVE</span>}</div>
              </div>
              <button type="button" onClick={() => void submitSpokenTurn()} disabled={!inputText.trim() || thinking || !started} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white disabled:opacity-40" title="Send current transcript"><Send className="h-4 w-4" /></button>
            </div>
            {!isSupported && <p className="mt-2 text-center text-[11px] text-amber-600">Voice input is not supported in this browser. Typed answers still work.</p>}
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Communication progress</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["clarity", "confidence", "fluency", "grammar"].map((label) => {
                  const value = Number(communication?.[label] || 0);
                  return <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"><div className="text-[10px] font-medium uppercase text-slate-400">{label}</div><div className="mt-1 text-lg font-semibold">{value > 0 ? `${Math.round(value)}%` : "—"}</div></div>;
                })}
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-zinc-800">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Recurring focus</div>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-zinc-300">{communication?.recurring_communication_weaknesses?.length ? communication.recurring_communication_weaknesses.slice(-3).join(" • ") : "Your coach will build this from real conversations."}</p>
            </div>
            {lastAI?.coaching?.naturalAlternative && (
              <div className="border-t border-slate-200 pt-4 dark:border-zinc-800">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Last correction</div>
                <p className="mt-2 text-xs leading-5 text-slate-700 dark:text-zinc-200">{lastAI.coaching.naturalAlternative}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ConversationScreen;
