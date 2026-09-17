export interface FallingWord {
  id: string;
  text: string;
  typed: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage 0% to 100%
  speed: number; // speed per frame
  points: number;
  isSpecial?: boolean; // gold / bonus word
  specialType?: 'shield' | 'nuke' | 'freeze' | 'double';
  color?: string;
  spawnTime: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  alpha: number;
  createdAt: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export type GameDifficulty = 'rookie' | 'agent' | 'overdrive';

export interface GameStats {
  score: number;
  highScore: number;
  wordsCleared: number;
  keystrokes: number;
  correctKeystrokes: number;
  streak: number;
  maxStreak: number;
  level: number;
  wpm: number;
  accuracy: number;
  shields: number; // Max 5
  maxShields: number;
}

export interface ScareState {
  isActive: boolean;
  armed: boolean;
  hasTriggered: boolean;
  triggerTimeSec: number; // when it's scheduled to pop (>= 30)
  elapsedSec: number;
  intensity: 'normal' | 'extreme' | 'gentle';
  soundEnabled: boolean;
}
