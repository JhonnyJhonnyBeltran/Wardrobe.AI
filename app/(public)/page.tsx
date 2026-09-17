'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck, FileText } from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white flex flex-col antialiased overflow-x-hidden">
      
      {/* 1. TOP HEADER (ONLY LOGIN & REGISTER BUTTONS AS REQUESTED) */}
      <div className="fixed top-0 right-0 z-50 p-4 sm:p-6 flex items-center gap-3">
        {user ? (
          <Link 
            href="/closet" 
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-black bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-lg shadow-[var(--brand-pink)]/25 active:scale-95 flex items-center gap-1.5"
          >
            <span>Mi Armario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <>
            <Link 
              href="/auth" 
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)]/70 transition-all active:scale-95 shadow-xs"
            >
              Iniciar sesión
            </Link>
            <Link 
              href="/auth" 
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-black bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1"
            >
              <span>Registrarse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>


      {/* ======================================================== */}
      {/* KEYFRAME 0: HERO (BOLD & EDITORIAL WHERING STYLE) */}
      {/* ======================================================== */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 py-20 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[850px] h-[340px] sm:h-[850px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center justify-center relative z-10">
          
          {/* Big Klozet Brand Title Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <Image 
              src="/landing/klozet-nombre-grande.png" 
              alt="Klozet" 
              width={260} 
              height={90} 
              className="h-10 sm:h-16 w-auto object-contain mx-auto drop-shadow-md"
              priority
            />
          </motion.div>

          {/* Editorial Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--foreground)] leading-[1.02] max-w-4xl"
          >
            Ama tu armario. <br />
            <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Vístete mejor.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-base sm:text-xl text-[var(--foreground-secondary)] max-w-xl font-medium leading-relaxed"
          >
            Digitaliza todas tus prendas, monta looks en lienzos libres y descubre combinaciones únicas con lo que ya tienes.
          </motion.p>

          {/* Action CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
          >
            <Link
              href={user ? "/closet" : "/auth"}
              className="w-full sm:w-auto px-9 py-4 rounded-full font-black text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>{user ? "Ir a mi armario" : "Empezar gratis"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Floating Garment Cutouts (Desktop) */}
          <div className="hidden lg:block absolute -left-12 xl:-left-6 top-6 w-44 xl:w-52 pointer-events-none drop-shadow-2xl animate-float">
            <Image 
              src="/landing/sudadera-scuffers-cutout.png" 
              alt="Sudadera Scuffers Cutout" 
              width={240} 
              height={240} 
              className="w-full h-auto object-contain -rotate-12"
              priority 
            />
          </div>

          <div className="hidden lg:block absolute -left-10 xl:-left-4 bottom-0 w-40 xl:w-48 pointer-events-none drop-shadow-2xl">
            <Image 
              src="/landing/pantalon-blanco.png" 
              alt="Pantalón Blanco Cutout" 
              width={220} 
              height={280} 
              className="w-full h-auto object-contain rotate-6"
              priority 
            />
          </div>

          <div className="hidden lg:block absolute -right-12 xl:-right-6 top-6 w-44 xl:w-52 pointer-events-none drop-shadow-2xl animate-float">
            <Image 
              src="/landing/camisa-zara-cutout.png" 
              alt="Camisa Zara Cutout" 
              width={240} 
              height={240} 
              className="w-full h-auto object-contain rotate-12"
              priority 
            />
          </div>

          <div className="hidden lg:block absolute -right-10 xl:-right-4 bottom-0 w-40 xl:w-48 pointer-events-none drop-shadow-2xl">
            <Image 
              src="/landing/botas-cowboy.png" 
              alt="Botas Cowboy Cutout" 
              width={220} 
              height={280} 
              className="w-full h-auto object-contain -rotate-6"
              priority 
            />
          </div>

        </div>

        {/* Scroll Cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[11px] font-bold text-[var(--foreground-tertiary)] uppercase tracking-widest pointer-events-none">
          <span>Scroll</span>
          <ChevronDown className="w-4 h-4 text-[var(--brand-pink)] animate-bounce" />
        </div>
      </section>


      {/* ======================================================== */}
      {/* KEYFRAME 1: DIGITALIZACIÓN ("MERECE VERSE. MERECE LLEVARSE.") */}
      {/* ======================================================== */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 py-20 border-t border-[var(--border-color)]/50 relative overflow-hidden bg-[var(--card-bg)]/30">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          
          {/* Left Column: Bold Editorial Typography */}
          <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
            <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-black uppercase tracking-wider mb-4 inline-block w-fit mx-auto md:mx-0">
              Digitalización Instantánea
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
              Merecen verse. <br />
              <span className="text-[var(--brand-pink)]">
                Merecen llevarse.
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              Tu ropa no debería quedarse olvidada en el fondo del armario. Sube una foto y Klozet elimina el fondo al milímetro, identificando color, tejido, corte y estilo.
            </p>
          </div>

          {/* Right Column: Tilted Bold Fashion Cards Stack */}
          <div className="md:col-span-6 flex items-center justify-center relative min-h-[340px] sm:min-h-[400px]">
            
            {/* Star Jeans Back Card */}
            <div className="absolute -left-2 sm:left-4 top-2 w-[170px] sm:w-[220px] rounded-3xl p-4 bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xl -rotate-12">
              <div className="w-full aspect-square relative flex items-center justify-center">
                <Image 
                  src="/landing/jeans-stars.png" 
                  alt="Jeans Stars" 
                  width={200} 
                  height={200} 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-black text-center mt-2 text-[var(--foreground-secondary)]">One Dilemma Star</p>
            </div>

            {/* Scuffers Hoodie Front Hero Card */}
            <div className="relative z-10 w-[250px] sm:w-[310px] rounded-3xl p-5 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] shadow-2xl rotate-2">
              <div className="w-full aspect-square relative flex items-center justify-center mb-3">
                <Image 
                  src="/landing/sudadera-scuffers-cutout.png" 
                  alt="Sudadera Scuffers Cutout" 
                  width={280} 
                  height={280} 
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              <div className="w-full pt-2.5 border-t border-[var(--border-color)]/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-[var(--brand-pink)] uppercase tracking-wider">Scuffers</span>
                  <h3 className="text-sm sm:text-base font-black text-[var(--foreground)]">Boxy Hoodie Naranja</h3>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                  Sin fondo
                </span>
              </div>
            </div>

            {/* Golden Goose Sneaker Front Card */}
            <div className="absolute right-0 sm:right-2 bottom-0 w-[170px] sm:w-[210px] rounded-3xl p-3.5 bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-xl rotate-12">
              <div className="w-full aspect-video relative flex items-center justify-center">
                <Image 
                  src="/landing/golden-goose.png" 
                  alt="Golden Goose Sneaker" 
                  width={190} 
                  height={110} 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <p className="text-[11px] font-black text-center mt-1 text-[var(--brand-pink)]">Golden Goose Glitter</p>
            </div>

          </div>
        </div>
      </section>


      {/* ======================================================== */}
      {/* KEYFRAME 2: LIENZO LIBRE DE CREACIÓN */}
      {/* ======================================================== */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 py-20 border-t border-[var(--border-color)]/50 relative overflow-hidden">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          
          {/* Left Column: Bold Text */}
          <div className="md:col-span-6 text-center md:text-left order-2 md:order-1 flex flex-col justify-center">
            <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider mb-4 inline-block w-fit mx-auto md:mx-0">
              Lienzo Creativo
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
              Combina como <br />
              <span className="bg-gradient-to-r from-purple-500 to-[var(--brand-pink)] bg-clip-text text-transparent">
                un estilista.
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              Arrastra, gira y superpón tus prendas en un lienzo libre estilo moodboard. Prueba infinitas combinaciones en tu pantalla antes de desordenar tu cuarto.
            </p>
          </div>

          {/* Right Column: Clean Canvas Showcase Card */}
          <div className="md:col-span-6 flex items-center justify-center order-1 md:order-2">
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-[var(--border-color)]/70 text-xs font-bold text-[var(--foreground-secondary)]">
                <span className="font-black text-[var(--foreground)]">Lienzo Moodboard</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-black text-[10px]">
                  LOOK ACTIVO
                </span>
              </div>
              <div className="w-full relative flex items-center justify-center py-3">
                <Image 
                  src="/landing/outfit-canvas-clean.png" 
                  alt="Outfit Canvas Scuffers + Onitsuka" 
                  width={420} 
                  height={500} 
                  className="w-full h-auto object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ======================================================== */}
      {/* KEYFRAME 3: INSPIRACIÓN & OUTFITS REALES CHICAS / CHICOS */}
      {/* ======================================================== */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 py-20 border-t border-[var(--border-color)]/50 relative overflow-hidden bg-[var(--card-bg)]/30">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          
          {/* Left Column: Bold Text */}
          <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-4 inline-block w-fit mx-auto md:mx-0">
              Inspiración Real
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
              Despiértate sabiendo <br />
              <span className="text-emerald-600 dark:text-emerald-400">
                qué ponerte hoy.
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              Planifica tus outfits para toda la semana, combina prendas reales y descubre inspiración auténtica de chicos y chicas con tu mismo estilo.
            </p>
          </div>

          {/* Right Column: Editorial Photo Grid with Real Models */}
          <div className="md:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[440px] rounded-3xl p-5 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col items-center gap-3.5">
              
              <div className="w-full flex items-center justify-between pb-2.5 border-b border-[var(--border-color)] text-xs font-bold text-[var(--foreground-secondary)]">
                <span className="font-black text-[var(--foreground)]">Comunidad Klozet</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-[10px]">
                  CHICOS & CHICAS
                </span>
              </div>

              {/* 4 Real Outfit Photos */}
              <div className="grid grid-cols-4 gap-2.5 w-full">
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                  <Image src="/landing/outfits/chica-cookies-denim.jpg" alt="Outfit Chica Denim" fill className="object-cover" />
                </div>
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                  <Image src="/landing/outfits/chico-henley-pleated.jpg" alt="Outfit Chico Henley" fill className="object-cover" />
                </div>
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                  <Image src="/landing/outfits/chica-leopard-scarf.jpg" alt="Outfit Chica Scarf" fill className="object-cover" />
                </div>
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                  <Image src="/landing/outfits/chico-yellow-baggy.jpg" alt="Outfit Chico Baggy" fill className="object-cover" />
                </div>
              </div>

              {/* Cutout Items Strip */}
              <div className="grid grid-cols-3 gap-2.5 w-full pt-1.5 border-t border-[var(--border-color)]/40">
                <div className="h-14 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                  <Image src="/landing/golden-goose.png" alt="Golden Goose" width={75} height={38} className="object-contain" />
                </div>
                <div className="h-14 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                  <Image src="/landing/sudadera-scuffers-cutout.png" alt="Scuffers" width={55} height={55} className="object-contain" />
                </div>
                <div className="h-14 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                  <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka" width={60} height={60} className="object-contain" />
                </div>
              </div>

              <p className="text-[11px] text-center text-[var(--foreground-secondary)] font-semibold">
                Streetwear, Quiet Luxury & Clean Look
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ======================================================== */}
      {/* KEYFRAME 4: ACCESO FINAL & FOOTER LEGAL INTEGRADO */}
      {/* ======================================================== */}
      <section className="min-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-8 py-16 border-t border-[var(--border-color)]/50 relative overflow-hidden">
        
        {/* Spacer */}
        <div className="h-4" />

        {/* Central Card */}
        <div className="w-full max-w-2xl p-8 sm:p-12 rounded-3xl bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl flex flex-col items-center text-center my-auto">
          
          <div className="mb-4">
            <Image 
              src="/landing/klozet-nombre-grande.png" 
              alt="Klozet" 
              width={200} 
              height={70} 
              className="h-10 sm:h-14 w-auto object-contain mx-auto" 
            />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
            Tu armario en tu bolsillo.
          </h2>
          
          <p className="mt-4 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-md font-medium">
            Regístrate gratis en menos de un minuto y empieza a organizar tus looks favoritos sin complicaciones.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/auth"
              className="w-full sm:w-auto px-9 py-4 rounded-full font-black text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2 group"
            >
              <span>Entrar a Klozet gratis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {user && (
              <Link
                href="/closet"
                className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-base bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 inline-flex items-center justify-center"
              >
                Ir a mi armario
              </Link>
            )}
          </div>
        </div>

        {/* INTEGRATED LEGAL FOOTER */}
        <div className="w-full max-w-5xl mx-auto pt-8 border-t border-[var(--border-color)]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--foreground-secondary)] font-semibold">
          <p className="text-[11px] text-[var(--foreground-tertiary)]">
            © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px]">
            <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Términos y Condiciones</span>
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacidad</span>
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/cookies" className="hover:text-[var(--brand-pink)] transition-colors">
              Cookies
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <a href="mailto:soporte@klozet.es" className="hover:text-[var(--brand-pink)] transition-colors">
              soporte@klozet.es
            </a>
          </div>
        </div>

      </section>

    </div>
  );
}



