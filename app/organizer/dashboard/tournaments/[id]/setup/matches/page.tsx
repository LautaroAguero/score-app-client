"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SetupProgressBar } from "@/components/setup/SetupProgressBar";
import { FormatSelector } from "@/components/setup/FormatSelector";
import { MatchesPreview } from "@/components/setup/MatchesPreview";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import type { Tournament, Team } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PreviewMatch {
  homeTeam: {
    _id: string;
    name: string;
  };
  awayTeam: {
    _id: string;
    name: string;
  };
  jornada: number;
}

export default function AutoGenerateMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<
    "league" | "cup" | "mixed"
  >("league");
  const [twoLegs, setTwoLegs] = useState(false);
  const [previewMatches, setPreviewMatches] = useState<PreviewMatch[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  useEffect(() => {
    if (teams.length > 0) {
      generatePreview();
    }
  }, [selectedFormat, twoLegs, teams]);

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

      const [tournamentRes, teamsRes] = await Promise.all([
        axios.get(`${API_URL}/tournaments/${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/teams?tournament=${tournamentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tourney = tournamentRes.data.tournament || tournamentRes.data;
      setTournament(tourney);

      const teamsList = teamsRes.data.teams || teamsRes.data;
      setTeams(teamsList);
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

  const generatePreview = async () => {
    try {
      setIsLoadingPreview(true);
      const token = localStorage.getItem("token");

      // Calculate preview without actual generation
      const matches = calculateMatches();
      setPreviewMatches(matches);
      setMatchesCount(matches.length);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const calculateMatches = (): PreviewMatch[] => {
    const matches: PreviewMatch[] = [];

    if (selectedFormat === "league") {
      // Correct Round Robin algorithm
      const teamList = [...teams];
      const n = teamList.length;

      // Generate all possible matchups (each pair plays once)
      const allMatchups: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          allMatchups.push([i, j]);
        }
      }

      // Distribute matchups into jornadas ensuring no team plays twice in same jornada
      let jornada = 1;
      const usedTeamsInJornada = new Set<number>();
      let matchesInCurrentJornada = 0;

      for (const [i, j] of allMatchups) {
        // If either team already played in this jornada, move to next jornada
        if (usedTeamsInJornada.has(i) || usedTeamsInJornada.has(j)) {
          // Start new jornada
          jornada++;
          usedTeamsInJornada.clear();
          matchesInCurrentJornada = 0;
        }

        // Add the match
        matches.push({
          homeTeam: {
            _id: teamList[i]._id,
            name: teamList[i].name,
          },
          awayTeam: {
            _id: teamList[j]._id,
            name: teamList[j].name,
          },
          jornada,
        });

        // Mark teams as used in this jornada
        usedTeamsInJornada.add(i);
        usedTeamsInJornada.add(j);
        matchesInCurrentJornada++;
      }

      // Second round if two legs (reverse matchups)
      if (twoLegs) {
        const firstRoundLength = matches.length;
        jornada++;
        const usedTeamsRound2 = new Set<number>();

        for (let i = 0; i < firstRoundLength; i++) {
          const match = matches[i];

          // Find the teams indices
          const teamAIndex = teamList.findIndex(
            (t) => t._id === match.homeTeam._id
          );
          const teamBIndex = teamList.findIndex(
            (t) => t._id === match.awayTeam._id
          );

          // If either team already played in this jornada, move to next
          if (
            usedTeamsRound2.has(teamAIndex) ||
            usedTeamsRound2.has(teamBIndex)
          ) {
            jornada++;
            usedTeamsRound2.clear();
          }

          // Add reverse match
          matches.push({
            homeTeam: match.awayTeam,
            awayTeam: match.homeTeam,
            jornada,
          });

          usedTeamsRound2.add(teamAIndex);
          usedTeamsRound2.add(teamBIndex);
        }
      }
    } else if (selectedFormat === "cup") {
      // Knockout elimination
      if (teams.length < 2) {
        return [];
      }

      const isPowerOf2 = (n: number) => n > 0 && (n & (n - 1)) === 0;
      if (!isPowerOf2(teams.length)) {
        toast({
          title: "Invalid teams count",
          description: "Cup format requires power of 2 teams (2, 4, 8, 16, 32)",
          variant: "destructive",
        });
        return [];
      }

      let roundTeams = [...teams];
      let jornada = 1;

      while (roundTeams.length > 1) {
        for (let i = 0; i < roundTeams.length; i += 2) {
          matches.push({
            homeTeam: {
              _id: roundTeams[i]._id,
              name: roundTeams[i].name,
            },
            awayTeam: {
              _id: roundTeams[i + 1]._id,
              name: roundTeams[i + 1].name,
            },
            jornada,
          });
        }
        roundTeams = roundTeams.slice(0, roundTeams.length / 2);
        jornada++;
      }
    } else if (selectedFormat === "mixed") {
      // Groups + Knockout
      if (teams.length < 4) {
        toast({
          title: "Invalid teams count",
          description: "Mixed format requires at least 4 teams",
          variant: "destructive",
        });
        return [];
      }

      // Divide into 2 groups
      const groupSize = Math.ceil(teams.length / 2);
      const groupA = teams.slice(0, groupSize);
      const groupB = teams.slice(groupSize);

      let jornada = 1;

      // Group stage
      // Group A
      for (let i = 0; i < groupA.length; i++) {
        for (let j = i + 1; j < groupA.length; j++) {
          matches.push({
            homeTeam: {
              _id: groupA[i]._id,
              name: groupA[i].name,
            },
            awayTeam: {
              _id: groupA[j]._id,
              name: groupA[j].name,
            },
            jornada,
          });
        }
      }
      jornada++;

      // Group B
      for (let i = 0; i < groupB.length; i++) {
        for (let j = i + 1; j < groupB.length; j++) {
          matches.push({
            homeTeam: {
              _id: groupB[i]._id,
              name: groupB[i].name,
            },
            awayTeam: {
              _id: groupB[j]._id,
              name: groupB[j].name,
            },
            jornada,
          });
        }
      }
      jornada++;

      // Knockout phase (simplified: top 2 from each group to semis)
      const groupATeam1 = groupA[1] || groupA[0];
      const groupBTeam1 = groupB[1] || groupB[0];

      matches.push({
        homeTeam: {
          _id: groupA[0]._id,
          name: groupA[0].name,
        },
        awayTeam: {
          _id: groupB[0]._id,
          name: groupB[0].name,
        },
        jornada,
      });
      matches.push({
        homeTeam: {
          _id: groupATeam1._id,
          name: groupATeam1.name,
        },
        awayTeam: {
          _id: groupBTeam1._id,
          name: groupBTeam1.name,
        },
        jornada,
      });
    }

    return matches;
  };

  const handleGenerateMatches = async () => {
    if (teams.length < 2) {
      toast({
        title: "Not enough teams",
        description: "Add at least 2 teams before generating matches",
        variant: "destructive",
      });
      return;
    }

    const isPowerOf2 = (n: number) => n > 0 && (n & (n - 1)) === 0;
    if (selectedFormat === "cup" && !isPowerOf2(teams.length)) {
      toast({
        title: "Invalid team count for Cup format",
        description: "Cup format requires power of 2 teams (2, 4, 8, 16, 32)",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/tournaments/${tournamentId}/auto-generate-matches`,
        {
          format: selectedFormat,
          twoLegs: selectedFormat === "league" ? twoLegs : false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: `${matchesCount} matches generated successfully!`,
      });

      // Navigate to next step
      router.push(
        `/organizer/dashboard/tournaments/${tournamentId}/setup/schedule`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error generating matches",
          description:
            error.response?.data?.message || "Failed to generate matches",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
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

  if (teams.length < 2) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Auto-Generate Matches</h1>
            <p className="text-muted-foreground mt-1">
              Step 3 of 4 - {tournament?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                `/organizer/dashboard/tournaments/${tournamentId}/setup/teams`
              )
            }
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <SetupProgressBar currentStep={3} totalSteps={4} />

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700">Not enough teams</p>
            <p className="text-sm text-amber-700 mt-1">
              You need to add at least 2 teams before generating matches.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/organizer/dashboard/tournaments/${tournamentId}/setup/teams`
                )
              }
              className="mt-3"
            >
              Go back to add teams
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Auto-Generate Matches</h1>
          <p className="text-muted-foreground mt-1">
            Step 3 of 4 - {tournament?.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(
              `/organizer/dashboard/tournaments/${tournamentId}/setup/teams`
            )
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <SetupProgressBar currentStep={3} totalSteps={4} />

      {/* Teams Info */}
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex items-center gap-3">
        <Users className="h-5 w-5 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-700">
            {teams.length} teams selected
          </p>
          <p className="text-sm text-blue-700">
            Teams will be matched according to selected format
          </p>
        </div>
      </div>

      {/* Format Selector */}
      <FormatSelector
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        twoLegs={twoLegs}
        onTwoLegsChange={setTwoLegs}
        teamsCount={teams.length}
        matchesCount={matchesCount}
      />

      {/* Matches Preview */}
      <MatchesPreview matches={previewMatches} isLoading={isLoadingPreview} />

      {/* Validation Status */}
      <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-green-700">Ready to generate</p>
          <p className="text-sm text-green-700 mt-1">
            {matchesCount} matches will be created for this tournament
          </p>
        </div>
        <Badge className="bg-green-600">Valid</Badge>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/organizer/dashboard/tournaments/${tournamentId}/setup/teams`
            )
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleGenerateMatches}
          disabled={isGenerating || teams.length < 2}
          className="gap-2 ml-auto"
        >
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
          {isGenerating ? "Generating..." : "Generate Matches"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
