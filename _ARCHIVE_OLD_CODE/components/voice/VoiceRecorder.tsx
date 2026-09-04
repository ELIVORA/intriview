/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

interface VoiceRecorderProps {
  sessionId: string;
  currentQuestionText: string;
  micActive: boolean;
  onTranscriptUpdate: (typed: string, interim: string) => void;
  onSubmitAnswer: (finalTranscript: string) => void;
  onVolumeChange: (level: number) => void;
  onSpeedUpdate: (wpm: number) => void;
  onConfidenceUpdate: (score: number) => void;
  loadingTurn: boolean;
}

export function VoiceRecorder({
  sessionId,
  currentQuestionText,
  micActive,
  onTranscriptUpdate,
  onSubmitAnswer,
  onVolumeChange,
  onSpeedUpdate,
  onConfidenceUpdate,
  loadingTurn
}: VoiceRecorderProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recognitionError, setRecognitionError] = useState<string>("");
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Track speech duration to calculate speed WPM
  const speechStartRef = useRef<number>(0);
  const currentTranscriptRef = useRef<string>("");

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechObj) {
      setRecognitionError("Web Speech API is not supported in this browser. Falling back to typing console.");
      return;
    }

    const rec = new SpeechObj();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final || interim) {
        if (speechStartRef.current === 0) {
          speechStartRef.current = Date.now();
        }

        // Aggregate current transcript text
        const currentFull = (currentTranscriptRef.current + " " + final + " " + interim).trim();
        onTranscriptUpdate(currentTranscriptRef.current + final, interim);

        // Dynamically compute speaking speed (WPM)
        const words = currentFull.split(/\s+/).filter(w => w.length > 0).length;
        const durationSec = Math.max(1, (Date.now() - speechStartRef.current) / 1000);
        const wpm = Math.round((words / durationSec) * 60);
        if (wpm > 0 && wpm < 300) {
          onSpeedUpdate(wpm);
        }

        // Live mock voice confidence score fluctuations
        const mockConf = Math.min(100, Math.max(60, 85 + Math.floor(Math.sin(Date.now() / 1000) * 10)));
        onConfidenceUpdate(mockConf);

        // --- SILENCE DETECTION (VAD) Workflow ---
        // Every time speech is recorded, reset silence countdown timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // If user remains quiet for 2.8s after speaking, automatically submit answer
        silenceTimerRef.current = setTimeout(() => {
          const finishedTranscript = (currentTranscriptRef.current + " " + final).trim();
          if (finishedTranscript.length > 5 && !loadingTurn) {
            console.log("[SILENCE_DETECTION] Silence detected. Automatically submitting transcript answer.");
            onSubmitAnswer(finishedTranscript);
            currentTranscriptRef.current = "";
            speechStartRef.current = 0;
          }
        }, 2800);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("[SPEECH_RECOGNITION] Error: ", e.error);
      if (e.error === "not-allowed") {
        setHasPermission(false);
      } else {
        setRecognitionError(`Recognition error occurred: ${e.error}`);
      }
    };

    rec.onend = () => {
      // Auto-restart if microphone is supposed to be active
      if (micActive && !loadingTurn) {
        try {
          recognitionRef.current?.start();
        } catch (err) {
          // Block already running error
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    };
  }, [micActive, loadingTurn]);

  // Request & Connect real-time Web Audio API Analyser
  const requestMediaAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const level = Math.min(100, Math.floor((sum / bufferLength) * 1.6));
        onVolumeChange(level);

        animationFrameRef.current = requestAnimationFrame(drawWaveMeter);
      };

      drawWaveMeter();

      // Trigger continuous speech recognition if enabled
      if (micActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } catch (err) {
      console.error("[VOICE_RECORDER] Microphone permission denied: ", err);
      setHasPermission(false);
    }
  };

  // Monitor micActive and trigger continuous speech stream
  useEffect(() => {
    if (micActive) {
      if (hasPermission === null) {
        requestMediaAccess();
      } else if (hasPermission === true && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          speechStartRef.current = Date.now();
        } catch (e) {}
      }
    } else {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      onVolumeChange(0);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [micActive, hasPermission]);

  // Clean up media context on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return null; // This is an orchestration component. It renders no visual UI, controlling standard flows.
}
