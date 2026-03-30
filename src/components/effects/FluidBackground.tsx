import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Configuration from technical guide
const SPACING = 30;
const REVEAL_RADIUS = 180;
const MAX_DISPLACEMENT = 10;
const CIRCLE_SIZE = 22; // Ensures they overlap when displaced to trigger the gooey filter

interface GridPoint {
  x: number;
  y: number;
  ref: HTMLDivElement | null;
}

export function FluidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridPoint[][]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ cols: 0, rows: 0 });

  // Handle Resize & Grid Generation
  useEffect(() => {
    if (typeof window === "undefined") return;

    let resizeTimer: NodeJS.Timeout;
    const calculateGrid = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.ceil(w / SPACING) + 1; // Add padding to avoid edge clipping
      const rows = Math.ceil(h / SPACING) + 1;

      const newGrid: GridPoint[][] = [];
      for (let r = 0; r < rows; r++) {
        const rowArr: GridPoint[] = [];
        for (let c = 0; c < cols; c++) {
          rowArr.push({
            x: c * SPACING,
            y: r * SPACING,
            ref: null, // Will be attached later
          });
        }
        newGrid.push(rowArr);
      }

      gridRef.current = newGrid;
      setDimensions({ cols, rows });
    };

    calculateGrid();

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateGrid, 150);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Handle Mouse physics & Render Loop
  useEffect(() => {
    if (dimensions.cols === 0) return;

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

    let animationId: number;

    const step = () => {
      const mouse = mouseRef.current;
      const { cols, rows } = dimensions;
      const grid = gridRef.current;

      // Extremely efficient CULLING: Only loop through the grid points that are physically close to the mouse.
      // 1. Convert mouse coordinate to grid coordinate
      const centerCol = Math.round(mouse.x / SPACING);
      const centerRow = Math.round(mouse.y / SPACING);

      // 2. Determine bounds (radius / spacing + buffer)
      const range = Math.ceil(REVEAL_RADIUS / SPACING) + 1;



      // First, quickly reset everything that might have been interacting in the previous frames
      // To strictly follow physics constraint "must return to original center immediately", we
      // only operate on elements in the bounding box and clear out elements at the edges of the box.
      // Note: A smarter approach is looping the previous active box and resetting, but the bounding box is small enough.
      
      // We will loop the bounding box. If something is outside INTERACT_RADIUS, reset it.
      // Elements fully outside the bounding box are already reset (or were reset as the box shifted).


      // Note: to guarantee no stuck elements, we could keep a list of active elements.
      // But clearing a slightly larger bounding box is exceptionally fast.
      const clearMinCol = Math.max(0, centerCol - range - 1);
      const clearMaxCol = Math.min(cols - 1, centerCol + range + 1);
      const clearMinRow = Math.max(0, centerRow - range - 1);
      const clearMaxRow = Math.min(rows - 1, centerRow + range + 1);

      for (let r = clearMinRow; r <= clearMaxRow; r++) {
        for (let c = clearMinCol; c <= clearMaxCol; c++) {
          const pt = grid[r][c];
          if (!pt.ref) continue;

          const dx = pt.x - mouse.x;
          const dy = pt.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REVEAL_RADIUS) {
            // Apply physics: attraction & reveal
            const force = 1 - dist / REVEAL_RADIUS; // 0 to 1
            const opacity = Math.max(0, Math.min(1, force));
            
            // Subtle displacement towards mouse
            // Normalize direction vector (from mouse TO point so it pushes? Wait, "move circle along this vector")
            // The guide: "attracted to my mouse cursor". So move FROM anchor TO mouse.
            // Direction = mouse - pt.x
            let dirX = 0, dirY = 0;
            if (dist > 0) {
              dirX = -dx / dist; // pointing toward mouse
              dirY = -dy / dist;
            }
            
            const displacement = MAX_DISPLACEMENT * force;
            const transX = pt.x + dirX * displacement - CIRCLE_SIZE / 2;
            const transY = pt.y + dirY * displacement - CIRCLE_SIZE / 2;

            pt.ref.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;
            pt.ref.style.opacity = opacity.toFixed(3);
          } else {
            // Reset to original center immediately
            pt.ref.style.transform = `translate3d(${pt.x - CIRCLE_SIZE / 2}px, ${pt.y - CIRCLE_SIZE / 2}px, 0)`;
            pt.ref.style.opacity = "0";
          }
        }
      }

      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationId);
      
      // Clean up the DOM to initial states so nothing gets stuck on re-render
      gridRef.current.forEach(row => row.forEach(pt => {
        if (pt.ref) {
          pt.ref.style.opacity = "0";
          pt.ref.style.transform = `translate3d(${pt.x - CIRCLE_SIZE / 2}px, ${pt.y - CIRCLE_SIZE / 2}px, 0)`;
        }
      }));
    };
  }, [dimensions]);

  if (dimensions.cols === 0) return null;

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: "none" }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 18 -7" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className={cn(
          "fixed inset-0 pointer-events-none z-[-1] overflow-hidden",
          "mix-blend-overlay dark:mix-blend-screen"
        )}
        style={{ filter: "url('#goo')" }}
      >
        {gridRef.current.map((rowArr, rIndex) =>
          rowArr.map((pt, cIndex) => (
            <div
              key={`${rIndex}-${cIndex}`}
              ref={(el) => {
                pt.ref = el;
                // Instant setup to avoid pop-in
                if (el) {
                  el.style.transform = `translate3d(${pt.x - CIRCLE_SIZE / 2}px, ${pt.y - CIRCLE_SIZE / 2}px, 0)`;
                  el.style.opacity = "0";
                }
              }}
              className={cn(
                "absolute top-0 left-0 rounded-full will-change-transform",
                // Aura Sky (Light): rgba(135, 206, 235, 0.4)
                // Aura Midnight (Dark): rgba(0, 204, 255, 0.6) with deep glow
                "bg-[rgba(135,206,235,0.4)] dark:bg-[rgba(0,204,255,0.6)] dark:shadow-[0_0_15px_rgba(0,204,255,0.4)]"
              )}
              style={{
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                willChange: "transform, opacity",
              }}
            />
          ))
        )}
      </div>
    </>
  );
}
