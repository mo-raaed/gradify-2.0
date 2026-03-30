import { useEffect, useRef } from "react";

const NUM_PARTICLES = 12;
const INTERACT_RADIUS = 250;
const SPRING_COEF = 0.03;
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
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const initParticles = () => {
      const newParticles: Particle[] = [];
      const cols = 4;
      const rows = Math.ceil(NUM_PARTICLES / cols);
      
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        const cellW = w / cols;
        const cellH = h / rows;
        const xBase = cellW * col + cellW / 2;
        const yBase = cellH * row + cellH / 2;
        
        const anchorX = xBase + (Math.random() - 0.5) * (cellW * 0.6);
        const anchorY = yBase + (Math.random() - 0.5) * (cellH * 0.6);
        
        newParticles.push({
          id: i,
          x: anchorX,
          y: anchorY,
          vx: 0,
          vy: 0,
          anchorX,
          anchorY,
          opacity: 0,
          size: 60 + Math.random() * 40, // Slightly larger base size for better merging visibility
        });
      }
      particlesRef.current = newParticles;
    };

    initParticles();

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        initParticles();
      }, 100);
    };
    window.addEventListener("resize", onResize);

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

    // To handle dark/light mode dynamically without reacting to state internally
    const getIsDark = () => document.documentElement.classList.contains("dark");

    let animationId: number;
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const isDark = getIsDark();
      const mouse = mouseRef.current;

      // We use a global composite operation to make overlapping soft gradients look like liquid fluid
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = particlesRef.current[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let targetOpacity = 0;
        
        if (dist < INTERACT_RADIUS) {
          targetOpacity = Math.max(0, 1 - (dist / INTERACT_RADIUS));
          // Provide organic offset so they orbit the mouse instead of stacking perfectly
          const orbitX = mouse.x + Math.sin(p.id * 1.5) * 50;
          const orbitY = mouse.y + Math.cos(p.id * 1.5) * 50;
          
          p.vx += (orbitX - p.x) * MOUSE_PULL;
          p.vy += (orbitY - p.y) * MOUSE_PULL;
        } else {
          p.vx += (p.anchorX - p.x) * SPRING_COEF;
          p.vy += (p.anchorY - p.y) * SPRING_COEF;
        }
        
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        
        p.opacity += (targetOpacity - p.opacity) * 0.08;

        if (p.opacity > 0.01) {
          // Draw fluid particle
          const radius = p.size;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          
          // Aura Midnight styling: Electric Cerulean in light mode, primary baby blue in dark mode
          const r = isDark ? 129 : 0;
          const g = isDark ? 174 : 127;
          const b = isDark ? 255 : 255;
          
          const maxAlpha = p.opacity;
          
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${maxAlpha * 0.8})`);
          gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${maxAlpha * 0.4})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
}
