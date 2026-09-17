export const SHORT_WORDS = [
  'byte', 'code', 'data', 'echo', 'fast', 'grid', 'hack', 'host', 'iron', 'jump',
  'kill', 'link', 'loop', 'mask', 'node', 'neon', 'path', 'ping', 'port', 'root',
  'scan', 'sync', 'task', 'time', 'user', 'void', 'warp', 'zero', 'zone', 'flux',
  'glow', 'core', 'chip', 'dash', 'edge', 'flow', 'gate', 'icon', 'lock', 'mode'
];

export const MEDIUM_WORDS = [
  'access', 'binary', 'buffer', 'cipher', 'cursor', 'domain', 'engine', 'filter',
  'glitch', 'impact', 'matrix', 'memory', 'module', 'packet', 'portal', 'prompt',
  'pulse', 'random', 'render', 'router', 'schema', 'script', 'server', 'shield',
  'signal', 'socket', 'stream', 'syntax', 'system', 'target', 'thread', 'vector',
  'vertex', 'visual', 'vortex', 'widget', 'beacon', 'charge', 'danger', 'energy'
];

export const LONG_WORDS = [
  'algorithm', 'bandwidth', 'benchmark', 'broadcast', 'cyberpunk', 'dashboard',
  'decryption', 'encryption', 'firewall', 'frequency', 'hyperlink', 'interface',
  'mainframe', 'mechanism', 'nanometer', 'processor', 'protocol', 'satellite',
  'terminal', 'synthetic', 'telemetry', 'trajectory', 'velocity', 'simulation',
  'shadowcode', 'singularity', 'hyperspace', 'quantumwave', 'neuralnetwork'
];

export const SPECIAL_WORDS = [
  { text: 'REPAIR', type: 'shield' as const, desc: '+1 Shield' },
  { text: 'DETONATE', type: 'nuke' as const, desc: 'Clear Screen' },
  { text: 'STASIS', type: 'freeze' as const, desc: 'Slow Down' },
  { text: 'DOUBLE', type: 'double' as const, desc: '2x Score' }
];

export function getRandomWord(level: number, existingTexts: Set<string>): {
  text: string;
  isSpecial: boolean;
  specialType?: 'shield' | 'nuke' | 'freeze' | 'double';
  points: number;
} {
  // 7% chance of special bonus word if level >= 2
  if (level >= 2 && Math.random() < 0.08) {
    const special = SPECIAL_WORDS[Math.floor(Math.random() * SPECIAL_WORDS.length)];
    if (!existingTexts.has(special.text.toLowerCase())) {
      return {
        text: special.text.toLowerCase(),
        isSpecial: true,
        specialType: special.type,
        points: 250
      };
    }
  }

  let pool: string[];
  if (level <= 2) {
    pool = SHORT_WORDS;
  } else if (level <= 5) {
    pool = Math.random() < 0.5 ? SHORT_WORDS : MEDIUM_WORDS;
  } else {
    const r = Math.random();
    if (r < 0.25) pool = SHORT_WORDS;
    else if (r < 0.7) pool = MEDIUM_WORDS;
    else pool = LONG_WORDS;
  }

  // Filter out already on-screen words to avoid confusion
  const available = pool.filter(w => !existingTexts.has(w.toLowerCase()));
  const candidate = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  const basePoints = candidate.length * 20;

  return {
    text: candidate.toLowerCase(),
    isSpecial: false,
    points: basePoints
  };
}
