/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { Mail, ChevronLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "../../providers/ToastProvider";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("Please enter your registered email address.", "error", "Required Field");
      return;
    }

    setIsLoading(true);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSuccess(true);
      toast("Reset instructions have been sent to your email.", "success", "Email Dispatched");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to process reset request.", "error", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6] dark:bg-zinc-950 p-6 md:p-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
      
      <button 
        onClick={onBack}
        className="self-start mb-12 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors group z-10"
      >
        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-slate-300 dark:group-hover:border-zinc-700 transition-colors shadow-sm">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span>Return to Login</span>
      </button>

      <div className="flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          
          {!isSuccess ? (
            <>
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-900/50 shadow-inner">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-serif-editorial font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Account Recovery</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Enter your email address to receive secure reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Registered Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F9F8F6] dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                    placeholder="student@university.edu"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center py-6 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif-editorial font-bold text-slate-900 dark:text-white tracking-tight">Check Your Inbox</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
                  We've sent secure password reset instructions to <span className="font-medium text-slate-900 dark:text-zinc-200">{email}</span>.
                </p>
              </div>
              <button
                onClick={onBack}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 rounded-xl font-semibold text-sm transition-all shadow-md mt-4"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
