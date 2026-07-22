import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { triggerHaptic } from '../telegram/webapp';
import { getSystemSettings } from '../firebase/services/settingService';
import { SystemSettings } from '../types';
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
  Hash
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

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await getSystemSettings();
      setSettings(s);
    };
    fetchSettings();
  }, []);

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
    let platform: SocialPlatform = 'Other';
    if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.watch')) {
      platform = 'Facebook';
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
      platform = 'X';
    }
    newLinks[index] = { url, platform };
    setLinks(newLinks);
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'X': return <Twitter className="w-4 h-4 text-slate-200" />;
      default: return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handleSubmit = async () => {
    const validLinks = links.filter(l => l.url.trim() !== '');
    if (validLinks.length === 0) {
      setStatus({ type: 'error', message: 'Minimal masukkan 1 link postingan.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'idle' });
    triggerHaptic('impact', 'medium');

    try {
      const response = await fetch('/api/telegram/send-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: validLinks.map(l => l.url),
          startNumber,
          images,
          recruiterName: `${userProfile?.firstName} ${userProfile?.lastName || ''}`.trim(),
          recruiterUsername: userProfile?.username || telegramUser?.username,
          groupId: settings?.telegramGroupId,
          topicId: settings?.telegramTopicPosting
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: 'Postingan berhasil dikirim ke grup Telegram!' });
        setLinks(Array(10).fill({ url: '', platform: 'Facebook' }));
        setImages([]);
        setStartNumber(prev => prev + 10);
        triggerHaptic('notification', 'success');
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
        <GlassCard className="p-4 space-y-5">
          {/* Start Number Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase px-1 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              Nomor Awal Postingan
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                className="w-24 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white font-bold text-center outline-none focus:border-sky-500/50"
              />
              <span className="text-xs text-slate-500 font-medium">
                Bot akan memuat nomor: {startNumber} sampai {startNumber + 9}
              </span>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase px-1 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              Link Sosmed (Maks 10)
            </label>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">
                      #{startNumber + idx}
                    </span>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(idx, e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-sky-500/50 text-slate-200 text-[11px] outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Gambar ({images.length}/10)
              </label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors uppercase"
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
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 group-hover:text-slate-200">Klik untuk upload gambar</p>
                  <p className="text-[10px] text-slate-600">Maksimal 10 gambar per batch</p>
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
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group"
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
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-800 hover:border-sky-500/30 bg-slate-950/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-500 hover:text-sky-400"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Tambah</span>
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
                className={`p-3 rounded-2xl flex items-center gap-3 ${
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
                <p className="text-xs font-bold leading-tight">{status.message}</p>
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

        {/* Tips Section */}
        <div className="px-4 py-3 bg-sky-500/5 rounded-2xl border border-sky-500/10">
          <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="w-3 h-3" /> Petunjuk
          </h4>
          <ul className="space-y-1">
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Bot akan mengirim sebagai Media Group (Album) berisi 10 gambar.
            </li>
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Format caption akan mencantumkan Tanggal, Range Nomor, dan List Link.
            </li>
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Grup & Topic ID diatur secara otomatis dari menu Owner Settings.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
