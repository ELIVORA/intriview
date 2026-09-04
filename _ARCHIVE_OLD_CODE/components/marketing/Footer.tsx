/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FooterProps {
  onChangeTab: (tab: "home" | "features" | "pricing" | "about" | "contact" | "privacy" | "terms") => void;
  onNavigateAuth: (view: "student-login" | "student-register" | "admin-login") => void;
}

export function Footer({ onChangeTab, onNavigateAuth }: FooterProps) {
  return (
    <footer className="px-6 lg:px-12 py-6 border-t border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#fdfdfc] dark:bg-zinc-950 font-mono text-[11px] text-slate-500 dark:text-zinc-500">
      <div className="uppercase tracking-[0.1em]">
        © 2026 Interview Cracker • Secure Practice Environment
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={() => onNavigateAuth("admin-login")} 
          className="uppercase tracking-[0.1em] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-indigo-500 font-bold"
        >
          Admin Portal
        </button>
        <button 
          onClick={() => onChangeTab("privacy")} 
          className="uppercase tracking-[0.1em] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Privacy Policy
        </button>
        <button 
          onClick={() => onChangeTab("terms")} 
          className="uppercase tracking-[0.1em] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Terms
        </button>
        <span className="uppercase tracking-[0.1em] opacity-40">v2.0.1</span>
      </div>
    </footer>
  );
}
