import { useState, useCallback, useRef, useEffect } from 'react';

interface BlinkStats {
  totalBlinks: number;
  sessionBlinks: number;
  blinkRate: number; // blinks per minute
  monitorTime: number; // seconds
  lastBlinkTime: number | null;
  timeSinceLastBlink: number; // seconds
  blinkHistory: { time: number; count: number }[];
}

interface UseBlinkStatsOptions {
  alertInterval?: number; // seconds without blink to trigger alert
  onAlert?: () => void;
}

export function useBlinkStats(options: UseBlinkStatsOptions = {}) {
  const { alertInterval = 10, onAlert } = options;

  const [stats, setStats] = useState<BlinkStats>({
    totalBlinks: 0,
    sessionBlinks: 0,
    blinkRate: 0,
    monitorTime: 0,
    lastBlinkTime: null,
    timeSinceLastBlink: 0,
    blinkHistory: [],
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const blinkTimesRef = useRef<number[]>([]);
  const alertTriggeredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    startTimeRef.current = Date.now();
    alertTriggeredRef.current = false;

    // Update stats every second
    intervalRef.current = setInterval(() => {
      setStats((prev) => {
        const now = Date.now();
        const monitorTime = startTimeRef.current
          ? Math.floor((now - startTimeRef.current) / 1000)
          : 0;

        const timeSinceLastBlink = prev.lastBlinkTime
          ? Math.floor((now - prev.lastBlinkTime) / 1000)
          : monitorTime;

        // Check for alert
        if (timeSinceLastBlink >= alertInterval && !alertTriggeredRef.current && prev.sessionBlinks > 0) {
          alertTriggeredRef.current = true;
          onAlert?.();
        } else if (timeSinceLastBlink < alertInterval) {
          alertTriggeredRef.current = false;
        }

        // Calculate blink rate (last 60 seconds)
        const recentBlinks = blinkTimesRef.current.filter(
          (t) => now - t < 60000
        ).length;
        const blinkRate = recentBlinks;

        // Update blink history (every 30 seconds)
        let blinkHistory = prev.blinkHistory;
        if (monitorTime % 30 === 0 && monitorTime > 0) {
          const lastEntry = blinkHistory[blinkHistory.length - 1];
          if (!lastEntry || lastEntry.time !== monitorTime) {
            blinkHistory = [...blinkHistory, { time: monitorTime, count: prev.sessionBlinks }];
            // Keep only last 20 entries
            if (blinkHistory.length > 20) {
              blinkHistory = blinkHistory.slice(-20);
            }
          }
        }

        return {
          ...prev,
          monitorTime,
          timeSinceLastBlink,
          blinkRate,
          blinkHistory,
        };
      });
    }, 1000);
  }, [alertInterval, onAlert]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    blinkTimesRef.current = [];
  }, []);

  // Record a blink
  const recordBlink = useCallback(() => {
    const now = Date.now();
    blinkTimesRef.current.push(now);

    // Clean up old blink times (older than 2 minutes)
    blinkTimesRef.current = blinkTimesRef.current.filter(
      (t) => now - t < 120000
    );

    setStats((prev) => ({
      ...prev,
      totalBlinks: prev.totalBlinks + 1,
      sessionBlinks: prev.sessionBlinks + 1,
      lastBlinkTime: now,
      timeSinceLastBlink: 0,
    }));

    // Reset alert
    alertTriggeredRef.current = false;
  }, []);

  // Reset session stats
  const resetSession = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      sessionBlinks: 0,
      monitorTime: 0,
      lastBlinkTime: null,
      timeSinceLastBlink: 0,
      blinkHistory: [],
    }));
    blinkTimesRef.current = [];
    alertTriggeredRef.current = false;
    if (startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Load total blinks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('blinkguard-total-blinks');
    if (saved) {
      setStats((prev) => ({
        ...prev,
        totalBlinks: parseInt(saved, 10) || 0,
      }));
    }
  }, []);

  // Save total blinks to localStorage
  useEffect(() => {
    if (stats.totalBlinks > 0) {
      localStorage.setItem('blinkguard-total-blinks', stats.totalBlinks.toString());
    }
  }, [stats.totalBlinks]);

  return {
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    recordBlink,
    resetSession,
  };
}

export type { BlinkStats };
