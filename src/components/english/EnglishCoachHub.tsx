import React, { useEffect, useState } from "react";
import { getCandidateMemory } from "../../services/candidateMemory";
import ConversationScreen from "./ConversationScreen";

export function EnglishCoachHub() {
  const [communication, setCommunication] = useState<any>(null);

  useEffect(() => {
    getCandidateMemory()
      .then((memory) => setCommunication(memory.communication))
      .catch(() => setCommunication(null));
  }, []);

  return (
    <section id="english-coach" className="w-full min-w-0 text-slate-900 dark:text-zinc-100">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">English Communication Coach</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Have a natural conversation, then get simple, supportive feedback on how to communicate more clearly.
          </p>
        </div>
        {communication?.sessions > 0 && (
          <div className="text-xs text-slate-500 dark:text-zinc-400">{communication.sessions} coaching sessions</div>
        )}
      </div>
      <ConversationScreen />
    </section>
  );
}

export default EnglishCoachHub;
