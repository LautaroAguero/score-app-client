"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Users } from "lucide-react";
import Image from "next/image";
import type { Team } from "@/lib/types";

interface AddedTeamsTableProps {
  teams: Team[];
  onRemoveTeam: (teamId: string) => void;
}

export function AddedTeamsTable({ teams, onRemoveTeam }: AddedTeamsTableProps) {
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (teamToDelete) {
      onRemoveTeam(teamToDelete._id);
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  if (teams.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Selected Teams (0/32)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No teams selected yet. Add teams from above to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Selected Teams ({teams.length}/32)</CardTitle>
            <Badge variant="outline">{teams.length} teams</Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">#</TableHead>
                <TableHead className="w-12">Logo</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team._id}>
                  <TableCell className="font-semibold text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted">
                      {team.logo ? (
                        <Image
                          src={`http://localhost:4000${team.logo}`}
                          alt={team.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    {team.groupId ? (
                      <Badge variant="secondary">{team.groupId}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(team)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{teamToDelete?.name}" from this
              tournament? This action can be undone by adding it again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
