"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Radio } from "lucide-react";

interface FormatSelectorProps {
  selectedFormat: "league" | "cup" | "mixed";
  onFormatChange: (format: "league" | "cup" | "mixed") => void;
  twoLegs: boolean;
  onTwoLegsChange: (value: boolean) => void;
  teamsCount: number;
  matchesCount: number;
}

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  twoLegs,
  onTwoLegsChange,
  teamsCount,
  matchesCount,
}: FormatSelectorProps) {
  // Check if teams count is valid for Cup format (must be power of 2)
  const isPowerOf2 = (n: number) => n > 0 && (n & (n - 1)) === 0;
  const cupIsValid = isPowerOf2(teamsCount);

  // Calculate matches for each format
  const calculateMatches = (format: string, teams: number): number => {
    if (format === "league") {
      const singleRound = (teams * (teams - 1)) / 2;
      return twoLegs ? singleRound * 2 : singleRound;
    } else if (format === "cup") {
      return teams - 1;
    } else if (format === "mixed") {
      // Simplified: 2 groups, each plays round robin, then 4 teams to semis
      const groupMatches = 6; // 4 teams in 2 groups = 3 matches per group
      const knockoutMatches = 3; // Semis (2) + Final (1)
      return groupMatches + knockoutMatches;
    }
    return 0;
  };

  const getLeagueMatches = () => {
    const singleRound = (teamsCount * (teamsCount - 1)) / 2;
    return twoLegs ? singleRound * 2 : singleRound;
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Select Match Format</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* League Format */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="format-league"
                name="format"
                value="league"
                checked={selectedFormat === "league"}
                onChange={() => onFormatChange("league")}
                className="w-4 h-4 cursor-pointer"
              />
              <Label
                htmlFor="format-league"
                className="cursor-pointer font-semibold"
              >
                League (Round Robin)
              </Label>
            </div>
            {selectedFormat === "league" && (
              <div className="ml-6 space-y-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <p className="text-sm text-muted-foreground">
                  Each team plays against every other team once (or twice with
                  two legs)
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="two-legs"
                    checked={twoLegs}
                    onCheckedChange={(checked) =>
                      onTwoLegsChange(checked as boolean)
                    }
                  />
                  <Label htmlFor="two-legs" className="cursor-pointer text-sm">
                    Two legs (double round robin)
                  </Label>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                  <span className="text-sm">
                    {teamsCount} teams →{" "}
                    <span className="font-semibold">
                      {(teamsCount * (teamsCount - 1)) / 2}
                    </span>{" "}
                    matches
                  </span>
                  {twoLegs && (
                    <span className="text-xs text-muted-foreground">
                      (with 2 legs:{" "}
                      {twoLegs
                        ? teamsCount * (teamsCount - 1)
                        : (teamsCount * (teamsCount - 1)) / 2}
                      )
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cup Format */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="format-cup"
                name="format"
                value="cup"
                checked={selectedFormat === "cup"}
                onChange={() => onFormatChange("cup")}
                className="w-4 h-4 cursor-pointer"
              />
              <Label
                htmlFor="format-cup"
                className="cursor-pointer font-semibold"
              >
                Cup (Knockout/Elimination)
              </Label>
            </div>
            {selectedFormat === "cup" && (
              <div className="ml-6 space-y-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <p className="text-sm text-muted-foreground">
                  Elimination tournament - losers are out
                </p>
                {!cupIsValid && (
                  <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Teams must be a power of 2 (2, 4, 8, 16, 32). You have{" "}
                      <span className="font-semibold">{teamsCount}</span> teams.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                  <span className="text-sm">
                    {teamsCount} teams →{" "}
                    <span className="font-semibold">{teamsCount - 1}</span>{" "}
                    matches
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mixed Format */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="format-mixed"
                name="format"
                value="mixed"
                checked={selectedFormat === "mixed"}
                onChange={() => onFormatChange("mixed")}
                className="w-4 h-4 cursor-pointer"
              />
              <Label
                htmlFor="format-mixed"
                className="cursor-pointer font-semibold"
              >
                Mixed (Groups + Knockout)
              </Label>
            </div>
            {selectedFormat === "mixed" && (
              <div className="ml-6 space-y-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <p className="text-sm text-muted-foreground">
                  Group stage followed by knockout rounds
                </p>
                <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                  <span className="text-sm">
                    {teamsCount} teams → ~
                    <span className="font-semibold">
                      {calculateMatches("mixed", teamsCount)}
                    </span>{" "}
                    matches
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Matches Count Badge */}
        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
          <span className="font-semibold">Total Matches to Generate:</span>
          <Badge className="text-lg py-1 px-3">{matchesCount} matches</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
