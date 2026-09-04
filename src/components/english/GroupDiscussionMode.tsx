/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Play,
  Pause,
  RefreshCw,
  MessageSquare,
  Award,
  Zap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { DialogueTurn, GroupDiscussionEvaluation } from "./types";

export function GroupDiscussionMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [discussionTopic, setDiscussionTopic] = useState(
    "Is Cloud Serverless strictly superior to Monolithic microservices for early-stage fintech architectures?"
  );

  const [chatLog, setChatLog] = useState<DialogueTurn[]>([]);
  const [activeSpeakerName, setActiveSpeakerName] = useState<string>("Moderator");
  
  // Evaluation outcomes
  const [evaluation, setEvaluation] = useState<GroupDiscussionEvaluation | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Discussion turn sequencer timer
  const discussionIntervalRef = useRef<any | null>(null);

  // Multi-agent pre-seeded turns script
  const simulatedDiscussionTurns: DialogueTurn[] = [
    {
      speaker: "Moderator",
      speakerName: "Moderator (Vocal Lead)",
      text: "Welcome team. Let us debate if early fintech systems should exclusively optimize for serverless pipelines or stick to resilient monolithic infrastructures. Rohan, what is your initial stance?",
      timestamp: "10:00 AM"
    },
    {
      speaker: "ParticipantA",
      speakerName: "Rohan (Technical Architect)",
      text: "In my opinion, fintech demands absolute security and ultra-low cold-start metrics. Monoliths are vastly simpler to audit, and relational transactions are tightly bound. Serverless introduces complex orchestration overhead that is unnecessary for small teams.",
      timestamp: "10:01 AM"
    },
    {
      speaker: "ParticipantB",
      speakerName: "Priya (Cloud Developer)",
      text: "I completely disagree, Rohan. Serverless allows early-stage startups to leverage scale-to-zero pricing. You only pay for active execution! This mitigates enormous cloud costs, allowing the firm to allocate budgets toward hiring top engineering talent.",
      timestamp: "10:02 AM"
    }
  ];

  const candidateCounterOptions = [
    {
      label: "Interpose construct: Align with Priya",
      text: "I agree with Priya's stance. For startups, cash velocity is pivotal. Leveraging AWS serverless mitigates massive up-front operational capital, freeing engineers to build core product loops."
    },
    {
      label: "Interpose construct: Support Rohan's security argument",
      text: "Rohan makes a strong security argument. Relational database pooling and strict compliance frameworks are vastly simpler to govern inside an orchestrated monolith, which mitigates early security vulnerabilities."
    },
    {
      label: "Interpose balance: Propose Hybrid orchestration",
      text: "I propose a hybrid architectural roadmap. We should run our transactional databases on secure, dedicated containers, but leverage serverless functions for asynchronous tasks like report generations and image resizing."
    }
  ];

  // Starts/Resumes the automated multi-agent chat log sequencer
  const handleStartDiscussion = () => {
    setIsPlaying(true);
    setEvaluation(null);
    setIsCompleted(false);

    if (chatLog.length === 0) {
      setChatLog([simulatedDiscussionTurns[0]]);
      setActiveSpeakerName(simulatedDiscussionTurns[1].speakerName);
      speakText(simulatedDiscussionTurns[0].text);
    } else {
      resumeSequencer();
    }
  };

  const resumeSequencer = () => {
    let nextTurnIdx = chatLog.length;

    discussionIntervalRef.current = setInterval(() => {
      if (nextTurnIdx < simulatedDiscussionTurns.length) {
        const nextTurn = simulatedDiscussionTurns[nextTurnIdx];
        setChatLog(prev => [...prev, nextTurn]);
        setActiveSpeakerName(
          nextTurnIdx + 1 < simulatedDiscussionTurns.length
            ? simulatedDiscussionTurns[nextTurnIdx + 1].speakerName
            : "Awaiting Candidate's Viewpoint..."
        );
        speakText(nextTurn.text);
        nextTurnIdx++;
      } else {
        clearInterval(discussionIntervalRef.current);
        setIsPlaying(false);
      }
    }, 4500);
  };

  const handlePauseDiscussion = () => {
    setIsPlaying(false);
    if (discussionIntervalRef.current) {
      clearInterval(discussionIntervalRef.current);
    }
  };

  const speakText = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Injects the student's argument into the current debate stream
  const handleCandidateSpeech = (speechText: string) => {
    handlePauseDiscussion();

    const candidateTurn: DialogueTurn = {
      speaker: "Candidate",
      speakerName: "You (Candidate)",
      text: speechText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatLog(prev => [...prev, candidateTurn]);
    speakText(speechText);

    // Prompt subsequent AI responses
    setTimeout(() => {
      const moderatorClosing: DialogueTurn = {
        speaker: "Moderator",
        speakerName: "Moderator (Vocal Lead)",
        text: "That was an exceptionally balanced and cohesive argument! Analyzing and proposing hybrid serverless structures proves deep system awareness. Let us conclude this discussion and review individual GD performance metrics.",
        timestamp: "10:04 AM"
      };

      setChatLog(prev => [...prev, moderatorClosing]);
      speakText(moderatorClosing.text);
      setIsCompleted(true);

      // Trigger final multi-agent evaluation scores
      setEvaluation({
        leadershipScore: 88,
        communicationScore: 92,
        activeListeningScore: 85,
        teamworkScore: 90,
        feedbackSummary:
          "You displayed outstanding teamwork and technical leadership. Proposing a balanced hybrid serverless system shows tactical product maturity. Your communication paced smoothly, and you did not aggressively override fellow peers."
      });
    }, 2500);
  };

  const handleResetDiscussion = () => {
    handlePauseDiscussion();
    setChatLog([]);
    setEvaluation(null);
    setIsCompleted(false);
    setActiveSpeakerName("Moderator");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" id="group-discussion-screen">
      
      {/* Col 1: Panel Controller & Counters */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6 h-fit">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            INTERVIEW GD ARENA
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Group Discussion Simulator
          </h3>
        </div>

        {/* Discussion Topic Box */}
        <div className="p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 space-y-1.5">
          <span className="text-[9px] font-mono font-bold text-indigo-500 uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>ACTIVE GD PARADIGM</span>
          </span>
          <p className="text-xs text-zinc-700 dark:text-zinc-200 font-semibold leading-relaxed">
            "{discussionTopic}"
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2">
          {isPlaying ? (
            <button
              onClick={handlePauseDiscussion}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause debate</span>
            </button>
          ) : (
            <button
              onClick={handleStartDiscussion}
              disabled={isCompleted}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Play debate</span>
            </button>
          )}

          <button
            onClick={handleResetDiscussion}
            className="p-2.5 bg-zinc-50 hover:bg-zinc-150 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-200 rounded-xl border border-zinc-200/30 dark:border-zinc-850 transition-colors"
            title="Reset discussion"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Interruption selection triggers */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">
            INTERRUPT / PRESENT ARGUMENT
          </label>
          <div className="space-y-2">
            {candidateCounterOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleCandidateSpeech(opt.text)}
                disabled={chatLog.length === 0 || isCompleted}
                className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/[0.02] text-[10px] leading-relaxed transition-all disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 flex items-start gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Col 2 & 3: Live Discussion Monitor & Leaderboard Scores */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Discussion Terminal log */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 rounded-3xl shadow-xs flex flex-col min-h-[380px] justify-between">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">Debate Session Live feed</span>
            <div className="text-[9px] font-mono text-zinc-400">
              Next Speaker: <strong className="text-indigo-500">{activeSpeakerName}</strong>
            </div>
          </div>

          {/* Scrolling discussion turns bubbles */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[280px]">
            {chatLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
                  <Users className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                    Awaiting Debate Playback
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Click "Play debate" to initiate multi-agent discussions.
                  </p>
                </div>
              </div>
            ) : (
              chatLog.map((turn, idx) => {
                const isCandidate = turn.speaker === "Candidate";
                const isMod = turn.speaker === "Moderator";

                return (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] ${isCandidate ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div className={`p-2 rounded-xl h-fit shrink-0 text-white ${
                      isCandidate ? "bg-emerald-500" : isMod ? "bg-indigo-500" : "bg-purple-500"
                    }`}>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      isCandidate
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    }`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-[10px] opacity-75">{turn.speakerName}</span>
                        <span className="text-[8px] opacity-50 font-mono">{turn.timestamp}</span>
                      </div>
                      <p className="leading-relaxed font-sans italic">"{turn.text}"</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/10 text-center text-[9px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-900">
            Click any counter argument under "INTERRUPT" above to inject your spoken viewpoint cleanly into the debate flow.
          </div>
        </div>

        {/* Concluded Group Discussion scores card */}
        {isCompleted && evaluation && (
          <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-emerald-500" />
                <span className="text-xs font-black text-zinc-850 dark:text-zinc-100">GD Performance Analysis</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold uppercase">
                EVALUATED
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-zinc-400 font-mono uppercase block">Leadership Index</span>
                <span className="text-base font-black text-indigo-500 font-mono block">{evaluation.leadershipScore}%</span>
              </div>
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-zinc-400 font-mono uppercase block">Communication Stance</span>
                <span className="text-base font-black text-indigo-500 font-mono block">{evaluation.communicationScore}%</span>
              </div>
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-zinc-400 font-mono uppercase block">Active Listening</span>
                <span className="text-base font-black text-indigo-500 font-mono block">{evaluation.activeListeningScore}%</span>
              </div>
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-zinc-400 font-mono uppercase block">Team Collaboration</span>
                <span className="text-base font-black text-emerald-600 font-mono block">{evaluation.teamworkScore}%</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs leading-relaxed text-emerald-600">
              <strong>Evaluation Summary:</strong> {evaluation.feedbackSummary}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
export default GroupDiscussionMode;
