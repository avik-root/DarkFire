
"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import zxcvbn from "zxcvbn";

interface PasswordStrengthMeterProps {
  password?: string;
}

const STRENGTH_LEVELS = [
  { label: "Very Weak", color: "bg-[hsl(var(--strength-very-weak))]" },
  { label: "Weak", color: "bg-[hsl(var(--strength-weak))]" },
  { label: "Fair", color: "bg-[hsl(var(--strength-fair))]" },
  { label: "Good", color: "bg-[hsl(var(--strength-good))]" },
  { label: "Strong", color: "bg-[hsl(var(--strength-strong))]" },
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
