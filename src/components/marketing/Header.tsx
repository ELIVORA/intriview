/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useTheme } from "../../providers/ThemeProvider";
import { Sun, Moon, Cpu, Menu, X, ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUserStore } from "../../store/useUserStore";

interface HeaderProps {
  currentTab: string;
  onChangeTab: (tab: "home" | "features" | "pricing" | "about" | "contact" | "privacy" | "terms") => void;
  onNavigateAuth: (view: "student-login" | "student-register" | "admin-login" | "student-dashboard" | "admin-dashboard") => void;
}

export function Header({ currentTab, onChangeTab, onNavigateAuth }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navItems = [
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ] as const;

  const handleNavClick = (tabId: "home" | "features" | "pricing" | "about" | "contact" | "privacy" | "terms") => {
    onChangeTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-zinc-800 bg-[#fdfdfc]/90 dark:bg-zinc-950/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("home")} 
          className="flex items-center gap-2.5 cursor-pointer group"
          id="navbar-logo"
        >
          <div className="w-6 h-6 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white font-sans">
            Interview Cracker
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavClick("home")}
            className={`text-xs font-medium cursor-pointer transition-colors ${
              currentTab === "home"
                ? "text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            home
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-xs font-medium cursor-pointer transition-colors ${
                currentTab === item.id
                  ? "text-slate-900 dark:text-white font-semibold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item.label.toLowerCase()}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-300 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => onNavigateAuth(user?.role === "admin" ? "admin-dashboard" : "student-dashboard")}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1a] hover:bg-blue-600 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateAuth("student-login")}
                className="text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer px-2"
              >
                Log In
              </button>

              <button
                onClick={() => onNavigateAuth("student-register")}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1a] hover:bg-blue-600 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer active:scale-98"
              >
                Get Started
              </button>
            </>
          )}
        </div>


        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleNavClick("home")}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-left transition-all ${
                    currentTab === "home"
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  Home
                </button>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-left transition-all ${
                      currentTab === item.id
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("student-login");
                  }}
                  className="w-full py-3 rounded-xl text-center text-sm font-semibold border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all"
                >
                  Log In
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("student-register");
                  }}
                  className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

