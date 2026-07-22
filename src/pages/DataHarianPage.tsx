import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/common/GlassCard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../hooks/useAuth';
import { DailyReportFormData } from '../types';
import { 
  Timer, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  Eye, 
  UserCheck, 
  Star, 
  Share2, 
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Zap,
  RotateCcw
} from 'lucide-react';

export const DataHarianPage: React.FC = () => {
  const { userProfile, telegramUser } = useAuth();
  const { reports, submitReport, isLoading } = useReports();

  const telegramId = userProfile?.telegramId || String(telegramUser?.id || '');
  const todayStr = new Date().toISOString().split('T')[0];

  // Latest report submitted by this user
  const userReports = reports.filter((r) => r.telegramId === telegramId);
  const latestReport = userReports.length > 0 ? userReports[0] : null;

  // Calculate 24-hour timer state
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [isCycleExpired, setIsCycleExpired] = useState<boolean>(true);
  const [elapsedPercent, setElapsedPercent] = useState<number>(100);

  // Form State
  const [formData, setFormData] = useState<DailyReportFormData>({
    date: todayStr,
    visit: 0,
    applicant: 0,
    quality: 0,
    posting: 0,
    permission: 0,
    note: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-fill form if user has an active report or wants to edit
  useEffect(() => {
    if (latestReport) {
      setFormData({
        date: latestReport.date || todayStr,
        visit: latestReport.visit || 0,
        applicant: latestReport.applicant || 0,
        quality: latestReport.quality || 0,
        posting: latestReport.posting || 0,
        permission: latestReport.permission || 0,
        note: latestReport.note || ''
      });
    }
  }, [latestReport, todayStr]);

  // Check if user has submitted a report for today
  const hasReportToday = userReports.some((r) => r.date === todayStr);

  // Live Timer Loop: Counts down to the end of the current day (23:59:59 / 00:00)
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
      setIsCycleExpired(!hasReportToday);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hasReportToday]);

  // Format time remaining into Hours, Minutes, Seconds
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
    if (!formData.date) {
      setError('Tanggal wajib diisi.');
      return;
    }

    setError(null);
    setSuccessMsg(null);

    try {
      await submitReport(formData);
      setSuccessMsg('Data Harian baru berhasil disimpan & tersinkron ke Google Sheets!');

      // Save submission timestamp
      localStorage.setItem(`azurlize_last_report_${telegramId}`, new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim data harian.');
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
          Kelola data harian recruiter dengan siklus pembaruan otomatis setiap pergantian hari.
        </p>
      </div>

      {/* 24-Hour Countdown Widget */}
      <GlassCard className="relative overflow-hidden border-sky-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-950/70 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Waktu Sisa Hari Ini</h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {!hasReportToday ? 'Belum isi data hari ini — Silakan input' : 'Data hari ini sudah tercatat & tersimpan'}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${
            !hasReportToday
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            <Zap className="w-3 h-3" />
            {!hasReportToday ? 'Wajib Isi' : 'Selesai Today'}
          </span>
        </div>

        {/* Digital Countdown Display */}
        <div className="py-3 px-4 rounded-2xl bg-slate-950/90 border border-sky-500/20 flex flex-col items-center justify-center space-y-2 my-2 shadow-inner">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Sisa Waktu Menuju Pergantian Hari (23:59:59)
          </span>

          <div className="flex items-center gap-2 text-white font-mono font-black text-2xl sm:text-3xl tracking-wider">
            <div className="flex flex-col items-center">
              <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-sky-500/30 text-sky-400 shadow-md">
                {hours}
              </span>
              <span className="text-[9px] font-sans text-slate-400 mt-1 font-semibold">Jam</span>
            </div>
            <span className="text-sky-500 font-sans font-bold -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-sky-500/30 text-sky-300 shadow-md">
                {minutes}
              </span>
              <span className="text-[9px] font-sans text-slate-400 mt-1 font-semibold">Menit</span>
            </div>
            <span className="text-sky-500 font-sans font-bold -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-slate-900 px-3 py-1.5 rounded-xl border border-sky-500/30 text-sky-200 shadow-md">
                {seconds}
              </span>
              <span className="text-[9px] font-sans text-slate-400 mt-1 font-semibold">Detik</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2 mt-2 overflow-hidden p-0.5 border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                !hasReportToday 
                  ? 'bg-amber-500' 
                  : 'bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400'
              }`}
              style={{ width: `${100 - elapsedPercent}%` }}
            />
          </div>
        </div>

        {/* Informational Banner */}
        <div className="mt-3 text-xs text-slate-300 flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
          <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Timer mengikuti waktu real-time jam sekarang menuju pukul 00:00 (pergantian hari). Setelah lewat pergantian hari, data baru untuk tanggal berikutnya akan langsung dapat diinput kembali.
          </p>
        </div>
      </GlassCard>

      {/* Active Daily Summary Card */}
      {latestReport && (
        <GlassCard className="p-4 space-y-3 border-emerald-500/30 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Data Harian Terakhir ({latestReport.date})
              </span>
            </div>

            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" /> Sheets Synced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Visit</span>
              <span className="text-base font-black text-blue-400">{latestReport.visit || 0}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Pelamar</span>
              <span className="text-base font-black text-sky-400">{latestReport.applicant || 0}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Quality</span>
              <span className="text-base font-black text-emerald-400">{latestReport.quality || 0}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Posting</span>
              <span className="text-base font-black text-indigo-400">{latestReport.posting || 0}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Izin</span>
              <span className="text-base font-black text-amber-400">{latestReport.permission || 0}</span>
            </div>
          </div>

          {latestReport.note && (
            <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              &quot;{latestReport.note}&quot;
            </p>
          )}
        </GlassCard>
      )}

      {/* Form Input Data Harian Baru */}
      <GlassCard className="border-sky-500/20 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Form Input Data Harian</span>
          </h3>

          {isCycleExpired ? (
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Wajib Isi Baru
            </span>
          ) : (
            <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Pembaruan Data
            </span>
          )}
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

          <Input
            label="Tanggal Data Harian"
            type="date"
            icon={<CalendarClock className="w-4 h-4" />}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kunjungan (Visit)"
              type="number"
              min="0"
              placeholder="0"
              icon={<Eye className="w-4 h-4 text-blue-400" />}
              value={formData.visit}
              onChange={(e) => setFormData({ ...formData, visit: Number(e.target.value) })}
              required
            />

            <Input
              label="Pelamar (Applicant)"
              type="number"
              min="0"
              placeholder="0"
              icon={<UserCheck className="w-4 h-4 text-sky-400" />}
              value={formData.applicant}
              onChange={(e) => setFormData({ ...formData, applicant: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Berkualitas / Testing"
              type="number"
              min="0"
              placeholder="0"
              icon={<Star className="w-4 h-4 text-emerald-400" />}
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: Number(e.target.value) })}
              required
            />

            <Input
              label="Jumlah Postingan"
              type="number"
              min="0"
              placeholder="0"
              icon={<Share2 className="w-4 h-4 text-indigo-400" />}
              value={formData.posting}
              onChange={(e) => setFormData({ ...formData, posting: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Izin / Kendala (Jumlah)"
            type="number"
            min="0"
            placeholder="0"
            icon={<AlertCircle className="w-4 h-4 text-amber-400" />}
            value={formData.permission}
            onChange={(e) => setFormData({ ...formData, permission: Number(e.target.value) })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
              Catatan / Keterangan
            </label>
            <textarea
              rows={3}
              placeholder="Keterangan postingan, kendala, atau aktivitas harian..."
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
            {isCycleExpired ? 'Simpan Data Harian Baru' : 'Perbarui Data Harian'}
          </Button>
        </form>
      </GlassCard>
    </motion.div>
  );
};
