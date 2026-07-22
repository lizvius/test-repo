import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { AzurLizeLogo } from '../components/logo/AzurLizeLogo';
import { useAuth } from '../hooks/useAuth';
import { LogIn, HelpCircle, UserCheck } from 'lucide-react';

interface ContinueLoginPageProps {
  onShowInstructions: () => void;
}

export const ContinueLoginPage: React.FC<ContinueLoginPageProps> = ({ onShowInstructions }) => {
  const { continueLogin, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const lastTgUserStr = localStorage.getItem('azurlize_last_telegram_user');
  const lastProfileStr = localStorage.getItem('azurlize_last_profile');

  let lastTgUser = null;
  let lastProfile = null;

  try {
    if (lastTgUserStr) lastTgUser = JSON.parse(lastTgUserStr);
    if (lastProfileStr) lastProfile = JSON.parse(lastProfileStr);
  } catch {
    // ignore
  }

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await continueLogin();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nameToDisplay = lastProfile?.firstName || lastTgUser?.first_name || 'Tim Rekrutmen';
  const usernameToDisplay = lastProfile?.username || lastTgUser?.username || '';
  const photoUrl = lastProfile?.photoUrl || lastTgUser?.photo_url || '';

  return (
    <div
      style={{
        backgroundColor: 'var(--tg-bg-color, #030712)',
        color: 'var(--tg-text-color, #f8fafc)'
      }}
      className="min-h-screen flex flex-col items-center justify-center p-5 text-center transition-colors duration-300 bg-mesh-gradient overflow-x-hidden"
    >
      <GlassCard className="max-w-md w-full p-6 space-y-6 border-sky-500/30 shadow-2xl">
        <div className="flex justify-center">
          <AzurLizeLogo size="lg" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Selamat Datang Kembali
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Anda sudah terdaftar dalam sistem rekrutmen <strong className="text-sky-600 dark:text-sky-400 font-bold">AzurLizeTeam</strong>. Silakan lanjutkan login untuk mengakses dasbor Anda.
          </p>
        </div>

        {/* Saved Session Info */}
        {(lastTgUser || lastProfile) && (
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-sky-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-bold text-lg">
                {(nameToDisplay[0] || 'R').toUpperCase()}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {nameToDisplay} {lastProfile?.lastName || lastTgUser?.last_name || ''}
              </span>
              {usernameToDisplay && (
                <span className="text-xs text-sky-600 dark:text-sky-400 font-medium truncate">
                  @{usernameToDisplay}
                </span>
              )}
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Sesi Terdaftar
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs p-3 rounded-2xl text-left">
            ⚠️ {error}
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <Button
            fullWidth
            isLoading={isLoading}
            onClick={handleContinue}
            icon={<LogIn className="w-4 h-4" />}
          >
            Lanjutkan Login
          </Button>

          <button
            type="button"
            onClick={onShowInstructions}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors flex items-center justify-center gap-1.5 py-1.5"
          >
            <HelpCircle className="w-4 h-4" /> Buka Petunjuk Telegram Bot
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
