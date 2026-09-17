import React from 'react';
import { GameStats } from '../types';
import { RotateCcw, Award, Target, Zap, Flame, Skull } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onTriggerScare: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onTriggerScare
}) => {
  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <div id="gameover-modal-backdrop" className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(15,23,42,0.9)] text-center text-white">
        {/* Glow Header */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
          <Skull className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          DEFENSE BREACHED
        </h2>
        <p className="text-slate-400 text-sm mb-6 font-mono">
          Hostile words breached the barrier grid.
        </p>

        {/* Record banner if broken */}
        {isNewRecord && (
          <div className="mb-6 py-2 px-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
            <Award className="w-4 h-4 text-amber-400" />
            NEW PERSONAL HIGH SCORE!
          </div>
        )}

        {/* Stats Matrix Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-left">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs mb-0.5">FINAL SCORE</div>
            <div className="text-xl font-black text-cyan-300">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs mb-0.5">HIGH SCORE</div>
            <div className="text-xl font-black text-amber-300">
              {stats.highScore.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs mb-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              TYPING SPEED
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {stats.wpm} <span className="text-xs text-slate-400">WPM</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs mb-0.5 flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-400" />
              ACCURACY
            </div>
            <div className="text-lg font-bold text-blue-400">
              {stats.accuracy}%
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs mb-0.5">WORDS NEUTRALIZED</div>
            <div className="text-lg font-bold text-indigo-300">
              {stats.wordsCleared}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs mb-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              MAX STREAK
            </div>
            <div className="text-lg font-bold text-rose-400">
              {stats.maxStreak}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="btn-play-again"
            onClick={onRestart}
            className="w-full cursor-pointer py-3.5 px-6 rounded-xl font-bold font-mono tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            REBOOT DEFENSE (RESTART)
          </button>

          <button
            id="btn-gameover-testscare"
            onClick={onTriggerScare}
            className="w-full cursor-pointer py-2.5 px-4 rounded-xl font-mono text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Skull className="w-4 h-4 text-red-400" />
            Trigger Jump Scare Surprise
          </button>
        </div>
      </div>
    </div>
  );
};
