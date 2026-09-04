/**
 * Central authentication hook.
 *
 * Credentials are verified on the server. No password or administrator
 * credential is shipped to the browser.
 */
import { useCallback, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { UserRole, IUser } from "../types";
import { api } from "../services/api";

export function useAuth() {
  const { user, isAuthenticated, isAuthenticating, setUser, clearSession, setAuthenticating } = useUserStore();

  useEffect(() => {
    let active = true;
    (async () => {
      setAuthenticating(true);
      const token = localStorage.getItem("idToken") || localStorage.getItem("token");
      if (!token) {
        if (active) {
          setUser(null);
          setAuthenticating(false);
        }
        return;
      }
      try {
        const res = await api.get("/v1/auth/me");
        if (active && res.data?.user) setUser(res.data.user as IUser);
      } catch {
        localStorage.removeItem("idToken");
        localStorage.removeItem("token");
        if (active) setUser(null);
      } finally {
        if (active) setAuthenticating(false);
      }
    })();
    return () => { active = false; };
  }, [setUser, setAuthenticating]);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    const res = await api.post("/v1/auth/login", { email: email.trim().toLowerCase(), password: pass });
    if (res.data?.status !== "success" || !res.data.user || !res.data.token) {
      throw new Error(res.data?.message || "Authentication failed.");
    }
    localStorage.setItem("idToken", res.data.token);
    const userObj = res.data.user as IUser;
    setUser(userObj);
    return userObj;
  }, [setUser]);

  const registerWithEmail = useCallback(async (email: string, pass: string, fullName: string) => {
    const res = await api.post("/v1/auth/register", {
      email: email.trim().toLowerCase(),
      password: pass,
      fullName: fullName.trim()
    });
    if (res.data?.status !== "success" || !res.data.user || !res.data.token) {
      const err: any = new Error(res.data?.message || "Registration failed.");
      if (res.data?.code) err.code = res.data.code;
      throw err;
    }
    localStorage.setItem("idToken", res.data.token);
    const userObj = res.data.user as IUser;
    setUser(userObj);
    return userObj;
  }, [setUser]);

  const loginWithGoogle = useCallback(async () => {
    throw new Error("Google sign-in is not configured. Add your OAuth provider before enabling this button.");
  }, []);

  const logout = useCallback(async () => {
    clearSession();
  }, [clearSession]);

  return {
    user,
    isAuthenticated,
    isAuthenticating,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  };
}

export default useAuth;
