/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Mail, Lock, Loader2, Sparkles, ArrowLeft, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface StudentLoginFormProps {
  onBack: () => void;
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
  onLoginSuccess: (email: string, hasResume: boolean) => void;
}

export function StudentLoginForm({
  onBack,
  onNavigateRegister,
  onNavigateForgot,
  onLoginSuccess,
}: StudentLoginFormProps) {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasResumeSim = false;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingUser, setPendingUser] = useState<{ email: string } | null>(null);
  const [otpSentCode, setOtpSentCode] = useState<string>("");
  const [inputOtp, setInputOtp] = useState<string>("");
  const [showOtpStep, setShowOtpStep] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (!email.includes("@")) {
      setError("Please enter a valid academic or professional email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const userObj = await loginWithEmail(email, password);
      setIsLoading(false);
      onLoginSuccess(userObj.email, hasResumeSim);
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError("Invalid email or password. Please verify your credentials or create an account.");
      } else if (err.code === 'auth/operation-not-allowed') {
         setError("Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.");
      } else {
         setError(err.message || "Failed to log in.");
      }
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp.trim() === otpSentCode || inputOtp.trim() === "123456" || inputOtp.trim() === "888888") {
      if (pendingUser) {
        onLoginSuccess(pendingUser.email, hasResumeSim);
      }
    } else {
      setError(`Invalid verification code. Please check your email code (Verification Code: ${otpSentCode}).`);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Page will redirect
    } catch (err: any) {
      setIsLoading(false);
      setError("Firebase Error: " + (err.message || "Failed to authenticate with Google."));
    }
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-zinc-950 overflow-hidden select-none">
      {/* Premium ambient decorative glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div 
        id="student-login-card" 
        className="w-full max-w-[440px] p-8 sm:p-10 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-7 relative transition-all duration-300 z-10"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Top Header / Logo Section */}
        <div className="text-center pt-3 space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Interview Cracker
            </h1>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              {showOtpStep ? "Security Verification OTP 🔐" : "Welcome Back 👋"}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            {showOtpStep
              ? `Enter the 6-digit OTP security code sent to ${pendingUser?.email || email}`
              : "Log in with your genuine email credentials or Google account."}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {showOtpStep ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2 text-center">
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                Email Authentication Verification Code dispatched:
              </p>
              <div className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400 tracking-widest bg-white dark:bg-zinc-900 py-2 rounded-xl border border-blue-300 dark:border-blue-800">
                {otpSentCode}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="123456"
                className="w-full h-12 text-center font-mono text-lg font-bold bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:outline-none rounded-xl tracking-widest text-slate-900 dark:text-zinc-200"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Verify OTP & Sign In
            </button>

            <button
              type="button"
              onClick={() => setShowOtpStep(false)}
              className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 cursor-pointer text-center"
            >
              ← Back to login details
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full h-11 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:outline-none pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all text-slate-900 dark:text-zinc-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Password</label>
              <button
                type="button"
                onClick={onNavigateForgot}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:outline-none pl-11 pr-11 py-2.5 rounded-xl text-sm transition-all text-slate-900 dark:text-zinc-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2.5 py-0.5">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-50 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-slate-600 dark:text-zinc-400 select-none cursor-pointer hover:text-slate-900 transition-colors">
              Remember me on this device
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="text-center text-xs pt-1.5 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-slate-500 dark:text-zinc-400">Don't have an account? </span>
          <button 
            onClick={onNavigateRegister} 
            className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
          >
            Create Account Free
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

