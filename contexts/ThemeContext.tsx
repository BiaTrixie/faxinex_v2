import React, { createContext, useContext, useState, ReactNode } from 'react';
import Colors from '@/constants/Colors';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  colors: typeof Colors.light;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  colors: Colors.light,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const colors = theme === 'light' ? Colors.light : Colors.dark;

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}