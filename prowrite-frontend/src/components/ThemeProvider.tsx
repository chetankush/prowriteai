import { ReactNode } from 'react';
import { useThemeProvider, ThemeContext } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, resolvedTheme, setTheme, ThemeContext: Context } = useThemeProvider();

  return (
    <Context.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </Context.Provider>
  );
}
