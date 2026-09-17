import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  FallingWord,
  Particle,
  LaserBeam,
  FloatingText,
  GameStatus,
  GameDifficulty,
  GameStats,
  ScareState
} from './types';
import { getRandomWord } from './utils/words';
import { sound } from './utils/audio';
import { HUD } from './components/HUD';
import { GameBoard } from './components/GameBoard';
import { JumpScareModal } from './components/JumpScareModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { StartScreen } from './components/StartScreen';

const MAX_SHIELDS = 5;

export default function App() {
  // Game Status & Config
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('agent');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Jump Scare State (must trigger randomly after 30 seconds)
  const [scareState, setScareState] = useState<ScareState>({
    isActive: false,
    armed: true,
    hasTriggered: false,
    triggerTimeSec: 30 + Math.floor(Math.random() * 25), // Between 30s and 55s
    elapsedSec: 0,
    intensity: 'normal',
    soundEnabled: true
  });

  // Game Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    wordsCleared: 0,
    keystrokes: 0,
    correctKeystrokes: 0,
    streak: 0,
    maxStreak: 0,
    level: 1,
    wpm: 0,
    accuracy: 100,
    shields: MAX_SHIELDS,
    maxShields: MAX_SHIELDS
  });

  // Falling Words & Dynamic Entities
  const [words, setWords] = useState<FallingWord[]>([]);
  const [targetWordId, setTargetWordId] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lasers, setLasers] = useState<LaserBeam[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Screen Visual Feedback
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<'damage' | 'clear' | null>(null);

  // Time & Loop Refs
  const gameStartTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load High Score from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fw_high_score');
      if (saved) {
        setStats(prev => ({ ...prev, highScore: parseInt(saved, 10) || 0 }));
      }
    } catch {
      // LocalStorage access ignore
    }
  }, []);

  // Save High Score
  const updateHighScore = useCallback((score: number) => {
    setStats(prev => {
      const newHigh = Math.max(prev.highScore, score);
      try {
        localStorage.setItem('fw_high_score', newHigh.toString());
      } catch {
        // ignore
      }
      return { ...prev, highScore: newHigh };
    });
  }, []);

  // Focus input automatically
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Difficulty parameters
  const getSpeedMultiplier = useCallback(() => {
    switch (difficulty) {
      case 'rookie': return 0.75;
      case 'overdrive': return 1.45;
      case 'agent':
      default: return 1.0;
    }
  }, [difficulty]);

  const getSpawnInterval = useCallback((level: number) => {
    const base = difficulty === 'rookie' ? 2400 : difficulty === 'overdrive' ? 1400 : 1900;
    return Math.max(800, base - (level - 1) * 110);
  }, [difficulty]);

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 240);
  }, []);

  // Add explosion particles
  const createExplosion = useCallback((xPercent: number, yPercent: number, color: string = '#22d3ee') => {
    const container = document.getElementById('game-board-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pixelX = (xPercent / 100) * rect.width;
    const pixelY = (yPercent / 100) * rect.height;

    const count = 18;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        id: Math.random().toString(),
        x: pixelX,
        y: pixelY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color: color,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.floor(Math.random() * 15)
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Add laser zap from defense turret (center bottom)
  const shootLaser = useCallback((targetXPercent: number, targetYPercent: number, color: string = '#38bdf8') => {
    const container = document.getElementById('game-board-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const startX = rect.width / 2;
    const startY = rect.height - 40;
    const endX = (targetXPercent / 100) * rect.width;
    const endY = (targetYPercent / 100) * rect.height;

    const newLaser: LaserBeam = {
      id: Math.random().toString(),
      startX,
      startY,
      endX,
      endY,
      color,
      alpha: 1,
      createdAt: Date.now()
    };
    setLasers(prev => [...prev, newLaser]);
  }, []);

  // Add floating text (+100, -1 SHIELD)
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    const id = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color, alpha: 1 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 900);
  }, []);

  // Trigger Jumpscare
  const triggerScare = useCallback(() => {
    setScareState(prev => ({
      ...prev,
      isActive: true,
      hasTriggered: true
    }));
  }, []);

  // Dismiss Jumpscare
  const handleDismissScare = useCallback((bonusPoints: number) => {
    setScareState(prev => ({
      ...prev,
      isActive: false
    }));

    // Grant adrenaline bonus
    if (bonusPoints > 0) {
      setStats(prev => {
        const nextScore = prev.score + bonusPoints;
        updateHighScore(nextScore);
        return { ...prev, score: nextScore };
      });
      addFloatingText(`+${bonusPoints} ADRENALINE BOOST!`, 50, 45, '#f59e0b');
    }

    focusInput();
  }, [focusInput, updateHighScore, addFloatingText]);

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    sound.unlock();
    gameStartTimeRef.current = Date.now();
    lastSpawnTimeRef.current = Date.now();

    setWords([]);
    setTargetWordId(null);
    setCurrentInput('');
    setParticles([]);
    setLasers([]);
    setFloatingTexts([]);

    setStats(prev => ({
      score: 0,
      highScore: prev.highScore,
      wordsCleared: 0,
      keystrokes: 0,
      correctKeystrokes: 0,
      streak: 0,
      maxStreak: 0,
      level: 1,
      wpm: 0,
      accuracy: 100,
      shields: MAX_SHIELDS,
      maxShields: MAX_SHIELDS
    }));

    // Randomize scare trigger time: strictly after 30 seconds (e.g. 30s + 0 to 25s)
    setScareState(prev => ({
      ...prev,
      isActive: false,
      hasTriggered: false,
      elapsedSec: 0,
      triggerTimeSec: 30 + Math.floor(Math.random() * 25)
    }));

    setGameStatus('playing');
    setTimeout(focusInput, 50);
  }, [focusInput]);

  // Timer interval for elapsed time and unpredictable jumpscare check
  useEffect(() => {
    if (gameStatus !== 'playing' || scareState.isActive) return;

    const timer = setInterval(() => {
      setScareState(prev => {
        const nextElapsed = prev.elapsedSec + 1;

        // Condition: triggers randomly after thirty seconds!
        if (prev.armed && !prev.hasTriggered && nextElapsed >= 30) {
          // Check if scheduled time reached OR random dice roll past 30s
          const timeReached = nextElapsed >= prev.triggerTimeSec;
          const randomChance = Math.random() < 0.08; // 8% chance per second once past 30s

          if (timeReached || randomChance) {
            triggerScare();
            return {
              ...prev,
              elapsedSec: nextElapsed,
              hasTriggered: true
            };
          }
        }

        return { ...prev, elapsedSec: nextElapsed };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, scareState.isActive, triggerScare]);

  // Spawn a new falling word with anti-overlap lane positioning
  const spawnWord = useCallback(() => {
    setWords(currentWords => {
      // Limit on-screen words to avoid clutter
      const maxWords = 5 + Math.min(3, Math.floor(stats.level / 2));
      if (currentWords.length >= maxWords) return currentWords;

      // 6 balanced horizontal lanes across the board (each having ~14% safe width)
      const LANES = [16, 30, 44, 58, 72, 86];

      // Calculate vertical headroom for each lane
      const laneStats = LANES.map(laneX => {
        // Find words in this lane's corridor
        const wordsInCorridor = currentWords.filter(w => Math.abs(w.x - laneX) < 13);
        const topY = wordsInCorridor.length > 0
          ? Math.min(...wordsInCorridor.map(w => w.y))
          : 100; // Complete clearance
        return { laneX, topY, count: wordsInCorridor.length };
      });

      // Valid lanes must have at least 25% vertical clearance from the top
      const safeLanes = laneStats.filter(l => l.topY >= 25);
      if (safeLanes.length === 0) {
        // No safe headroom right now; delay spawn to prevent stacking/overlap
        return currentWords;
      }

      // Pick lane with the most vertical clearance and lowest word count
      safeLanes.sort((a, b) => (b.topY - a.topY) || (a.count - b.count));
      const chosenLane = safeLanes[Math.floor(Math.random() * Math.min(2, safeLanes.length))];

      // Slight natural organic offset (+- 1.5%) while staying strictly separated
      const jitter = (Math.random() - 0.5) * 3;
      const x = Math.max(12, Math.min(88, chosenLane.laneX + jitter));

      const existingTexts = new Set<string>(currentWords.map(w => w.text));
      const wordData = getRandomWord(stats.level, existingTexts);

      // Speed calculation (smooth, readable fall rate)
      const baseSpeed = 0.075 * getSpeedMultiplier();
      const levelBonus = (stats.level - 1) * 0.012;
      const wordLengthBonus = Math.max(0, (7 - wordData.text.length) * 0.006);
      const speed = baseSpeed + levelBonus + wordLengthBonus;

      const newWord: FallingWord = {
        id: Math.random().toString(),
        text: wordData.text,
        typed: '',
        x,
        y: 2, // Start smoothly at the top
        speed,
        points: wordData.points,
        isSpecial: wordData.isSpecial,
        specialType: wordData.specialType,
        spawnTime: Date.now()
      };

      return [...currentWords, newWord];
    });
  }, [stats.level, getSpeedMultiplier]);

  // Game Animation Loop (falling words, collision resolution, particles, lasers)
  useEffect(() => {
    if (gameStatus !== 'playing' || scareState.isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      // Smooth delta step clamped between 8ms and 33.3ms to avoid jumps
      const rawDelta = timestamp - lastTimestamp;
      const delta = Math.min(33.33, Math.max(8, rawDelta));
      lastTimestamp = timestamp;

      // 1. Spawning check
      const now = Date.now();
      const spawnInterval = getSpawnInterval(stats.level);
      if (now - lastSpawnTimeRef.current > spawnInterval) {
        spawnWord();
        lastSpawnTimeRef.current = now;
      }

      // 2. Update Falling Words with Collision Separation
      setWords(prevWords => {
        let breachOccurred = false;

        // Move words down smoothly
        let updatedWords = prevWords.map(w => ({
          ...w,
          y: w.y + w.speed * (delta / 16.66)
        }));

        // Anti-overlap resolution: enforce vertical and horizontal buffers between all words
        for (let i = 0; i < updatedWords.length; i++) {
          for (let j = i + 1; j < updatedWords.length; j++) {
            const w1 = updatedWords[i];
            const w2 = updatedWords[j];

            const dx = Math.abs(w1.x - w2.x);
            const dy = Math.abs(w1.y - w2.y);

            // If words are in the same or adjacent lane and close vertically
            const minHorizontalGap = 15; // 15% horizontal clearance
            const minVerticalGap = 9;   // 9% vertical clearance

            if (dx < minHorizontalGap && dy < minVerticalGap) {
              // Push apart horizontally to avoid text overlap
              const overlapX = (minHorizontalGap - dx) / 2;
              if (w1.x <= w2.x) {
                w1.x = Math.max(12, w1.x - overlapX);
                w2.x = Math.min(88, w2.x + overlapX);
              } else {
                w1.x = Math.min(88, w1.x + overlapX);
                w2.x = Math.max(12, w2.x - overlapX);
              }

              // Adjust vertical spacing so higher word doesn't fall through lower word
              if (w1.y < w2.y) {
                // w1 is higher, w2 is lower
                w1.y = Math.max(2, w2.y - minVerticalGap);
              } else {
                // w2 is higher, w1 is lower
                w2.y = Math.max(2, w1.y - minVerticalGap);
              }
            }
          }
        }

        const nextWords: FallingWord[] = [];
        for (const w of updatedWords) {
          // Check if word hit the barrier / ground (84%)
          if (w.y >= 84) {
            breachOccurred = true;
            sound.playDamage();
            triggerShake();
            setScreenFlash('damage');
            setTimeout(() => setScreenFlash(null), 250);
            createExplosion(w.x, 84, '#ef4444');
            addFloatingText('BARRIER BREACH -1 SHIELD', w.x, 80, '#ef4444');

            // Reset current input if target word was destroyed by barrier
            if (w.id === targetWordId) {
              setTargetWordId(null);
              setCurrentInput('');
            }
          } else {
            nextWords.push(w);
          }
        }

        if (breachOccurred) {
          setStats(s => {
            const nextShields = s.shields - 1;
            if (nextShields <= 0) {
              // Game Over
              setGameStatus('gameover');
              updateHighScore(s.score);
            }
            return {
              ...s,
              shields: Math.max(0, nextShields),
              streak: 0 // Break streak on breach
            };
          });
        }

        return nextWords;
      });

      // 3. Update Particles
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            alpha: 1 - p.life / p.maxLife,
            life: p.life + 1
          }))
          .filter(p => p.life < p.maxLife)
      );

      // 4. Update Laser Beams (fade fast)
      setLasers(prev =>
        prev
          .map(l => ({ ...l, alpha: l.alpha - 0.12 }))
          .filter(l => l.alpha > 0)
      );

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    gameStatus,
    scareState.isActive,
    stats.level,
    getSpawnInterval,
    spawnWord,
    triggerShake,
    createExplosion,
    addFloatingText,
    targetWordId,
    updateHighScore
  ]);

  // Handle Typing Input
  const handleInputChange = (inputValue: string) => {
    if (gameStatus !== 'playing' || scareState.isActive) return;

    sound.unlock();

    const cleanInput = inputValue.trim().toLowerCase();
    const lastChar = cleanInput.slice(-1);

    if (!cleanInput) {
      setCurrentInput('');
      return;
    }

    setStats(s => ({ ...s, keystrokes: s.keystrokes + 1 }));

    // Case 1: Already have a targeted word
    if (targetWordId) {
      const targetWord = words.find(w => w.id === targetWordId);

      if (targetWord) {
        const nextExpectedChar = targetWord.text.charAt(targetWord.typed.length);

        if (lastChar === nextExpectedChar) {
          // Correct keypress!
          sound.playKey(true);
          const nextTyped = targetWord.typed + lastChar;
          setStats(s => ({ ...s, correctKeystrokes: s.correctKeystrokes + 1 }));

          // Word completed!
          if (nextTyped === targetWord.text) {
            handleWordDestroyed(targetWord);
          } else {
            // Advance typed letters on the targeted word
            setWords(prev =>
              prev.map(w => (w.id === targetWord.id ? { ...w, typed: nextTyped } : w))
            );
            setCurrentInput(nextTyped);
          }
        } else {
          // Wrong keypress
          sound.playKey(false);
          setStats(s => ({ ...s, streak: 0 }));
          triggerShake();
        }
      } else {
        // Target word no longer exists
        setTargetWordId(null);
        setCurrentInput('');
      }
      return;
    }

    // Case 2: No active target - search for closest falling word starting with lastChar
    const candidates = words.filter(w => w.text.startsWith(lastChar));

    if (candidates.length > 0) {
      // Pick the word closest to the bottom barrier (highest Y) for urgent defense!
      candidates.sort((a, b) => b.y - a.y);
      const chosen = candidates[0];

      sound.playKey(true);
      setStats(s => ({ ...s, correctKeystrokes: s.correctKeystrokes + 1 }));
      setTargetWordId(chosen.id);

      if (chosen.text.length === 1) {
        handleWordDestroyed(chosen);
      } else {
        setWords(prev =>
          prev.map(w => (w.id === chosen.id ? { ...w, typed: lastChar } : w))
        );
        setCurrentInput(lastChar);
      }
    } else {
      // Missed keystroke
      sound.playKey(false);
      setStats(s => ({ ...s, streak: 0 }));
      setCurrentInput('');
    }
  };

  // Word neutralized by player
  const handleWordDestroyed = (word: FallingWord) => {
    sound.playWordDestroyed(word.isSpecial);
    shootLaser(word.x, word.y, word.isSpecial ? '#fbbf24' : '#38bdf8');
    createExplosion(word.x, word.y, word.isSpecial ? '#f59e0b' : '#06b6d4');

    // Calculate score with streak multiplier
    const currentStreak = stats.streak + 1;
    const multiplier = Math.min(5, Math.floor(currentStreak / 3) + 1);
    const earnedPoints = word.points * multiplier;

    addFloatingText(`+${earnedPoints}`, word.x, word.y - 4, word.isSpecial ? '#fbbf24' : '#38bdf8');

    // Handle special powerups
    if (word.isSpecial && word.specialType) {
      if (word.specialType === 'shield') {
        setStats(s => ({ ...s, shields: Math.min(MAX_SHIELDS, s.shields + 1) }));
        addFloatingText('+1 SHIELD RESTORED', word.x, word.y - 9, '#10b981');
        sound.playLevelUp();
      } else if (word.specialType === 'nuke') {
        // Clear all on-screen words!
        setWords(current => {
          current.forEach(w => {
            createExplosion(w.x, w.y, '#f43f5e');
          });
          return [];
        });
        addFloatingText('TACTICAL EMP BLAST!', 50, 40, '#f43f5e');
        sound.playWordDestroyed(true);
      } else if (word.specialType === 'freeze') {
        // Temporarily slow all words
        setWords(current => current.map(w => ({ ...w, speed: w.speed * 0.4 })));
        addFloatingText('STASIS FIELD ACTIVE', 50, 40, '#38bdf8');
      }
    }

    // Remove word
    setWords(prev => prev.filter(w => w.id !== word.id));
    setTargetWordId(null);
    setCurrentInput('');

    // Update stats
    setStats(s => {
      const nextScore = s.score + earnedPoints;
      const nextCleared = s.wordsCleared + 1;
      const nextMaxStreak = Math.max(s.maxStreak, currentStreak);

      // Level progression every 6 words
      const nextLevel = 1 + Math.floor(nextCleared / 6);
      if (nextLevel > s.level) {
        sound.playLevelUp();
        addFloatingText(`SECTOR LEVEL ${nextLevel}!`, 50, 30, '#a855f7');
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 }
        });
      }

      // WPM calculation
      const elapsedMin = Math.max(0.1, (Date.now() - gameStartTimeRef.current) / 60000);
      const computedWpm = Math.round(nextCleared / elapsedMin);
      const computedAcc = s.keystrokes > 0 ? Math.round((s.correctKeystrokes / s.keystrokes) * 100) : 100;

      updateHighScore(nextScore);

      return {
        ...s,
        score: nextScore,
        wordsCleared: nextCleared,
        streak: currentStreak,
        maxStreak: nextMaxStreak,
        level: nextLevel,
        wpm: computedWpm,
        accuracy: computedAcc
      };
    });
  };

  // Keyboard shortcut listener for ESC (pause/settings) or autofocus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(prev => !prev);
      }
      if (gameStatus === 'playing' && !scareState.isActive && !isSettingsOpen) {
        focusInput();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, scareState.isActive, isSettingsOpen, focusInput]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top HUD Bar */}
      <HUD
        stats={stats}
        scareState={scareState}
        isMuted={isMuted}
        onToggleMute={() => {
          sound.isMuted = !isMuted;
          setIsMuted(!isMuted);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTriggerTestScare={triggerScare}
        gameStatus={gameStatus}
      />

      {/* Main Game Arena */}
      <GameBoard
        words={words}
        currentInput={currentInput}
        targetWordId={targetWordId}
        particles={particles}
        lasers={lasers}
        floatingTexts={floatingTexts}
        isShaking={isShaking}
        screenFlash={screenFlash}
        onInputChange={handleInputChange}
        inputRef={inputRef}
        onFocusInput={focusInput}
      />

      {/* Start Screen Overlay */}
      {gameStatus === 'idle' && (
        <StartScreen
          onStartGame={handleStartGame}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          highScore={stats.highScore}
          onTriggerScare={triggerScare}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'gameover' && (
        <GameOverModal
          stats={stats}
          onRestart={handleStartGame}
          onTriggerScare={triggerScare}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          focusInput();
        }}
        difficulty={difficulty}
        onSelectDifficulty={setDifficulty}
        scareState={scareState}
        onToggleScareArmed={() => {
          setScareState(prev => ({ ...prev, armed: !prev.armed }));
        }}
        onTriggerScare={triggerScare}
        isMuted={isMuted}
        onToggleMute={() => {
          sound.isMuted = !isMuted;
          setIsMuted(!isMuted);
        }}
      />

      {/* Jump Scare Fullscreen Surprise Modal */}
      <JumpScareModal
        isActive={scareState.isActive}
        onDismiss={handleDismissScare}
      />
    </div>
  );
}
