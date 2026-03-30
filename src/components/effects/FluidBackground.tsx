import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function FluidBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start strictly in the center
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      if (!isVisible && glowRef.current) {
        glowRef.current.style.opacity = "1";
        isVisible = true;
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    let animationId: number;
    const loop = () => {
      // Smooth lerp (floating follow effect)
      current.x += (mouse.x - current.x) * 0.1;
      current.y += (mouse.y - current.y) * 0.1;

      if (glowRef.current) {
        // Offset by half of the width/height (800 / 2 = 400) to keep the mouse exactly in the center
        glowRef.current.style.transform = `translate3d(${current.x - 400}px, ${current.y - 400}px, 0)`;
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-transparent">
      <div
        ref={glowRef}
        className={cn(
          "absolute top-0 left-0",
          "w-[800px] h-[800px] rounded-full",
          // Adapt to Aurora themes: smooth sky blue in light, rich electric cyan / blue in dark
          // Adjust Opacity so it acts purely as ambient light, not obstructing text
          "bg-[#4993FA]/10 dark:bg-[#4993FA]/20",
          "blur-[150px]", 
          "will-change-transform transition-opacity duration-1000 opacity-0"
        )}
      />
    </div>
  );
}
