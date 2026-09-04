/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import { IUser, ICandidateProfile } from "../types";

const SESSION_STORAGE_KEY = "interview_cracker_user_session";

function getStoredUser(): IUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading stored user session:", e);
  }
  return null;
}

interface UserState {
  user: IUser | null;
  candidateProfile: ICandidateProfile | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  setUser: (user: IUser | null) => void;
  setCandidateProfile: (profile: ICandidateProfile | null) => void;
  clearSession: () => void;
  setAuthenticating: (isAuthenticating: boolean) => void;
}

const initialUser = getStoredUser();

export const useUserStore = create<UserState>((set) => ({
  user: initialUser,
  candidateProfile: null,
  isAuthenticated: !!initialUser,
  isAuthenticating: false,
  setUser: (user) => {
    if (user) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error("Error persisting user session:", e);
      }
      set({ user, isAuthenticated: true, isAuthenticating: false });
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      set({ user: null, isAuthenticated: false, isAuthenticating: false });
    }
  },
  setCandidateProfile: (profile) => set({ candidateProfile: profile }),
  clearSession: () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem("interview_cracker_current_view");
    set({ user: null, candidateProfile: null, isAuthenticated: false, isAuthenticating: false });
  },
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
}));

