import React from 'react';
import { GameDifficulty } from '../types';
import { Play, Shield, Zap, Skull, Target, Sparkles, Terminal } from 'lucide-react';

interface StartScreenProps {
  onStartGame: () => void;
  difficulty: GameDifficulty;
  onChangeDifficulty: (diff: GameDifficulty) => void;
  highScore: number;
  onTriggerScare: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  difficulty,
  onChangeDifficulty,
  highScore,
  onTriggerScare
}) => {
  return (
    <div id="start-screen-overlay" className="fixed inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative max-w-xl w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(6,182,212,0.15)] text-center text-white overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title Badges */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold mb-4 tracking-widest uppercase">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYBERNETIC TYPING DEFENSE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          FALLING <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">WORDS</span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
          Intercept and type falling words before they crash into the ground barrier. Stay focused, maintain your multiplier, and brace for unexpected surprises.
        </p>

        {/* High Score Banner */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 font-mono text-xs mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PERSONAL RECORD: <strong>{highScore.toLocaleString()} PTS</strong></span>
          </div>
        )}

        {/* Instructions Matrix */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-left font-mono">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">TYPE TO LOCK</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Type matching letters to laser-lock falling words.
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">DEFEND SHIELD</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Prevent words from impacting the bottom barrier.
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-2">
              <Skull className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">SURPRISE SCARE</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Unpredictable scare triggers randomly after 30s!
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
            Select Difficulty
          </div>
          <div className="flex justify-center gap-2">
            {(['rookie', 'agent', 'overdrive'] as GameDifficulty[]).map(diff => (
              <button
                key={diff}
                id={`start-diff-${diff}`}
                onClick={() => onChangeDifficulty(diff)}
                className={`py-1.5 px-4 rounded-xl border text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                  difficulty === diff
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-105'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <button
          id="btn-start-game"
          onClick={onStartGame}
          className="w-full cursor-pointer py-4 px-8 rounded-2xl font-bold font-mono tracking-wider bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 text-lg font-black active:scale-98"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          START TYPING DEFENSE
        </button>

        {/* Subtle test scare trigger */}
        <div className="mt-4 flex items-center justify-center">
          <button
            id="btn-start-testscare"
            onClick={onTriggerScare}
            className="cursor-pointer text-xs font-mono text-red-400/80 hover:text-red-300 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-red-950/30 transition-colors"
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Test the Jump Scare right now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
