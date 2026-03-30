import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const NUM_PARTICLES = 12;
const INTERACT_RADIUS = 250; 
const SPRING_COEF = 0.02;
const MOUSE_PULL = 0.05;
const FRICTION = 0.85;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  anchorX: number;
  anchorY: number;
  opacity: number;
  size: number;
  ref: HTMLDivElement | null;
}

export function FluidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initParticles = () => {
      let w = window.innerWidth;
      let h = window.innerHeight;
      
      const newParticles: Particle[] = [];
      const cols = 4;
      const rows = Math.ceil(NUM_PARTICLES / cols);
      
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        // Distribute evenly across the grid
        const cellW = w / cols;
        const cellH = h / rows;
        const xBase = cellW * col + cellW / 2;
        const yBase = cellH * row + cellH / 2;
        
        // Add random scatter so it feels natural, not rigid
        const anchorX = xBase + (Math.random() - 0.5) * (cellW * 0.6);
        const anchorY = yBase + (Math.random() - 0.5) * (cellH * 0.6);
        
        // Re-use existing ref if resizing
        const existingNode = particlesRef.current[i]?.ref || null;
        
        newParticles.push({
          id: i,
          x: anchorX,
          y: anchorY,
          vx: 0,
          vy: 0,
          anchorX,
          anchorY,
          opacity: 0, // Starts invisible
          size: 40 + Math.random() * 20, // 40px to 60px
          ref: existingNode
        });
      }
      particlesRef.current = newParticles;
      if (!isInitialized) setIsInitialized(true);
    };

    initParticles();

    // Resize handler
    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initParticles, 100);
    };
    window.addEventListener("resize", onResize);

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    // Physics Loop
    let animationId: number;
    const step = () => {
      const mouse = mouseRef.current;
      
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = particlesRef.current[i];
        if (!p) continue;

        // Calculate distance from mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let targetOpacity = 0;
        
        if (dist < INTERACT_RADIUS) {
          // Attract towards mouse but keep some organic drift instead of exact center
          targetOpacity = Math.max(0, 1 - (dist / INTERACT_RADIUS));
          // Provide slight random offset based on ID so they don't all stack exactly
          const hoverTargetX = mouse.x + (Math.sin(p.id) * 30);
          const hoverTargetY = mouse.y + (Math.cos(p.id) * 30);
          
          p.vx += (hoverTargetX - p.x) * MOUSE_PULL;
          p.vy += (hoverTargetY - p.y) * MOUSE_PULL;
        } else {
          // Drift back to permanent anchor point slowly
          p.vx += (p.anchorX - p.x) * SPRING_COEF;
          p.vy += (p.anchorY - p.y) * SPRING_COEF;
        }
        
        // Physics update
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        
        // Smoothly fade opacity in and out
        p.opacity += (targetOpacity - p.opacity) * 0.1;
        
        // Write instantly to DOM without causing React state re-renders
        if (p.ref) {
          const transX = p.x - p.size / 2;
          const transY = p.y - p.size / 2;
          p.ref.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;
          p.ref.style.opacity = p.opacity.toFixed(3);
        }
      }
      
      animationId = requestAnimationFrame(step);
    };
    
    // Start loop
    animationId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationId);
    };
  }, [isInitialized]);

  if (!isInitialized) return null;

  return (
    <>
      <svg className="fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="gooey-morph">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 35 -15"
              result="goo"
            />
            {/* Standard metaball composition */}
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      <div 
        ref={containerRef}
        className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden" 
        style={{ filter: "url(#gooey-morph)" }}
      >
        {particlesRef.current.map((p) => (
          <div
            key={p.id}
            ref={(el) => {
              p.ref = el;
            }}
            className={cn(
               "absolute top-0 left-0 rounded-full will-change-transform",
               // The unified color matching the aura midnight theme reference (Electric Cerulean / Primary)
               "bg-[#007FFF] dark:bg-[#81aeff]"
            )}
            style={{ 
              width: `${p.size}px`, 
              height: `${p.size}px`,
              opacity: 0 // Physics loop overrides this immediately
            }}
          />
        ))}
      </div>
    </>
  );
}
