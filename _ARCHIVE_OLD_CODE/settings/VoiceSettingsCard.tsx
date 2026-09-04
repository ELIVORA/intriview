import { useState, useEffect } from "react";
import { Volume2, Sparkles, Check, Play, UserCheck, Sliders, Mic } from "lucide-react";
import { INTERVIEWER_AVATARS } from "../voice/AIInterviewerAvatar";

export function VoiceSettingsCard() {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("app_interviewer_avatar_obj");
      if (saved) return JSON.parse(saved).id;
    } catch (e) {}
    return "emma";
  });

  const [pitch, setPitch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("app_interviewer_voice_pitch");
      return saved ? parseFloat(saved) : 1.0;
    } catch (e) {
      return 1.0;
    }
  });
  
  const [speed, setSpeed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("app_interviewer_voice_speed");
      return saved ? parseFloat(saved) : 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const persistSettings = (
    avatarId: string,
    pitchVal: number,
    speedVal: number
  ) => {
    try {
      const avatarObj = INTERVIEWER_AVATARS.find((a) => a.id === avatarId) || INTERVIEWER_AVATARS[0];
      const gender = (avatarObj.gender || "female").toLowerCase();

      localStorage.setItem("app_interviewer_avatar_obj", JSON.stringify(avatarObj));
      localStorage.setItem("app_interviewer_voice_pitch", pitchVal.toString());
      localStorage.setItem("app_interviewer_voice_speed", speedVal.toString());
      localStorage.setItem("app_interviewer_voice_gender", gender);

      window.dispatchEvent(new Event("app_interviewer_settings_changed"));
    } catch (e) {}
  };

  const handleAvatarSelect = (id: string) => {
    setSelectedAvatarId(id);
    const active = INTERVIEWER_AVATARS.find((a) => a.id === id);
    if (active) {
      try {
        localStorage.setItem("app_interviewer_avatar_obj", JSON.stringify(active));
        localStorage.setItem("app_interviewer_voice_gender", active.gender);
        if (active.voice) {
          setPitch(active.voice.pitch);
          setSpeed(active.voice.rate);
          localStorage.setItem("app_interviewer_voice_pitch", active.voice.pitch.toString());
          localStorage.setItem("app_interviewer_voice_speed", active.voice.rate.toString());
        }
        window.dispatchEvent(new Event("app_interviewer_settings_changed"));
      } catch (e) {}
    }
  };

  const handlePitchChange = (val: number) => {
    setPitch(val);
    persistSettings(selectedAvatarId, val, speed);
  };

  const handleSpeedChange = (val: number) => {
    setSpeed(val);
    persistSettings(selectedAvatarId, pitch, val);
  };

  const handleTestVoice = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const activeAvatar = INTERVIEWER_AVATARS.find((a) => a.id === selectedAvatarId) || INTERVIEWER_AVATARS[0];
      const sampleText = activeAvatar.voice?.sampleText || "Hello! I am your AI interviewer.";
      const utterance = new SpeechSynthesisUtterance(sampleText);
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (activeAvatar.gender === "female") {
          const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("google us english"));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("george"));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }
      utterance.pitch = pitch;
      utterance.rate = speed;
      utterance.onstart = () => setIsPlayingSample(true);
      utterance.onend = () => setIsPlayingSample(false);
      utterance.onerror = () => setIsPlayingSample(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveSettings = () => {
    persistSettings(selectedAvatarId, pitch, speed);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div id="voice-interviewer-settings-card" className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>AI Interviewer Settings</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Customize your interviewer persona, facial headshot, synthetic voice tone, and speaking pace.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
          Personalized AI
        </span>
      </div>

      {/* 1. INTERVIEWER PERSONA / AVATAR SELECTION */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-blue-500" />
          <span>Select Default AI Interviewer Persona</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INTERVIEWER_AVATARS.map((avatar) => {
            const isSelected = selectedAvatarId === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleAvatarSelect(avatar.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center text-center space-y-2 relative overflow-hidden ${
                  isSelected
                    ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-slate-50/60 dark:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm shrink-0">
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block line-clamp-1">{avatar.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium block line-clamp-1">{avatar.role}</span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono font-semibold block mt-0.5">{avatar.company}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VOICE PITCH & SPEED ADJUSTMENT */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>Speech Dynamics & Speed Tuning</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/70 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-700 dark:text-zinc-300 font-semibold">
              <span>Voice Pitch ({pitch}x)</span>
              <span className="text-slate-400 font-mono text-[10px]">{pitch < 1 ? "Deeper" : pitch > 1 ? "Higher" : "Default"}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={pitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-700 dark:text-zinc-300 font-semibold">
              <span>Speaking Speed ({speed}x)</span>
              <span className="text-slate-400 font-mono text-[10px]">{speed < 1 ? "Slower" : speed > 1 ? "Faster" : "Natural"}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Live Audio Test Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isPlayingSample}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isPlayingSample ? "animate-spin" : ""}`} />
            <span>{isPlayingSample ? "Playing Sample..." : "🔊 Test Voice Sample"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Voice Preferences Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Save Voice Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
