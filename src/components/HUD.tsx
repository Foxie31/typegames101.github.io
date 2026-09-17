import React from 'react';
import { GameStats, ScareState } from '../types';
import { Shield, Zap, Volume2, VolumeX, Settings, Target, Award, Flame, Skull } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  scareState: ScareState;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onTriggerTestScare: () => void;
  gameStatus: string;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  scareState,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onTriggerTestScare,
  gameStatus
}) => {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white select-none z-20">
      {/* Brand & Shields */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm">
            FW
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              FALLING WORDS
            </h1>
            <div className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
              DEFENSE MATRIX v2.4
            </div>
          </div>
        </div>

        {/* Shield / HP gauge */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex gap-1">
            {Array.from({ length: stats.maxShields }).map((_, i) => {
              const isFilled = i < stats.shields;
              const isDanger = stats.shields === 1;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                    isFilled
                      ? isDanger
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                        : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]'
                      : 'bg-slate-800/80 border border-slate-700'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 ml-1">
            {stats.shields}/{stats.maxShields}
          </span>
        </div>
      </div>

      {/* Main Core Stats */}
      <div className="flex items-center gap-4 sm:gap-6 font-mono">
        {/* Score & Multiplier */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Score</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black text-cyan-300">
              {stats.score.toLocaleString()}
            </span>
            {stats.streak >= 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider bg-amber-500/20 border border-amber-500/60 text-amber-300 flex items-center gap-0.5 animate-bounce">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                x{Math.min(5, Math.floor(stats.streak / 3) + 1)}
              </span>
            )}
          </div>
        </div>

        {/* Level */}
        <div className="hidden sm:flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Sector</span>
          <span className="text-base sm:text-lg font-bold text-indigo-300">
            LVL {stats.level}
          </span>
        </div>

        {/* WPM */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Speed</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            {stats.wpm} <span className="text-[10px] text-slate-400">WPM</span>
          </span>
        </div>

        {/* Accuracy */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Accuracy</span>
          <span className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            {stats.accuracy}%
          </span>
        </div>

        {/* High Score */}
        <div className="hidden lg:flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Record</span>
          <span className="text-base font-bold text-slate-300 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            {stats.highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Control Actions & JumpScare Radar Indicator */}
      <div className="flex items-center gap-2">
        {/* Suspense / Scare Status Pill */}
        {scareState.armed && (
          <div
            title="Jump scare module active (triggers unpredictably after 30s)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 text-xs font-mono"
          >
            <Skull className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider">
              {scareState.elapsedSec < 30
                ? `ARMING IN ${30 - scareState.elapsedSec}s`
                : scareState.hasTriggered
                ? 'ANOMALY SURVIVED'
                : 'SURPRISE ARMED!'}
            </span>
          </div>
        )}

        {/* Test Scare Trigger Button */}
        <button
          id="btn-test-jumpscare"
          onClick={onTriggerTestScare}
          title="Test Jump Scare Now"
          className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95"
        >
          <Skull className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden xl:inline text-[11px] font-bold">Test Scare</span>
        </button>

        {/* Audio Toggle */}
        <button
          id="btn-sound-toggle"
          onClick={onToggleMute}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          className="cursor-pointer p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          title="Game Settings"
          className="cursor-pointer p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
