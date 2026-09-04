/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  BrainCircuit,
  CornerDownLeft,
  Terminal,
  Bot,
  User,
  Info,
  Layers,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AiMessage, AiPrepTopic } from "./types";
import { aiAssistantService } from "./services";

interface AiAssistantProps {
  onShowAlert: (message: string, type: "success" | "info" | "error") => void;
}

export function AiAssistant({ onShowAlert }: AiAssistantProps) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "ai_1",
      sender: "ai",
      text: "Welcome back, Aarav! I am your AI Placement Mentor. I've audited your master credentials. Ask me anything about Google's interview guidelines, Stripe's eligibility cutoffs, vocal filler reduction, or backend concurrency prep!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("Placement Queries");
  const [isTyping, setIsTyping] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const topics = aiAssistantService.getTopics();

  const handleSendPrompt = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // 1. Add User Message
    const userMsg: AiMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // 2. Simulate AI Processing
    setTimeout(() => {
      const aiResponseText = aiAssistantService.askAssistant(selectedTopic, text);
      const aiMsg: AiMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      onShowAlert("AI Mentorship response received!", "success");
    }, 1200);
  };

  const handleTopicClick = (topic: AiPrepTopic) => {
    setSelectedTopic(topic.category);
    handleSendPrompt(topic.sampleQuestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
      id="ai-prep-assistant-center"
    >
      {/* LEFT COLUMN: Smart Preloaded Prompt Topics */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="pb-3 border-b border-zinc-150 dark:border-zinc-850">
            <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
              COHORT PREPARATION
            </span>
            <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50 mt-0.5">
              Smart Prep Topics
            </h3>
          </div>

          <p className="text-[10px] text-zinc-400 leading-normal">
            Select an official category and query template below. The AI Mentor will automatically parse your metrics and provide real-time strategic assistance.
          </p>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {topics.map(topic => {
              const isCurrent = selectedTopic === topic.category;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-indigo-600/5 dark:bg-indigo-600/[0.03] border-indigo-500/30 text-indigo-600"
                      : "bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  <span className="text-[8px] font-mono font-bold tracking-wider uppercase block mb-1 text-indigo-500">
                    {topic.category}
                  </span>
                  <h4 className="text-[11px] font-black line-clamp-1">
                    {topic.title}
                  </h4>
                  <p className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">
                    "{topic.sampleQuestion}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT 2 COLUMNS: Chat Window */}
      <div className="lg:col-span-2">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 rounded-3xl flex flex-col h-[520px] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-2xl">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xs font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                  <span>AI Placement Advisor</span>
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Active Session: {selectedTopic}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full">
              <Bot className="w-3 h-3" />
              <span>ACTIVE COGNITIVE AGENT</span>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[360px] bg-gradient-to-b from-zinc-50/20 to-zinc-100/10 dark:from-zinc-950/10 dark:to-zinc-900/10">
            {messages.map(msg => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Avatar wrapper */}
                  <div className={`p-2 rounded-xl shrink-0 self-end ${
                    isAi ? "bg-indigo-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-1">
                    <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-xs ${
                      isAi
                        ? "bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-150 rounded-bl-none"
                        : "bg-indigo-600 text-white rounded-br-none"
                    }`}>
                      {msg.text.split("\n").map((line, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <span className={`text-[8px] font-mono text-zinc-400 block ${!isAi ? "text-right" : ""}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%] items-center mr-auto">
                <div className="p-2 bg-indigo-500 text-white rounded-xl shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl rounded-bl-none flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer Box */}
          <div className="p-4 border-t border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Ask your AI Placement Mentor anything..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-4 py-3 rounded-2xl text-[11.5px] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
              />

              <button
                onClick={() => handleSendPrompt()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-2 shrink-0">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span>Command Line Mode: ENTER to submit</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
