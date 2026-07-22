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

    try {
      // Verify initData with Express Backend API
      const apiResult = await verifyTelegramInitDataApi(initData);

      if (!apiResult.success || !apiResult.data) {
        throw new Error(apiResult.error || 'Gagal memverifikasi akun Telegram.');
      }

      const tgUser = apiResult.data.telegramUser;
      const telegramId = String(tgUser.id);
      const token = apiResult.data.token;

      // Fetch Profile from Firebase Firestore
      const profile = await getUserProfile(telegramId);

      await finishLoading({
        isAuthenticated: true,
        telegramUser: {
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url
        },
        userProfile: profile,
        token,
        initData,
        error: null,
        isTelegramContext: true
      });
    } catch (err) {
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
