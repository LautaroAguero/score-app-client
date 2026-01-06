"use client";

import { Badge } from "@/components/ui/badge";
import type { RegistrationStatus } from "@/lib/types";

interface RegistrationStatusBadgeProps {
  status: RegistrationStatus;
}

export function RegistrationStatusBadge({
  status,
}: RegistrationStatusBadgeProps) {
  const getStatusConfig = (status: RegistrationStatus) => {
    switch (status) {
      case "approved":
        return {
          label: "Aprobado",
          variant: "default" as const,
          bgColor: "bg-green-500/20",
          textColor: "text-green-700 dark:text-green-400",
        };
      case "pending":
        return {
          label: "Pendiente",
          variant: "secondary" as const,
          bgColor: "bg-yellow-500/20",
          textColor: "text-yellow-700 dark:text-yellow-400",
        };
      case "rejected":
        return {
          label: "Rechazado",
          variant: "destructive" as const,
          bgColor: "bg-red-500/20",
          textColor: "text-red-700 dark:text-red-400",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          bgColor: "bg-gray-500/20",
          textColor: "text-gray-700 dark:text-gray-400",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </Badge>
  );
}
