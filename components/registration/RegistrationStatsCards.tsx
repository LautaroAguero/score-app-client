"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface RegistrationStatsCardsProps {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  maxTeams?: number;
}

export function RegistrationStatsCards({
  total,
  approved,
  pending,
  rejected,
  maxTeams,
}: RegistrationStatsCardsProps) {
  const stats = [
    {
      label: "Total",
      value: total,
      icon: Users,
      color: "bg-blue-500/20",
      textColor: "text-blue-700 dark:text-blue-400",
      subtitle: maxTeams ? `de ${maxTeams} cupos` : undefined,
    },
    {
      label: "Aprobadas",
      value: approved,
      icon: CheckCircle,
      color: "bg-green-500/20",
      textColor: "text-green-700 dark:text-green-400",
    },
    {
      label: "Pendientes",
      value: pending,
      icon: Clock,
      color: "bg-yellow-500/20",
      textColor: "text-yellow-700 dark:text-yellow-400",
    },
    {
      label: "Rechazadas",
      value: rejected,
      icon: XCircle,
      color: "bg-red-500/20",
      textColor: "text-red-700 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="glass">
            <CardContent className="pt-6">
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
              >
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
