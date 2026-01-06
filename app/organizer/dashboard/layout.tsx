"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  TrendingUp,
  Plus,
  Menu,
  X,
  LogOut,
  Users2,
  Loader2,
} from "lucide-react";

const organizerItems = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/organizer/dashboard/tournaments",
    label: "My Tournaments",
    icon: Trophy,
  },
  {
    href: "/organizer/dashboard/create",
    label: "Create Tournament",
    icon: Plus,
  },
  {
    href: "/organizer/dashboard/matches",
    label: "Match Management",
    icon: Calendar,
  },
  { href: "/organizer/dashboard/teams", label: "Team Management", icon: Users },
  {
    href: "/organizer/dashboard/players",
    label: "Player Management",
    icon: Users2,
  },
  {
    href: "/organizer/dashboard/registrations",
    label: "Mis Inscripciones",
    icon: TrendingUp,
  },
  { href: "/organizer/dashboard/settings", label: "Settings", icon: Settings },
];

const captainItems = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/dashboard/teams", label: "My Teams", icon: Users },
  {
    href: "/organizer/dashboard/matches",
    label: "Match Management",
    icon: Calendar,
  },
  {
    href: "/organizer/dashboard/registrations",
    label: "Mis Inscripciones",
    icon: TrendingUp,
  },
  { href: "/organizer/dashboard/settings", label: "Settings", icon: Settings },
];

interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "organizer" | "admin" | null;
}

export default function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Obtener datos del usuario desde el backend o localStorage
        // Por ahora, almacenaremos el role en localStorage después del login
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Determinar items del sidebar según el rol
  const sidebarItems = user?.role === "user" ? captainItems : organizerItems;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 glass-strong border-r border-border/50 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border/50">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Trophy className="h-6 w-6 text-accent-foreground" />
              </div>
              <span>TournamentPro</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden absolute top-6 right-6"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Role Badge */}
          <div className="px-4 py-2 mx-4 rounded-lg bg-accent/20 border border-accent/50">
            <div className="text-xs font-semibold text-accent uppercase">
              {user?.role === "user" ? "Team Captain" : user?.role === "organizer" ? "Organizer" : "Admin"}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 glass-strong border-b border-border/50 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
