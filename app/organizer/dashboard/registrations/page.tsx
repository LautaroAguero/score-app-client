"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { RegistrationCard } from "@/components/registration";
import type { Registration } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "organizer" | "admin" | null;
}

interface TournamentGroup {
  tournament: {
    _id: string;
    name: string;
    sportType?: string;
    maxTeams?: number;
    requiresApproval?: boolean;
  };
  registrations: Registration[];
}

export default function MyRegistrationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [groupedRegistrations, setGroupedRegistrations] = useState<TournamentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] =
    useState<Registration | null>(null);
  const [registrationToAction, setRegistrationToAction] =
    useState<{ registration: Registration; registrationId: string; action: "approve" | "reject"; tournamentName?: string } | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Verificar autenticación y cargar user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      toast({
        title: "Autenticación requerida",
        description: "Por favor inicia sesión para ver tus inscripciones",
        variant: "destructive",
      });
      router.push("/organizer/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchRegistrations();
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/organizer/login");
    }
  }, []);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role === "user") {
        // Team captain: obtiene sus propias inscripciones
        const response = await axios.get(
          `${API_URL}/registrations/my-registrations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRegistrations(response.data.registrations || []);
      } else {
        // Organizer: obtiene inscripciones agrupadas por torneo
        const response = await axios.get(
          `${API_URL}/registrations/grouped/by-tournament`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGroupedRegistrations(response.data.registrations || []);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error al cargar inscripciones",
          description:
            error.response?.data?.message ||
            "No se pudieron cargar las inscripciones",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (registrationId: string) => {
    const registration = registrations.find((r) => r._id === registrationId);
    if (registration) {
      setRegistrationToDelete(registration);
      setIsCancelDialogOpen(true);
    }
  };

  const handleActionClick = (registrationId: string, registration: Registration, action: "approve" | "reject", tournamentName?: string) => {
    setRegistrationToAction({ registration, registrationId, action, tournamentName });
    setIsActionDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!registrationToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/registrations/${registrationToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Éxito",
        description: "Inscripción cancelada exitosamente",
      });

      setIsCancelDialogOpen(false);
      setRegistrationToDelete(null);
      fetchRegistrations();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error al cancelar",
          description:
            error.response?.data?.message || "No se pudo cancelar la inscripción",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActionConfirm = async () => {
    if (!registrationToAction) return;

    setIsActing(true);
    try {
      const token = localStorage.getItem("token");
      const { registrationId, action } = registrationToAction;

      const endpoint = action === "approve"
        ? `${API_URL}/registrations/${registrationId}/approve`
        : `${API_URL}/registrations/${registrationId}/reject`;

      await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Éxito",
        description: `Inscripción ${action === "approve" ? "aprobada" : "rechazada"} exitosamente`,
      });

      setIsActionDialogOpen(false);
      setRegistrationToAction(null);
      fetchRegistrations();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "No se pudo procesar la inscripción",
          variant: "destructive",
        });
      }
    } finally {
      setIsActing(false);
    }
  };

  // Filtrar inscripciones
  const filteredRegistrations =
    filterStatus === "all"
      ? registrations
      : registrations.filter((reg) => reg.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Inscripciones</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === "user"
            ? "Ver el estado de tus inscripciones a torneos"
            : "Gestiona las inscripciones de equipos a tus torneos"}
        </p>
      </div>

      {/* Filter - Solo mostrar para team captains */}
      {user?.role === "user" && (
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filtrar por estado:</label>
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as FilterStatus)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {user?.role === "user" ? (
        // Team Captain View
        filteredRegistrations.length === 0 ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                {registrations.length === 0
                  ? "No tienes inscripciones aún. ¡Inscríbete a un torneo!"
                  : "No hay inscripciones con ese estado"}
              </p>
              {registrations.length === 0 && (
                <Button onClick={() => router.push("/tournaments")}>
                  Ver torneos disponibles
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRegistrations.map((registration) => (
              <RegistrationCard
                key={registration._id}
                registration={registration}
                onCancel={handleCancelClick}
                showActions={true}
                isLoading={isDeleting}
              />
            ))}
          </div>
        )
      ) : // Organizer View - Agrupado por Torneo
      groupedRegistrations.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No hay torneos con inscripciones aún
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedRegistrations.map((group) => (
            <Card key={group.tournament._id} className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{group.tournament.name}</CardTitle>
                    <CardDescription>
                      {group.registrations.length} inscripción(es)
                      {group.tournament.maxTeams && 
                        ` de ${group.tournament.maxTeams} equipos máximo`}
                    </CardDescription>
                  </div>
                  {group.tournament.requiresApproval && (
                    <Badge variant="outline">Requiere Aprobación</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {group.registrations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay inscripciones para este torneo
                  </p>
                ) : (
                  <div className="space-y-3">
                    {group.registrations.map((registration) => (
                      <div
                        key={registration._id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">
                              {registration.team.name}
                            </h4>
                            <Badge
                              variant={
                                registration.status === "approved"
                                  ? "default"
                                  : registration.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {registration.status === "approved"
                                ? "Aprobada"
                                : registration.status === "rejected"
                                ? "Rechazada"
                                : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Capitán:</strong> {registration.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Email:</strong> {registration.user.email}
                          </p>
                        </div>

                        {/* Botones - Solo mostrar si está pendiente */}
                        {registration.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleActionClick(registration._id || (registration as any).id, registration, "reject", group.tournament.name)
                              }
                              disabled={isActing}
                            >
                              {isActing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Rechazar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleActionClick(registration._id || (registration as any).id, registration, "approve", group.tournament.name)
                              }
                              disabled={isActing}
                            >
                              {isActing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Aprobar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar tu inscripción a{" "}
              <strong>{registrationToDelete?.tournament.name}</strong> con el
              equipo <strong>{registrationToDelete?.team.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isDeleting}
            >
              No, mantener inscripción
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Cancelando..." : "Sí, cancelar inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog (Approve/Reject) */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {registrationToAction?.action === "approve"
                ? "Aprobar inscripción"
                : "Rechazar inscripción"}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas{" "}
              {registrationToAction?.action === "approve"
                ? "aprobar"
                : "rechazar"}{" "}
              la inscripción del equipo{" "}
              <strong>{registrationToAction?.registration.team.name}</strong> al
              torneo{" "}
              <strong>{registrationToAction?.tournamentName || registrationToAction?.registration.tournament?.name || "Sin torneo"}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isActing}
            >
              Cancelar
            </Button>
            <Button
              variant={
                registrationToAction?.action === "approve"
                  ? "default"
                  : "destructive"
              }
              onClick={handleActionConfirm}
              disabled={isActing}
            >
              {isActing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isActing
                ? "Procesando..."
                : registrationToAction?.action === "approve"
                ? "Sí, aprobar"
                : "Sí, rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
