/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { ShieldCheck, ChevronLeft, ArrowRight, Loader2, Key } from "lucide-react";
import { useToast } from "../../providers/ToastProvider";
import { useAuth } from "../../hooks/useAuth";

interface AdminLoginFormProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export function AdminLoginForm({ onBack, onSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { loginWithEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please enter both email and password.", "error", "Missing Credentials");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess(email);
    } catch (err: any) {
      console.error(err);
      toast("Access denied. Invalid administrator credentials.", "error", "Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6] dark:bg-zinc-950 p-6 md:p-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
      
      <button 
        onClick={onBack}
        className="self-start mb-12 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors group z-10"
      >
        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-slate-300 dark:group-hover:border-zinc-700 transition-colors shadow-sm">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span>Return to Login Selection</span>
      </button>

      <div className="flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-red-200/50 dark:border-red-900/30 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600" />
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 border border-red-100 dark:border-red-900/50 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-serif-editorial font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Admin Portal</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Secure access for administrative personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Administrator Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F8F6] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:ring-red-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                placeholder="admin@your-domain.com"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F9F8F6] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:ring-red-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/50 flex flex-col items-center gap-2">
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono text-center max-w-[280px]">
              Unauthorized access attempts are logged and strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
