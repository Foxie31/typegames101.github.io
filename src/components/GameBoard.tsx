import React, { useRef, useEffect } from 'react';
import { FallingWord, Particle, LaserBeam, FloatingText } from '../types';
import { Crosshair, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface GameBoardProps {
  words: FallingWord[];
  currentInput: string;
  targetWordId: string | null;
  particles: Particle[];
  lasers: LaserBeam[];
  floatingTexts: FloatingText[];
  isShaking: boolean;
  screenFlash: 'damage' | 'clear' | null;
  onInputChange: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFocusInput: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  words,
  currentInput,
  targetWordId,
  particles,
  lasers,
  floatingTexts,
  isShaking,
  screenFlash,
  onInputChange,
  inputRef,
  onFocusInput
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render canvas effects (lasers, sparks, particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Laser Beams
    lasers.forEach(laser => {
      ctx.save();
      ctx.strokeStyle = laser.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = laser.color;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = Math.max(0, laser.alpha);

      ctx.beginPath();
      ctx.moveTo(laser.startX, laser.startY);
      ctx.lineTo(laser.endX, laser.endY);
      ctx.stroke();

      // Inner white laser core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(laser.startX, laser.startY);
      ctx.lineTo(laser.endX, laser.endY);
      ctx.stroke();

      ctx.restore();
    });

    // Draw Particles
    particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [particles, lasers]);

  // Keep canvas sized properly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      id="game-board-container"
      onClick={onFocusInput}
      className={`relative flex-1 w-full overflow-hidden bg-slate-950 flex flex-col justify-between select-none cursor-crosshair ${
        isShaking ? 'animate-[bounce_0.15s_ease-in-out_infinite]' : ''
      }`}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Screen Damage / Clear Flash Overlay */}
      {screenFlash === 'damage' && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-red-600/35 border-4 border-red-500 animate-pulse transition-opacity" />
      )}
      {screenFlash === 'clear' && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-cyan-400/20 border-4 border-cyan-300 animate-pulse transition-opacity" />
      )}

      {/* Canvas Layer for Lasers & Explosion Sparks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none w-full h-full"
      />

      {/* Floating Damage / Score Texts */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {floatingTexts.map(item => (
          <div
            key={item.id}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.alpha,
              transform: 'translate3d(-50%, -50%, 0)'
            }}
            className="absolute font-mono font-black text-sm sm:text-base tracking-wider will-change-transform"
          >
            <span style={{ color: item.color }} className="drop-shadow-[0_0_8px_currentColor]">
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Main Falling Words Arena */}
      <div className="relative w-full flex-1 overflow-hidden">
        {words.map(word => {
          const isTarget = word.id === targetWordId;
          const typedPart = word.text.slice(0, word.typed.length);
          const remainingPart = word.text.slice(word.typed.length);
          const nextChar = remainingPart.charAt(0);
          const restPart = remainingPart.slice(1);

          // Word danger proximity to bottom
          const isNearGround = word.y > 68;

          return (
            <div
              key={word.id}
              id={`word-${word.id}`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: 'translate3d(-50%, -50%, 0)',
                willChange: 'transform, top, left'
              }}
              className={`absolute font-mono z-15 select-none pointer-events-none ${
                word.isSpecial
                  ? 'animate-pulse'
                  : ''
              }`}
            >
              <div
                className={`relative px-3.5 py-1.5 rounded-xl text-base sm:text-lg font-bold flex items-center gap-1.5 border shadow-lg backdrop-blur-md transition-colors duration-150 whitespace-nowrap ${
                  isTarget
                    ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.7)] scale-105 ring-2 ring-cyan-400/50'
                    : isNearGround
                    ? 'bg-red-950/80 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.6)] animate-pulse'
                    : word.isSpecial
                    ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.6)] text-amber-200'
                    : 'bg-slate-900/85 border-slate-700/80 text-slate-100'
                }`}
              >
                {/* Target reticle icon if locked */}
                {isTarget ? (
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : isNearGround ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                ) : word.isSpecial ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : null}

                {/* Letters */}
                <div className="flex tracking-wider">
                  {/* Typed completed letters */}
                  <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] underline decoration-emerald-400 decoration-2 underline-offset-4">
                    {typedPart}
                  </span>

                  {/* Next required letter (highlighted if target) */}
                  {nextChar && (
                    <span
                      className={`${
                        isTarget
                          ? 'text-cyan-300 font-extrabold bg-cyan-500/30 px-0.5 rounded'
                          : 'text-white'
                      }`}
                    >
                      {nextChar}
                    </span>
                  )}

                  {/* Remaining un-typed letters */}
                  <span className="text-slate-300 opacity-90">{restPart}</span>
                </div>

                {/* Special word badge */}
                {word.isSpecial && (
                  <span className="text-[9px] font-black uppercase px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 ml-1">
                    {word.specialType}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ground Defense Shield Barrier (Bottom 12%) */}
      <div className="relative w-full z-20">
        {/* Electric Barrier Laser Line */}
        <div className="relative w-full h-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.9)]">
          <div className="absolute inset-0 bg-white/70 animate-pulse" />
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-cyan-300" />
        </div>

        {/* Typing Console Bar */}
        <div className="w-full bg-slate-900/95 border-t border-cyan-500/30 p-3 sm:p-4 backdrop-blur-lg">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* Terminal indicator */}
            <div className="hidden sm:flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold px-2.5 py-2 rounded-lg bg-slate-950 border border-cyan-500/20">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>DEFENSE_INPUT</span>
            </div>

            {/* Hidden / Real Input Controller */}
            <div className="relative flex-1">
              <input
                id="main-typing-input"
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={e => onInputChange(e.target.value)}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Type falling words before they hit the barrier..."
                className="w-full bg-slate-950/90 text-cyan-300 font-mono text-lg sm:text-xl font-bold px-4 py-3 rounded-xl border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] placeholder:text-slate-600 placeholder:text-sm sm:placeholder:text-base"
              />

              {/* Target lock pill on right of input */}
              {targetWordId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold pointer-events-none">
                  <Crosshair className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>LOCKED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
