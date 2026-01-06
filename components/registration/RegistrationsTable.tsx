"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RegistrationStatusBadge } from "./RegistrationStatusBadge";
import type { Registration } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface RegistrationsTableProps {
  registrations: Registration[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export function RegistrationsTable({
  registrations,
  onApprove,
  onReject,
  isLoading = false,
  showActions = false,
}: RegistrationsTableProps) {
  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No hay inscripciones para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Equipo</TableHead>
            <TableHead>Solicitado por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            {showActions && (
              <TableHead className="text-right">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration._id}>
              <TableCell>
                <div>
                  <p className="font-medium">{registration.team.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">
                    {registration.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {registration.user.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(registration.appliedAt), "d MMM yyyy", {
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                <RegistrationStatusBadge status={registration.status} />
              </TableCell>
              {showActions && registration.status === "pending" && (
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onApprove?.(registration._id)}
                      disabled={isLoading}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onReject?.(registration._id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
