import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramThemeParams } from '../types';
import { getTelegramWebApp } from '../telegram/webapp';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
}

const defaultParams: TelegramThemeParams = {
  bg_color: '#0f172a',
  secondary_bg_color: '#1e293b',
  text_color: '#f8fafc',
  hint_color: '#94a3b8',
  link_color: '#38bdf8',
  button_color: '#2563eb',
  button_text_color: '#ffffff',
  header_bg_color: '#0f172a',
  accent_text_color: '#60a5fa'
};

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'dark',
  themeParams: defaultParams
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [themeParams, setThemeParams] = useState<TelegramThemeParams>(defaultParams);

  useEffect(() => {
    const webApp = getTelegramWebApp();

    const applyTheme = () => {
      if (webApp) {
        const scheme = webApp.colorScheme || 'dark';
        const params = webApp.themeParams || {};

        setColorScheme(scheme);

        // Fallback default colors based on scheme if Telegram params are partial
        const isDark = scheme === 'dark';
        const mergedParams: TelegramThemeParams = {
          bg_color: params.bg_color || (isDark ? '#0b1329' : '#f8fafc'),
          secondary_bg_color: params.secondary_bg_color || (isDark ? '#15203e' : '#ffffff'),
          text_color: params.text_color || (isDark ? '#f1f5f9' : '#0f172a'),
          hint_color: params.hint_color || (isDark ? '#94a3b8' : '#64748b'),
          link_color: params.link_color || (isDark ? '#38bdf8' : '#0284c7'),
          button_color: params.button_color || (isDark ? '#2563eb' : '#0284c7'),
          button_text_color: params.button_text_color || '#ffffff',
          header_bg_color: params.header_bg_color || (isDark ? '#0b1329' : '#ffffff'),
          accent_text_color: params.accent_text_color || (isDark ? '#60a5fa' : '#2563eb')
        };

        setThemeParams(mergedParams);

        // Set CSS Root Variables for global Tailwind & Glassmorphism styling
        const root = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }

        root.style.setProperty('--tg-bg-color', mergedParams.bg_color!);
        root.style.setProperty('--tg-secondary-bg-color', mergedParams.secondary_bg_color!);
        root.style.setProperty('--tg-text-color', mergedParams.text_color!);
        root.style.setProperty('--tg-hint-color', mergedParams.hint_color!);
        root.style.setProperty('--tg-link-color', mergedParams.link_color!);
        root.style.setProperty('--tg-button-color', mergedParams.button_color!);
        root.style.setProperty('--tg-button-text-color', mergedParams.button_text_color!);
        root.style.setProperty('--tg-header-bg-color', mergedParams.header_bg_color!);
        root.style.setProperty('--tg-accent-text-color', mergedParams.accent_text_color!);
      }
    };

    applyTheme();

    if (webApp) {
      const handleThemeChanged = () => {
        applyTheme();
      };
      webApp.onEvent('themeChanged', handleThemeChanged);
      return () => {
        webApp.offEvent('themeChanged', handleThemeChanged);
      };
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ colorScheme, themeParams }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
