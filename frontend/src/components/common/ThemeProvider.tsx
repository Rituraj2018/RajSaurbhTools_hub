import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Reads stored theme from localStorage, defaults to 'dark' (existing appearance).
 */
const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // SSR / private browsing — ignore
  }
  return 'dark';
};

/**
 * Applies the correct class to <html> and persists choice.
 */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Enable transition briefly for smooth switch
  root.classList.add('theme-transition');

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Private browsing — ignore
  }

  // Remove transition class after animation completes to avoid
  // transition delays on normal interactions
  const timeout = setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 350);

  return () => clearTimeout(timeout);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme on mount and changes
  useEffect(() => {
    const cleanup = applyTheme(theme);
    return cleanup;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
