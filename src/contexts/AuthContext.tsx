import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthState, TelegramUser, UserProfile } from '../types';
import { getTelegramWebApp, isTelegramEnvironment } from '../telegram/webapp';
import { verifyTelegramInitDataApi } from '../services/api';
import { getUserProfile } from '../firebase/services/userService';

interface AuthContextType extends AuthState {
  refreshProfile: () => Promise<UserProfile | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Promise timeout helper to prevent hanging on slow network or unconfigured database
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn(`[Timeout] Operation timed out after ${ms}ms, returning fallback.`);
      resolve(fallback);
    }, ms))
  ]);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    telegramUser: null,
    userProfile: null,
    token: null,
    initData: '',
    error: null,
    isTelegramContext: false
  });

  const initAuth = useCallback(async () => {
    const startTime = Date.now();
    const MIN_SPLASH_DELAY = 150; // Super fast splash screen (0.15 seconds max delay if loaded)

    const finishLoading = async (newState: Omit<AuthState, 'isLoading'>) => {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SPLASH_DELAY) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DELAY - elapsed));
      }
      setState({ ...newState, isLoading: false });
    };

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Wait for Telegram Script to load completely (optimized and fast check)
    const immediateWa = typeof window !== 'undefined' && window.Telegram?.WebApp;
    if (immediateWa && (immediateWa.initData || immediateWa.initDataUnsafe?.user || immediateWa.platform)) {
      try {
        immediateWa.ready();
        immediateWa.expand();
      } catch (e) {
        console.error('Error calling Telegram WebApp ready/expand:', e);
      }
    } else {
      await new Promise<void>((resolve) => {
        const checkStart = Date.now();
        const interval = setInterval(() => {
          const wa = typeof window !== 'undefined' && window.Telegram?.WebApp;
          if (wa && (wa.initData || wa.initDataUnsafe?.user || wa.platform)) {
            clearInterval(interval);
            try {
              wa.ready();
              wa.expand();
            } catch (e) {
              console.error('Error calling Telegram WebApp ready/expand:', e);
            }
            resolve();
          } else if (Date.now() - checkStart > 200) { // Reduced script wait timeout
            clearInterval(interval);
            resolve();
          }
        }, 15);
      });
    }

    const webApp = getTelegramWebApp();
    const inTelegram = isTelegramEnvironment();

    if (!inTelegram || !webApp) {
      await finishLoading({
        isAuthenticated: false,
        telegramUser: null,
        userProfile: null,
        token: null,
        initData: '',
        error: null,
        isTelegramContext: false
      });
      return;
    }

    const initData = webApp.initData;
    const tgUser = webApp.initDataUnsafe?.user;

    // SWR Cache: Instantly retrieve from localStorage cache for instant UI response
    let cachedProfile: UserProfile | null = null;
    if (tgUser) {
      const cachedProfileStr = localStorage.getItem(`azurlize_profile_${tgUser.id}`);
      if (cachedProfileStr) {
        try {
          cachedProfile = JSON.parse(cachedProfileStr);
        } catch {
          // ignore
        }
      }
    }

    // Fast-path: If cache is found, render the page IMMEDIATELY
    if (tgUser && cachedProfile) {
      console.log('[AuthContext] SWR Cache found. Rendering instantly:', cachedProfile);
      setState({
        isAuthenticated: true,
        telegramUser: {
          id: tgUser.id,
          first_name: tgUser.first_name || '',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          photo_url: tgUser.photo_url || ''
        },
        userProfile: cachedProfile,
        token: localStorage.getItem(`azurlize_token_${tgUser.id}`) || 'cached_token',
        initData,
        error: null,
        isTelegramContext: true,
        isLoading: false
      });

      // Silently verify and revalidate in the background
      try {
        const apiResult = await withTimeout(verifyTelegramInitDataApi(initData), 1500, { success: false, error: 'Timeout' });
        if (apiResult.success && apiResult.data) {
          const freshTgUser = apiResult.data.telegramUser;
          const freshToken = apiResult.data.token;
          const telegramId = String(freshTgUser.id);

          localStorage.setItem(`azurlize_token_${freshTgUser.id}`, freshToken);

          const freshProfile = await withTimeout(getUserProfile(telegramId), 800, cachedProfile);
          if (freshProfile) {
            localStorage.setItem(`azurlize_profile_${freshTgUser.id}`, JSON.stringify(freshProfile));
          }

          setState((prev) => ({
            ...prev,
            telegramUser: {
              id: freshTgUser.id,
              first_name: freshTgUser.first_name || '',
              last_name: freshTgUser.last_name || '',
              username: freshTgUser.username || '',
              photo_url: freshTgUser.photo_url || ''
            },
            userProfile: freshProfile,
            token: freshToken,
            isAuthenticated: freshProfile !== null
          }));
        }
      } catch (bgErr) {
        console.warn('[AuthContext] Background revalidation failed, using cached profile:', bgErr);
      }
      return;
    }

    // Default-path (No Cache): Fast API call + Fast Firestore request with quick timeout limits
    try {
      const apiResult = await withTimeout(verifyTelegramInitDataApi(initData), 1500, { success: false, error: 'Timeout' });

      if (apiResult.success && apiResult.data) {
        const freshTgUser = apiResult.data.telegramUser;
        const telegramId = String(freshTgUser.id);
        const token = apiResult.data.token;

        let profile = null;
        try {
          profile = await withTimeout(getUserProfile(telegramId), 800, null);
        } catch (dbErr) {
          console.warn('[AuthContext] Firestore profile fetch failed:', dbErr);
        }

        // Cache for subsequent fast logins
        if (profile) {
          localStorage.setItem(`azurlize_profile_${freshTgUser.id}`, JSON.stringify(profile));
        }
        localStorage.setItem(`azurlize_token_${freshTgUser.id}`, token);

        await finishLoading({
          isAuthenticated: profile !== null,
          telegramUser: {
            id: freshTgUser.id,
            first_name: freshTgUser.first_name || '',
            last_name: freshTgUser.last_name || '',
            username: freshTgUser.username || '',
            photo_url: freshTgUser.photo_url || ''
          },
          userProfile: profile,
          token,
          initData,
          error: null,
          isTelegramContext: true
        });
      } else {
        throw new Error(apiResult.error || 'Gagal memverifikasi akun Telegram.');
      }
    } catch (err) {
      // Direct Fallback if API fails: try using local user client-side info immediately
      const fallbackTgUser = webApp.initDataUnsafe?.user;
      if (fallbackTgUser) {
        console.warn('[AuthContext] API verification failed, using client fallback:', err);
        const telegramId = String(fallbackTgUser.id);

        let profile = null;
        try {
          profile = await withTimeout(getUserProfile(telegramId), 800, null);
        } catch (dbErr) {
          console.warn('[AuthContext] Fallback Firestore profile fetch failed:', dbErr);
        }

        if (profile) {
          localStorage.setItem(`azurlize_profile_${fallbackTgUser.id}`, JSON.stringify(profile));
        }

        await finishLoading({
          isAuthenticated: profile !== null,
          telegramUser: {
            id: fallbackTgUser.id,
            first_name: fallbackTgUser.first_name || '',
            last_name: fallbackTgUser.last_name || '',
            username: fallbackTgUser.username || '',
            photo_url: fallbackTgUser.photo_url || ''
          },
          userProfile: profile,
          token: 'client_side_fallback_token',
          initData,
          error: null,
          isTelegramContext: true
        });
      } else {
        await finishLoading({
          isAuthenticated: false,
          telegramUser: null,
          userProfile: null,
          token: null,
          initData,
          error: err instanceof Error ? err.message : 'Terjadi kesalahan otentikasi Telegram.',
          isTelegramContext: true
        });
      }
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!state.telegramUser) return null;
    try {
      const telegramId = String(state.telegramUser.id);
      const profile = await withTimeout(getUserProfile(telegramId), 1200, state.userProfile);

      if (profile) {
        localStorage.setItem(`azurlize_profile_${telegramId}`, JSON.stringify(profile));
      } else {
        localStorage.removeItem(`azurlize_profile_${telegramId}`);
      }

      setState((prev) => ({ ...prev, userProfile: profile }));
      return profile;
    } catch (err) {
      console.error('Error refreshing profile:', err);
      return null;
    }
  };

  const logout = () => {
    if (state.telegramUser) {
      const telegramId = String(state.telegramUser.id);
      localStorage.removeItem(`azurlize_profile_${telegramId}`);
      localStorage.removeItem(`azurlize_token_${telegramId}`);
    }
    setState({
      isAuthenticated: false,
      isLoading: false,
      telegramUser: null,
      userProfile: null,
      token: null,
      initData: '',
      error: null,
      isTelegramContext: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        refreshProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
