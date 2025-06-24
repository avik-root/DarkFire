
"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import zxcvbn from "zxcvbn";

interface PasswordStrengthMeterProps {
  password?: string;
}

const STRENGTH_LEVELS = [
  { label: "Very Weak", color: "bg-red-500", width: "w-1/5" },
  { label: "Weak", color: "bg-orange-500", width: "w-2/5" },
  { label: "Fair", color: "bg-yellow-500", width: "w-3/5" },
  { label: "Good", color: "bg-blue-500", width: "w-4/5" },
  { label: "Strong", color: "bg-green-500", width: "w-full" },
];

export default function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setScore(result.score);
    } else {
      setScore(0);
    }
  }, [password]);

  const strength = STRENGTH_LEVELS[score];

  return (
    <div className="space-y-2">
      <Progress
        value={(score + 1) * 20}
        className="h-2"
        indicatorClassName={strength?.color}
      />
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-semibold">{strength?.label}</span>
      </p>
    </div>
  );
}
