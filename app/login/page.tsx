"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
        {
          email,
          password,
        }
      );

      // Si el login es exitoso
      if (response.data) {
        toast({
          title: "Sesión iniciada",
          description: "¡Bienvenido!",
        });

        // Guardar el token
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Guardar datos del usuario incluyendo el rol
        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              role: response.data.user.role,
            })
          );
        }

        // Dispatch custom event para notificar al navigation
        window.dispatchEvent(new Event("authChange"));

        // Redirigir al dashboard
        router.push("/organizer/dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error al iniciar sesión",
          description:
            error.response?.data?.message || "Email o contraseña incorrectos",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-background" />
      <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
            <Trophy className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">TournamentPro</h1>
          <p className="text-muted-foreground">Inicia sesión para continuar</p>
        </div>

        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>
              Ingresa tu email y contraseña para acceder
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Recuérdame en este dispositivo
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center mb-4">
                ¿No tienes cuenta?
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">
                  Crear Cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Fallback para login del organizador */}
            <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
              <p>
                ¿Necesitas acceso antiguo?{" "}
                <Link
                  href="/organizer/login"
                  className="text-accent hover:underline"
                >
                  Click aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
