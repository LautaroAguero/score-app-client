"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SetupProgressBar } from "@/components/setup/SetupProgressBar";
import { SetupStepCard } from "@/components/setup/SetupStepCard";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Tournament } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SetupStatus {
  step1_tournament_created: boolean;
  step2_teams_added: boolean;
  step2_min_teams: number;
  step2_max_teams: number;
  step3_matches_generated: boolean;
  step4_matches_scheduled: boolean;
}

export default function TournamentSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSetupData();
  }, [tournamentId]);

  const fetchSetupData = async () => {
    try {
      setIsLoading(true);
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

      const [tournamentRes, statusRes] = await Promise.all([
        axios.get(`${API_URL}/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/tournaments/${tournamentId}/setup-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTournament(tournamentRes.data.tournament || tournamentRes.data);
      setSetupStatus(statusRes.data.progress || statusRes.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading setup",
          description:
            error.response?.data?.message ||
            "Failed to load tournament setup data",
          variant: "destructive",
        });
      }
      console.error("Error fetching setup data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStep = (): number => {
    if (!setupStatus) return 1;

    if (!setupStatus.step2_teams_added) return 2;
    if (!setupStatus.step3_matches_generated) return 3;
    if (!setupStatus.step4_matches_scheduled) return 4;

    return 4; // All completed
  };

  const getStepStatus = (
    stepNumber: number
  ): "pending" | "completed" | "locked" | "current" => {
    if (!setupStatus) return "pending";

    const currentStep = getCurrentStep();

    switch (stepNumber) {
      case 1:
        return setupStatus.step1_tournament_created ? "completed" : "pending";
      case 2:
        if (stepNumber === currentStep) return "current";
        return setupStatus.step2_teams_added ? "completed" : "pending";
      case 3:
        if (!setupStatus.step2_teams_added) return "locked";
        if (stepNumber === currentStep) return "current";
        return setupStatus.step3_matches_generated ? "completed" : "pending";
      case 4:
        if (!setupStatus.step3_matches_generated) return "locked";
        if (stepNumber === currentStep) return "current";
        return setupStatus.step4_matches_scheduled ? "completed" : "pending";
      default:
        return "pending";
    }
  };

  const isStepDisabled = (stepNumber: number): boolean => {
    if (!setupStatus) return stepNumber > 1;

    switch (stepNumber) {
      case 1:
        return false;
      case 2:
        return false;
      case 3:
        return !setupStatus.step2_teams_added;
      case 4:
        return !setupStatus.step3_matches_generated;
      default:
        return true;
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (isStepDisabled(stepNumber)) return;

    const routes: { [key: number]: string } = {
      1: `/organizer/dashboard/tournaments/create`,
      2: `/organizer/dashboard/tournaments/${tournamentId}/setup/teams`,
      3: `/organizer/dashboard/tournaments/${tournamentId}/setup/matches`,
      4: `/organizer/dashboard/tournaments/${tournamentId}/setup/schedule`,
    };

    router.push(routes[stepNumber]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tournament || !setupStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-muted-foreground">Failed to load tournament data</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tournament Setup</h1>
          <p className="text-muted-foreground mt-1">{tournament.name}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/organizer/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <SetupProgressBar currentStep={getCurrentStep()} totalSteps={4} />

      {/* Step Cards */}
      <div className="space-y-4">
        <SetupStepCard
          stepNumber={1}
          title="Create Tournament"
          description="Tournament has been created successfully"
          status={getStepStatus(1)}
          onClick={() => handleStepClick(1)}
          disabled={isStepDisabled(1)}
        />

        <SetupStepCard
          stepNumber={2}
          title="Add Teams"
          description={`Add 2-32 teams to your tournament. Currently: ${setupStatus.step2_min_teams} teams`}
          status={getStepStatus(2)}
          onClick={() => handleStepClick(2)}
          disabled={isStepDisabled(2)}
        />

        <SetupStepCard
          stepNumber={3}
          title="Auto-Generate Matches"
          description="Automatically generate matches based on selected format (League, Cup, or Mixed)"
          status={getStepStatus(3)}
          onClick={() => handleStepClick(3)}
          disabled={isStepDisabled(3)}
        />

        <SetupStepCard
          stepNumber={4}
          title="Schedule Matches"
          description="Set dates and times for all generated matches"
          status={getStepStatus(4)}
          onClick={() => handleStepClick(4)}
          disabled={isStepDisabled(4)}
        />
      </div>

      {/* Info Box */}
      {getCurrentStep() === 4 && setupStatus.step4_matches_scheduled && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-700">
          <p className="font-semibold">✓ Setup Complete!</p>
          <p className="text-sm">
            Your tournament is ready to go. You can now view matches and manage
            the tournament.
          </p>
          <Button
            className="mt-4"
            onClick={() =>
              router.push(
                `/organizer/dashboard/tournaments/${tournamentId}/registrations`
              )
            }
          >
            Gestionar Inscripciones
          </Button>
        </div>
      )}
    </div>
  );
}
