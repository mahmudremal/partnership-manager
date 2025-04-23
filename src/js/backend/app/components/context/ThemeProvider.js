import React, { useState, useEffect, createContext, useContext } from 'react';
import { useSession } from '@context/SessionProvider';
const ThemeContext = createContext();

export default function ThemeProvider({ children, initial = {} }) {
  const { session, setSession } = useSession();
  const [theme, setTheme] = useState(null);

  const changeTheme = () => {
    const newMode = (!theme && session?.themeMode) ? session.themeMode : theme === 'dark' ? 'light' : 'dark';
    setSession(prev => ({ ...prev, themeMode: newMode }));setTheme(newMode);
    document.querySelector('html').dataset.theme = newMode;
  }

  return (
    <ThemeContext.Provider value={{ theme, switchTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
