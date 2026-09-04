/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface AIInterviewerAvatarProps {
  name: string;
  role: string;
  avatarEmoji?: string;
  isSpeaking: boolean;
  soundLevel: number;
  imageUrl?: string;
  gender?: "female" | "male";
  size?: "normal" | "large";
}

// High resolution professional interviewer photos library
export const INTERVIEWER_AVATARS = [
  {
    id: "emma",
    name: "Emma",
    role: "Senior HR Recruiter",
    company: "Friendly & Supportive",
    gender: "female",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    voice: { pitch: 1.1, rate: 1.0, sampleText: "Hello! I am Emma, your HR Recruiter. I'm here to support you and learn about your background." }
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "Technical Recruiter",
    company: "Technical & Detailed",
    gender: "female",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    voice: { pitch: 1.0, rate: 0.95, sampleText: "Hi, I'm Sophia. I will be evaluating your technical skills and detailed engineering knowledge." }
  },
  {
    id: "daniel",
    name: "Daniel",
    role: "Engineering Manager",
    company: "Deep Technical Focus",
    gender: "male",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    voice: { pitch: 0.9, rate: 0.95, sampleText: "Welcome. I am Daniel, Engineering Manager. Let's dive deep into your technical architecture and systems." }
  },
  {
    id: "james",
    name: "James",
    role: "Senior Software Engineer",
    company: "Coding-heavy",
    gender: "male",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
    voice: { pitch: 0.95, rate: 1.05, sampleText: "Hey there, I'm James. We're going to write some code today and optimize some algorithms." }
  },
  {
    id: "olivia",
    name: "Olivia",
    role: "Behavioral Interviewer",
    company: "Behavioral & Leadership",
    gender: "female",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    voice: { pitch: 1.05, rate: 0.9, sampleText: "Hello! I'm Olivia. I'd love to hear about your past experiences and leadership principles." }
  }
];

const INTERVIEWER_PHOTOS: Record<string, string> = {
  Emma: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  Sophia: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
  Daniel: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
  James: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
  Olivia: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
};

export function AIInterviewerAvatar({ 
  name, 
  role, 
  isSpeaking, 
  soundLevel,
  imageUrl,
  size = "large"
}: AIInterviewerAvatarProps) {
  const [headTilt, setHeadTilt] = useState(0);
  const activeImage = imageUrl || INTERVIEWER_PHOTOS[name] || INTERVIEWER_PHOTOS["Emma"];

  useEffect(() => {
    const tiltInterval = setInterval(() => {
      setHeadTilt((Math.random() * 2) - 1);
    }, 3000);

    return () => clearInterval(tiltInterval);
  }, []);

  const sizeClasses = size === "large" 
    ? "w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72" 
    : "w-36 h-36 sm:w-44 sm:h-44";

  return (
    <div id="ai-interviewer-avatar-card" className="flex flex-col items-center justify-center space-y-4">
      {/* Immersive Clean Photo Frame */}
      <div 
        id="avatar-canvas-wrapper"
        className={`${sizeClasses} rounded-2xl border-2 ${
          isSpeaking 
            ? "border-blue-500 shadow-xl shadow-blue-500/20" 
            : "border-slate-200 dark:border-zinc-800 shadow-md"
        } relative overflow-hidden flex items-center justify-center bg-slate-900 transition-all duration-300`}
      >
        {/* Real Headshot Image */}
        <motion.img 
          src={activeImage}
          alt={`${name} - ${role}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none"
          animate={{
            scale: isSpeaking ? 1.02 + (soundLevel / 700) : 1,
            rotate: headTilt,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800";
          }}
        />

        {/* Live Speaking Indicator Badge */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute bottom-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span>AI Speaking</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name and Role Labels */}
      <div className="text-center space-y-0.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{name}</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{role}</p>
      </div>
    </div>
  );
}

