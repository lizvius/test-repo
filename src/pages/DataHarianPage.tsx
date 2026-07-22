import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/common/GlassCard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../hooks/useAuth';
import { DailyReportFormData } from '../types';
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Phone, 
  Hash, 
  Send, 
  MessageSquare, 
  Users, 
  Globe, 
  Share2, 
  AtSign, 
  FileSpreadsheet,
  Zap,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

// Channel Platforms with Icons
const CHANNELS = [
  { id: 'Facebook', label: 'FB (Facebook)', color: 'bg-blue-600/20 border-blue-500/40 text-blue-400', activeBg: 'bg-blue-600 text-white' },
  { id: 'X (Twitter)', label: 'X (Twitter)', color: 'bg-slate-700/30 border-slate-600/40 text-slate-300', activeBg: 'bg-slate-200 text-slate-900' },
  { id: 'Threads', label: 'Threads', color: 'bg-zinc-800/40 border-zinc-700/50 text-zinc-300', activeBg: 'bg-zinc-100 text-zinc-950' },
  { id: 'Instagram', label: 'Instagram', color: 'bg-pink-600/20 border-pink-500/40 text-pink-400', activeBg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { id: 'TikTok', label: 'TikTok', color: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300', activeBg: 'bg-cyan-500 text-slate-950' },
  { id: 'LinkedIn', label: 'LinkedIn', color: 'bg-sky-700/20 border-sky-600/40 text-sky-400', activeBg: 'bg-sky-600 text-white' },
  { id: 'Telegram', label: 'Telegram', color: 'bg-sky-500/20 border-sky-400/40 text-sky-300', activeBg: 'bg-sky-500 text-white' },
  { id: 'WhatsApp', label: 'WhatsApp', color: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400', activeBg: 'bg-emerald-600 text-white' },
  { id: 'Lainnya', label: 'Lainnya', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', activeBg: 'bg-emerald-600 text-white' },
];

export const DataHarianPage: React.FC = () => {
  const { userProfile, telegramUser } = useAuth();
  const { reports, submitReport, isLoading } = useReports();

  const telegramId = userProfile?.telegramId || String(telegramUser?.id || '');
  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-set recruiter username
  const autoRecruiterUsername = userProfile?.username 
    ? `@${userProfile.username.replace(/^@/, '')}`
    : telegramUser?.username
    ? `@${telegramUser.username.replace(/^@/, '')}`
    : userProfile?.firstName
    ? userProfile.firstName
    : 'Recruiter';

  // Latest user reports
  const userReports = reports.filter((r) => r.telegramId === telegramId);
  const latestReport = userReports.length > 0 ? userReports[0] : null;

  // Check if submitted report today
  const hasReportToday = userReports.some((r) => r.date === todayStr);

  // Form State initialized with auto set values
  const [formData, setFormData] = useState<DailyReportFormData>({
    date: todayStr, // Auto set date today
    recruiterUsername: autoRecruiterUsername, // Auto set recruiter username
    channel: 'Facebook',
    applicantWhatsapp: '',
    uid9Kucing: '',
    applicantTelegramUsername: '',
    result: 'Pending',
    grup: 'T0',
    visit: 0,
    applicant: 1,
    quality: 0,
    posting: 0,
    permission: 0,
    note: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Keep date & recruiter username always auto-updated
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: todayStr,
      recruiterUsername: autoRecruiterUsername
    }));
  }, [todayStr, autoRecruiterUsername]);

  // Live countdown to midnight (00:00)
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [elapsedPercent, setElapsedPercent] = useState<number>(100);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const totalDayMs = 24 * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - startOfDay.getTime();
      const pct = Math.min(100, Math.max(0, (elapsedMs / totalDayMs) * 100));

      setTimeRemainingMs(Math.max(0, diff));
      setElapsedPercent(pct);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' };
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const { hours, minutes, seconds } = formatTime(timeRemainingMs);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.applicantWhatsapp) {
      setError('Nomor WA Pelamar wajib diisi.');
      return;
    }

    if (!formData.uid9Kucing) {
      setError('UID 9kucing wajib diisi.');
      return;
    }

    try {
      await submitReport({
        ...formData,
        date: todayStr, // Ensure auto set date
        recruiterUsername: autoRecruiterUsername // Ensure auto set recruiter username
      });

      setSuccessMsg('Data Harian pelamar berhasil disimpan & tersinkron ke Google Sheets!');

      // Reset candidate specific fields for next entry
      setFormData((prev) => ({
        ...prev,
        applicantWhatsapp: '',
        uid9Kucing: '',
        applicantTelegramUsername: '',
        note: ''
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data harian.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pb-28"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CalendarClock className="w-5 h-5" />
          </div>
          <span>Data Harian</span>
        </h2>
        <p className="text-xs text-slate-400">
          Form input data harian recruiter & pelamar dengan siklus pembaruan harian.
        </p>
      </div>

      {/* Countdown Card */}
      <GlassCard className="relative overflow-hidden border-sky-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-950/70 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Sisa Waktu Hari Ini</h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {!hasReportToday ? 'Belum input data hari ini' : 'Data hari ini telah tersimpan'}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
            !hasReportToday
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            <Zap className="w-3 h-3" />
            {!hasReportToday ? 'Wajib Input' : 'Tersimpan'}
          </span>
        </div>

        {/* Countdown Display */}
        <div className="py-2.5 px-3 rounded-2xl bg-slate-950/90 border border-sky-500/20 flex flex-col items-center justify-center space-y-1 my-1 shadow-inner">
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
            Pergantian Hari dalam (23:59:59)
          </span>

          <div className="flex items-center gap-2 text-white font-mono font-black text-xl sm:text-2xl tracking-wider">
            <div className="flex flex-col items-center">
              <span className="bg-slate-900 px-2.5 py-1 rounded-xl border border-sky-500/30 text-sky-400">
                {hours}
              </span>
              <span className="text-[8px] font-sans text-slate-400 mt-0.5 font-semibold">Jam</span>
            </div>
            <span className="text-sky-500 font-sans font-bold -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-slate-900 px-2.5 py-1 rounded-xl border border-sky-500/30 text-sky-300">
                {minutes}
              </span>
              <span className="text-[8px] font-sans text-slate-400 mt-0.5 font-semibold">Menit</span>
            </div>
            <span className="text-sky-500 font-sans font-bold -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-slate-900 px-2.5 py-1 rounded-xl border border-sky-500/30 text-sky-200">
                {seconds}
              </span>
              <span className="text-[8px] font-sans text-slate-400 mt-0.5 font-semibold">Detik</span>
            </div>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden p-0.5 border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                !hasReportToday ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400'
              }`}
              style={{ width: `${100 - elapsedPercent}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Main Form Data Harian */}
      <GlassCard className="border-sky-500/20 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Form Data Harian</span>
          </h3>

          <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Auto Sync
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-medium">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tanggal & Recruiter Username (Auto Set Display) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Tanggal (Auto Set Hari Ini) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center justify-between">
                <span>Tanggal</span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">Auto Set</span>
              </label>
              <div className="w-full rounded-2xl py-3 px-4 text-sm font-bold border border-slate-800 bg-slate-950 text-sky-300 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{formData.date}</span>
              </div>
            </div>

            {/* 2. Username Recruiter (Auto Set) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center justify-between">
                <span>Username Recruiter</span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">Auto Set</span>
              </label>
              <div className="w-full rounded-2xl py-3 px-4 text-sm font-bold border border-slate-800 bg-slate-950 text-sky-300 flex items-center gap-2">
                <AtSign className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{formData.recruiterUsername}</span>
              </div>
            </div>
          </div>

          {/* 3. Channels (Options with Platform Icons) */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Channel / Platform</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {CHANNELS.map((ch) => {
                const isSelected = formData.channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, channel: ch.id })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? `${ch.activeBg} border-transparent shadow-lg scale-[1.02]`
                        : `${ch.color} hover:bg-white/5`
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. WA Nomor WA Pelamar */}
          <Input
            label="Nomor WA Pelamar"
            type="tel"
            placeholder="Contoh: 081234567890 / 628123..."
            icon={<Phone className="w-4 h-4 text-emerald-400" />}
            value={formData.applicantWhatsapp}
            onChange={(e) => setFormData({ ...formData, applicantWhatsapp: e.target.value })}
            required
          />

          {/* 5. UID 9kucing & Username Telegram Pelamar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="UID 9kucing"
              type="text"
              placeholder="Contoh: 9K-88231"
              icon={<Hash className="w-4 h-4 text-amber-400" />}
              value={formData.uid9Kucing}
              onChange={(e) => setFormData({ ...formData, uid9Kucing: e.target.value })}
              required
            />

            <Input
              label="Username Telegram Pelamar"
              type="text"
              placeholder="Contoh: @username_pelamar"
              icon={<Send className="w-4 h-4 text-sky-400" />}
              value={formData.applicantTelegramUsername}
              onChange={(e) => setFormData({ ...formData, applicantTelegramUsername: e.target.value })}
            />
          </div>

          {/* 6. Results (Pending, ACC, REJECT) */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Result (Hasil Seleksi)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, result: 'Pending' })}
                className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                  formData.result === 'Pending'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Pending</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, result: 'ACC' })}
                className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                  formData.result === 'ACC'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>ACC</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, result: 'REJECT' })}
                className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                  formData.result === 'REJECT'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20 scale-[1.02]'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT</span>
              </button>
            </div>
          </div>

          {/* 7. Grup (T0, V0, T3) */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Grup</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['T0', 'V0', 'T3'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, grup: g })}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                    formData.grup === g
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-lg scale-[1.02]'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>Grup {g}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Catatan / Keterangan</span>
            </label>
            <textarea
              rows={2}
              placeholder="Catatan pelamar atau kendala (opsional)..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full rounded-2xl py-3 px-4 text-sm font-medium outline-none border border-slate-800 bg-slate-900/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-white transition-all placeholder:text-slate-500"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            icon={<Sparkles className="w-4 h-4" />}
            className="mt-2"
          >
            Simpan Data Harian Pelamar
          </Button>
        </form>
      </GlassCard>

      {/* Riwayat Input Pelamar Hari Ini */}
      {userReports.length > 0 && (
        <GlassCard className="p-4 space-y-3 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-sky-500/15 text-sky-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Riwayat Data Harian Terbaru
              </span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
              Total {userReports.length} Entry
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {userReports.slice(0, 5).map((rep, idx) => (
              <div key={rep.reportId || idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {rep.applicantWhatsapp || 'Tanpa No WA'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    rep.result === 'ACC'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : rep.result === 'REJECT'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {rep.result || 'Pending'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                  <span>Channel: <strong className="text-slate-200">{rep.channel || '-'}</strong></span>
                  <span>UID: <strong className="text-slate-200">{rep.uid9Kucing || '-'}</strong></span>
                  <span>Grup: <strong className="text-slate-200">{rep.grup || '-'}</strong></span>
                </div>

                {rep.applicantTelegramUsername && (
                  <p className="text-[10px] text-sky-400 font-mono">
                    TG: {rep.applicantTelegramUsername}
                  </p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
};
