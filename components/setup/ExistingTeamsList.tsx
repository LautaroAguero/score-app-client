"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Team } from "@/lib/types";

interface ExistingTeamsListProps {
  teams: Team[];
  selectedTeamIds: string[];
  onAddTeam: (teamId: string) => void;
  isLoading?: boolean;
}

export function ExistingTeamsList({
  teams,
  selectedTeamIds,
  onAddTeam,
  isLoading = false,
}: ExistingTeamsListProps) {
  const unselectedTeams = teams.filter(
    (team) => !selectedTeamIds.includes(team._id)
  );

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Existing Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Existing Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No existing teams found.</p>
            <p className="text-sm mt-2">
              Create a new team below to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (unselectedTeams.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Existing Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>All your teams have been added to this tournament.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Existing Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {unselectedTeams.map((team) => (
            <div
              key={team._id}
              className="group flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              {/* Team Logo */}
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {team.logo ? (
                  <Image
                    src={`http://localhost:4000${team.logo}`}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Team Name */}
              <h3 className="font-semibold text-center truncate w-full text-sm">
                {team.name}
              </h3>

              {/* Add Button */}
              <Button
                size="sm"
                onClick={() => onAddTeam(team._id)}
                className="w-full gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
