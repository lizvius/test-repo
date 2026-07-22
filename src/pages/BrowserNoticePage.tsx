import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { AzurLizeLogo } from '../components/logo/AzurLizeLogo';
import { Button } from '../components/common/Button';

export const BrowserNoticePage: React.FC = () => {
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

        <div className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-500 dark:text-sky-400 text-3xl">
          📱
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Akses Khusus Telegram Bot
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Aplikasi rekrutmen <strong className="text-sky-600 dark:text-sky-400 font-bold">AzurLizeTeam</strong> dikhususkan untuk dibuka melalui Telegram Mini App dari Bot resmi kami.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
          <p className="font-bold text-slate-700 dark:text-slate-200">Cara Membuka Aplikasi:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <li>Buka aplikasi Telegram di perangkat Anda.</li>
            <li>Cari Bot Rekrutmen <strong className="text-sky-600 dark:text-sky-400 font-bold">@azurlize_recruitment_bot</strong></li>
            <li>Tekan tombol <strong className="text-sky-600 dark:text-sky-400 font-bold">"Buka Web App"</strong> atau kirim perintah <code className="text-amber-600 dark:text-amber-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">/app</code></li>
          </ol>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <Button
            fullWidth
            onClick={() => {
              window.location.href = 'https://t.me/azurlize_recruitment_bot';
            }}
          >
            Buka Telegram
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => {
              localStorage.setItem('azurlize_manual_mode', 'true');
              window.location.reload();
            }}
          >
            Masuk / Daftar Manual (Tanpa Bot)
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <p className="text-[10px] font-black tracking-widest text-sky-400 uppercase">
            🧪 Mode Simulasi & Pengujian
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const mockUser = {
                  id: 11223344,
                  first_name: 'Owner',
                  last_name: 'AzurLize',
                  username: 'owner_azurlize',
                  photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                };
                localStorage.setItem('azurlize_simulated_user', JSON.stringify(mockUser));
                localStorage.setItem('azurlize_simulated_role', 'Owner');
                window.location.reload();
              }}
              className="py-2.5 px-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[11px] font-bold tracking-wide transition-all cursor-pointer"
            >
              Simulasi Owner
            </button>

            <button
              onClick={() => {
                const mockUser = {
                  id: 88776655,
                  first_name: 'Admin',
                  last_name: 'AzurLize',
                  username: 'admin_azurlize',
                  photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
                };
                localStorage.setItem('azurlize_simulated_user', JSON.stringify(mockUser));
                localStorage.setItem('azurlize_simulated_role', 'Admin');
                window.location.reload();
              }}
              className="py-2.5 px-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold tracking-wide transition-all cursor-pointer"
            >
              Simulasi Admin
            </button>
          </div>

          <button
            onClick={() => {
              const mockUser = {
                id: Math.floor(10000000 + Math.random() * 90000000),
                first_name: 'Recruiter',
                last_name: 'Simulasi',
                username: `recruiter_${Math.floor(Math.random() * 1000)}`
              };
              localStorage.setItem('azurlize_simulated_user', JSON.stringify(mockUser));
              localStorage.removeItem('azurlize_simulated_role'); // Force manual registration
              window.location.reload();
            }}
            className="w-full py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-[11px] font-semibold transition-all cursor-pointer"
          >
            Simulasikan Pendaftaran Recruiter Baru &rarr;
          </button>
          
          <p className="text-[10px] text-slate-500 leading-normal">
            Gunakan tombol simulasi untuk masuk dan menguji sistem langsung dari iframe preview AI Studio.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
