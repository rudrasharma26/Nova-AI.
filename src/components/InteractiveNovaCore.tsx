import React, { useRef, useEffect, useState } from 'react';

interface InteractiveNovaCoreProps {
  isGenerating: boolean;
  isDark?: boolean;
}

interface Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  pulseOffset: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

/**
 * InteractiveNovaCore:
 * An interactive, tactile animated core that replaces the static thinking indicator
 * in the empty space near the composer while Nova is generating a reply.
 * The user can nudge, drag, hover, or watch the core drift and pulse while they wait.
 */
export const InteractiveNovaCore: React.FC<InteractiveNovaCoreProps> = ({
  isGenerating,
  isDark = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Core physics & drag offset
  const corePosRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, coreX: 0, coreY: 0 });
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const sparksRef = useRef<Spark[]>([]);

  const emberColor = isDark ? '#FF8A66' : '#FF6B4A';
  const signalColor = isDark ? '#8577FF' : '#5B47E0';

  useEffect(() => {
    if (!isGenerating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = 320;
    const height = 90;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = 50;
    const centerY = height / 2;

    // Initialize 24 orbiting plasma particles
    const particleCount = 24;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const isEmber = Math.random() > 0.45;
      particles.push({
        x: 0,
        y: 0,
        angle: (i / particleCount) * Math.PI * 2,
        radius: 14 + Math.random() * 22,
        speed: (Math.random() * 0.02 + 0.015) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.2 + 1.2,
        color: isEmber ? emberColor : signalColor,
        alpha: Math.random() * 0.4 + 0.5,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      t += 0.035;
      ctx.clearRect(0, 0, width, height);

      // Spring physics for dragged/nudged core
      const core = corePosRef.current;
      if (!isDragging) {
        // Return to resting position (0, 0)
        const springTension = 0.08;
        const damping = 0.82;
        const ax = -core.x * springTension;
        const ay = -core.y * springTension;
        core.vx = (core.vx + ax) * damping;
        core.vy = (core.vy + ay) * damping;
        core.x += core.vx;
        core.y += core.vy;
      }

      // Current center of the core
      const curX = centerX + core.x;
      const curY = centerY + core.y;

      // 1. Draw outer ambient ignition aura
      const auraPulse = Math.sin(t * 1.5) * 4;
      const auraGrad = ctx.createRadialGradient(
        curX,
        curY,
        4,
        curX,
        curY,
        34 + auraPulse
      );
      auraGrad.addColorStop(0, isDark ? 'rgba(255, 138, 102, 0.4)' : 'rgba(255, 107, 74, 0.3)');
      auraGrad.addColorStop(0.5, isDark ? 'rgba(133, 119, 255, 0.25)' : 'rgba(91, 71, 224, 0.2)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(curX, curY, 34 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw orbiting plasma particles
      for (const p of particles) {
        p.angle += p.speed;
        const rx = p.radius + Math.sin(t * 2 + p.pulseOffset) * 2;
        const ry = (p.radius * 0.6) + Math.cos(t * 2 + p.pulseOffset) * 2;

        p.x = curX + Math.cos(p.angle) * rx;
        p.y = curY + Math.sin(p.angle) * ry;

        // Interaction with mouse pointer nudge
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 40) {
            p.x += (dx / dist) * 4;
            p.y += (dy / dist) * 4;
          }
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 3. Central ignition singularity core
      const corePulse = Math.sin(t * 3) * 1.2;
      const coreGrad = ctx.createRadialGradient(
        curX - 2,
        curY - 2,
        1,
        curX,
        curY,
        11 + corePulse
      );
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.3, emberColor);
      coreGrad.addColorStop(0.75, signalColor);
      coreGrad.addColorStop(1, isDark ? '#4A3DAA' : '#392B9C');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(curX, curY, 11 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      // High-intensity focal center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(curX - 1.5, curY - 1.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Update and render spark bursts
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;
        if (s.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGenerating, isDark, emberColor, signalColor, isDragging]);

  if (!isGenerating) return null;

  // Pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    dragStartRef.current = {
      x,
      y,
      coreX: corePosRef.current.x,
      coreY: corePosRef.current.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Burst of tactile sparks on click
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 1;
      sparksRef.current.push({
        x: 50 + corePosRef.current.x,
        y: 45 + corePosRef.current.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? emberColor : signalColor,
        alpha: 1,
        decay: Math.random() * 0.035 + 0.02,
        size: Math.random() * 2 + 1,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current = { x, y, active: true };

    if (isDragging) {
      const dx = x - dragStartRef.current.x;
      const dy = y - dragStartRef.current.y;
      // Clamp drag distance for responsive springiness
      const maxDrag = 35;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist > maxDrag ? maxDrag / dist : 1;

      corePosRef.current.x = dragStartRef.current.coreX + dx * factor;
      corePosRef.current.y = dragStartRef.current.coreY + dy * factor;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    mouseRef.current.active = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`flex items-center justify-between px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
          isDark
            ? 'bg-[#121318]/90 border-[#24262D] shadow-[0_4px_20px_rgba(133,119,255,0.1)]'
            : 'bg-[#FFFFFF]/90 border-[#E4E2DC] shadow-[0_4px_20px_rgba(91,71,224,0.06)]'
        } backdrop-blur-md`}
      >
        <div className="flex items-center gap-2">
          {/* Interactive tactile canvas */}
          <canvas
            ref={canvasRef}
            style={{ width: '110px', height: '44px' }}
            className="cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => {
              setIsHovered(false);
              mouseRef.current.active = false;
            }}
            title="Drag or click to nudge Nova's ignition core"
            aria-label="Interactive Nova ignition core"
          />

          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#15161A] dark:text-[#EDECE8] flex items-center gap-1.5">
              <span>Nova is thinking</span>
              <span className="inline-flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-[#5B47E0] dark:bg-[#8577FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-[#5B47E0] dark:bg-[#8577FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-[#5B47E0] dark:bg-[#8577FF] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </span>
            <span className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6]">
              {isDragging
                ? 'Releasing core springs back...'
                : isHovered
                ? 'Nudge or click to scatter sparks'
                : 'Interactive tactile core · Drag to nudge'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B47E0] dark:text-[#8577FF] bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 px-2 py-0.5 rounded-full">
            Streaming
          </span>
        </div>
      </div>
    </div>
  );
};
