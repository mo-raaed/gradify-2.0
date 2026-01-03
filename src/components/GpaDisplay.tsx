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
        "rounded-xl text-center transition-all duration-300",
        containerSizes[size],
        variant === "primary" 
          ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20" 
          : "bg-muted/50 border border-border"
      )}
    >
      <p className={cn("text-muted-foreground font-medium", labelSizes[size])}>
        {label}
      </p>
      <p
        className={cn(
          "font-bold tracking-tight font-serif",
          sizeClasses[size],
          variant === "primary" ? "text-primary" : "text-foreground"
        )}
      >
        {gpa.toFixed(2)}
      </p>
    </div>
  );
}

