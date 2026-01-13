import { useCallback, useRef } from 'react';

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export function useSoundEffects() {
  const lastPlayTime = useRef(0);

  // Play a beep/tone sound
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    try {
      const ctx = getAudioContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Fade in and out for smoother sound
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio playback not available');
    }
  }, []);

  // Score increment sound - short upward beep
  const playScoreSound = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayTime.current < 100) return; // Debounce
    lastPlayTime.current = now;
    
    playTone(880, 0.1, 'sine', 0.2); // A5 note
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.25), 50); // Higher note
  }, [playTone]);

  // Score decrement sound - short downward beep
  const playDecrementSound = useCallback(() => {
    playTone(440, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(330, 0.15, 'sine', 0.1), 50);
  }, [playTone]);

  // Set win fanfare - ascending melody
  const playSetWinSound = useCallback(() => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'triangle', 0.3), i * 100);
    });
  }, [playTone]);

  // Match win celebration - grand fanfare
  const playMatchWinSound = useCallback(() => {
    // First fanfare
    const fanfare1 = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
    fanfare1.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'triangle', 0.35), i * 120);
    });
    
    // Victory chord
    setTimeout(() => {
      playTone(523, 0.8, 'triangle', 0.2); // C5
      playTone(659, 0.8, 'triangle', 0.2); // E5
      playTone(784, 0.8, 'triangle', 0.2); // G5
      playTone(1047, 0.8, 'triangle', 0.25); // C6
    }, 700);

    // Final flourish
    setTimeout(() => {
      [1319, 1568, 2093].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 80);
      });
    }, 1500);
  }, [playTone]);

  // Button click sound
  const playClickSound = useCallback(() => {
    playTone(600, 0.05, 'sine', 0.1);
  }, [playTone]);

  // Error/invalid action sound
  const playErrorSound = useCallback(() => {
    playTone(200, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.1), 100);
  }, [playTone]);

  // Match start whistle sound
  const playStartSound = useCallback(() => {
    // Whistle-like sound using high frequency
    playTone(2000, 0.3, 'sine', 0.2);
    setTimeout(() => playTone(2500, 0.5, 'sine', 0.25), 200);
  }, [playTone]);

  return {
    playScoreSound,
    playDecrementSound,
    playSetWinSound,
    playMatchWinSound,
    playClickSound,
    playErrorSound,
    playStartSound,
  };
}
