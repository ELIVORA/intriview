/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./providers/ThemeProvider";
import { ToastProvider, useToast } from "./providers/ToastProvider";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Sparkles, ShieldCheck } from "lucide-react";

import { useUserStore } from "./store/useUserStore";
import { enterpriseIntegration } from "./services/integrationService";

// Auth Flows & Screens
import { LandingLogin } from "./components/auth/LandingLogin";
import { StudentLoginForm } from "./components/auth/StudentLoginForm";
import { StudentRegisterForm } from "./components/auth/StudentRegisterForm";
import { ForgotPasswordForm } from "./components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "./components/auth/ResetPasswordForm";
import { EmailVerificationForm } from "./components/auth/EmailVerificationForm";
import { CompleteProfileForm } from "./components/auth/CompleteProfileForm";
import { ResumeUploadStep } from "./components/auth/ResumeUploadStep";
import { ResumeAnalysisStep } from "./components/auth/ResumeAnalysisStep";
import { StudentOnboardingWizard } from "./components/auth/StudentOnboardingWizard";
import { AdminLoginForm } from "./components/auth/AdminLoginForm";
import { StudentDashboard } from "./components/auth/StudentDashboard";
import { AdminDashboard } from "./components/auth/AdminDashboard";

// Marketing Website Pages
import { Header } from "./components/marketing/Header";
import { Footer } from "./components/marketing/Footer";
import { HomeView } from "./components/marketing/HomeView";
import { FeaturesView } from "./components/marketing/FeaturesView";
import { PricingView } from "./components/marketing/PricingView";
import { AboutView } from "./components/marketing/AboutView";
import { PrivacyView } from "./components/marketing/PrivacyView";
import { TermsView } from "./components/marketing/TermsView";
import { NotFoundView } from "./components/marketing/NotFoundView";

import { useAuth } from "./hooks/useAuth";

type AuthView =
  | "marketing"
  | "landing-login"
  | "student-login"
  | "student-register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "complete-profile"
  | "upload-resume"
  | "analyze-resume"
  | "student-onboarding"
  | "admin-login"
  | "student-dashboard"
  | "admin-dashboard";

interface StudentProfile {
  fullName: string;
  university: string;
  graduationYear: string;
  targetRoles: string[];
  skills: string[];
}

function AuthenticationSupervisor() {
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, isAuthenticated, isAuthenticating, logout: authLogout } = useAuth();

  // Navigation view state initialized with persisted session check
  const [currentView, setCurrentView] = useState<AuthView>(() => {
    const initialUser = useUserStore.getState().user;
    if (initialUser && initialUser.uid) {
      if (initialUser.role === "admin") return "admin-dashboard";
      return "student-dashboard";
    }
    return "marketing";
  });

  const [activeEmail, setActiveEmail] = useState("");
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    fullName: "",
    university: "",
    graduationYear: "2026",
    targetRoles: [],
    skills: []
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");
  
  // Marketing page routing
  const [marketingPage, setMarketingPage] = useState<"home" | "features" | "pricing" | "about" | "contact" | "privacy" | "terms">("home");

  // Handle URL path rendering (client-side routing simulation)
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.startsWith("/features")) {
      setCurrentView("marketing");
      setMarketingPage("features");
    } else if (path.startsWith("/pricing")) {
      setCurrentView("marketing");
      setMarketingPage("pricing");
    } else if (path.startsWith("/about")) {
      setCurrentView("marketing");
      setMarketingPage("about");
    } else if (path.startsWith("/privacy")) {
      setCurrentView("marketing");
      setMarketingPage("privacy");
    } else if (path.startsWith("/terms")) {
      setCurrentView("marketing");
      setMarketingPage("terms");
    }
    
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === "/") {
        setMarketingPage("home");
      }
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Load local data and auto-route whenever authenticated user changes
  useEffect(() => {
    if (user && user.uid) {
      const email = user.email || "";
      setActiveEmail(email);

      // Load data from localStorage
      (async () => {
        try {
          const profileRaw = localStorage.getItem(`interview_cracker_profile_${email}`);
          if (profileRaw) {
             setStudentProfile(JSON.parse(profileRaw));
          }
          
          const resumeRaw = localStorage.getItem(`interview_cracker_resume_${email}`);
          if (resumeRaw) {
             setResumeName(resumeRaw);
          }
        } catch (e) {
          console.error("Error loading local user data:", e);
        }
      })();

      // Auto-redirect authenticated user directly to dashboard if currently on landing or login/register views
      setCurrentView((prev) => {
        if (
          prev === "marketing" ||
          prev === "landing-login" ||
          prev === "student-login" ||
          prev === "student-register"
        ) {
          if (user.role === "admin") return "admin-dashboard";
          return "student-dashboard";
        }
        return prev;
      });
    }
  }, [user]);

  // Action flow handlers
  const handleStudentLoginSuccess = async (email: string, hasUploadedResume: boolean = true) => {
    setActiveEmail(email);
    const currentUid = user?.uid || email;
    
    // Sync to Zustand store for multi-tenancy access in services
    const userObj = {
      uid: currentUid,
      email: email,
      displayName: email.split("@")[0].toUpperCase(),
      role: "student",
      createdAt: new Date().toISOString(),
      completedProfile: true
    };
    useUserStore.getState().setUser(userObj as any);

    // Fetch from fallback to localStorage
    let profileToSet: StudentProfile | null = null;
    const lsProf = localStorage.getItem(`interview_cracker_profile_${email}`);
    if (lsProf) {
        try {
            profileToSet = JSON.parse(lsProf);
        } catch (e) {}
    }

    if (!profileToSet) {
      profileToSet = {
        fullName: email.split("@")[0].toUpperCase(),
        university: "",
        graduationYear: "2026",
        targetRoles: [],
        skills: []
      };
    }
    setStudentProfile(profileToSet);

    // Set resume filename
    let activeResume = localStorage.getItem(`interview_cracker_resume_${email}`) || "";
    setResumeName(activeResume);

    toast("Session verified. Entering dashboard...", "success", "Authenticated");
    setCurrentView("student-dashboard");
  };

  const handleAdminLoginSuccess = (email: string) => {
    setActiveEmail(email);
    toast("Administrative session established. Entering command center...", "success", "System Access Granted");
    setCurrentView("admin-dashboard");
  };

  const handleOnboardingComplete = async (profile: StudentProfile, activeResumeName: string) => {
    setStudentProfile(profile);
    
    localStorage.setItem(`interview_cracker_profile_${activeEmail}`, JSON.stringify(profile));

    // Emit event to trigger ATS workflow
    enterpriseIntegration.emit("RESUME_UPLOADED", { score: 82 });
    
    toast("Account fully configured. Initializing candidate portal...", "success", "Welcome Aboard");
    setCurrentView("student-dashboard");
  };

  const handleProfileSuccess = async (profile: StudentProfile) => {
    setStudentProfile(profile);
    localStorage.setItem(`interview_cracker_profile_${activeEmail}`, JSON.stringify(profile));
    
    toast("Onboarding profile details saved.", "success", "Profile Sync Completed");
    setCurrentView("upload-resume");
  };

  const handleResumeSuccess = async (fileName: string, fileObj?: File) => {
    setResumeName(fileName);
    if (fileObj) setResumeFile(fileObj);
    localStorage.setItem(`interview_cracker_resume_${activeEmail}`, fileName);
    
    enterpriseIntegration.emit("RESUME_UPLOADED", { score: 85 });
    
    toast("Resume package received. Initializing universal AI scanner...", "info", "File Upload Success");
    setCurrentView("analyze-resume");
  };

  const handleLogout = async () => {
    setActiveEmail("");
    setResumeName("");
    setResumeFile(null);
    setStudentProfile({
      fullName: "",
      university: "",
      graduationYear: "2026",
      targetRoles: [],
      skills: []
    });

    // Terminate session state
    await authLogout();
    useUserStore.getState().clearSession();
    
    toast("Session successfully terminated.", "info", "Disconnected");
    setCurrentView("marketing");
  };

  const navigateToTab = (tab: "home" | "features" | "pricing" | "about" | "contact" | "privacy" | "terms") => {
    setMarketingPage(tab);
    setCurrentView("marketing");
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors selection:bg-blue-200 dark:selection:bg-blue-900">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl blur-xl animate-pulse"></div>
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin-slow" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold font-serif-editorial text-slate-800 dark:text-zinc-100 tracking-tight">Verifying Secure Session</h2>
            <p className="text-sm font-sans text-slate-500 dark:text-zinc-400 animate-pulse">Please wait while we establish a secure connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-sans selection:bg-blue-200 dark:selection:bg-blue-900/50 transition-colors duration-300">
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated Radial Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[120px] opacity-70 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-[100px] opacity-70 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        {/* Soft Noise Overlay for Texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay dark:opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full min-h-screen flex flex-col"
        >
          {/* MARKETING ROUTES */}
          {currentView === "marketing" && (
            <div className="flex flex-col min-h-screen w-full">
              <Header 
                currentTab={marketingPage}
                onChangeTab={navigateToTab}
                onNavigateAuth={setCurrentView}
              />
              <main className="flex-1 w-full">
                {marketingPage === "home" && (
                  <HomeView onNavigateTab={navigateToTab} onNavigateAuth={setCurrentView} />
                )}
                {marketingPage === "features" && <FeaturesView onNavigateAuth={setCurrentView} />}
                {marketingPage === "pricing" && <PricingView onNavigateAuth={setCurrentView} />}
                {marketingPage === "about" && <AboutView />}
                {marketingPage === "privacy" && <PrivacyView />}
                {marketingPage === "terms" && <TermsView />}
              </main>
              <Footer onChangeTab={navigateToTab} onNavigateAuth={setCurrentView} />
            </div>
          )}

          {/* AUTHENTICATION ROUTES */}
          {currentView === "landing-login" && (
            <LandingLogin 
              onNavigate={setCurrentView}
            />
          )}

          {currentView === "student-login" && (
            <StudentLoginForm
              onBack={() => setCurrentView("landing-login")}
              onLoginSuccess={handleStudentLoginSuccess}
              onNavigateRegister={() => setCurrentView("student-register")}
              onNavigateForgot={() => setCurrentView("forgot-password")}
            />
          )}

          {currentView === "student-register" && (
            <StudentRegisterForm
              onBack={() => setCurrentView("marketing")}
              onRegisterSuccess={(email) => {
                setActiveEmail(email);
                setCurrentView("student-onboarding");
              }}
              onNavigateLogin={() => setCurrentView("student-login")}
            />
          )}

          {currentView === "student-onboarding" && (
            <StudentOnboardingWizard onSuccess={handleOnboardingComplete} userEmail={activeEmail} />
          )}

          {currentView === "forgot-password" && (
            <ForgotPasswordForm
              onBack={() => setCurrentView("student-login")}
            />
          )}

          {currentView === "reset-password" && (
            <ResetPasswordForm
              email={activeEmail}
              onBack={() => setCurrentView("student-login")}
              onResetSuccess={() => setCurrentView("student-login")}
            />
          )}

          {currentView === "verify-email" && (
            <EmailVerificationForm
              email={activeEmail}
              onBack={() => setCurrentView("student-register")}
              onVerificationSuccess={() => setCurrentView("complete-profile")}
            />
          )}

          {currentView === "complete-profile" && (
            <CompleteProfileForm
              onSuccess={handleProfileSuccess}
            />
          )}

          {currentView === "upload-resume" && (
            <ResumeUploadStep
              onSuccess={handleResumeSuccess}
            />
          )}

          {currentView === "analyze-resume" && (
            <ResumeAnalysisStep
              fileName={resumeName}
              file={resumeFile}
              onComplete={() => setCurrentView("student-dashboard")}
            />
          )}

          {currentView === "admin-login" && (
            <AdminLoginForm
              onBack={() => setCurrentView("landing-login")}
              onSuccess={handleAdminLoginSuccess}
            />
          )}

          {currentView === "student-dashboard" && (
            <StudentDashboard
              email={activeEmail}
              profile={studentProfile}
              resumeFileName={resumeName}
              onLogout={handleLogout}
            />
          )}

          {currentView === "admin-dashboard" && (
            <AdminDashboard
              email={activeEmail}
              onLogout={handleLogout}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* FIXED THEME TOGGLE FOR DEVELOPMENT ONLY */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Toggle Theme"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthenticationSupervisor />
      </ToastProvider>
    </ThemeProvider>
  );
}
