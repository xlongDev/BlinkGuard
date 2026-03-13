import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioAlertOptions {
  enabled?: boolean;
  volume?: number;
}

export function useAudioAlert(options: UseAudioAlertOptions = {}) {
  const { enabled = true, volume = 0.5 } = options;

  const [isEnabled, setIsEnabled] = useState(enabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync state with prop
  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play gentle reminder sound
  const playAlert = useCallback(() => {
    if (!isEnabled) return;

    try {
      const ctx = initAudioContext();
      if (!ctx) return;

      // Create oscillator for a gentle chime
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Gentle chime sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5

      // Volume envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      // Second note for a pleasant chord
      const oscillator2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(ctx.destination);

      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator2.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5

      gainNode2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + 0.15);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      oscillator2.start(ctx.currentTime + 0.1);
      oscillator2.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.error('Audio alert error:', err);
    }
  }, [isEnabled, volume, initAudioContext]);

  // Play blink confirmation sound (very subtle)
  const playBlinkSound = useCallback(() => {
    if (!isEnabled) return;

    try {
      const ctx = initAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.05, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (err) {
      console.error('Blink sound error:', err);
    }
  }, [isEnabled, volume, initAudioContext]);

  // Toggle enabled state
  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  // Set enabled state
  const setEnabled = useCallback((value: boolean) => {
    setIsEnabled(value);
  }, []);

  return {
    isEnabled,
    toggleEnabled,
    setEnabled,
    playAlert,
    playBlinkSound,
  };
}
