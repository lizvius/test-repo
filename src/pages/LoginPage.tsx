import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AzurLizeLogo } from '../components/logo/AzurLizeLogo';
import { useAuth } from '../hooks/useAuth';
import { createUserProfile } from '../firebase/services/userService';
import { RegistrationFormData } from '../types';
import { User, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { telegramUser, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    whatsapp: '',
    akun9Kucing: '',
    agreedTerms: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const telegramId = telegramUser ? String(telegramUser.id) : '';
  const username = telegramUser?.username || '';
  const firstName = telegramUser?.first_name || '';
  const lastName = telegramUser?.last_name || '';
  const photoUrl = telegramUser?.photo_url || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId) {
      setError('Data Telegram tidak ditemukan.');
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
      await createUserProfile({
        telegramId,
        username,
        firstName,
        lastName,
        photoUrl,
        email: formData.email,
        whatsapp: formData.whatsapp,
        akun9Kucing: formData.akun9Kucing,
        role: 'Recruiter',
        status: 'Pending',
        approved: false
      });

      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran.');
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-2xl flex items-center gap-2">
                <span className="font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Readonly Telegram User Info Header */}
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
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Terverifikasi oleh Telegram WebApp
                </span>
              </div>
            </div>

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
        </GlassCard>
      </div>
    </div>
  );
};
