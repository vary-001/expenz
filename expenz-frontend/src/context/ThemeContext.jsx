// src/context/ThemeContext.jsx
import React, { createContext, useEffect, useState, useCallback } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('expenz_theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('expenz_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const setSpecificTheme = useCallback((t) => {
    if (t === 'light' || t === 'dark') setTheme(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setSpecificTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};