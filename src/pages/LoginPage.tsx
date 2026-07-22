import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AzurLizeLogo } from '../components/logo/AzurLizeLogo';
import { useAuth } from '../hooks/useAuth';
import { createUserProfile, getUserProfile } from '../firebase/services/userService';
import { RegistrationFormData } from '../types';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, KeyRound, UserPlus } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { telegramUser, refreshProfile } = useAuth();
  
  // Tab mode for manual entries: 'register' or 'login'
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    whatsapp: '',
    akun9Kucing: '',
    agreedTerms: false
  });

  // Manual inputs if Telegram info isn't auto-detected
  const [manualId, setManualId] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');

  // Login inputs for existing accounts
  const [loginId, setLoginId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine actual values (auto-detected has priority)
  const isAutoDetected = telegramUser !== null;
  const telegramId = isAutoDetected ? String(telegramUser.id) : manualId;
  const username = isAutoDetected ? (telegramUser?.username || '') : manualUsername;
  const firstName = isAutoDetected ? (telegramUser?.first_name || '') : manualFirstName;
  const lastName = isAutoDetected ? (telegramUser?.last_name || '') : manualLastName;
  const photoUrl = isAutoDetected ? (telegramUser?.photo_url || '') : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!telegramId.trim()) {
      setError('ID Telegram wajib diisi.');
      return;
    }

    if (!username.trim()) {
      setError('Username Telegram wajib diisi.');
      return;
    }

    if (!firstName.trim()) {
      setError('Nama Depan wajib diisi.');
      return;
    }

    if (!formData.email || !formData.whatsapp || !formData.akun9Kucing) {
      setError('Mohon isi seluruh bidang pendaftaran.');
      return;
    }

    if (!formData.agreedTerms) {
      setError('Anda wajib menyetujui syarat dan ketentuan rekrutmen.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanTelegramId = telegramId.trim();
      const cleanUsername = username.trim().replace(/^@/, '');

      // Check if profile already exists to prevent duplication
      const existingProfile = await getUserProfile(cleanTelegramId);
      if (existingProfile) {
        throw new Error('ID Telegram ini sudah terdaftar. Silakan pindah ke tab "Masuk Akun" untuk masuk.');
      }

      await createUserProfile({
        telegramId: cleanTelegramId,
        username: cleanUsername,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        photoUrl,
        email: formData.email,
        whatsapp: formData.whatsapp,
        akun9Kucing: formData.akun9Kucing,
        role: 'Recruiter',
        status: 'Pending',
        approved: false
      });

      // Save session in localStorage for standard browsers/non-detected environments
      const manualUser = {
        id: Number(cleanTelegramId),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: cleanUsername,
        photo_url: photoUrl
      };
      localStorage.setItem('azurlize_user_session', JSON.stringify(manualUser));

      // Reload to let AuthContext grab the session
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setError('Mohon masukkan ID Telegram Anda.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanLoginId = loginId.trim();
      const profile = await getUserProfile(cleanLoginId);
      
      if (!profile) {
        throw new Error('ID Telegram tidak terdaftar. Silakan mendaftar sebagai Recruiter Baru terlebih dahulu.');
      }

      // Store persistent session
      const manualUser = {
        id: Number(profile.telegramId),
        first_name: profile.firstName,
        last_name: profile.lastName || '',
        username: profile.username || '',
        photo_url: profile.photoUrl || ''
      };
      localStorage.setItem('azurlize_user_session', JSON.stringify(manualUser));

      // Reload to initialize user dashboard
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk sesi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 pb-12 pt-safe overflow-x-hidden">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <AzurLizeLogo size="lg" />
          <h1 className="text-xl font-extrabold text-white tracking-tight mt-2">
            Pendaftaran Recruiter
          </h1>
          <p className="text-xs text-slate-400">
            Lengkapi formulir di bawah untuk mendaftar sebagai tim rekrutmen AzurLize.
          </p>
        </div>

        <GlassCard className="space-y-5 border-blue-500/20">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-2xl flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Tab Selector - ONLY shown if Telegram user is NOT auto-detected */}
          {!isAutoDetected && (
            <div className="flex bg-slate-900/95 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Daftar Recruiter
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Masuk Akun
              </button>
            </div>
          )}

          {/* MODE: REGISTER */}
          {(!isAutoDetected && activeTab === 'login') ? (
            /* MODE: LOGIN MANUAL */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-[11px] text-amber-300 leading-relaxed">
                ℹ️ Masukkan ID Telegram Anda yang telah terdaftar sebelumnya untuk langsung masuk ke sesi.
              </div>

              <Input
                label="ID Telegram Anda (Hanya Angka)"
                type="text"
                placeholder="Contoh: 11223344"
                icon={<User className="w-4 h-4" />}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value.replace(/\D/g, ''))}
                required
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                icon={<KeyRound className="w-5 h-5" />}
                className="mt-4"
              >
                Masuk Sesi
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Telegram User Status Header */}
              {isAutoDetected ? (
                /* Auto-detected success card */
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Telegram Photo"
                      className="w-12 h-12 rounded-xl object-cover border border-blue-500/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-lg">
                      {(firstName[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-sm font-bold text-white truncate">
                      {firstName} {lastName}
                    </span>
                    <span className="text-xs text-sky-400 font-medium">
                      @{username || 'tanpa_username'} &bull; ID: {telegramId}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Terdeteksi Otomatis (Telegram WebApp)
                    </span>
                  </div>
                </div>
              ) : (
                /* Manual Inputs Alert & Fields */
                <div className="space-y-3.5">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl text-[11px] text-blue-300 leading-relaxed">
                    💡 Hubungkan akun Telegram Anda secara manual dengan mengisi ID dan Username Anda di bawah.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="ID Telegram (Angka)"
                      type="text"
                      placeholder="Contoh: 54123456"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    <Input
                      label="Username Telegram"
                      type="text"
                      placeholder="Contoh: ghrryuuka"
                      value={manualUsername}
                      onChange={(e) => setManualUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nama Depan"
                      type="text"
                      placeholder="Nama Depan"
                      value={manualFirstName}
                      onChange={(e) => setManualFirstName(e.target.value)}
                      required
                    />
                    <Input
                      label="Nama Belakang"
                      type="text"
                      placeholder="Nama Belakang (Opsional)"
                      value={manualLastName}
                      onChange={(e) => setManualLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* User Input Fields */}
              <Input
                label="Email Aktif"
                type="email"
                placeholder="nama@email.com"
                icon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Nomor WhatsApp"
                type="tel"
                placeholder="081234567890"
                icon={<Phone className="w-4 h-4" />}
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
              />

              <Input
                label="UID / Akun 9Kucing"
                type="text"
                placeholder="Masukkan ID / Akun 9Kucing"
                icon={<User className="w-4 h-4" />}
                value={formData.akun9Kucing}
                onChange={(e) => setFormData({ ...formData, akun9Kucing: e.target.value })}
                required
              />

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.agreedTerms}
                  onChange={(e) => setFormData({ ...formData, agreedTerms: e.target.checked })}
                  className="mt-0.5 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Saya menyetujui seluruh <span className="text-blue-400 font-semibold">syarat & ketentuan</span> sebagai tim rekrutmen AzurLizeTeam.
                </span>
              </label>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                icon={<ShieldCheck className="w-5 h-5" />}
                className="mt-4"
              >
                Kirim Pendaftaran
              </Button>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
