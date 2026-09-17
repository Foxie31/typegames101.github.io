import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import scareImg from '../assets/images/jumpscare_face_1789644954817.jpg';
import { AlertTriangle, Heart, Zap, Play } from 'lucide-react';

interface JumpScareModalProps {
  isActive: boolean;
  onDismiss: (bonusPoints: number) => void;
}

export const JumpScareModal: React.FC<JumpScareModalProps> = ({ isActive, onDismiss }) => {
  const [phase, setPhase] = useState<'screamer' | 'aftermath' | null>(null);
  const [heartBpm, setHeartBpm] = useState(188);

  useEffect(() => {
    if (!isActive) {
      setPhase(null);
      return;
    }

    // Trigger audio screech immediately
    sound.playJumpScare();
    setPhase('screamer');
    setHeartBpm(Math.floor(175 + Math.random() * 25));

    // Phase 1: Screamer lasts ~1.8 seconds, then transitions to aftershock
    const timer1 = setTimeout(() => {
      setPhase('aftermath');
      sound.playHeartbeat();
    }, 1800);

    // Heartbeat pulses in aftermath
    const pulseInterval = setInterval(() => {
      sound.playHeartbeat();
      setHeartBpm(prev => Math.max(90, prev - 15));
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearInterval(pulseInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div id="jumpscare-overlay" className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      <AnimatePresence mode="wait">
        {phase === 'screamer' && (
          <motion.div
            key="screamer-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Rapid Strobe Flash Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none animate-pulse bg-red-600/30 mix-blend-color-dodge" />
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-red-950/70 to-black" />

            {/* Violent Jitter Image Container */}
            <motion.div
              initial={{ scale: 0.6, rotate: -2 }}
              animate={{
                scale: [0.7, 1.45, 1.25, 1.5, 1.3],
                x: [0, -18, 22, -14, 16, -8, 12, 0],
                y: [0, 15, -20, 18, -12, 14, -6, 0],
                rotate: [0, 4, -4, 3, -3, 0]
              }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                repeat: 0
              }}
              className="relative z-10 w-[95vw] max-w-[850px] aspect-square flex items-center justify-center"
            >
              <img
                src={scareImg}
                alt="Entity"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl shadow-[0_0_90px_rgba(239,68,68,0.85)] filter contrast-150 brightness-110 saturate-150"
              />

              {/* Horror vignette & blood glazes */}
              <div className="absolute inset-0 rounded-2xl border-4 border-red-600/80 shadow-[inset_0_0_80px_rgba(185,28,28,0.9)]" />
            </motion.div>

            {/* Glitch Typography Overlay */}
            <div className="absolute top-8 left-0 right-0 z-30 flex flex-col items-center justify-center pointer-events-none">
              <motion.div
                animate={{ x: [-8, 8, -5, 5, 0], opacity: [0.9, 1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 0.15 }}
                className="bg-red-600 text-white font-black tracking-widest text-2xl md:text-4xl px-6 py-2 uppercase shadow-[0_0_30px_rgba(220,38,38,1)] border-2 border-white"
              >
                CRITICAL SYSTEM INTRUSION
              </motion.div>
              <p className="text-red-400 font-mono tracking-widest text-sm md:text-base mt-2 font-bold bg-black/80 px-4 py-1">
                HOSTILE ANOMALY DETECTED // PULSE {heartBpm} BPM
              </p>
            </div>

            {/* Bottom Warning Bar */}
            <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
              <div className="bg-black/90 border border-red-500/60 px-6 py-2 rounded-full flex items-center space-x-3 text-red-500 font-mono animate-bounce">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-spin" />
                <span className="font-bold tracking-wider text-sm">NEURAL OVERLOAD DETECTED</span>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'aftermath' && (
          <motion.div
            key="aftermath-stage"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="relative max-w-lg w-full bg-slate-900 border-2 border-red-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center">
              {/* EKG / Heart Rate graphic */}
              <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Heart className="w-8 h-8 text-red-500 animate-ping" />
              </div>

              <div className="inline-block px-3 py-1 bg-red-950/80 border border-red-700/60 rounded-full text-xs font-mono text-red-300 mb-3 tracking-widest uppercase">
                Random Scare Event Triggered
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                SYSTEM ANOMALY RECOVERED!
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                Your heart just leaped into your throat! The cyber entity tested your reflex nerves. You survived the surprise anomaly!
              </p>

              {/* Stat breakdown box */}
              <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-sm">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">HEART RATE</div>
                  <div className="text-red-400 font-bold text-lg flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    <span>{heartBpm} BPM</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">ADRENALINE BOOST</div>
                  <div className="text-amber-400 font-bold text-lg flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>+500 PTS</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-resume-defense"
                onClick={() => onDismiss(500)}
                className="w-full cursor-pointer py-3.5 px-6 rounded-xl font-bold font-mono tracking-wider bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2 text-base active:scale-98"
              >
                <Play className="w-5 h-5 fill-white" />
                RESUME TYPING DEFENSE
              </button>

              <div className="mt-4 text-xs text-slate-400">
                You can adjust jumpscare frequency or safe mode in the top right Settings gear anytime.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
