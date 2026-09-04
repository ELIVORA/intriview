/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { ShieldCheck, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";

interface EmailVerificationFormProps {
  email: string;
  onBack: () => void;
  onVerificationSuccess: () => void;
}

export function EmailVerificationForm({
  email,
  onBack,
  onVerificationSuccess,
}: EmailVerificationFormProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input box initially
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const digits = pasteData.split("");
    setOtp(digits);
    inputsRef.current[5]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join("");

    if (code.length < 6) {
      setError("Please input the complete 6-digit security code.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Let's accept any correct code length for ease of testing!
      onVerificationSuccess();
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div id="email-verification-card" className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 relative">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Verify Your Email</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            We have dispatched a 6-digit security verification code to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>. Please enter it below.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-between items-center gap-2.5 max-w-[320px] mx-auto">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                ref={(el) => { inputsRef.current[index] = el; }}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-11 h-12 text-center text-lg font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none text-zinc-900 dark:text-zinc-100"
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
          </button>
        </form>

        {/* Resend option */}
        <div className="text-center text-xs">
          <span className="text-zinc-500">Didn't receive the email code? </span>
          <button
            onClick={() => {
              setOtp(new Array(6).fill(""));
              inputsRef.current[0]?.focus();
            }}
            className="text-indigo-500 font-semibold hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
