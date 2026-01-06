"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  teamName: string;
  onConfirm: (id: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  registrationId,
  teamName,
  onConfirm,
  isLoading = false,
}: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(registrationId, reason);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rechazar Inscripción</DialogTitle>
          <DialogDescription>
            Estás rechazando la inscripción del equipo{" "}
            <strong>{teamName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Razón (Opcional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué rechazas esta inscripción..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 min-h-[100px]"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              El dueño del equipo verá esta razón
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Rechazando..." : "Rechazar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
