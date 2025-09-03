"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, Trophy, Users, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { RegisterData } from "@/lib/types";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
    role: "organizer",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (formData.role === "team" && !formData.teamName) {
      setError("El nombre del equipo es requerido");
      setIsLoading(false);
      return;
    }

    try {
      console.log(formData);
      await register(formData);
      router.push("/");
    } catch (err) {
      console.log(err);
      setError("Error al crear la cuenta. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Únete a la plataforma de torneos de básquet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label>Tipo de Cuenta</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value: "organizer" | "team") =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50">
                  <RadioGroupItem value="organizer" id="organizer" />
                  <Label
                    htmlFor="organizer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Organizador</div>
                      <div className="text-xs text-muted-foreground">
                        Gestiona torneos
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50">
                  <RadioGroupItem value="team" id="team" />
                  <Label
                    htmlFor="team"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Equipo</div>
                      <div className="text-xs text-muted-foreground">
                        Participa en torneos
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {formData.role === "organizer"
                  ? "Nombre Completo"
                  : "Nombre del Representante"}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={
                  formData.role === "organizer"
                    ? "Juan Pérez"
                    : "Capitán del equipo"
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            {formData.role === "team" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="teamName">Nombre del Equipo</Label>
                  <Input
                    id="teamName"
                    type="text"
                    placeholder="Los Tigres"
                    value={formData.teamName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        teamName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Primario</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.teamPrimaryColor || "#3b82f6"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          teamPrimaryColor: e.target.value,
                        }))
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.teamSecondaryColor || "#1e40af"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          teamSecondaryColor: e.target.value,
                        }))
                      }
                      className="h-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-600 hover:to-amber-600"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="text-cyan-600 hover:text-cyan-500 font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
