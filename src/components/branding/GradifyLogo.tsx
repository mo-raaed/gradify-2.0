import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type GradifyLogoSize = "sm" | "md" | "lg";

interface GradifyLogoProps {
  size?: GradifyLogoSize;
  /** Hide the wordmark (e.g. collapsed sidebar) while keeping the mark */
  iconOnly?: boolean;
  className?: string;
  /** Applied to the text column (e.g. `md:max-lg:hidden` for collapsed sidebar) */
  textClassName?: string;
}

const sizeConfig: Record<
  GradifyLogoSize,
  { circle: string; icon: string; title: string; tagline: string }
> = {
  sm: {
    circle: "h-9 w-9",
    icon: "h-4 w-4",
    title: "text-sm font-bold tracking-tight",
    tagline: "text-[8px] font-normal tracking-[0.12em] uppercase leading-tight",
  },
  md: {
    circle: "h-10 w-10",
    icon: "h-5 w-5",
    title: "text-base font-bold tracking-tight",
    tagline: "text-[9px] font-normal tracking-[0.14em] uppercase leading-tight",
  },
  lg: {
    circle: "h-11 w-11",
    icon: "h-6 w-6",
    title: "text-xl font-bold tracking-tight",
    tagline: "text-[10px] font-normal tracking-[0.16em] uppercase leading-tight",
  },
};

/**
 * Brand lockup: circular blue gradient + mortarboard + “Gradify” / “AUIS GPA CALCULATOR”
 * (matches the product reference: vibrant blue wordmark, cool gray tagline).
 */
export function GradifyLogo({
  size = "md",
  iconOnly = false,
  className,
  textClassName,
}: GradifyLogoProps) {
  const s = sizeConfig[size];

  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      <div
        className={cn(
          "rounded-full shrink-0 flex items-center justify-center",
          "bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700",
          "shadow-sm shadow-blue-900/20",
          s.circle
        )}
        aria-hidden
      >
        <GraduationCap
          className={cn(s.icon, "text-[#0a1628] dark:text-[#0c1929]")}
          strokeWidth={2}
        />
      </div>

      {!iconOnly && (
        <div className={cn("flex flex-col min-w-0 justify-center", textClassName)}>
          <span
            className={cn(
              s.title,
              "text-blue-600 dark:text-sky-400"
            )}
          >
            Gradify
          </span>
          <span
            className={cn(
              s.tagline,
              "text-slate-500 dark:text-slate-400"
            )}
          >
            AUIS GPA Calculator
          </span>
        </div>
      )}
    </div>
  );
}
