import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // 다크모드 컬러
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#0f0f23',
      surface: '#1a1a2e',
      card: '#16213e',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: '#2d3748',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    } : {
      // 라이트모드 컬러
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#f8fafc',
      surface: '#ffffff',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 