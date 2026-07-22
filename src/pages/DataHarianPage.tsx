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
  HelpCircle,
  ExternalLink,
  User,
  Lock,
  Loader2,
  AlertTriangle,
  UserX
} from 'lucide-react';

// Channel Platform Real SVG Icons
const ChannelPlatformIcon: React.FC<{ id: string; className?: string }> = ({ id, className = "w-4 h-4 shrink-0" }) => {
  switch (id) {
    case 'Facebook':
      return (
        <svg className={`${className} text-blue-500 fill-current`} viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'X (Twitter)':
      return (
        <svg className={`${className} text-slate-200 fill-current`} viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'Threads':
      return (
        <svg className={`${className} text-white fill-current`} viewBox="0 0 24 24">
          <path d="M12.186 24c-3.142 0-5.782-1.002-7.587-2.87-1.848-1.91-2.599-4.57-2.599-7.728 0-3.322.95-6.07 2.825-8.17C6.632 3.123 9.29 2 12.723 2c3.488 0 6.208 1.14 8.084 3.388 1.583 1.897 2.392 4.417 2.392 7.488 0 .61-.03 1.256-.09 1.933h-3.411c.045-.487.068-.962.068-1.428 0-2.22-.57-3.992-1.693-5.27-1.196-1.36-2.937-2.05-5.183-2.05-2.298 0-4.093.758-5.337 2.252-1.22 1.466-1.838 3.513-1.838 6.084 0 2.327.534 4.254 1.587 5.727 1.055 1.475 2.585 2.223 4.548 2.223 1.623 0 2.946-.43 3.931-1.28.932-.803 1.488-1.922 1.654-3.328h-5.26v-3.072h8.777c.074.526.111 1.077.111 1.652 0 2.457-.833 4.475-2.477 6.002C18.667 23.23 15.808 24 12.186 24z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg className={`${className} text-pink-500 fill-current`} viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'TikTok':
      return (
        <svg className={`${className} text-cyan-400 fill-current`} viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.54-1.33 2.54-.02 1.08.46 2.15 1.28 2.84 1.01.83 2.47.98 3.63.4 1.03-.51 1.69-1.57 1.78-2.72.08-2.71.04-5.43.05-8.15-.01-2.9-.01-5.8 0-8.7z" />
        </svg>
      );
    case 'LinkedIn':
      return (
        <svg className={`${className} text-sky-500 fill-current`} viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
        </svg>
      );
    case 'Telegram':
      return (
        <svg className={`${className} text-sky-400 fill-current`} viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.18-1.82 6.97-3.02 8.37-3.61 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.17.14.12.18.28.2.45-.01.07.01.23 0 .39z" />
        </svg>
      );
    case 'WhatsApp':
      return (
        <svg className={`${className} text-emerald-400 fill-current`} viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      );
    default:
      return <Globe className={`${className} text-emerald-400`} />;
  }
};

// Telegram Username Parser Helper
const parseTelegramUsername = (raw?: string) => {
  if (!raw) return { clean: '', formatted: '', url: '' };
  let clean = raw.trim();

  // Extract from full URLs or links like https://t.me/username, t.me/username, telegram.me/username, tg://resolve?domain=username
  if (clean.includes('t.me/') || clean.includes('telegram.me/')) {
    const match = clean.match(/(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      clean = match[1];
    }
  } else if (clean.includes('tg://')) {
    const match = clean.match(/domain=([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      clean = match[1];
    }
  }

  // Remove query params, hash or trailing slash
  clean = clean.split('?')[0].split('#')[0].replace(/\/$/, '');
  // Strip leading @ or slashes or plus
  clean = clean.replace(/^[@/+]+/, '');

  if (!clean) return { clean: '', formatted: '', url: '' };

  return {
    clean,
    formatted: `@${clean}`,
    url: `https://t.me/${clean}`
  };
};

// Real-time Telegram Username Availability Checker
const checkTelegramAvailability = async (cleanUsername: string): Promise<{
  exists: boolean;
  title?: string;
  isSyntaxValid: boolean;
  message?: string;
}> => {
  if (!cleanUsername) {
    return { exists: false, isSyntaxValid: false, message: 'Username belum diisi' };
  }

  // Telegram username rules: 5-32 chars, a-z, A-Z, 0-9, _
  const syntaxRegex = /^[a-zA-Z0-9_]{5,32}$/;
  if (!syntaxRegex.test(cleanUsername)) {
    return {
      exists: false,
      isSyntaxValid: false,
      message: 'Username Telegram minimal 5-32 karakter (hanya huruf, angka, & underscore)'
    };
  }

  try {
    const targetUrl = `https://t.me/${cleanUsername}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl, { method: 'GET' });
    if (!response.ok) {
      return { exists: true, isSyntaxValid: true, title: `@${cleanUsername}` };
    }

    const data = await response.json();
    const html: string = data.contents || '';

    // Check indicators in Telegram's web profile page
    const isUserNotFoundMsg = html.includes('User not found') || html.includes('Page not found');
    const isNotFoundText = html.includes('If you have <strong>Telegram</strong>, you can contact') || html.includes('If you have Telegram, you can contact');
    const hasPageTitle = html.includes('tgme_page_title') || html.includes('tgme_page_extra');

    if (isUserNotFoundMsg || (isNotFoundText && !hasPageTitle)) {
      return {
        exists: false,
        isSyntaxValid: true,
        message: `Username @${cleanUsername} TIDAK TERDAFTAR di Telegram.`
      };
    }

    // Extract real display name if available
    let extractedTitle = `@${cleanUsername}`;
    const titleMatch = html.match(/<div class="tgme_page_title"[^>]*><span[^>]*>(.*?)<\/span><\/div>/s) || html.match(/<meta property="og:title" content="(.*?)"/);
    if (titleMatch && titleMatch[1]) {
      const cleanTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      if (cleanTitle && !cleanTitle.toLowerCase().includes('telegram: contact')) {
        extractedTitle = cleanTitle;
      }
    }

    return {
      exists: true,
      title: extractedTitle,
      isSyntaxValid: true,
      message: `Username @${cleanUsername} terdaftar aktif.`
    };
  } catch {
    return {
      exists: true,
      title: `@${cleanUsername}`,
      isSyntaxValid: true
    };
  }
};

// Channel Platforms with Colors & Active Styles
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

  const isAdminOrOwner = userProfile?.role === 'Admin' || userProfile?.role === 'Owner';
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

  // Check if submitted report today
  const hasReportToday = userReports.some((r) => r.date === todayStr);

  // Form State initialized with auto set values
  const [formData, setFormData] = useState<DailyReportFormData>({
    date: todayStr,
    recruiterUsername: autoRecruiterUsername,
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

  // Telegram Username Real-time Status
  const [tgStatus, setTgStatus] = useState<{
    status: 'idle' | 'checking' | 'exists' | 'not_found' | 'invalid_syntax';
    title?: string;
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    const rawTg = formData.applicantTelegramUsername;
    if (!rawTg || !rawTg.trim()) {
      setTgStatus({ status: 'idle' });
      return;
    }

    const { clean: cleanTg } = parseTelegramUsername(rawTg);

    if (!cleanTg || cleanTg.length < 5 || !/^[a-zA-Z0-9_]{5,32}$/.test(cleanTg)) {
      setTgStatus({
        status: 'invalid_syntax',
        message: 'Username Telegram minimal 5-32 karakter (hanya huruf, angka, & underscore)'
      });
      return;
    }

    setTgStatus({
      status: 'checking',
      message: `Memeriksa keberadaan akun Telegram @${cleanTg}...`
    });

    const timer = setTimeout(async () => {
      const result = await checkTelegramAvailability(cleanTg);
      if (!result.isSyntaxValid) {
        setTgStatus({ status: 'invalid_syntax', message: result.message });
      } else if (!result.exists) {
        setTgStatus({
          status: 'not_found',
          message: `Username @${cleanTg} TIDAK TERDAFTAR di Telegram.`
        });
      } else {
        setTgStatus({
          status: 'exists',
          title: result.title || `@${cleanTg}`,
          message: `Username @${cleanTg} terdaftar aktif di Telegram.`
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.applicantTelegramUsername]);

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
      const parsedTg = parseTelegramUsername(formData.applicantTelegramUsername);
      const finalTg = parsedTg.formatted || formData.applicantTelegramUsername.trim();

      await submitReport({
        ...formData,
        date: todayStr, // Ensure auto set date
        recruiterUsername: autoRecruiterUsername, // Ensure auto set recruiter username
        applicantTelegramUsername: finalTg,
        // Recruiter result is strictly 'Pending', Admin/Owner can set custom result
        result: isAdminOrOwner ? formData.result : 'Pending',
        // Recruiter can only select T0 or V0, T3 is for Admin/Owner
        grup: !isAdminOrOwner && formData.grup === 'T3' ? 'T0' : formData.grup
      });

      setSuccessMsg('Data Harian pelamar berhasil disimpan & tersinkron ke Google Sheets!');

      // Reset candidate specific fields for next entry
      setFormData((prev) => ({
        ...prev,
        applicantWhatsapp: '',
        uid9Kucing: '',
        applicantTelegramUsername: '',
        result: 'Pending',
        grup: 'T0',
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

          {/* 3. Channels (Options with Real Platform SVG Icons) */}
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
                    <ChannelPlatformIcon id={ch.id} />
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

            <div className="space-y-1.5">
              <Input
                label="Username Telegram Pelamar"
                type="text"
                placeholder="Contoh: @username_pelamar atau t.me/..."
                icon={<Send className="w-4 h-4 text-sky-400" />}
                value={formData.applicantTelegramUsername}
                onChange={(e) => {
                  const val = e.target.value;
                  // Auto detect if user pasted link or full URL
                  if (val.includes('t.me') || val.includes('telegram.me') || val.includes('http') || val.includes('tg://')) {
                    const parsed = parseTelegramUsername(val);
                    setFormData({ ...formData, applicantTelegramUsername: parsed.formatted || val });
                  } else {
                    setFormData({ ...formData, applicantTelegramUsername: val });
                  }
                }}
                onBlur={() => {
                  if (formData.applicantTelegramUsername) {
                    const parsed = parseTelegramUsername(formData.applicantTelegramUsername);
                    if (parsed.formatted) {
                      setFormData((prev) => ({ ...prev, applicantTelegramUsername: parsed.formatted }));
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Live Real Telegram Account Verification & Status Preview */}
          {(() => {
            const { clean: cleanTg, formatted: formattedTg, url: tgUrl } = parseTelegramUsername(formData.applicantTelegramUsername);
            if (!cleanTg || tgStatus.status === 'idle') return null;

            if (tgStatus.status === 'checking') {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-3 shadow-md"
                >
                  <Loader2 className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-sky-300">Memeriksa Akun Telegram...</span>
                    <p className="text-[10px] text-slate-400 font-mono">Verifikasi keberadaan username @{cleanTg} di server Telegram</p>
                  </div>
                </motion.div>
              );
            }

            if (tgStatus.status === 'invalid_syntax') {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex items-start gap-3 shadow-lg"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-300">Format Username Tidak Valid</span>
                    <p className="text-[11px] text-amber-200/90 font-medium">{tgStatus.message}</p>
                  </div>
                </motion.div>
              );
            }

            if (tgStatus.status === 'not_found') {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-900 border border-rose-500/60 flex items-start justify-between gap-3 shadow-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                      <UserX className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white font-mono">{formattedTg}</span>
                        <span className="text-[9px] bg-rose-500/30 text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-500/40 font-black flex items-center gap-1 uppercase tracking-wider">
                          <XCircle className="w-2.5 h-2.5 text-rose-400" />
                          Tidak Terdaftar
                        </span>
                      </div>
                      <p className="text-xs text-rose-200 font-bold">
                        ⚠️ Username tidak ditemukan di Telegram!
                      </p>
                      <p className="text-[10px] text-slate-300">
                        Akun @{cleanTg} belum dibuat atau username salah eja. Mohon pastikan ejaan username pelamar sudah benar.
                      </p>
                    </div>
                  </div>

                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800/80 border border-rose-500/40 text-rose-200 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0"
                  >
                    <span>Cek Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>
              );
            }

            // 'exists' Status
            return (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-sky-950/80 to-slate-900 border border-emerald-500/50 flex items-center justify-between gap-3 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-slate-950 shadow-md shrink-0 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white font-mono">{formattedTg}</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        Terdaftar Aktif
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Profil: <strong className="text-white font-mono">{tgStatus.title || formattedTg}</strong> • Link: <span className="text-sky-300 font-mono">{tgUrl}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shrink-0 hover:scale-[1.03]"
                >
                  <span>Buka Chat</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            );
          })()}

          {/* 6. Results (Recruiter = Auto Pending, Admin/Owner = Pending, ACC, REJECT) */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Result (Hasil Seleksi)</span>
              </span>
              {!isAdminOrOwner ? (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Auto Pending
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Admin / Owner Control
                </span>
              )}
            </label>

            {!isAdminOrOwner ? (
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-xs flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white">Status: Pending</p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Input recruiter otomatis berstatus Pending. Persetujuan (ACC / REJECT) dilakukan oleh Admin atau Owner.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  Pending
                </span>
              </div>
            ) : (
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
            )}
          </div>

          {/* 7. Grup (Recruiter = T0 & V0, Admin/Owner = T0, V0, T3) */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Grup</span>
              </span>
              {!isAdminOrOwner && (
                <span className="text-[10px] text-slate-400 font-medium">T0 & V0 (T3 khusus Admin/Owner)</span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['T0', 'V0'] as const).map((g) => (
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

              {isAdminOrOwner ? (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, grup: 'T3' })}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                    formData.grup === 'T3'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-lg scale-[1.02]'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>Grup T3</span>
                </button>
              ) : (
                <div
                  title="Khusus Admin & Owner"
                  className="py-2.5 px-3 rounded-2xl text-xs font-bold border border-slate-800/80 bg-slate-950/50 text-slate-500 opacity-60 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>T3 (Admin)</span>
                </div>
              )}
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

                {rep.applicantTelegramUsername && (() => {
                  const { clean, formatted, url } = parseTelegramUsername(rep.applicantTelegramUsername);
                  if (!clean) return null;
                  return (
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-sky-300 font-mono font-bold">
                        <Send className="w-3 h-3 text-sky-400 shrink-0" />
                        <span>{formatted}</span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-[10px] text-sky-300 font-bold flex items-center gap-1 transition-all"
                      >
                        <span>Chat Pelamar</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
};

