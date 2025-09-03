"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User, AuthState, LoginCredentials, RegisterData } from "./types";
import axios from "axios";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("basketball_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL not set in environment variables");
      const response = await axios.post(`${apiUrl}/user/login`, credentials);
      if (response.status !== 200) {
        throw new Error("Credenciales inválidas");
      }
      const user: User = response.data;
      localStorage.setItem("basketball_user", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Error al iniciar sesión");
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
      if (!apiUrl) throw new Error("API URL not set in environment variables");
      const { data: user } = await axios.post<User>(
        `${apiUrl}/user/register`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );
      localStorage.setItem("basketball_user", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("basketball_user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
