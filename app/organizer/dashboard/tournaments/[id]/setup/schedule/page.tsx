"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SetupProgressBar } from "@/components/setup/SetupProgressBar";
import { JornadaScheduler } from "@/components/setup/JornadaScheduler";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Match, Tournament } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ScheduleState {
  [jornadaNumber: number]: {
    date: string | null;
    time: string | null;
  };
}

export default function ScheduleMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedule, setSchedule] = useState<ScheduleState>({});

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
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

      const [tournamentRes, matchesRes] = await Promise.all([
        axios.get(`${API_URL}/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/matches?tournament=${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tourney = tournamentRes.data.tournament || tournamentRes.data;
      setTournament(tourney);

      const matchesList = matchesRes.data.matches || matchesRes.data;
      setMatches(matchesList);

      // Initialize schedule from existing matches
      const initialSchedule: ScheduleState = {};
      matchesList.forEach((match: Match) => {
        const jornada = (match as any).jornada || 1;
        if (!initialSchedule[jornada]) {
          initialSchedule[jornada] = { date: null, time: null };
        }
        // If match already has date/time, use it
        if (match.matchDate && match.matchTime) {
          initialSchedule[jornada] = {
            date: match.matchDate.split("T")[0],
            time: match.matchTime,
          };
        }
      });
      setSchedule(initialSchedule);
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
      setIsLoadingData(false);
    }
  };

  // Group matches by jornada
  const groupedByJornada = matches.reduce((acc, match) => {
    const jornada = (match as any).jornada || 1;
    if (!acc[jornada]) {
      acc[jornada] = [];
    }
    acc[jornada].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const jornadas = Object.keys(groupedByJornada)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate stats
  const totalMatches = matches.length;
  const scheduledMatches = jornadas.reduce((acc, jornada) => {
    if (schedule[jornada]?.date && schedule[jornada]?.time) {
      return acc + groupedByJornada[jornada].length;
    }
    return acc;
  }, 0);
  const pendingMatches = totalMatches - scheduledMatches;

  const handleDateChange = (jornada: number, date: string) => {
    setSchedule((prev) => ({
      ...prev,
      [jornada]: {
        ...prev[jornada],
        date,
      },
    }));
  };

  const handleTimeChange = (jornada: number, time: string) => {
    setSchedule((prev) => ({
      ...prev,
      [jornada]: {
        ...prev[jornada],
        time,
      },
    }));
  };

  const handleClear = (jornada: number) => {
    setSchedule((prev) => ({
      ...prev,
      [jornada]: {
        date: null,
        time: null,
      },
    }));
  };

  const handleSaveSchedule = async () => {
    // No validation - allow passing without dates
    // Dates can be assigned later

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare updates - only include matches with dates/times
      const updates = matches
        .map((match) => {
          const jornada = (match as any).jornada || 1;
          const { date, time } = schedule[jornada];

          // Only include if both date and time are set
          if (date && time) {
            return {
              matchId: match._id,
              matchDate: date,
              matchTime: time,
            };
          }
          return null;
        })
        .filter((update) => update !== null);

      // Call PATCH bulk-schedule only if there are updates
      if (updates.length > 0) {
        await axios.patch(
          `${API_URL}/matches/bulk-schedule`,
          { updates },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      toast({
        title: "Success",
        description:
          updates.length > 0
            ? "Matches scheduled successfully! Remaining matches can be scheduled later."
            : "Setup complete! You can schedule matches later from the tournament page.",
      });

      // Update tournament status to "inprogress"
      try {
        await axios.put(
          `${API_URL}/tournaments/${tournamentId}`,
          { status: "inprogress" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Error updating tournament status:", err);
        // Continue even if status update fails
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/organizer/dashboard");
      }, 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error scheduling matches",
          description:
            error.response?.data?.message || "Failed to schedule matches",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
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

  if (matches.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Schedule Matches</h1>
            <p className="text-muted-foreground mt-1">
              Step 4 of 4 - {tournament?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                `/organizer/dashboard/tournaments/${tournamentId}/setup/matches`
              )
            }
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <SetupProgressBar currentStep={4} totalSteps={4} />

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700">
              No matches to schedule
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Generate matches first before scheduling them.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/organizer/dashboard/tournaments/${tournamentId}/setup/matches`
                )
              }
              className="mt-3"
            >
              Go back to generate matches
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allScheduled = scheduledMatches === totalMatches;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schedule Matches</h1>
          <p className="text-muted-foreground mt-1">
            Step 4 of 4 - {tournament?.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(
              `/organizer/dashboard/tournaments/${tournamentId}/setup/matches`
            )
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <SetupProgressBar currentStep={4} totalSteps={4} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Matches</p>
          <p className="text-2xl font-bold mt-1">{totalMatches}</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-700">Scheduled</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {scheduledMatches}
          </p>
        </div>
        <div
          className={`rounded-lg border p-4 ${
            pendingMatches === 0
              ? "border-green-500/30 bg-green-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <p
            className={`text-sm ${
              pendingMatches === 0 ? "text-green-700" : "text-amber-700"
            }`}
          >
            Pending
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              pendingMatches === 0 ? "text-green-700" : "text-amber-700"
            }`}
          >
            {pendingMatches}
          </p>
        </div>
      </div>

      {/* Jornada Schedulers */}
      <div className="space-y-4">
        {jornadas.map((jornada) => (
          <JornadaScheduler
            key={jornada}
            jornadaNumber={jornada}
            matches={groupedByJornada[jornada]}
            date={schedule[jornada]?.date || null}
            time={schedule[jornada]?.time || null}
            onDateChange={(date) => handleDateChange(jornada, date)}
            onTimeChange={(time) => handleTimeChange(jornada, time)}
            onClear={() => handleClear(jornada)}
          />
        ))}
      </div>

      {/* Status */}
      <div
        className={`rounded-lg border p-4 flex items-start gap-3 ${
          pendingMatches === 0
            ? "bg-green-500/10 border-green-500/30"
            : "bg-blue-500/10 border-blue-500/30"
        }`}
      >
        {pendingMatches === 0 ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-700">
                ✓ All matches scheduled
              </p>
              <p className="text-sm text-green-700 mt-1">
                {totalMatches} matches are ready. You can now save and complete
                the setup.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-700">
                {pendingMatches} matches without schedule
              </p>
              <p className="text-sm text-blue-700 mt-1">
                You can set dates and times now or schedule them later from the
                tournament page.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/organizer/dashboard/tournaments/${tournamentId}/setup/matches`
            )
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSaveSchedule}
          disabled={isSubmitting}
          className="gap-2 ml-auto"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save & Complete Setup"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
