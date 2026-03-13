import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeColor = 
  | 'indigo' 
  | 'emerald' 
  | 'rose' 
  | 'amber' 
  | 'cyan' 
  | 'violet' 
  | 'orange' 
  | 'pink';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  defaultColor?: ThemeColor;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light';
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

const themeColorMap: Record<ThemeColor, { primary: string; primaryDark: string; primaryLight: string }> = {
  indigo: { primary: '239 84% 67%', primaryDark: '239 70% 55%', primaryLight: '239 90% 77%' },
  emerald: { primary: '160 84% 39%', primaryDark: '160 70% 30%', primaryLight: '160 90% 50%' },
  rose: { primary: '350 89% 60%', primaryDark: '350 80% 50%', primaryLight: '350 95% 70%' },
  amber: { primary: '38 92% 50%', primaryDark: '38 85% 40%', primaryLight: '38 95% 60%' },
  cyan: { primary: '189 94% 43%', primaryDark: '189 85% 35%', primaryLight: '189 95% 55%' },
  violet: { primary: '258 90% 66%', primaryDark: '258 80% 55%', primaryLight: '258 95% 75%' },
  orange: { primary: '24 95% 53%', primaryDark: '24 85% 45%', primaryLight: '24 95% 65%' },
  pink: { primary: '330 81% 60%', primaryDark: '330 70% 50%', primaryLight: '330 90% 70%' },
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultColor = 'indigo',
  storageKey = 'blinkguard-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`${storageKey}-mode`) as ThemeMode) || defaultTheme;
    }
    return defaultTheme;
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`${storageKey}-color`) as ThemeColor) || defaultColor;
    }
    return defaultColor;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  // Apply theme color CSS variables
  const applyThemeColor = (color: ThemeColor) => {
    const colors = themeColorMap[color];
    const root = window.document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--primary-light', colors.primaryLight);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let resolved: 'dark' | 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);
    applyThemeColor(themeColor);

    if (theme !== 'system') {
      localStorage.setItem(`${storageKey}-mode`, theme);
    }
    localStorage.setItem(`${storageKey}-color`, themeColor);
  }, [theme, themeColor]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = mediaQuery.matches ? 'dark' : 'light';
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (newTheme !== 'system') {
      localStorage.setItem(`${storageKey}-mode`, newTheme);
    }
  };

  const setThemeColor = (newColor: ThemeColor) => {
    setThemeColorState(newColor);
    localStorage.setItem(`${storageKey}-color`, newColor);
    applyThemeColor(newColor);
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme,
    themeColor,
    setThemeColor,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
