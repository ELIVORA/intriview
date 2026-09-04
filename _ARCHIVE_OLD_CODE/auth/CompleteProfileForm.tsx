/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { User, GraduationCap, Calendar, Briefcase, Sparkles, Loader2 } from "lucide-react";

interface CompleteProfileFormProps {
  onSuccess: (profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  }) => void;
}

const AVAILABLE_ROLES = ["Full-Stack Engineer", "Frontend Engineer", "Backend Engineer", "AI/ML Engineer", "Data Scientist", "Mobile App Developer"];
const POPULAR_SKILLS = ["React", "TypeScript", "Next.js", "Python", "FastAPI", "MySQL", "Tailwind CSS", "Git", "Docker", "Machine Learning"];

export function CompleteProfileForm({ onSuccess }: CompleteProfileFormProps) {
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleRole = (role: string) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter((r) => r !== role));
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !university) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess({
        fullName,
        university,
        graduationYear,
        targetRoles: targetRoles.length > 0 ? targetRoles : ["Full-Stack Engineer"],
        skills: selectedSkills.length > 0 ? selectedSkills : ["React", "Python"],
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      <div id="complete-profile-card" className="w-full max-w-lg p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 relative">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Complete Your Profile</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Let's customize your Virtual Placement Mentor experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* University */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">University/College</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="State University"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Graduation Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Expected Graduation Year</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none appearance-none"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          {/* Target Job Roles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Target Job Roles (Select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((role) => {
                const selected = targetRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selected
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Skills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Primary Technologies & Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map((skill) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selected
                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Details"}
          </button>
        </form>
      </div>
    </div>
  );
}
