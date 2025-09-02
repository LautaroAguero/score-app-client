"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { Trophy } from "lucide-react"

interface RouteProtectionProps {
  children: React.ReactNode
  allowedRoles?: ("organizer" | "team")[]
  redirectTo?: string
}

export function RouteProtection({
  children,
  allowedRoles = ["organizer", "team"],
  redirectTo = "/login",
}: RouteProtectionProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate page based on role
        if (user.role === "team") {
          router.push("/tournaments")
        } else {
          router.push("/")
        }
        return
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for easier use
export function withRouteProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: ("organizer" | "team")[],
  redirectTo?: string,
) {
  return function ProtectedComponent(props: P) {
    return (
      <RouteProtection allowedRoles={allowedRoles} redirectTo={redirectTo}>
        <Component {...props} />
      </RouteProtection>
    )
  }
}
