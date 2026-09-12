'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User, Sparkles, Check, Trash2, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface AvatarCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrationComplete?: () => void;
}

export default function AvatarCalibrationModal({
  isOpen,
  onClose,
  onCalibrationComplete,
}: AvatarCalibrationModalProps) {
  const { user } = useUser();
  const [facePhotos, setFacePhotos] = useState<string[]>([]);
  const [bodyPhotos, setBodyPhotos] = useState<string[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUploadRef = useRef<{ type: 'face' | 'body'; index: number } | null>(null);

  const [step, setStep] = useState<'intro' | 'upload'>('intro');

  const cacheKey = user?.id ? `wardrobe_avatar_calibration_${user.id}` : null;

  // Load photos on mount / open
  useEffect(() => {
    if (!user?.id || !isOpen) return;

    // 1. Instant hydration from localStorage
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.face_photos || parsed.body_photos) {
            const f = (parsed.face_photos || []).filter(Boolean);
            const b = (parsed.body_photos || []).filter(Boolean);
            setFacePhotos(f);
            setBodyPhotos(b);
            if (f.length > 0 || b.length > 0) {
              setStep('upload');
            }
          }
        }
      } catch (e) {
        console.warn('Error reading calibration cache:', e);
      }
    }

    // 2. Fetch from API & Supabase
    const loadCalibration = async () => {
      try {
        const res = await fetch('/api/user/avatar-calibration');
        if (res.ok) {
          const json = await res.json();
          const faces: string[] = json.face_photos || [];
          const bodies: string[] = json.body_photos || [];

          if (faces.length > 0 || bodies.length > 0) {
            setFacePhotos(faces);
            setBodyPhotos(bodies);
            setStep('upload');

            if (cacheKey) {
              localStorage.setItem(cacheKey, JSON.stringify({ face_photos: faces, body_photos: bodies }));
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching avatar calibration from API:', err);
      }
    };

    loadCalibration();
  }, [user?.id, isOpen, cacheKey]);

  const handleSelectSlot = (type: 'face' | 'body', index: number) => {
    targetUploadRef.current = { type, index };
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id || !targetUploadRef.current) return;

    const { type, index } = targetUploadRef.current;
    const slotId = `${type}_${index}`;
    setUploadingSlot(slotId);
    setErrorMsg(null);

    try {
      // 1. Upload to Supabase Storage
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `calibration/${user.id}/${type}_${index}_${Date.now()}.${ext}`;

      let bucketUsed = 'avatars';
      let { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        bucketUsed = 'clothing';
        const { error: fallbackError } = await supabase.storage
          .from('clothing')
          .upload(path, file, { upsert: true });
        
        if (fallbackError) {
          // If storage bucket fails, convert to data URL as fail-safe
          console.warn('Storage upload error, using object URL fallback:', fallbackError);
        }
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketUsed)
        .getPublicUrl(path);

      const photoUrl = publicUrlData?.publicUrl || URL.createObjectURL(file);

      // 2. Update local state & cache
      let updatedFace = [...facePhotos];
      let updatedBody = [...bodyPhotos];

      if (type === 'face') {
        updatedFace[index] = photoUrl;
        setFacePhotos(updatedFace);
      } else {
        updatedBody[index] = photoUrl;
        setBodyPhotos(updatedBody);
      }

      const cleanFace = updatedFace.filter(Boolean);
      const cleanBody = updatedBody.filter(Boolean);

      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify({ face_photos: cleanFace, body_photos: cleanBody }));
      }

      // 3. Persist to API & Supabase
      try {
        await fetch('/api/user/avatar-calibration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            face_photos: cleanFace,
            body_photos: cleanBody,
          }),
        });
      } catch (apiErr) {
        console.warn('API sync error:', apiErr);
      }

      // Also try updating Supabase profiles table directly
      try {
        await (supabase.from('profiles') as any)
          .update({
            face_photos: cleanFace,
            body_photos: cleanBody,
          })
          .eq('id', user.id);
      } catch {}

      setSuccessMsg('Foto guardada correctamente');
      setTimeout(() => setSuccessMsg(null), 3000);

      // Check if all 6 photos are complete
      const totalCount = cleanFace.length + cleanBody.length;
      if (totalCount >= 6) {
        onCalibrationComplete?.();
      }
    } catch (err: any) {
      console.error('Error uploading calibration photo:', err);
      setErrorMsg(err.message || 'Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploadingSlot(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (type: 'face' | 'body', index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    let updatedFace = [...facePhotos];
    let updatedBody = [...bodyPhotos];

    if (type === 'face') {
      updatedFace.splice(index, 1);
      setFacePhotos(updatedFace);
    } else {
      updatedBody.splice(index, 1);
      setBodyPhotos(updatedBody);
    }

    const cleanFace = updatedFace.filter(Boolean);
    const cleanBody = updatedBody.filter(Boolean);

    if (cacheKey) {
      localStorage.setItem(cacheKey, JSON.stringify({ face_photos: cleanFace, body_photos: cleanBody }));
    }

    try {
      await fetch('/api/user/avatar-calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          face_photos: cleanFace,
          body_photos: cleanBody,
        }),
      });
    } catch {}

    try {
      await (supabase.from('profiles') as any)
        .update({
          face_photos: cleanFace,
          body_photos: cleanBody,
        })
        .eq('id', user.id);
    } catch {}
  };

  if (!isOpen) return null;

  const validFaceCount = facePhotos.filter(Boolean).length;
  const validBodyCount = bodyPhotos.filter(Boolean).length;
  const totalUploaded = validFaceCount + validBodyCount;
  const isComplete = totalUploaded >= 6;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--background)] rounded-3xl shadow-2xl border border-[var(--border-color)] p-6 z-10 no-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {step === 'intro' ? (
            /* Intro Step - Explicitly Optional with detailed photo instructions */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--brand-pink)] bg-[var(--brand-pink)]/10 px-3 py-1 rounded-full">
                  Función Opcional
                </span>
                <h2 className="text-xl font-bold text-[var(--foreground)] mt-3">
                  ¿Quieres crear tu Avatar Virtual?
                </h2>
                <p className="text-xs text-[var(--foreground-secondary)] mt-2 leading-relaxed max-w-md mx-auto">
                  Para que Kloe pueda modelar tus outfits con IA exactamente sobre ti, necesitamos 6 fotos de referencia con las siguientes pautas:
                </p>
              </div>

              {/* Guidelines Box */}
              <div className="space-y-3 text-left bg-[var(--background-secondary)]/70 border border-[var(--border-color)] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">3 Fotos de Rostro</h4>
                    <p className="text-[11px] text-[var(--foreground-secondary)] leading-relaxed mt-0.5">
                      Con buena iluminación natural o blanca, donde se te vea bien de <strong>frente</strong>, y fotos de perfil o 3/4 con expresión neutra.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-[var(--border-color)]/40">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">3 Fotos de Cuerpo Entero</h4>
                    <p className="text-[11px] text-[var(--foreground-secondary)] leading-relaxed mt-0.5">
                      Donde se te vea de pie, cuerpo completo de <strong>frente y de lado</strong>, con silueta clara y ropa neutra.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setStep('upload')}
                  className="w-full py-3.5 rounded-2xl bg-[var(--brand-pink)] text-white font-bold text-sm hover:bg-[var(--brand-pink-dark)] transition-colors shadow-lg shadow-[var(--brand-pink)]/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Crear mi avatar ahora
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border-color)]/60 text-xs font-semibold transition-colors cursor-pointer"
                >
                  No quiero crear mi avatar ahora
                </button>
              </div>

              <p className="text-[11px] text-[var(--foreground-tertiary)] italic">
                💡 Recuerda que puedes añadir o cambiar tus fotos cuando quieras desde el icono de la cámara en la esquina superior derecha.
              </p>
            </div>
          ) : (
            /* Upload Step - 6 Slots */
            <div>
              {/* Header */}
              <div className="text-center mb-6 pr-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Calibración de Avatar Virtual
                </h2>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Fotos con buena luz: rostro de frente y perfil, y cuerpo entero de frente y de lado.
                </p>

                {/* Progress Badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--background-secondary)] text-xs font-semibold text-[var(--foreground)] border border-[var(--border-color)]">
                  {isComplete ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">6/6 Fotos Listas para Probar Looks</span>
                    </>
                  ) : (
                    <span>{totalUploaded} de 6 fotos subidas</span>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Section 1: Face Photos (3) */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[var(--brand-pink)]" />
                    1. Fotos de Rostro ({validFaceCount}/3)
                  </h3>
                  <span className="text-[11px] text-[var(--foreground-tertiary)]">Frente, perfil y buena luz</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const photo = facePhotos[idx];
                    const isUploading = uploadingSlot === `face_${idx}`;

                    return (
                      <div
                        key={`face_${idx}`}
                        onClick={() => handleSelectSlot('face', idx)}
                        className="group relative aspect-square rounded-2xl bg-[var(--background-secondary)] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all"
                      >
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-[var(--brand-pink)] animate-spin" />
                        ) : photo ? (
                          <>
                            <img src={photo} alt={`Rostro ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => handleDeletePhoto('face', idx, e)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center text-[var(--foreground-tertiary)] group-hover:text-[var(--brand-pink)] transition-colors">
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-semibold">Rostro #{idx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Body Photos (3) */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[var(--brand-pink)]" />
                    2. Fotos de Cuerpo Entero ({validBodyCount}/3)
                  </h3>
                  <span className="text-[11px] text-[var(--foreground-tertiary)]">De frente y de lado</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const photo = bodyPhotos[idx];
                    const isUploading = uploadingSlot === `body_${idx}`;

                    return (
                      <div
                        key={`body_${idx}`}
                        onClick={() => handleSelectSlot('body', idx)}
                        className="group relative aspect-[3/4] rounded-2xl bg-[var(--background-secondary)] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all"
                      >
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-[var(--brand-pink)] animate-spin" />
                        ) : photo ? (
                          <>
                            <img src={photo} alt={`Cuerpo ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => handleDeletePhoto('body', idx, e)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center text-[var(--foreground-tertiary)] group-hover:text-[var(--brand-pink)] transition-colors">
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-semibold">Cuerpo #{idx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('intro')}
                  className="py-3 px-4 rounded-2xl bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Pautas
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--brand-pink)] text-white font-bold text-sm hover:bg-[var(--brand-pink-dark)] transition-colors shadow-lg shadow-[var(--brand-pink)]/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isComplete ? '✨ Guardar y Probar' : 'Guardar y Continuar'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
