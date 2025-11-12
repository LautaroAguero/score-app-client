"use client";

import { Check } from "lucide-react";

interface SetupProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function SetupProgressBar({
  currentStep,
  totalSteps,
}: SetupProgressBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        return (
          <div
            key={stepNumber}
            className="flex items-center gap-2 md:gap-4 flex-1"
          >
            {/* Step Circle */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center 
                  font-semibold text-sm transition-all
                  ${
                    isCompleted
                      ? "bg-green-500/20 border-2 border-green-500 text-green-700"
                      : isCurrent
                      ? "bg-blue-500/20 border-2 border-blue-500 text-blue-700"
                      : isPending
                      ? "bg-gray-500/10 border-2 border-gray-300 text-gray-500"
                      : ""
                  }
                `}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span
                className={`
                  text-xs font-medium hidden md:block
                  ${
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                      ? "text-blue-700"
                      : "text-gray-500"
                  }
                `}
              >
                Step {stepNumber}
              </span>
            </div>

            {/* Connecting Line */}
            {stepNumber < totalSteps && (
              <div
                className={`
                  h-1 flex-1 rounded-full transition-all
                  ${isCompleted ? "bg-green-500" : "bg-gray-300"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
