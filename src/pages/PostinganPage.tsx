import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { triggerHaptic } from '../telegram/webapp';
import { getSystemSettings } from '../firebase/services/settingService';
import { createPost, getRecruiterPosts, archiveOldPosts } from '../firebase/services/postService';
import { SystemSettings, BatchPost } from '../types';
import { 
  Image as ImageIcon, 
  X, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Plus,
  Link as LinkIcon,
  Globe,
  Facebook,
  Twitter,
  Hash,
  History,
  Archive,
  ChevronRight,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  Timer
} from 'lucide-react';

type SocialPlatform = 'Facebook' | 'X' | 'Other';

interface SocialLink {
  url: string;
  platform: SocialPlatform;
}

export const PostinganPage: React.FC = () => {
  const { userProfile, telegramUser } = useAuth();
  const [links, setLinks] = useState<SocialLink[]>(Array(10).fill({ url: '', platform: 'Facebook' }));
  const [startNumber, setStartNumber] = useState<number>(1);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tabs & History State
  const [activeHistoryTab, setActiveHistoryTab] = useState<'hari_ini' | 'arsip'>('hari_ini');
  const [posts, setPosts] = useState<BatchPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const { hours, minutes, seconds } = formatTime(timeRemainingMs);

  useEffect(() => {
    const init = async () => {
      const s = await getSystemSettings();
      setSettings(s);
      await archiveOldPosts(); // Auto archive old posts on mount
      fetchHistory(true);
    };
    init();
  }, [activeHistoryTab]);

  const fetchHistory = async (reset: boolean = false) => {
    if (!userProfile?.telegramId) return;
    setIsLoadingHistory(true);
    try {
      const { posts: fetchedPosts, lastDoc: nextDoc } = await getRecruiterPosts(
        userProfile.telegramId, 
        10, 
        reset ? undefined : lastDoc
      );
      
      const today = new Date().toISOString().split('T')[0];
      
      // Filter based on active tab
      const filtered = fetchedPosts.filter(p => {
        if (activeHistoryTab === 'hari_ini') {
          return p.date === today && !p.archived;
        } else {
          return p.date < today || p.archived;
        }
      });

      if (reset) {
        setPosts(filtered);
      } else {
        setPosts(prev => [...prev, ...filtered]);
      }
      
      setLastDoc(nextDoc);
      setHasMore(fetchedPosts.length === 10);
    } catch (err) {
      console.error('[Postingan] Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      if (images.length >= 10) {
        alert('Maksimal 10 gambar diperbolehkan.');
      }
      return;
    }

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    triggerHaptic('impact', 'light');
  };

  const updateLink = (index: number, url: string) => {
    const newLinks = [...links];
    let platform = newLinks[index].platform;
    
    if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.watch')) {
      platform = 'Facebook';
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
      platform = 'X';
    }
    
    newLinks[index] = { url, platform };
    setLinks(newLinks);
  };

  const updatePlatform = (index: number, platform: SocialPlatform) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], platform };
    setLinks(newLinks);
    triggerHaptic('selection');
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="w-3.5 h-3.5 text-blue-400" />;
      case 'X': return <Twitter className="w-3.5 h-3.5 text-slate-200" />;
      default: return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const handleSubmit = async () => {
    const validLinks = links.filter(l => l.url.trim() !== '');
    if (validLinks.length === 0) {
      setStatus({ type: 'error', message: 'Minimal masukkan 1 link postingan.' });
      return;
    }

    if (images.length === 0) {
      setStatus({ type: 'error', message: 'Setidaknya upload 1 gambar.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'idle' });
    triggerHaptic('impact', 'medium');

    try {
      const recruiterName = `${userProfile?.firstName} ${userProfile?.lastName || ''}`.trim();
      const recruiterUsername = userProfile?.username || telegramUser?.username;
      
      const response = await fetch('/api/telegram/send-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: validLinks.map(l => l.url),
          startNumber,
          images,
          recruiterName,
          recruiterUsername,
          groupId: settings?.telegramGroupId,
          topicId: settings?.telegramTopicPosting
        })
      });

      const result = await response.json();
      if (result.success) {
        await createPost({
          telegramId: userProfile?.telegramId || '',
          username: recruiterUsername || '',
          name: recruiterName,
          date: new Date().toISOString().split('T')[0],
          startNumber,
          links: validLinks.map(l => l.url),
          platforms: validLinks.map(l => l.platform)
        });

        setStatus({ type: 'success', message: 'Batch Berhasil Dikirim!' });
        setLinks(Array(10).fill({ url: '', platform: 'Facebook' }));
        setImages([]);
        setStartNumber(prev => prev + 10);
        triggerHaptic('notification', 'success');
        
        fetchHistory(true);
      } else {
        throw new Error(result.error || 'Gagal mengirim postingan');
      }
    } catch (err) {
      console.error('[Postingan] Error submitting:', err);
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengirim postingan.' });
      triggerHaptic('notification', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        {/* Live Timer Section */}
        <GlassCard className="p-4 border-amber-500/20 bg-amber-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles className="w-12 h-12 text-amber-500" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 animate-pulse" />
                Batas Waktu Harian
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-black text-white tracking-tighter">{hours}</span>
                <span className="text-lg font-black text-amber-500/50">:</span>
                <span className="text-2xl font-black text-white tracking-tighter">{minutes}</span>
                <span className="text-lg font-black text-amber-500/50">:</span>
                <span className="text-2xl font-black text-white tracking-tighter">{seconds}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Status Progres</div>
              <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${elapsedPercent}%` }}
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                />
              </div>
              <span className="text-[8px] font-bold text-amber-400 mt-1 block">
                {Math.round(elapsedPercent)}% Hari Berjalan
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Header Section */}
        <div className="px-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-sky-400" />
              Batch Postingan
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Kirim 10 Link & Gambar ke Grup
            </p>
          </div>
        </div>

        {/* Form Section */}
        <GlassCard className="p-4 space-y-6">
          {/* Start Number & Multi-Platform Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-amber-400" />
                Nomor Awal
              </label>
              <input
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-black text-center text-sm outline-none focus:border-sky-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-sky-400" />
                Batch Ke
              </label>
              <div className="w-full p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50 text-slate-400 font-bold text-center text-sm">
                #{Math.ceil(startNumber / 10)}
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              Daftar Link & Platform
            </label>
            <div className="space-y-3">
              {links.map((link, idx) => (
                <div key={idx} className="space-y-2 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 shadow-inner group focus-within:border-sky-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-600 bg-slate-900 px-2 py-0.5 rounded-md">
                      #{startNumber + idx}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {(['Facebook', 'X', 'Other'] as SocialPlatform[]).map(p => (
                        <button
                          key={p}
                          onClick={() => updatePlatform(idx, p)}
                          className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center gap-1 ${
                            link.platform === p 
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {getPlatformIcon(p)}
                          {p === 'Other' ? 'Lain' : p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(idx, e.target.value)}
                      placeholder="Paste link postingan..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500/50 text-white text-[11px] outline-none transition-all placeholder:text-slate-700 font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Upload Gambar ({images.length}/10)
              </label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors uppercase bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            {images.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer aspect-video rounded-2xl border-2 border-dashed border-slate-800 hover:border-sky-500/30 bg-slate-950/30 flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shadow-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-300 group-hover:text-white">Klik untuk upload gambar</p>
                  <p className="text-[10px] text-slate-600 font-medium mt-1">Maksimal 10 gambar per batch</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <AnimatePresence mode="popLayout">
                  {images.map((img, idx) => (
                    <motion.div
                      key={`${idx}-${img.substring(0, 20)}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-md"
                    >
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 transition-colors z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {images.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-800 hover:border-sky-500/30 bg-slate-950/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-500 hover:text-sky-400 group"
                  >
                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Tambah</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {status.type !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-3 ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <p className="text-xs font-black leading-tight">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={isUploading || links.filter(l => l.url.trim() !== '').length === 0 || images.length === 0}
            isLoading={isUploading}
            icon={<Send className="w-4 h-4" />}
          >
            Kirim Batch Postingan
          </Button>
        </GlassCard>

        {/* History Section with Tabs */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                Riwayat Aktivitas
              </h3>
            </div>
            
            {/* Tabs Trigger */}
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => { setActiveHistoryTab('hari_ini'); triggerHaptic('selection'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  activeHistoryTab === 'hari_ini' 
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-lg' 
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Hari Ini
              </button>
              <button
                onClick={() => { setActiveHistoryTab('arsip'); triggerHaptic('selection'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  activeHistoryTab === 'arsip' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg' 
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <Archive className="w-3 h-3" />
                Arsip
              </button>
            </div>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {posts.length === 0 && !isLoadingHistory ? (
              <div className="py-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/50">
                <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">
                  {activeHistoryTab === 'hari_ini' ? 'Belum ada postingan hari ini' : 'Folder arsip kosong'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <GlassCard key={post.id} className={`p-4 space-y-3 ${post.archived ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">#{post.startNumber} - #{post.startNumber + post.links.length - 1}</span>
                        {post.archived && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1">
                            Arsip
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <Calendar className="w-3 h-3 text-sky-400" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <LinkIcon className="w-3 h-3 text-sky-400" />
                          {post.links.length} Item
                        </div>
                      </div>
                    </div>
                    <div className="flex -space-x-1.5">
                      {Array.from(new Set(post.platforms)).map((p, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-md">
                          {getPlatformIcon(p as SocialPlatform)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                    {post.links.slice(0, 2).map((link, i) => (
                      <a 
                        key={i} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-800/50 transition-colors group"
                      >
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                          {link}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition-colors" />
                      </a>
                    ))}
                    {post.links.length > 2 && (
                      <div className="text-[9px] font-black text-slate-600 text-center uppercase tracking-tighter pt-1">
                        + {post.links.length - 2} Link Lainnya
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))
            )}

            {hasMore && posts.length > 0 && (
              <button
                onClick={() => fetchHistory()}
                disabled={isLoadingHistory}
                className="w-full p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs font-black text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {isLoadingHistory ? (
                  <X className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Lihat Lebih Banyak
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="px-4 py-3 bg-sky-500/5 rounded-2xl border border-sky-500/10">
          <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="w-3 h-3" /> Petunjuk
          </h4>
          <ul className="space-y-1">
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Gunakan tab **Arsip** untuk melihat postingan dari hari-hari sebelumnya.
            </li>
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Timer di atas menunjukkan sisa waktu pengumpulan batch untuk hari ini.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
