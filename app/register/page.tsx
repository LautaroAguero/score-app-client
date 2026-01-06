"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trophy,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  ArrowRight,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

type UserRole = "team-captain" | "organizer" | null;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    phone: "",
    experience: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("form");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas sean iguales",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Términos requeridos",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Rol no seleccionado",
        description: "Por favor selecciona un rol",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole === "team-captain" ? "user" : "organizer", // Mapear al rol del backend
      };

      // Agregar campos opcionales según el rol
      if (selectedRole === "organizer") {
        payload.organization = formData.organization || undefined;
        payload.phone = formData.phone || undefined;
        payload.experience = formData.experience || undefined;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/register`,
        payload
      );

      // Si el registro es exitoso
      if (response.data) {
        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta ha sido creada correctamente",
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

        // Dispatch custom event
        window.dispatchEvent(new Event("authChange"));

        // Redirigir al dashboard
        router.push("/organizer/dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error en el registro",
          description:
            error.response?.data?.message || "No se pudo completar el registro",
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

  // Paso 1: Seleccionar Rol
  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-background" />
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
              <Trophy className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Únete a TournamentPro</h1>
            <p className="text-muted-foreground">
              ¿Cuál es tu rol en nuestra plataforma?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Opción: Dueño de Equipo */}
            <Card
              className="glass-strong cursor-pointer hover:border-accent transition-colors"
              onClick={() => handleRoleSelect("team-captain")}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Dueño de Equipo</CardTitle>
                </div>
                <CardDescription>Crea y gestiona equipos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    Crear y editar equipos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    Inscribir equipos en torneos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    Ver estado de inscripciones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    Participar en torneos
                  </li>
                </ul>
                <Button className="w-full mt-4">
                  Continuar como Dueño
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Opción: Organizador */}
            <Card
              className="glass-strong cursor-pointer hover:border-accent transition-colors"
              onClick={() => handleRoleSelect("organizer")}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Organizador</CardTitle>
                </div>
                <CardDescription>Crea y gestiona torneos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    Crear torneos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    Gestionar inscripciones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    Generar partidos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    Ver estadísticas
                  </li>
                </ul>
                <Button className="w-full mt-4">
                  Continuar como Organizador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Paso 2: Formulario
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-background" />
      <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("role")}
            disabled={isLoading}
            className="mb-4"
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
          <p className="text-muted-foreground">
            {selectedRole === "team-captain"
              ? "Como Dueño de Equipo"
              : "Como Organizador"}
          </p>
        </div>

        <Card className="glass-strong">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Completa los datos para crear tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Campos específicos para Organizador */}
              {selectedRole === "organizer" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organization">
                      Organización (Opcional)
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="organization"
                        name="organization"
                        placeholder="Tu organización"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experiencia (Opcional)</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      placeholder="Cuéntanos sobre tu experiencia organizando eventos..."
                      value={formData.experience}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Términos */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Acepto los{" "}
                  <Link href="#" className="text-accent hover:underline">
                    términos y condiciones
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm">
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-accent hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
