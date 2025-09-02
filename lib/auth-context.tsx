"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, AuthState, LoginCredentials, RegisterData } from "./types"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("basketball_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      // TODO: Replace with actual API call
      // For now, simulate login with mock data
      const mockUser: User = {
        id: "1",
        email: credentials.email,
        name: credentials.email === "admin@test.com" ? "Administrador" : "Usuario Equipo",
        role: credentials.email === "admin@test.com" ? "organizer" : "team",
        teamId: credentials.email !== "admin@test.com" ? "team-1" : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      localStorage.setItem("basketball_user", JSON.stringify(mockUser))
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.error("Login error:", error)
      throw new Error("Error al iniciar sesión")
    }
  }

  const register = async (data: RegisterData) => {
    try {
      // TODO: Replace with actual API call
      // For now, simulate registration
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: data.role,
        teamId: data.role === "team" ? `team-${Date.now()}` : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // If registering as team, we would also create the team here
      if (data.role === "team" && data.teamName) {
        // TODO: Create team in database
        console.log("Creating team:", {
          name: data.teamName,
          primaryColor: data.teamPrimaryColor,
          secondaryColor: data.teamSecondaryColor,
        })
      }

      localStorage.setItem("basketball_user", JSON.stringify(newUser))
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.error("Registration error:", error)
      throw new Error("Error al crear la cuenta")
    }
  }

  const logout = () => {
    localStorage.removeItem("basketball_user")
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
