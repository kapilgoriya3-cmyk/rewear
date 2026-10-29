import { createContext, useContext, useState, useEffect } from "react";
import API_BASE_URL from "../api";

const AuthContext = createContext(null);

const AUTH_API = `${API_BASE_URL}/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("rewear_user");
      if (!savedUser || savedUser === "undefined" || savedUser === "null")
        return null;
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("rewear_token");
    return savedToken && savedToken !== "undefined" && savedToken !== "null"
      ? savedToken
      : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync state to localStorage cleanly
  useEffect(() => {
    if (user) {
      localStorage.setItem("rewear_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("rewear_user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("rewear_token", token);
    } else {
      localStorage.removeItem("rewear_token");
    }
  }, [token]);

  // Sync session with backend to ensure freshest role and valid token
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const syncSession = async () => {
      try {
        const response = await fetch(`${AUTH_API}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        } else if (response.status === 401 || response.status === 404) {
          logout();
        }
      } catch (err) {
        console.error("Session sync error:", err);
      }
    };

    syncSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const response = await fetch(`${AUTH_API}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          return data.user;
        }
      } else if (response.status === 401 || response.status === 404) {
        logout();
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
    return null;
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Login failed. Please try again.",
          userNotFound: !!data.userNotFound,
          email: data.email || email,
        };
      }

      setUser(data.user);
      setToken(data.token);

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch (err) {
      console.error("Login network error:", err);
      return {
        success: false,
        error:
          "Unable to reach backend server. Please verify the server is running on port 5000.",
        networkError: true,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({
    name,
    email,
    password,
    confirmPassword,
    location,
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Registration failed. Please try again.",
          userExists: !!data.userExists,
        };
      }

      // Automatically log user in upon registration
      if (data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
      }

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch (err) {
      console.error("Registration network error:", err);
      return {
        success: false,
        error:
          "Unable to reach backend server. Please verify the server is running on port 5000.",
        networkError: true,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async ({ name, location }) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const response = await fetch(`${AUTH_API}/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location }),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Failed to update profile",
        };
      }
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      console.error("Update profile error:", err);
      return { success: false, error: "Network error updating profile" };
    }
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutRedirectUrl, setLogoutRedirectUrl] = useState("/login");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const requestLogout = (redirectTo = "/login") => {
    setLogoutRedirectUrl(redirectTo);
    setIsLogoutModalOpen(true);
  };

  const cancelLogout = () => {
    if (isLoggingOut) return;
    setIsLogoutModalOpen(false);
  };

  const confirmLogout = (navigateFn) => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      logout();
      setIsLogoutModalOpen(false);
      if (typeof navigateFn === "function") {
        navigateFn(logoutRedirectUrl || "/login");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("rewear_user");
    localStorage.removeItem("rewear_token");
    localStorage.removeItem("rewear_favorites");
  };

  const loginWithGoogle = async (credential) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Google authentication failed. Please try again.",
        };
      }

      setUser(data.user);
      setToken(data.token);

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch (err) {
      console.error("Google authentication network error:", err);
      return {
        success: false,
        error: "Unable to reach backend server. Please verify the server is running.",
        networkError: true,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        requestLogout,
        cancelLogout,
        confirmLogout,
        isLogoutModalOpen,
        isLoggingOut,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
