import { useState, useEffect, useRef } from "react";
import { MessageSquare, Sparkles, Send, Bot, X, Trash2, Minus, Maximize2, HelpCircle, FileText, Mic, Award } from "lucide-react";
import { api } from "../../services/api";
import { useTheme } from "../../providers/ThemeProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AppSidebarChatbotProps {
  currentTab?: string;
  atsScore?: number;
  resumeFileName?: string;
}

// Simple Helper to render basic markdown bold text and bullet points cleanly
function renderFormattedText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    // Check bullet points
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
    const cleanLine = isBullet ? line.trim().substring(2) : line;

    // Parse **bold** tags
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

    const parsedContent = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pIdx} className="font-bold text-indigo-600 dark:text-indigo-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={lIdx} className="flex items-start gap-1.5 my-0.5 pl-1">
          <span className="text-indigo-500 dark:text-indigo-400 font-bold">•</span>
          <span>{parsedContent}</span>
        </div>
      );
    }

    return (
      <div key={lIdx} className={line.trim() === "" ? "h-2" : "my-0.5"}>
        {parsedContent}
      </div>
    );
  });
}

export function AppSidebarChatbot({ currentTab = "overview", atsScore, resumeFileName }: AppSidebarChatbotProps) {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("app_sidebar_chatbot_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "m-welcome",
        role: "assistant",
        content: "Hello! I am your **Interview Cracker Assistant**. Ask me anything about your ATS resume score, changing interviewer voices in Settings, launching mock interviews, or coding practice!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("app_sidebar_chatbot_history", JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post("/v1/app-assistant", {
        prompt: textToSend,
        history: historyPayload,
        currentTab,
        atsScore,
        resumeFileName
      });

      const replyContent = res.data?.answer || "I am here to guide you with ATS resume scoring, voice customization, and mock interview practice!";

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn("Chatbot API error, using intelligent offline answer", err);
      let offlineAnswer = "I'm your Interview Cracker assistant! You can upload a resume for permanent ATS scoring (out of 100), select interviewer voices in Settings, and launch AI practice interviews anytime.";
      const lower = textToSend.toLowerCase();

      if (lower.includes("ats") || lower.includes("score") || lower.includes("mark")) {
        offlineAnswer = "Your **ATS Score** is calculated out of 100 based on structure, skills, active verbs, and quantitative impact.\n\nOnce uploaded, your score and parsed resume **stay permanently saved** in storage until you manually click 'Remove Resume'. They will NOT reset when navigating back and forth!";
      } else if (lower.includes("voice") || lower.includes("accent") || lower.includes("sound")) {
        offlineAnswer = "You can customize the AI interviewer's voice under the **Settings** tab! Choose from Sarah (US), David (UK), Elena (EU), Marcus (US), Priya (IN), or James (AU), adjust speaking speed/pitch, and test audio playback live.";
      } else if (lower.includes("interview") || lower.includes("attend") || lower.includes("practice")) {
        offlineAnswer = "Once your resume is uploaded, you can attend mock interviews anytime! Click **Attend AI Practice Interview** or navigate to the AI Practice Studio. Your resume projects and ATS score will automatically format your interview questions.";
      } else if (lower.includes("remove") || lower.includes("upload")) {
        offlineAnswer = "You don't need to re-upload your resume every time! It stays saved. If you want to replace it, click **Remove Resume** on the Resume Analysis page.";
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: offlineAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const welcomeMsg: Message = {
      id: `w-${Date.now()}`,
      role: "assistant",
      content: "Chat history cleared. How can I assist you with Interview Cracker today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([welcomeMsg]);
  };

  const quickPrompts = [
    { label: "How is ATS score calculated?", icon: Award },
    { label: "Will my resume stay saved?", icon: FileText },
    { label: "How do I change voice/accent?", icon: Mic },
    { label: "How to start mock interview?", icon: Sparkles }
  ];

  return (
    <>
      {/* 1. FIXED FLOATING CORNER WIDGET BUTTON (WHEN CLOSED) */}
      {!isOpen && (
        <button
          id="app-chatbot-floating-trigger"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 p-3.5 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/40 flex items-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-95 border border-white/20 dark:border-indigo-400/20"
          title="Open AI App Assistant"
        >
          <Bot className="w-5 h-5 text-white" />
          <span className="text-xs font-bold pr-0.5 hidden sm:inline">AI Assistant</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>
      )}

      {/* 2. FIXED FLOATING WINDOW FOR CHAT (DYNAMIC LIGHT & DARK MODE RESPONSIVE) */}
      {isOpen && (
        <div
          id="app-chatbot-floating-window"
          className={`fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[380px] md:w-[400px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? "h-14" : "h-[490px]"
          }`}
        >
          {/* HEADER BAR */}
          <div
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 dark:from-indigo-700 dark:via-indigo-800 dark:to-violet-800 text-white flex items-center justify-between select-none cursor-pointer border-b border-indigo-500/30"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none text-white">AI Assistant</span>
                <span className="text-[10px] text-emerald-300 font-mono font-medium block mt-0.5">● Online</span>
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-300 dark:text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-slate-300 dark:text-zinc-400 hover:text-red-400 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 dark:text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* MESSAGES SCROLL AREA */}
              <div className="flex-1 p-3.5 bg-slate-50/80 dark:bg-zinc-950/80 overflow-y-auto space-y-3 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none font-medium shadow-sm"
                          : "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-slate-200/90 dark:border-zinc-800 rounded-tl-none shadow-xs"
                      }`}
                    >
                      <div>{renderFormattedText(m.content)}</div>
                      <span className={`text-[9px] block mt-1.5 font-mono ${m.role === "user" ? "text-blue-200 text-right" : "text-slate-400 dark:text-zinc-500"}`}>
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-xs py-2 italic bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/90 dark:border-zinc-800 w-fit shadow-xs">
                    <Bot className="w-4 h-4 animate-bounce text-indigo-500 dark:text-indigo-400" />
                    <span>Assistant is thinking...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* QUICK PROMPTS CHIPS BAR */}
              <div className="p-2.5 bg-slate-100/70 dark:bg-zinc-900/90 border-t border-slate-200/80 dark:border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(qp.label)}
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-zinc-200 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-zinc-700/80 shadow-xs"
                    >
                      <Icon className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <span>{qp.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask any question about Interview Cracker..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

