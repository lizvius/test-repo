import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { triggerHaptic } from '../telegram/webapp';
import { 
  Image as ImageIcon, 
  X, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Upload,
  Plus
} from 'lucide-react';

export const PostinganPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Reset input value so same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    triggerHaptic('impact', 'light');
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setStatus({ type: 'error', message: 'Keterangan/caption tidak boleh kosong.' });
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
          caption,
          images,
          recruiterName: `${userProfile?.firstName} ${userProfile?.lastName || ''}`.trim(),
          recruiterUsername: userProfile?.username
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: 'Postingan berhasil dikirim ke grup Telegram!' });
        setCaption('');
        setImages([]);
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
              Buat Postingan
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Kirim Batch 10 Gambar ke Grup
            </p>
          </div>
        </div>

        {/* Form Section */}
        <GlassCard className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase px-1">Keterangan / Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tulis keterangan postingan di sini..."
              className="w-full min-h-[120px] p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 text-slate-200 text-sm outline-none transition-all resize-none placeholder:text-slate-600"
            />
          </div>

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
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/40 backdrop-blur-[2px] text-[8px] font-bold text-white text-center">
                        #{idx + 1}
                      </div>
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
            disabled={isUploading || !caption.trim() || images.length === 0}
            isLoading={isUploading}
            icon={<Send className="w-4 h-4" />}
          >
            Kirim {images.length > 0 ? `${images.length} Gambar` : 'Postingan'}
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
              Bot akan mengirim postingan sebagai satu album (Media Group) jika terdapat lebih dari 1 gambar.
            </li>
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Caption akan disematkan pada gambar pertama dalam album tersebut.
            </li>
            <li className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              Maksimal 10 gambar per pengiriman sesuai limitasi API Telegram.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
