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

    // Support browser-based simulation testing for AI Studio preview / standard browser
    const simulatedUserStr = localStorage.getItem('azurlize_simulated_user');

    // Wait for Telegram Script to load completely if not using simulated user
    if (!simulatedUserStr) {
      await new Promise<void>((resolve) => {
        const checkStart = Date.now();
        const interval = setInterval(() => {
          const wa = typeof window !== 'undefined' && window.Telegram?.WebApp;
          // Consider WebApp fully loaded if platform or initData is available
          if (wa && (wa.initData || wa.initDataUnsafe?.user || wa.platform)) {
            clearInterval(interval);
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


    if (!inTelegram && simulatedUserStr) {
      try {
        const simulatedUser = JSON.parse(simulatedUserStr);
        const telegramId = String(simulatedUser.id);
        let profile = await getUserProfile(telegramId);

        const simulatedRole = localStorage.getItem('azurlize_simulated_role');
        if (!profile && simulatedRole) {
          const { createUserProfile } = await import('../firebase/services/userService');
          profile = await createUserProfile({
            telegramId,
            firstName: simulatedUser.first_name,
            lastName: simulatedUser.last_name || '',
            username: simulatedUser.username || '',
            email: `${simulatedUser.username || 'user'}@azurlizeteam.com`,
            whatsapp: '081234567890',
            akun9Kucing: '123456',
            role: simulatedRole as 'Owner' | 'Admin' | 'Recruiter',
            status: 'Active',
            approved: true,
            photoUrl: simulatedUser.photo_url || ''
          });
        }

        await finishLoading({
          isAuthenticated: true,
          telegramUser: {
            id: simulatedUser.id,
            first_name: simulatedUser.first_name,
            last_name: simulatedUser.last_name || '',
            username: simulatedUser.username || 'recruiter_simulasi',
            photo_url: simulatedUser.photo_url || ''
          },
          userProfile: profile,
          token: 'simulated_jwt_token_for_preview',
          initData: `query_id=simulated_query_id&user=${encodeURIComponent(simulatedUserStr)}`,
          error: null,
          isTelegramContext: true
        });
        return;
      } catch (err) {
        console.error('[Preview Simulation] Failed to load mock profile:', err);
      }
    }

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

    let initData = webApp.initData;

    // Fallback: Construct synthetic initData if standard initData is empty but initDataUnsafe.user is populated
    if ((!initData || initData.trim() === '') && webApp.initDataUnsafe?.user) {
      const userObj = webApp.initDataUnsafe.user;
      const userParam = encodeURIComponent(JSON.stringify(userObj));
      initData = `user=${userParam}&hash=synthetic_hash_fallback_development`;
    }

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
    localStorage.removeItem('azurlize_simulated_user');
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
