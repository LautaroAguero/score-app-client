"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import type { Team, Tournament } from "@/lib/types";

interface InscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament;
  onSuccess?: () => void;
}

export function InscribeDialog({
  open,
  onOpenChange,
  tournament,
  onSuccess,
}: InscribeDialogProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Cargar equipos del usuario para este torneo
  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  const fetchTeams = async () => {
    try {
      setIsLoadingTeams(true);
      const token = localStorage.getItem("token");

      // Obtener todos los equipos del usuario capitán (no filtrados por torneo)
      const response = await axios.get(`${API_URL}/teams/my-teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeams(response.data.teams || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error al cargar equipos",
          description:
            error.response?.data?.message ||
            "No se pudieron cargar tus equipos",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un equipo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/registrations`,
        {
          tournament: tournament._id,
          team: selectedTeamId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const registration = response.data.registration;
      const statusMessage =
        registration.status === "approved"
          ? "¡Inscrito exitosamente! Tu equipo ya puede participar"
          : "Inscripción enviada. Esperando aprobación del organizador";

      toast({
        title: "Éxito",
        description: statusMessage,
      });

      onOpenChange(false);
      setSelectedTeamId("");
      onSuccess?.();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error al inscribirse",
          description:
            error.response?.data?.message ||
            "No se pudo completar la inscripción",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inscribirse a {tournament.name}</DialogTitle>
          <DialogDescription>
            Selecciona el equipo con el que deseas participar en este torneo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Equipo</label>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger disabled={isLoadingTeams}>
                {isLoadingTeams ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  <SelectValue placeholder="Selecciona un equipo" />
                )}
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No tienes equipos en este torneo
                  </div>
                ) : (
                  teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {teams.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Debes crear un equipo primero antes de poder inscribirte
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedTeamId || teams.length === 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Inscribiendo..." : "Inscribirse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
