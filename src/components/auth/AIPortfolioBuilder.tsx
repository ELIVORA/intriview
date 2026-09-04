/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Palette,
  Layers,
  Settings,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Globe,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet as TabletIcon,
  Check,
  Terminal,
  Download,
  AlertCircle,
  Clock,
  RotateCcw,
  FileText,
  User,
  Heart,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIPortfolioBuilderProps {
  profile: {
    fullName?: string;
    college?: string;
    branch?: string;
    cgpa?: string;
    graduationYear?: string;
    skills?: string;
    achievements?: string;
    resumeFileName?: string;
  };
}

export function AIPortfolioBuilder({ profile }: AIPortfolioBuilderProps) {
  // Tabs: aesthetic, sections, content, seo, deployment
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"aesthetics" | "sections" | "ai_content" | "seo" | "deploy">("aesthetics");
  
  // Viewport widths
  const [viewportWidth, setViewportWidth] = useState<"desktop" | "laptop" | "tablet" | "mobile" | "foldable">("desktop");
  
  // Core portfolio state
  const [loading, setLoading] = useState<boolean>(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [deployPlatform, setDeployPlatform] = useState<string>("Vercel");
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [activeDeployResult, setActiveDeployResult] = useState<any>(null);
  
  // AI Generation triggers
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  
  // Project editing helpers
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [newProject, setNewProject] = useState<any>({
    title: "",
    description: "",
    role: "Full Stack Engineer",
    duration: "3 Months",
    technologies: [],
    features: [],
    github_link: "",
    live_demo_link: ""
  });
  const [techInput, setTechInput] = useState<string>("");
  const [featureInput, setFeatureInput] = useState<string>("");

  // Alert notices
  const [alertNotice, setAlertNotice] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Load baseline portfolio configuration
  useEffect(() => {
    fetchPortfolio();
    fetchDeployments();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
      } else {
        showNotice("Could not load candidate portfolio baseline", "error");
      }
    } catch (e) {
      showNotice("Network error: backend service offline", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeployments = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/deployments", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === "success") {
        setDeployments(data.deployments);
      }
    } catch (e) {
      console.error("Deploy history offline", e);
    }
  };

  const showNotice = (msg: string, type: "success" | "error" | "info") => {
    setAlertNotice({ message: msg, type });
    setTimeout(() => {
      setAlertNotice(null);
    }, 4000);
  };

  // Sync update to backend
  const saveThemeConfig = async (updatedTheme: any) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ theme: updatedTheme })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
      }
    } catch (e) {
      showNotice("Failed to sync theme customizations", "error");
    }
  };

  const saveContentConfig = async (updatedContent: any) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: updatedContent })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
      }
    } catch (e) {
      showNotice("Failed to sync textual content", "error");
    }
  };

  const saveProjectsConfig = async (updatedProjects: any[]) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ projects: updatedProjects })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
        showNotice("Project catalog saved successfully", "success");
      }
    } catch (e) {
      showNotice("Failed to save projects data", "error");
    }
  };

  const saveSocialConfig = async (updatedSocials: any) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/socials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ social_links: updatedSocials })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
      }
    } catch (e) {
      showNotice("Failed to save social tags", "error");
    }
  };

  const saveSectionsOrderConfig = async (order: string[], hidden: string[]) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sections_order: order, hidden_sections: hidden })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
        showNotice("Section visibility and ordering updated", "success");
      }
    } catch (e) {
      showNotice("Failed to update layout parameters", "error");
    }
  };

  // AI Generation with AI Engine
  const triggerAiGeneration = async () => {
    try {
      setIsAiGenerating(true);
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: profile,
          resume_fileName: profile.resumeFileName || "candidate_resume.pdf"
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPortfolio(data.portfolio);
        showNotice("AI content successfully synthesized!", "success");
      } else {
        showNotice("AI synthesis fumbled. Try again.", "error");
      }
    } catch (e) {
      showNotice("Network error: AI model unreachable", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Simulated Cloud deployment
  const triggerProductionDeploy = async () => {
    try {
      setIsDeploying(true);
      setDeployLogs([]);
      setActiveDeployResult(null);
      
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/v1/portfolio/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ platform: deployPlatform })
      });
      const data = await res.json();
      
      if (data.status === "success") {
        const targetLogs = data.deployment.logs;
        // Stream logs slowly for dramatic professional high-fidelity feel
        for (let i = 0; i < targetLogs.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          setDeployLogs((prev) => [...prev, targetLogs[i]]);
        }
        setActiveDeployResult(data.deployment);
        setDeployments((prev) => [data.deployment, ...prev]);
        showNotice(`Deployed successfully to ${deployPlatform}!`, "success");
      } else {
        showNotice("Deployment build process failed.", "error");
      }
    } catch (e) {
      showNotice("Deployment network exception", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  // Aesthetic adjustments
  const applyPresetTheme = (themeName: string) => {
    let baseTheme = { ...portfolio.theme, theme_name: themeName };
    switch (themeName) {
      case "Minimal":
        baseTheme.primary_color = "#18181b";
        baseTheme.accent_color = "#71717a";
        baseTheme.font_sans = "Inter";
        baseTheme.font_display = "Inter";
        baseTheme.card_style = "flat";
        baseTheme.bg_style = "solid";
        break;
      case "Dark":
        baseTheme.primary_color = "#ec4899";
        baseTheme.accent_color = "#8b5cf6";
        baseTheme.font_sans = "Inter";
        baseTheme.font_display = "Space Grotesk";
        baseTheme.card_style = "border";
        baseTheme.bg_style = "gradient";
        baseTheme.dark_mode = true;
        break;
      case "Glassmorphism":
        baseTheme.primary_color = "#3b82f6";
        baseTheme.accent_color = "#f43f5e";
        baseTheme.font_sans = "Inter";
        baseTheme.font_display = "Space Grotesk";
        baseTheme.card_style = "glass";
        baseTheme.bg_style = "mesh";
        break;
      case "Apple Style":
        baseTheme.primary_color = "#000000";
        baseTheme.accent_color = "#86868b";
        baseTheme.font_sans = "SF Pro";
        baseTheme.font_display = "SF Pro Display";
        baseTheme.card_style = "glass";
        baseTheme.bg_style = "solid";
        baseTheme.dark_mode = false;
        break;
      case "Vercel Style":
        baseTheme.primary_color = "#000000";
        baseTheme.accent_color = "#0070f3";
        baseTheme.font_sans = "Geist";
        baseTheme.font_display = "Geist Mono";
        baseTheme.card_style = "flat";
        baseTheme.bg_style = "grid";
        baseTheme.dark_mode = true;
        break;
      case "GitHub Style":
        baseTheme.primary_color = "#2ea44f";
        baseTheme.accent_color = "#0969da";
        baseTheme.font_sans = "Inter";
        baseTheme.font_display = "JetBrains Mono";
        baseTheme.card_style = "border";
        baseTheme.bg_style = "solid";
        baseTheme.dark_mode = true;
        break;
      case "Creative":
        baseTheme.primary_color = "#f59e0b";
        baseTheme.accent_color = "#10b981";
        baseTheme.font_sans = "Inter";
        baseTheme.font_display = "Clash Display";
        baseTheme.card_style = "neo";
        baseTheme.bg_style = "mesh";
        break;
    }
    saveThemeConfig(baseTheme);
  };

  // Reorder list items
  const moveSection = (index: number, direction: "up" | "down") => {
    let order = [...portfolio.theme.sections_order];
    if (direction === "up" && index > 0) {
      const temp = order[index];
      order[index] = order[index - 1];
      order[index - 1] = temp;
    } else if (direction === "down" && index < order.length - 1) {
      const temp = order[index];
      order[index] = order[index + 1];
      order[index + 1] = temp;
    }
    saveSectionsOrderConfig(order, portfolio.theme.hidden_sections);
  };

  const toggleSectionVisibility = (section: string) => {
    let hidden = [...portfolio.theme.hidden_sections];
    if (hidden.includes(section)) {
      hidden = hidden.filter((s) => s !== section);
    } else {
      hidden.push(section);
    }
    saveSectionsOrderConfig(portfolio.theme.sections_order, hidden);
  };

  // Add Project
  const addNewProjectToCatalog = () => {
    if (!newProject.title) {
      showNotice("Project title is required", "error");
      return;
    }
    let currentProjects = [...(portfolio.projects || [])];
    const projectRecord = { ...newProject, id: `proj_${Date.now()}` };
    currentProjects.push(projectRecord);
    saveProjectsConfig(currentProjects);
    // Reset inputs
    setNewProject({
      title: "",
      description: "",
      role: "Full Stack Engineer",
      duration: "3 Months",
      technologies: [],
      features: [],
      github_link: "",
      live_demo_link: ""
    });
    setEditingProjectIndex(null);
  };

  const removeProjectFromCatalog = (index: number) => {
    let currentProjects = [...(portfolio.projects || [])];
    currentProjects.splice(index, 1);
    saveProjectsConfig(currentProjects);
  };

  // Manual input updates helper
  const handleContentChange = (field: string, value: string) => {
    const updatedContent = { ...portfolio.content, [field]: value };
    setPortfolio({ ...portfolio, content: updatedContent });
    saveContentConfig(updatedContent);
  };

  const handleSEOChange = (field: string, value: string) => {
    const updatedSEO = { ...portfolio.content.seo, [field]: value };
    const updatedContent = { ...portfolio.content, seo: updatedSEO };
    setPortfolio({ ...portfolio, content: updatedContent });
    saveContentConfig(updatedContent);
  };

  // Inline editing helper
  const handleDirectTextEdit = (section: string, text: string) => {
    handleContentChange(section, text);
  };

  // Viewport style calculations
  const getViewportSizeClass = () => {
    switch (viewportWidth) {
      case "desktop":
        return "w-full max-w-full";
      case "laptop":
        return "max-w-[1024px]";
      case "tablet":
        return "max-w-[768px]";
      case "mobile":
        return "max-w-[420px]";
      case "foldable":
        return "max-w-[280px]";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Initializing Portfolio Builder Environment...</p>
      </div>
    );
  }

  const themePresetList = ["Professional", "Minimal", "Dark", "Glassmorphism", "Apple Style", "Vercel Style", "GitHub Style", "Creative"];

  return (
    <div className="space-y-6">
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-[10px] text-pink-500 font-mono font-bold tracking-widest block uppercase">
            PORTFOLIO WORKSPACE
          </span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            AI-Engineered Placement Portfolio
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Design, enrich, customize, and deploy your production portfolio website in seconds matching your real credentials.
          </p>
        </div>

        <button
          onClick={triggerAiGeneration}
          disabled={isAiGenerating}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{isAiGenerating ? "Enriching via AI Engine..." : "Re-Write All via AI Engine"}</span>
        </button>
      </div>

      {/* Alert Notices */}
      <AnimatePresence>
        {alertNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium border ${
              alertNotice.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : alertNotice.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{alertNotice.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Control panel */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl flex flex-col h-[750px] overflow-hidden">
          
          {/* Internal Control Tabs */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-850 p-2 bg-zinc-50/50 dark:bg-zinc-950/20 gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "aesthetics", label: "Themes", icon: Palette },
              { id: "sections", label: "Sections", icon: Layers },
              { id: "ai_content", label: "AI Copy", icon: Sparkles },
              { id: "seo", label: "SEO Engine", icon: Globe },
              { id: "deploy", label: "Deployment", icon: Network }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeWorkspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkspaceTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents Pane (Scrollable) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* T1: Themes / Aesthetics */}
            {activeWorkspaceTab === "aesthetics" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Theme Selectors</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Toggle designer presets to match your unique brand and style.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {themePresetList.map((themeName) => {
                    const active = portfolio.theme.theme_name === themeName;
                    return (
                      <button
                        key={themeName}
                        onClick={() => applyPresetTheme(themeName)}
                        className={`p-3.5 rounded-2xl border text-xs text-left font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          active
                            ? "bg-indigo-500/5 border-indigo-500 text-indigo-500 dark:text-indigo-400 font-bold"
                            : "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span>{themeName}</span>
                        {active && <Check className="w-4 h-4 text-indigo-500" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Custom Color Maps</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={portfolio.theme.primary_color}
                          onChange={(e) => saveThemeConfig({ ...portfolio.theme, primary_color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono">{portfolio.theme.primary_color}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={portfolio.theme.accent_color}
                          onChange={(e) => saveThemeConfig({ ...portfolio.theme, accent_color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono">{portfolio.theme.accent_color}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Aesthetics config</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 block">Typography Sans</label>
                      <select
                        value={portfolio.theme.font_sans}
                        onChange={(e) => saveThemeConfig({ ...portfolio.theme, font_sans: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Inter">Inter (Default)</option>
                        <option value="SF Pro">SF Pro</option>
                        <option value="Geist">Geist Sans</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 block">Typography Display</label>
                      <select
                        value={portfolio.theme.font_display}
                        onChange={(e) => saveThemeConfig({ ...portfolio.theme, font_display: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Space Grotesk">Space Grotesk</option>
                        <option value="JetBrains Mono">JetBrains Mono</option>
                        <option value="Geist Mono">Geist Mono</option>
                        <option value="Playfair Display">Playfair Display</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 block">Card Layout</label>
                      <select
                        value={portfolio.theme.card_style}
                        onChange={(e) => saveThemeConfig({ ...portfolio.theme, card_style: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="glass">Glassmorphism</option>
                        <option value="flat">Minimal Flat</option>
                        <option value="border">Structured Border</option>
                        <option value="neo">Neo-Brutalism</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 block">Background Canvas</label>
                      <select
                        value={portfolio.theme.bg_style}
                        onChange={(e) => saveThemeConfig({ ...portfolio.theme, bg_style: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="mesh">Mesh Gradient</option>
                        <option value="grid">Dot Grid</option>
                        <option value="solid">Minimal Solid</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold block">Force Dark Mode</span>
                      <span className="text-[10px] text-zinc-400 block">Style pages using premium midnight palettes.</span>
                    </div>
                    <button
                      onClick={() => saveThemeConfig({ ...portfolio.theme, dark_mode: !portfolio.theme.dark_mode })}
                      className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                        portfolio.theme.dark_mode ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-800"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${portfolio.theme.dark_mode ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* T2: Sections Order */}
            {activeWorkspaceTab === "sections" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Layout & Sections Manager</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Drag-free structural sorting. Control exactly which blocks render live.</p>
                </div>

                <div className="space-y-2.5">
                  {portfolio.theme.sections_order.map((section: string, idx: number) => {
                    const isHidden = portfolio.theme.hidden_sections.includes(section);
                    return (
                      <div
                        key={section}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isHidden
                            ? "bg-zinc-50/40 dark:bg-zinc-950/5 border-zinc-100 dark:border-zinc-900 text-zinc-400"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold font-mono text-zinc-400">0{idx + 1}</span>
                          <span className="text-xs font-semibold uppercase tracking-wider font-mono">{section.replace("_", " ")}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Visibility Eye */}
                          <button
                            onClick={() => toggleSectionVisibility(section)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all cursor-pointer"
                            title={isHidden ? "Show Section" : "Hide Section"}
                          >
                            {isHidden ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                          </button>

                          {/* Reorder Up */}
                          <button
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, "up")}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            disabled={idx === portfolio.theme.sections_order.length - 1}
                            onClick={() => moveSection(idx, "down")}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* T3: AI Copy / Project Catalog Content */}
            {activeWorkspaceTab === "ai_content" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Copilot Content Studio</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Customize your headlines, professional summaries, and project catalogs.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Professional Headline</label>
                    <textarea
                      value={portfolio.content.headline}
                      onChange={(e) => handleContentChange("headline", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[50px] resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Professional Bio</label>
                    <textarea
                      value={portfolio.content.professional_bio}
                      onChange={(e) => handleContentChange("professional_bio", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">About Me</label>
                    <textarea
                      value={portfolio.content.about_me}
                      onChange={(e) => handleContentChange("about_me", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Career Objective</label>
                    <textarea
                      value={portfolio.content.career_objective}
                      onChange={(e) => handleContentChange("career_objective", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
                    />
                  </div>

                  {/* Projects Showcase block list */}
                  <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Projects Showcase Catalog</h4>
                      <button
                        onClick={() => setEditingProjectIndex(editingProjectIndex === -1 ? null : -1)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    {/* Inline Add/Edit Project Form */}
                    {editingProjectIndex === -1 && (
                      <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3.5">
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Add New Featured Project</span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Project Title"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Developer Role (e.g. Lead Architect)"
                            value={newProject.role}
                            onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 3 Months)"
                            value={newProject.duration}
                            onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                          />
                          <textarea
                            placeholder="STAR project description"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:outline-none min-h-[60px]"
                          />
                          <input
                            type="text"
                            placeholder="GitHub Repo URL"
                            value={newProject.github_link}
                            onChange={(e) => setNewProject({ ...newProject, github_link: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                          />
                          
                          {/* Features helper input */}
                          <div className="space-y-1.5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add Key Feature Bullet"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  if (featureInput.trim()) {
                                    setNewProject({ ...newProject, features: [...newProject.features, featureInput.trim()] });
                                    setFeatureInput("");
                                  }
                                }}
                                className="px-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                            {newProject.features.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {newProject.features.map((feat: string, fIdx: number) => (
                                  <span key={fIdx} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] rounded-lg text-zinc-500 font-medium flex items-center gap-1">
                                    <span>{feat}</span>
                                    <button onClick={() => setNewProject({ ...newProject, features: newProject.features.filter((_, i) => i !== fIdx) })} className="text-red-500 font-bold hover:opacity-80">×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Technologies input */}
                          <div className="space-y-1.5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add Technology keyword (e.g. Docker)"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  if (techInput.trim()) {
                                    setNewProject({ ...newProject, technologies: [...newProject.technologies, techInput.trim()] });
                                    setTechInput("");
                                  }
                                }}
                                className="px-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                            {newProject.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {newProject.technologies.map((tech: string, tIdx: number) => (
                                  <span key={tIdx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] rounded font-semibold flex items-center gap-1">
                                    <span>{tech}</span>
                                    <button onClick={() => setNewProject({ ...newProject, technologies: newProject.technologies.filter((_, i) => i !== tIdx) })} className="text-red-500 font-bold">×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setEditingProjectIndex(null)}
                            className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addNewProjectToCatalog}
                            className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Save Project
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active list projects */}
                    <div className="space-y-3">
                      {(portfolio.projects || []).map((p: any, idx: number) => (
                        <div key={p.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-400 font-mono block">{p.role}</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{p.title}</span>
                          </div>
                          <button
                            onClick={() => removeProjectFromCatalog(idx)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social links block update */}
                  <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Social Integrations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">GitHub URL</label>
                        <input
                          type="text"
                          value={portfolio.social_links.github}
                          onChange={(e) => saveSocialConfig({ ...portfolio.social_links, github: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">LinkedIn URL</label>
                        <input
                          type="text"
                          value={portfolio.social_links.linkedin}
                          onChange={(e) => saveSocialConfig({ ...portfolio.social_links, linkedin: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Contact Email</label>
                        <input
                          type="text"
                          value={portfolio.social_links.email}
                          onChange={(e) => saveSocialConfig({ ...portfolio.social_links, email: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Contact Phone</label>
                        <input
                          type="text"
                          value={portfolio.social_links.phone}
                          onChange={(e) => saveSocialConfig({ ...portfolio.social_links, phone: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* T4: SEO Engines */}
            {activeWorkspaceTab === "seo" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">SEO & Indexing Optimizer</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Control browser titles, search summaries, and preview auto-generated crawlers.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Browser Site Title</label>
                    <input
                      type="text"
                      value={portfolio.content.seo.title}
                      onChange={(e) => handleSEOChange("title", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none font-semibold text-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Meta Description</label>
                    <textarea
                      value={portfolio.content.seo.description}
                      onChange={(e) => handleSEOChange("description", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:outline-none min-h-[70px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">OpenGraph Title (LinkedIn/Twitter)</label>
                    <input
                      type="text"
                      value={portfolio.content.seo.open_graph_title}
                      onChange={(e) => handleSEOChange("open_graph_title", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">OpenGraph Description</label>
                    <textarea
                      value={portfolio.content.seo.open_graph_desc}
                      onChange={(e) => handleSEOChange("open_graph_desc", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:outline-none min-h-[60px]"
                    />
                  </div>

                  {/* SEO Crawlers previews */}
                  <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block tracking-wider font-mono">Engine Crawl Credentials</span>
                    
                    <div className="space-y-3.5">
                      {/* robots.txt preview */}
                      <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono block">robots.txt</span>
                        <pre className="text-[10px] font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap">{portfolio.content.seo.robots_txt}</pre>
                      </div>

                      {/* Structured JSON Schema */}
                      <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono block">JSON-LD Person Schema (Structured Data)</span>
                        <pre className="text-[9px] font-mono text-emerald-500 overflow-x-auto max-h-[120px] scrollbar-thin">{portfolio.content.seo.structured_data}</pre>
                      </div>

                      {/* Sitemap.xml */}
                      <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono block">sitemap.xml</span>
                          <button
                            onClick={() => showNotice("Successfully downloaded site index layout mapping!", "success")}
                            className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Download className="w-2.5 h-2.5" />
                            Download
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-zinc-500 overflow-x-auto max-h-[100px] scrollbar-thin">{portfolio.content.seo.sitemap_xml}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* T5: Deployment */}
            {activeWorkspaceTab === "deploy" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">CDNs & Deploy Engine</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Bundle assets, perform static sanitizers, and host your landing page in 1-Click.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Target Provider Platform</label>
                    <select
                      value={deployPlatform}
                      onChange={(e) => setDeployPlatform(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Vercel">Vercel (Recommended)</option>
                      <option value="Netlify">Netlify Containers</option>
                      <option value="GitHub Pages">GitHub Pages (gh-pages branch)</option>
                    </select>
                  </div>

                  <button
                    onClick={triggerProductionDeploy}
                    disabled={isDeploying}
                    className="w-full py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
                  >
                    {isDeploying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span>Compiling Static Bundles...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>1-Click Live Production Launch</span>
                      </>
                    )}
                  </button>

                  {/* Build terminal logs */}
                  {(isDeploying || deployLogs.length > 0) && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Active Pipeline Build Console</span>
                      </span>
                      <div className="bg-zinc-950 text-zinc-300 p-4 rounded-2xl border border-zinc-850 font-mono text-[10px] space-y-1.5 h-[220px] overflow-y-auto scrollbar-thin">
                        {deployLogs.map((log, lIdx) => (
                          <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">
                            <span className="text-zinc-500">{"> "}</span>
                            <span>{log}</span>
                          </div>
                        ))}
                        {isDeploying && <div className="text-indigo-400 animate-pulse font-bold mt-1">{"_ COMPILING PRODUCTION DIST BUILDS"}</div>}
                      </div>
                    </div>
                  )}

                  {/* Deploy result success banner */}
                  {activeDeployResult && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 space-y-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono block">Status: SUCCESS</span>
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">CDN Subdomain Active!</h4>
                        </div>
                        <span className="px-2 py-1 rounded bg-emerald-500 text-white font-mono text-[9px] font-bold">
                          {activeDeployResult.version}
                        </span>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-500/10 flex items-center justify-between text-xs font-semibold">
                        <a href={activeDeployResult.url} target="_blank" rel="noreferrer" className="text-indigo-500 truncate mr-2 flex items-center gap-1.5 hover:underline">
                          <span>{activeDeployResult.url}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Deployment History logs */}
                  {deployments.length > 0 && (
                    <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Launch Deployment History</span>
                      <div className="space-y-3">
                        {deployments.map((record) => (
                          <div key={record.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{record.platform}</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-850 rounded text-zinc-500 font-mono">{record.version}</span>
                              </div>
                              <a href={record.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:underline mt-1 block truncate max-w-[200px]">
                                {record.url}
                              </a>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">{new Date(record.deployed_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Responsive live visual preview mockup */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Sizing Controller Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1">
              {[
                { id: "desktop", label: "Desktop", icon: Laptop },
                { id: "laptop", label: "Laptop", icon: Laptop },
                { id: "tablet", label: "Tablet", icon: TabletIcon },
                { id: "mobile", label: "Mobile", icon: Smartphone },
                { id: "foldable", label: "Foldable", icon: Smartphone }
              ].map((v) => {
                const Icon = v.icon;
                const active = viewportWidth === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setViewportWidth(v.id as any)}
                    className={`p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow"
                        : "text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                    }`}
                    title={v.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">{v.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] font-mono text-zinc-400 uppercase hidden sm:block">
              Viewport: {viewportWidth === "desktop" ? "Responsive" : viewportWidth === "laptop" ? "1024px" : viewportWidth === "tablet" ? "768px" : viewportWidth === "mobile" ? "420px" : "280px"}
            </div>
          </div>

          {/* Browser Container Frame with inline customized items */}
          <div className="flex-1 border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-950 p-4 rounded-3xl flex items-center justify-center min-h-[680px] overflow-hidden">
            <div className={`h-[680px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex flex-col overflow-hidden shadow-xl transition-all duration-300 ${getViewportSizeClass()} relative`}>
              
              {/* Fake Chrome Browser Top Header */}
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 h-11 border-b border-zinc-200/60 dark:border-zinc-850 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>

                <div className="flex-1 max-w-md mx-6 px-4 py-1 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-lg text-[10px] text-zinc-400 dark:text-zinc-500 font-mono text-center flex items-center justify-center gap-1.5 truncate">
                  <span className="text-emerald-500 font-bold">🔒</span>
                  <span>https://{portfolio.content.seo.title.toLowerCase().replace(/\s+/g, "-").replace(/\|/g, "").slice(0, 12)}.vercel.app/</span>
                </div>

                <div className="w-8" />
              </div>

              {/* LIVE WEBPAGE SIMULATOR */}
              <div className={`flex-1 overflow-y-auto scrollbar-thin ${portfolio.theme.dark_mode ? "dark bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"} font-sans transition-colors duration-300`}>
                
                {/* Navbar mockup */}
                <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 h-14 flex items-center justify-between px-6 select-none shrink-0">
                  <span className="font-bold text-xs tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 uppercase font-mono">
                    {portfolio.content.seo.title.split("|")[0].trim().split(" ")[0] || "Candidate"}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-zinc-500">
                    <span>Skills</span>
                    <span>Projects</span>
                    <span>Stats</span>
                  </div>
                </div>

                {/* Iterate order of live sections */}
                <div className="p-6 sm:p-10 space-y-16">
                  {portfolio.theme.sections_order.map((secName: string) => {
                    const isHidden = portfolio.theme.hidden_sections.includes(secName);
                    if (isHidden) return null;

                    switch (secName) {
                      
                      // HERO BLOCK
                      case "hero":
                        return (
                          <div key={secName} className="text-center py-10 space-y-4 animate-fadeIn">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[9px] font-mono font-bold tracking-wider uppercase">
                              🔥 Verified Placement Mentor Portfolio
                            </span>
                            
                            {/* Title with edit click overlay */}
                            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleDirectTextEdit("headline", e.currentTarget.textContent || "")}
                            >
                              {portfolio.content.headline}
                            </h1>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleDirectTextEdit("professional_bio", e.currentTarget.textContent || "")}
                            >
                              {portfolio.content.professional_bio}
                            </p>

                            <div className="pt-4 flex items-center justify-center gap-3">
                              <span className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold rounded-xl shadow select-none">Connect</span>
                              <span className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold rounded-xl select-none">Showcase</span>
                            </div>
                          </div>
                        );

                      // ABOUT ME
                      case "about":
                        return (
                          <div key={secName} className="space-y-4 animate-fadeIn border-t border-zinc-200/30 dark:border-zinc-800/30 pt-10">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">About Me</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleDirectTextEdit("about_me", e.currentTarget.textContent || "")}
                            >
                              {portfolio.content.about_me}
                            </p>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl text-xs space-y-1">
                              <span className="font-bold text-zinc-600 dark:text-zinc-400">Career Objective:</span>
                              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleDirectTextEdit("career_objective", e.currentTarget.textContent || "")}
                              >
                                {portfolio.content.career_objective}
                              </p>
                            </div>
                          </div>
                        );

                      // SKILLS
                      case "skills":
                        return (
                          <div key={secName} className="space-y-4 animate-fadeIn border-t border-zinc-200/30 dark:border-zinc-800/30 pt-10">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Professional Skillset</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleDirectTextEdit("skills_description", e.currentTarget.textContent || "")}
                            >
                              {portfolio.content.skills_description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {(profile.skills || "React, Python, AWS").split(",").map((s) => (
                                <span key={s} className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-semibold shadow-xs">
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        );

                      // PROJECTS
                      case "projects":
                        return (
                          <div key={secName} className="space-y-4 animate-fadeIn border-t border-zinc-200/30 dark:border-zinc-800/30 pt-10">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Featured Project Showcase</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {(portfolio.projects || []).map((proj: any) => (
                                <div key={proj.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl space-y-2.5 flex flex-col justify-between shadow-xs">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                                      <span>{proj.role}</span>
                                      <span>{proj.duration}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{proj.title}</h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{proj.description}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                                    {(proj.technologies || []).map((tech: string) => (
                                      <span key={tech} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono rounded text-zinc-500">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );

                      // CODING STATISTICS
                      case "coding_stats":
                        return (
                          <div key={secName} className="space-y-4 animate-fadeIn border-t border-zinc-200/30 dark:border-zinc-800/30 pt-10">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Coding Assessment Achievements</h2>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl text-center">
                                <span className="block text-[10px] text-zinc-400">Coding Score</span>
                                <span className="text-xl font-bold text-indigo-500 font-mono mt-0.5 block">{portfolio.coding_stats.coding_score}</span>
                              </div>
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl text-center">
                                <span className="block text-[10px] text-zinc-400">Problems Solved</span>
                                <span className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono mt-0.5 block">{portfolio.coding_stats.problems_solved}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-850 text-[10px]">
                              <span className="text-zinc-400">Placement Readiness</span>
                              <span className="font-bold text-emerald-500 font-mono">{portfolio.coding_stats.company_readiness}</span>
                            </div>
                          </div>
                        );

                      // INTERVIEW ANALYTICS
                      case "interview_stats":
                        return (
                          <div key={secName} className="space-y-4 animate-fadeIn border-t border-zinc-200/30 dark:border-zinc-800/30 pt-10">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">AI Placement Assessments</h2>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { label: "Comm.", val: portfolio.interview_analytics.communication },
                                { label: "Technical", val: portfolio.interview_analytics.technical },
                                { label: "Confidence", val: portfolio.interview_analytics.confidence }
                              ].map((item) => (
                                <div key={item.label} className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-center">
                                  <span className="block text-[9px] text-zinc-400">{item.label}</span>
                                  <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-100 block mt-0.5">{item.val}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-850 text-[10px]">
                              <span className="text-zinc-400">Commulative Readiness</span>
                              <span className="font-bold text-emerald-500 font-mono text-xs">{portfolio.interview_analytics.overall_readiness}% Readiness</span>
                            </div>
                          </div>
                        );

                      // CONTACT / SOCIALS
                      case "contact":
                        return (
                          <div key={secName} className="text-center py-10 space-y-4 animate-fadeIn border-t border-zinc-200/30 dark:border-zinc-800/30 pt-10">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Get in Touch</h2>
                            <p className="text-[10px] text-zinc-500">I am actively open to internship and entry-level full-time roles.</p>
                            <div className="flex flex-col items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                              <span>{portfolio.social_links.email}</span>
                              <span>{portfolio.social_links.phone}</span>
                            </div>
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
