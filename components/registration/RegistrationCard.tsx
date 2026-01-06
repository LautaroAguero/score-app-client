"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegistrationStatusBadge } from "./RegistrationStatusBadge";
import type { Registration } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RegistrationCardProps {
  registration: Registration;
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
  isLoading?: boolean;
}

export function RegistrationCard({
  registration,
  onCancel,
  onApprove,
  onReject,
  showActions = false,
  isLoading = false,
}: RegistrationCardProps) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{registration.team.name}</CardTitle>
            <CardDescription className="mt-1">
              {registration.tournament.name}
            </CardDescription>
          </div>
          <RegistrationStatusBadge status={registration.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Solicitado</p>
            <p className="text-sm font-medium">
              {format(new Date(registration.appliedAt), "d MMM yyyy", {
                locale: es,
              })}
            </p>
          </div>
          {registration.approvedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Aprobado</p>
              <p className="text-sm font-medium">
                {format(new Date(registration.approvedAt), "d MMM yyyy", {
                  locale: es,
                })}
              </p>
            </div>
          )}
        </div>

        {registration.rejectionReason && (
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-3">
            <p className="text-xs text-red-700 dark:text-red-200">
              <span className="font-semibold">Razón: </span>
              {registration.rejectionReason}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            {registration.status === "pending" && (
              <>
                {onApprove && (
                  <button
                    onClick={() => onApprove(registration._id)}
                    disabled={isLoading}
                    className="flex-1 rounded-md bg-green-600 text-white text-sm font-medium px-3 py-2 hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={() => onReject(registration._id)}
                    disabled={isLoading}
                    className="flex-1 rounded-md bg-red-600 text-white text-sm font-medium px-3 py-2 hover:bg-red-700 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                )}
              </>
            )}
            {registration.status === "approved" && onCancel && (
              <button
                onClick={() => onCancel(registration._id)}
                disabled={isLoading}
                className="w-full rounded-md bg-orange-600 text-white text-sm font-medium px-3 py-2 hover:bg-orange-700 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
