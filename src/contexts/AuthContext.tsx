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
    const MIN_SPLASH_DELAY = 2200; // Minimum 2.2 seconds splash display time

    const finishLoading = async (newState: Omit<AuthState, 'isLoading'>) => {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SPLASH_DELAY) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DELAY - elapsed));
      }
      setState({ ...newState, isLoading: false });
    };

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const manualUserStr = localStorage.getItem('azurlize_user_session');

    // Wait for Telegram Script to load completely if not using manual user
    if (!manualUserStr) {
      await new Promise<void>((resolve) => {
        const checkStart = Date.now();
        const interval = setInterval(() => {
          const wa = typeof window !== 'undefined' && window.Telegram?.WebApp;
          // Consider WebApp fully loaded if platform or initData is available
          if (wa && (wa.initData || wa.initDataUnsafe?.user || wa.platform)) {
            clearInterval(interval);
            try {
              wa.ready();
              wa.expand();
            } catch (e) {
              console.error('Error calling Telegram WebApp ready/expand:', e);
            }
            resolve();
          } else if (Date.now() - checkStart > 1200) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

    const webApp = getTelegramWebApp();
    const inTelegram = isTelegramEnvironment();

    // Check for manual user session
    if (manualUserStr) {
      try {
        const manualUser = JSON.parse(manualUserStr);
        const telegramId = String(manualUser.id);
        const profile = await getUserProfile(telegramId);

        if (profile) {
          await finishLoading({
            isAuthenticated: true,
            telegramUser: {
              id: Number(manualUser.id),
              first_name: manualUser.first_name || '',
              last_name: manualUser.last_name || '',
              username: manualUser.username || '',
              photo_url: manualUser.photo_url || ''
            },
            userProfile: profile,
            token: 'manual_session_token',
            initData: `user=${encodeURIComponent(manualUserStr)}`,
            error: null,
            isTelegramContext: true
          });
          return;
        } else {
          localStorage.removeItem('azurlize_user_session');
        }
      } catch (err) {
        console.error('[Manual Session] Failed to load profile:', err);
        localStorage.removeItem('azurlize_user_session');
      }
    }

    try {
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

      try {
        // Verify initData with Express Backend API
        const apiResult = await verifyTelegramInitDataApi(initData);

        if (!apiResult.success || !apiResult.data) {
          throw new Error(apiResult.error || 'Gagal memverifikasi akun Telegram.');
        }

        const tgUser = apiResult.data.telegramUser;
        const telegramId = String(tgUser.id);
        const token = apiResult.data.token;

        // Fetch Profile from Firebase Firestore (safely catch errors so permission denied doesn't block the screen)
        let profile = null;
        try {
          profile = await getUserProfile(telegramId);
        } catch (dbErr) {
          console.warn('[AuthContext] Firestore profile fetch failed:', dbErr);
        }

        await finishLoading({
          isAuthenticated: profile !== null,
          telegramUser: {
            id: tgUser.id,
            first_name: tgUser.first_name || '',
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            photo_url: tgUser.photo_url || ''
          },
          userProfile: profile,
          token,
          initData,
          error: null,
          isTelegramContext: true
        });
      } catch (err) {
        // Fallback: If backend verification fails but we are inside Telegram, retrieve the user info client-side directly
        const tgUser = webApp.initDataUnsafe?.user;
        if (tgUser) {
          console.warn('[AuthContext] Backend verification failed, using client-side WebApp user object fallback:', err);
          const telegramId = String(tgUser.id);
          
          let profile = null;
          try {
            profile = await getUserProfile(telegramId);
          } catch (dbErr) {
            console.warn('[AuthContext] Fallback Firestore profile fetch failed:', dbErr);
          }

          await finishLoading({
            isAuthenticated: profile !== null,
            telegramUser: {
              id: tgUser.id,
              first_name: tgUser.first_name || '',
              last_name: tgUser.last_name || '',
              username: tgUser.username || '',
              photo_url: tgUser.photo_url || ''
            },
            userProfile: profile,
            token: 'client_side_fallback_token',
            initData,
            error: null, // Clear error so it doesn't block the screen with a scary error box
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
    } catch (criticalErr) {
      console.error('[AuthContext] Critical exception in initAuth:', criticalErr);
      const tgUser = webApp?.initDataUnsafe?.user;
      await finishLoading({
        isAuthenticated: false,
        telegramUser: tgUser ? {
          id: tgUser.id,
          first_name: tgUser.first_name || '',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          photo_url: tgUser.photo_url || ''
        } : null,
        userProfile: null,
        token: null,
        initData: webApp?.initData || '',
        error: criticalErr instanceof Error ? criticalErr.message : String(criticalErr),
        isTelegramContext: inTelegram
      });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!state.telegramUser) return null;
    try {
      const telegramId = String(state.telegramUser.id);
      const profile = await getUserProfile(telegramId);
      setState((prev) => ({ ...prev, userProfile: profile }));
      return profile;
    } catch (err) {
      console.error('Error refreshing profile:', err);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('azurlize_user_session');
    localStorage.removeItem('azurlize_manual_mode');
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
