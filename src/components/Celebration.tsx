import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface CelebrationProps {
  show: boolean;
  winnerName: string;
  type: 'set' | 'match';
  onComplete?: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, left, color, size }: { delay: number; left: number; color: string; size: number }) => (
  <div
    className="absolute animate-confetti-fall"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      top: '-20px',
    }}
  >
    <div
      className="animate-confetti-spin"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: size > 8 ? '2px' : '50%',
      }}
    />
  </div>
);

// Cracker burst component
const CrackerBurst = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
  >
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full animate-burst"
        style={{
          backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#E74C3C', '#3498DB'][i % 6],
          transform: `rotate(${i * 30}deg)`,
          animationDelay: `${delay + i * 0.02}s`,
        }}
      />
    ))}
  </div>
);

// Sparkle component
const Sparkle = ({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) => (
  <div
    className="absolute animate-sparkle"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
        fill="#FFD700"
      />
    </svg>
  </div>
);

export function Celebration({ show, winnerName, type, onComplete }: CelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);
  const [crackers, setCrackers] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  const { playSetWinSound, playMatchWinSound } = useSoundEffects();

  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Play celebration sound
      if (type === 'match') {
        playMatchWinSound();
      } else {
        playSetWinSound();
      }
      // Generate confetti particles
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#1ABC9C', '#E91E63'];
      const newParticles = [...Array(80)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
      }));
      setParticles(newParticles);

      // Generate cracker bursts
      const newCrackers = [...Array(8)].map((_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        delay: Math.random() * 1.5,
      }));
      setCrackers(newCrackers);

      // Generate sparkles
      const newSparkles = [...Array(20)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 80,
        delay: Math.random() * 2,
        size: Math.random() * 20 + 15,
      }));
      setSparkles(newSparkles);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, type === 'match' ? 6000 : 4000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/40 animate-fade-in",
        type === 'match' && "bg-black/60"
      )} />

      {/* Confetti particles */}
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          left={particle.left}
          delay={particle.delay}
          color={particle.color}
          size={particle.size}
        />
      ))}

      {/* Cracker bursts */}
      {crackers.map((cracker) => (
        <CrackerBurst
          key={cracker.id}
          x={cracker.x}
          y={cracker.y}
          delay={cracker.delay}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          x={sparkle.x}
          y={sparkle.y}
          delay={sparkle.delay}
          size={sparkle.size}
        />
      ))}

      {/* Winner announcement */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "text-center animate-celebration-pop",
          type === 'match' ? "scale-110" : ""
        )}>
          <div className={cn(
            "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-1 rounded-2xl shadow-2xl",
            type === 'match' && "from-green-500 via-emerald-400 to-green-500"
          )}>
            <div className="bg-background/95 backdrop-blur-sm rounded-xl px-8 py-6 md:px-16 md:py-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className={cn(
                  "h-10 w-10 md:h-14 md:w-14 animate-bounce",
                  type === 'match' ? "text-green-500" : "text-amber-500"
                )} />
                <span className={cn(
                  "font-display text-2xl md:text-4xl font-bold",
                  type === 'match' ? "text-green-500" : "text-amber-500"
                )}>
                  {type === 'match' ? '🏆 MATCH WINNER! 🏆' : '🎉 SET WON! 🎉'}
                </span>
                <Trophy className={cn(
                  "h-10 w-10 md:h-14 md:w-14 animate-bounce",
                  type === 'match' ? "text-green-500" : "text-amber-500"
                )} />
              </div>
              
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground animate-pulse">
                {winnerName}
              </h2>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎊</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎊</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎊</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
