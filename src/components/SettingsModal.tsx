import React from 'react';
import { GameDifficulty, ScareState } from '../types';
import { X, Volume2, VolumeX, Skull, Gauge, Sparkles, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: GameDifficulty;
  onSelectDifficulty: (diff: GameDifficulty) => void;
  scareState: ScareState;
  onToggleScareArmed: () => void;
  onTriggerScare: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  difficulty,
  onSelectDifficulty,
  scareState,
  onToggleScareArmed,
  onTriggerScare,
  isMuted,
  onToggleMute
}) => {
  if (!isOpen) return null;

  return (
    <div id="settings-modal-backdrop" className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-white">System Config</h2>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 font-mono text-sm">
          {/* Difficulty Selection */}
          <div>
            <label className="text-xs uppercase text-slate-400 tracking-wider mb-2 block font-semibold">
              Difficulty Sector
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['rookie', 'agent', 'overdrive'] as GameDifficulty[]).map((mode) => (
                <button
                  key={mode}
                  id={`btn-difficulty-${mode}`}
                  onClick={() => onSelectDifficulty(mode)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    difficulty === mode
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Jump Scare Controls */}
          <div className="p-3.5 rounded-xl bg-red-950/25 border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-400" />
                <span className="font-bold text-red-300 text-xs tracking-wider uppercase">
                  Jump Scare Anomaly
                </span>
              </div>
              <button
                id="btn-toggle-scare-armed"
                onClick={onToggleScareArmed}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  scareState.armed
                    ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {scareState.armed ? 'ARMED (>30s)' : 'MUTED (SAFE)'}
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Triggers unpredictably at random after 30 seconds of play to test your nerves! Includes sudden scream and visual entity shockwave.
            </p>

            <button
              id="btn-settings-testscare"
              onClick={() => {
                onClose();
                onTriggerScare();
              }}
              className="w-full py-2 px-3 rounded-lg bg-red-900/40 hover:bg-red-800/50 border border-red-500/40 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Skull className="w-3.5 h-3.5 text-red-400" />
              Preview Scare Right Now
            </button>
          </div>

          {/* Sound Mute */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>Procedural Synthesizer Audio</span>
            </div>
            <button
              id="btn-settings-toggle-sound"
              onClick={onToggleMute}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {isMuted ? 'UNMUTE' : 'MUTE'}
            </button>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 text-[11px] text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>Type words accurately. Multipliers increase with consecutive words. Power-up words provide shields and tactical clearing.</span>
          </div>
        </div>

        {/* Footer */}
        <button
          id="btn-save-close-settings"
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-mono text-xs font-bold text-white transition-colors"
        >
          APPLY CONFIG
        </button>
      </div>
    </div>
  );
};
