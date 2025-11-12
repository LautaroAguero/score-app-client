"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, ChevronRight } from "lucide-react";

type StepStatus = "pending" | "completed" | "locked" | "current";

interface SetupStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  status: StepStatus;
  onClick?: () => void;
  disabled?: boolean;
}

export function SetupStepCard({
  stepNumber,
  title,
  description,
  status,
  onClick,
  disabled = false,
}: SetupStepCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          bgColor: "bg-green-500/10",
          badgeColor: "bg-green-500/20 text-green-700",
          badgeText: "✓ Completed",
          icon: <Check className="h-5 w-5 text-green-600" />,
        };
      case "current":
        return {
          bgColor: "bg-blue-500/10 border-l-4 border-blue-500",
          badgeColor: "bg-blue-500/20 text-blue-700",
          badgeText: "Current",
          icon: <ChevronRight className="h-5 w-5 text-blue-600" />,
        };
      case "locked":
        return {
          bgColor: "bg-red-500/10",
          badgeColor: "bg-red-500/20 text-red-700",
          badgeText: "Locked",
          icon: <Lock className="h-5 w-5 text-red-600" />,
        };
      case "pending":
      default:
        return {
          bgColor: "bg-gray-500/10",
          badgeColor: "bg-gray-500/20 text-gray-700",
          badgeText: "Pending",
          icon: (
            <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
          ),
        };
    }
  };

  const config = getStatusConfig();

  const getDisabledTooltip = () => {
    switch (status) {
      case "locked":
        if (stepNumber === 3) {
          return "Complete Step 2 (Add Teams) first";
        }
        if (stepNumber === 4) {
          return "Complete Step 3 (Auto-Generate Matches) first";
        }
        return "Complete previous steps first";
      default:
        return undefined;
    }
  };

  return (
    <Card
      className={`
        glass transition-all hover:shadow-md
        ${config.bgColor}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Step Number Circle */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-border flex-shrink-0">
              <span className="font-bold text-lg text-foreground">
                {stepNumber}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{title}</h3>
                <Badge className={`text-xs ${config.badgeColor}`}>
                  {config.badgeText}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={onClick}
              disabled={disabled}
              variant={disabled ? "ghost" : "outline"}
              size="sm"
              className={`
                ${disabled ? "cursor-not-allowed opacity-50" : ""}
              `}
              title={getDisabledTooltip()}
            >
              {status === "completed" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  View
                </>
              ) : (
                <>
                  Go <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
