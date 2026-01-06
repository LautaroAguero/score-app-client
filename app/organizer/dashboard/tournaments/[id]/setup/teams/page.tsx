"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SetupProgressBar } from "@/components/setup/SetupProgressBar";
import { ExistingTeamsList } from "@/components/setup/ExistingTeamsList";
import { QuickCreateTeam } from "@/components/setup/QuickCreateTeam";
import { AddedTeamsTable } from "@/components/setup/AddedTeamsTable";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Team, Tournament, Registration } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MIN_TEAMS = 2;

export default function AddTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [inscribedTeams, setInscribedTeams] = useState<Registration[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setIsLoadingTeams(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to continue",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      const [tournamentRes, registrationsRes] = await Promise.all([
        axios.get(`${API_URL}/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/registrations/tournament/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tourney = tournamentRes.data.tournament || tournamentRes.data;
      setTournament(tourney);

      const registrations = registrationsRes.data.registrations || [];
      setInscribedTeams(registrations);

      // Initialize selected teams from tournament
      if (tourney.teams && Array.isArray(tourney.teams)) {
        const selectedIds = tourney.teams.map((t: any) =>
          typeof t === "string" ? t : t._id
        );
        setSelectedTeamIds(selectedIds);

        // Filter selected teams from inscribed teams
        const selected = registrations
          .filter((reg: Registration) => selectedIds.includes(reg.team._id))
          .map((reg: Registration) => reg.team);
        setSelectedTeams(selected);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Failed to load data";
        setError(message);
        toast({
          title: "Error loading data",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleAddTeam = (teamId: string) => {
    if (!tournament) return;

    if (selectedTeamIds.includes(teamId)) {
      toast({
        title: "Team already added",
        description: "This team is already in the selection",
        variant: "destructive",
      });
      return;
    }

    if (selectedTeamIds.length >= tournament.numberOfParticipants) {
      toast({
        title: "Team limit reached",
        description: `You can only add ${tournament.numberOfParticipants} teams for this tournament`,
        variant: "destructive",
      });
      return;
    }

    setSelectedTeamIds([...selectedTeamIds, teamId]);

    const team = inscribedTeams.find((reg) => reg.team._id === teamId)?.team;
    if (team) {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const handleApproveRegistration = async (
    registrationId: string,
    teamId: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      setApprovingIds(new Set([...approvingIds, registrationId]));

      await axios.patch(
        `${API_URL}/registrations/${registrationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Auto-add to selected teams
      setSelectedTeamIds([...selectedTeamIds, teamId]);
      const team = inscribedTeams.find((reg) => reg.team._id === teamId)?.team;
      if (team) {
        setSelectedTeams([...selectedTeams, team]);
      }

      toast({
        title: "Success",
        description: "Registration approved and team added!",
      });

      // Remove from pending registrations
      setInscribedTeams(
        inscribedTeams.filter((reg) => reg.team._id !== teamId)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error approving registration",
          description: error.response?.data?.message || "Failed to approve",
          variant: "destructive",
        });
      }
    } finally {
      setApprovingIds(
        new Set([...approvingIds].filter((id) => id !== registrationId))
      );
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    setSelectedTeams(selectedTeams.filter((team) => team._id !== teamId));
  };

  const handleTeamCreated = (newTeamId: string, newTeam: Team) => {
    // Add new team to existing teams list
    setExistingTeams([...existingTeams, newTeam]);

    // Add to selected teams
    setSelectedTeamIds([...selectedTeamIds, newTeamId]);
    setSelectedTeams([...selectedTeams, newTeam]);

    toast({
      title: "Success",
      description: "Team created and added to tournament!",
    });
  };

  const handleNext = async () => {
    // Validation
    if (!tournament) return;

    if (selectedTeamIds.length < MIN_TEAMS) {
      toast({
        title: "Not enough teams",
        description: `Please add at least ${MIN_TEAMS} teams`,
        variant: "destructive",
      });
      return;
    }

    if (selectedTeamIds.length > tournament.numberOfParticipants) {
      toast({
        title: "Too many teams",
        description: `You can add maximum ${tournament.numberOfParticipants} teams`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/tournaments/${tournamentId}/add-teams`,
        { teamIds: selectedTeamIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Teams added to tournament successfully!",
      });

      // Navigate to next step
      router.push(
        `/organizer/dashboard/tournaments/${tournamentId}/setup/matches`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error adding teams",
          description: error.response?.data?.message || "Failed to add teams",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTeams) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const maxTeams = tournament?.numberOfParticipants || 32;
  const isValid =
    selectedTeamIds.length >= MIN_TEAMS && selectedTeamIds.length <= maxTeams;
  const validationMessage =
    selectedTeamIds.length < MIN_TEAMS
      ? `Add at least ${MIN_TEAMS - selectedTeamIds.length} more team${
          MIN_TEAMS - selectedTeamIds.length !== 1 ? "s" : ""
        }`
      : selectedTeamIds.length > maxTeams
      ? `Remove ${selectedTeamIds.length - maxTeams} team${
          selectedTeamIds.length - maxTeams !== 1 ? "s" : ""
        }`
      : "Ready to proceed to next step";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Add Teams</h1>
          <p className="text-muted-foreground mt-1">
            Step 2 of 4 - {tournament?.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(
              `/organizer/dashboard/tournaments/${tournamentId}/setup`
            )
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <SetupProgressBar currentStep={2} totalSteps={4} />

      {/* Inscribed Teams List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Inscribed Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTeams ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : inscribedTeams.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No teams have inscribed to this tournament yet.
            </p>
          ) : (
            <div className="space-y-3">
              {inscribedTeams.map((registration) => (
                <div
                  key={registration._id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{registration.team.name}</h4>
                    {registration.team.tournament && (
                      <p className="text-sm text-muted-foreground">
                        Tournament: {registration.team.tournament.name}
                      </p>
                    )}
                  </div>
                  {!selectedTeamIds.includes(registration.team._id) ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleApproveRegistration(
                          registration._id,
                          registration.team._id
                        )
                      }
                      disabled={approvingIds.has(registration._id)}
                      className="gap-2"
                    >
                      {approvingIds.has(registration._id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {approvingIds.has(registration._id)
                        ? "Approving..."
                        : "Approve"}
                    </Button>
                  ) : (
                    <Badge className="bg-green-600">Added</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Create Team */}
      <QuickCreateTeam
        tournamentId={tournamentId}
        onTeamCreated={handleTeamCreated}
      />

      {/* Added Teams Table */}
      <AddedTeamsTable teams={selectedTeams} onRemoveTeam={handleRemoveTeam} />

      {/* Validation Status */}
      <div
        className={`
          rounded-lg border p-4 flex items-start gap-3
          ${
            isValid
              ? "bg-green-500/10 border-green-500/30 text-green-700"
              : "bg-amber-500/10 border-amber-500/30 text-amber-700"
          }
        `}
      >
        <div className="flex-1">
          <p className="font-semibold">
            {selectedTeamIds.length}/{maxTeams} Teams Selected
          </p>
          <p className="text-sm mt-1">{validationMessage}</p>
        </div>
        {isValid && <Badge className="bg-green-600">Valid</Badge>}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/organizer/dashboard/tournaments/${tournamentId}/setup`
            )
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid || isSubmitting}
          className="gap-2 ml-auto"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Next"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
