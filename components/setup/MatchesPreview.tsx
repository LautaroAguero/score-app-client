"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown } from "lucide-react";

interface Match {
  homeTeam: {
    _id: string;
    name: string;
  };
  awayTeam: {
    _id: string;
    name: string;
  };
  jornada?: number;
}

interface MatchesPreviewProps {
  matches: Match[];
  isLoading?: boolean;
}

export function MatchesPreview({
  matches,
  isLoading = false,
}: MatchesPreviewProps) {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Matches Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Calculating matches...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Matches Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
            <p>No matches to preview. Select a format and teams above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group matches by jornada
  const groupedByJornada = matches.reduce((acc, match) => {
    const jornada = match.jornada || 1;
    if (!acc[jornada]) {
      acc[jornada] = [];
    }
    acc[jornada].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const jornadas = Object.keys(groupedByJornada)
    .map(Number)
    .sort((a, b) => a - b);

  // Show only first 5 jornadas by default
  const displayedJornadas = showAll ? jornadas : jornadas.slice(0, 5);
  const hasMore = jornadas.length > 5;

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Matches Preview</CardTitle>
          <Badge variant="outline">{matches.length} matches</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Jornadas */}
        {displayedJornadas.map((jornada) => (
          <div key={jornada} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Jornada {jornada}</h3>
              <Badge variant="secondary" className="text-xs">
                {groupedByJornada[jornada].length} matches
              </Badge>
            </div>
            <div className="space-y-2 ml-2">
              {groupedByJornada[jornada].map((match, idx) => (
                <div
                  key={`${jornada}-${idx}`}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between flex-1 gap-3">
                    {/* Home Team */}
                    <div className="flex-1 text-right">
                      <span className="font-medium text-sm">
                        {match.homeTeam.name}
                      </span>
                    </div>

                    {/* VS Badge */}
                    <Badge variant="outline" className="mx-2 font-semibold">
                      vs
                    </Badge>

                    {/* Away Team */}
                    <div className="flex-1">
                      <span className="font-medium text-sm">
                        {match.awayTeam.name}
                      </span>
                    </div>
                  </div>

                  {/* Match Number */}
                  <span className="text-xs text-muted-foreground ml-2">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Show More Button */}
        {hasMore && !showAll && (
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="w-full gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Show {jornadas.length - 5} more jornadas
          </Button>
        )}

        {/* Show Less Button */}
        {showAll && (
          <Button
            variant="outline"
            onClick={() => setShowAll(false)}
            className="w-full gap-2"
          >
            Show less
          </Button>
        )}

        {/* Summary */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">
            Total: {jornadas.length} jornadas, {matches.length} matches
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
