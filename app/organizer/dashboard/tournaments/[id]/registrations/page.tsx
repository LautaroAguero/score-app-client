"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  RegistrationsTable,
  RegistrationStatsCards,
  RejectDialog,
} from "@/components/registration";
import type { Registration, RegistrationStats, Tournament } from "@/lib/types";

export default function ManageRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tournamentId = params.id as string;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    registrationId: string;
    teamName: string;
  }>({ open: false, registrationId: "", teamName: "" });

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Autenticación requerida",
        description: "Por favor inicia sesión",
        variant: "destructive",
      });
      router.push("/organizer/login");
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Obtener torneo
      const tournamentRes = await axios.get(
        `${API_URL}/tournaments/${tournamentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTournament(tournamentRes.data.tournament);

      // Obtener estadísticas
      const statsRes = await axios.get(
        `${API_URL}/registrations/tournament/${tournamentId}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(statsRes.data);

      // Obtener todas las inscripciones
      const regsRes = await axios.get(
        `${API_URL}/registrations/tournament/${tournamentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllRegistrations(regsRes.data.registrations || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          toast({
            title: "Acceso denegado",
            description: "No tienes permiso para gestionar este torneo",
            variant: "destructive",
          });
          router.back();
        } else {
          toast({
            title: "Error",
            description:
              error.response?.data?.message ||
              "No se pudieron cargar los datos",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/registrations/${registrationId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Éxito",
        description: "Inscripción aprobada",
      });

      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "No se pudo aprobar la inscripción",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (registrationId: string, teamName: string) => {
    setRejectDialog({
      open: true,
      registrationId,
      teamName,
    });
  };

  const handleRejectConfirm = async (
    registrationId: string,
    reason: string
  ) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/registrations/${registrationId}/reject`,
        { rejectionReason: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Éxito",
        description: "Inscripción rechazada",
      });

      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "No se pudo rechazar la inscripción",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRegs = allRegistrations.filter(
    (reg) => reg.status === "pending"
  );
  const approvedRegs = allRegistrations.filter(
    (reg) => reg.status === "approved"
  );
  const rejectedRegs = allRegistrations.filter(
    (reg) => reg.status === "rejected"
  );

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
        <h1 className="text-3xl font-bold">Gestionar Inscripciones</h1>
        <p className="text-muted-foreground mt-2">{tournament?.name}</p>
      </div>

      {/* Stats */}
      {stats && (
        <RegistrationStatsCards
          total={stats.stats.total}
          approved={stats.stats.approved}
          pending={stats.stats.pending}
          rejected={stats.stats.rejected}
          maxTeams={stats.tournament.maxTeams}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendientes ({pendingRegs.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprobadas ({approvedRegs.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas ({rejectedRegs.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Inscripciones Pendientes de Aprobación</CardTitle>
              <CardDescription>
                Revisa y aprueba o rechaza las solicitudes pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationsTable
                registrations={pendingRegs}
                onApprove={handleApprove}
                onReject={(id) => {
                  const reg = pendingRegs.find((r) => r._id === id);
                  if (reg) {
                    handleRejectClick(id, reg.team.name);
                  }
                }}
                showActions={true}
                isLoading={isProcessing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Inscripciones Aprobadas</CardTitle>
              <CardDescription>
                Equipos que han sido aprobados y pueden participar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationsTable
                registrations={approvedRegs}
                showActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Inscripciones Rechazadas</CardTitle>
              <CardDescription>
                Equipos cuyas solicitudes fueron rechazadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationsTable
                registrations={rejectedRegs}
                showActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
        registrationId={rejectDialog.registrationId}
        teamName={rejectDialog.teamName}
        onConfirm={handleRejectConfirm}
        isLoading={isProcessing}
      />
    </div>
  );
}
