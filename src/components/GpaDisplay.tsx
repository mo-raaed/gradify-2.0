import { cn } from "@/lib/utils";

interface GpaDisplayProps {
  gpa: number;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

export function GpaDisplay({
  gpa,
  label,
  size = "md",
  variant = "primary"
}: GpaDisplayProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const containerSizes = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={cn(
        "rounded-[2rem] text-center transition-all duration-300",
        containerSizes[size],
        variant === "primary"
          ? "bg-gradient-to-br from-primary/20 to-[var(--color-primary-container)]/20"
          : "bg-secondary"
      )}
    >
      <p className={cn("text-muted-foreground font-medium", labelSizes[size])}>
        {label}
      </p>
      <p
        className={cn(
          "font-bold tracking-tight inline-block transition-all duration-300 hover:scale-[1.15] hover:text-primary hover:[text-shadow:0_0_20px_rgba(5,99,128,0.5)] dark:hover:text-white dark:hover:[text-shadow:0_0_25px_rgba(255,255,255,0.8)] cursor-default origin-center",
          sizeClasses[size],
          variant === "primary" ? "text-primary" : "text-foreground"
        )}
      >
        {gpa.toFixed(2)}
      </p>
    </div>
  );
}
