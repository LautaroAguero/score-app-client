"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Calendar } from "lucide-react";
import type { Match } from "@/lib/types";

interface JornadaSchedulerProps {
  jornadaNumber: number;
  matches: Match[];
  date: string | null;
  time: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onClear: () => void;
}

export function JornadaScheduler({
  jornadaNumber,
  matches,
  date,
  time,
  onDateChange,
  onTimeChange,
  onClear,
}: JornadaSchedulerProps) {
  const isScheduled = date && time;
  const today = new Date().toISOString().split("T")[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate >= today) {
      onDateChange(selectedDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = e.target.value;
    if (selectedTime && /^\d{2}:\d{2}$/.test(selectedTime)) {
      onTimeChange(selectedTime);
    }
  };

  return (
    <Card
      className={`glass transition-all ${
        isScheduled ? "border-green-500/30" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Jornada {jornadaNumber}</CardTitle>
            <Badge variant={isScheduled ? "default" : "outline"}>
              {isScheduled ? "✓ Scheduled" : "○ Pending"}
            </Badge>
            <Badge variant="secondary">{matches.length} matches</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label
              htmlFor={`date-${jornadaNumber}`}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id={`date-${jornadaNumber}`}
              type="date"
              value={date || ""}
              onChange={handleDateChange}
              min={today}
              className="cursor-pointer"
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label
              htmlFor={`time-${jornadaNumber}`}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Time
            </Label>
            <Input
              id={`time-${jornadaNumber}`}
              type="time"
              value={time || ""}
              onChange={handleTimeChange}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">
            Matches:
          </p>
          <div className="space-y-2 pl-2 border-l-2 border-border">
            {matches.map((match, idx) => (
              <div
                key={match._id || idx}
                className="text-sm p-2 rounded bg-background hover:bg-accent/50 transition-colors"
              >
                <p className="font-medium">
                  {match.homeTeam.name}
                  <span className="text-muted-foreground mx-2">vs</span>
                  {match.awayTeam.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Clear Button */}
        {isScheduled && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Schedule
          </Button>
        )}

        {/* Validation Messages */}
        {date && !isScheduled && (
          <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded p-2">
            Please select both date and time
          </p>
        )}
      </CardContent>
    </Card>
  );
}
