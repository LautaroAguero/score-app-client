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
import { ArrowLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import type { Team, Tournament } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MIN_TEAMS = 2;
const MAX_TEAMS = 32;

export default function AddTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

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

      const [tournamentRes, teamsRes] = await Promise.all([
        axios.get(`${API_URL}/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tourney = tournamentRes.data.tournament || tournamentRes.data;
      setTournament(tourney);

      const teams = teamsRes.data.teams || teamsRes.data;
      setExistingTeams(teams);

      // Initialize selected teams from tournament
      if (tourney.teams && Array.isArray(tourney.teams)) {
        const selectedIds = tourney.teams.map((t: any) =>
          typeof t === "string" ? t : t._id
        );
        setSelectedTeamIds(selectedIds);

        // Filter selected teams from existing teams
        const selected = teams.filter((t: Team) => selectedIds.includes(t._id));
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
    if (!selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds([...selectedTeamIds, teamId]);

      const team = existingTeams.find((t) => t._id === teamId);
      if (team) {
        setSelectedTeams([...selectedTeams, team]);
      }
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
    if (selectedTeamIds.length < MIN_TEAMS) {
      toast({
        title: "Not enough teams",
        description: `Please add at least ${MIN_TEAMS} teams`,
        variant: "destructive",
      });
      return;
    }

    if (selectedTeamIds.length > MAX_TEAMS) {
      toast({
        title: "Too many teams",
        description: `You can add maximum ${MAX_TEAMS} teams`,
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

  const isValid =
    selectedTeamIds.length >= MIN_TEAMS && selectedTeamIds.length <= MAX_TEAMS;
  const validationMessage =
    selectedTeamIds.length < MIN_TEAMS
      ? `Add at least ${MIN_TEAMS - selectedTeamIds.length} more team${
          MIN_TEAMS - selectedTeamIds.length !== 1 ? "s" : ""
        }`
      : selectedTeamIds.length > MAX_TEAMS
      ? `Remove ${selectedTeamIds.length - MAX_TEAMS} team${
          selectedTeamIds.length - MAX_TEAMS !== 1 ? "s" : ""
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

      {/* Existing Teams List */}
      <ExistingTeamsList
        teams={existingTeams}
        selectedTeamIds={selectedTeamIds}
        onAddTeam={handleAddTeam}
        isLoading={isLoadingTeams}
      />

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
            {selectedTeamIds.length}/32 Teams Selected
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
