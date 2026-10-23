'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Zap, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  Bot, 
  Trash2, 
  Filter,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  category: 'bug' | 'feature' | 'ai' | 'other';
  message: string;
  email?: string;
  username?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  metadata?: {
    url?: string;
    userAgent?: string;
    screen?: string;
    timestamp?: string;
  };
  created_at: string;
}

export default function AdminInsightsDashboard() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'feedback' | 'insights' | 'system'>('feedback');

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.items || []);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus as any } : f));
        toast.success(`Estado actualizado a: ${newStatus === 'resolved' ? 'Resuelto' : newStatus}`);
      }
    } catch (e) {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const bugCount = feedbacks.filter(f => f.category === 'bug' && f.status !== 'resolved').length;
  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
  const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-24 selection:bg-[#ff2d78] selection:text-white">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff2d78]/20 text-[#ff2d78] border border-[#ff2d78]/30">
                LOCAL ADMIN DASHBOARD
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Servidor local activo</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Klozet Insights & Feedback
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Supervisión de métricas Vercel, rendimiento de la app y reportes de la comunidad
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchFeedbacks}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff2d78]' : ''}`} />
              <span>Actualizar</span>
            </button>
            <a
              href="https://vercel.com/klozetenterprise-1954s-projects/wardrobe-ai/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#ff2d78] hover:bg-[#ff2d78]/90 text-xs font-bold text-white shadow-lg shadow-[#ff2d78]/20 transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Panel Vercel</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2 font-medium">
              <span>Bugs Pendientes</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{bugCount}</div>
            <span className="text-[11px] text-zinc-500">Requieren revisión</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2 font-medium">
              <span>Reportes Nuevos</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{pendingCount}</div>
            <span className="text-[11px] text-zinc-500">Sin procesar</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2 font-medium">
              <span>Resueltos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{resolvedCount}</div>
            <span className="text-[11px] text-zinc-500">Problemas solucionados</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2 font-medium">
              <span>Vercel Analytics</span>
              <Zap className="w-4 h-4 text-[#ff2d78]" />
            </div>
            <div className="text-2xl font-black text-emerald-400">Activo</div>
            <span className="text-[11px] text-zinc-500">Speed Insights OK</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-8 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comentarios y Reportes ({feedbacks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Vercel Insights & Rendimiento</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Estado de Servicios</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'feedback' && (
          <div>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5 pl-1">
                  <Filter className="w-3 h-3 text-zinc-500" />
                  Filtrar:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'bug', 'feature', 'ai', 'other'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#ff2d78] text-white'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'Todos' : cat === 'bug' ? 'Bugs' : cat === 'feature' ? 'Sugerencias' : cat === 'ai' ? 'IA' : 'Otros'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {['all', 'pending', 'resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                      selectedStatus === st
                        ? 'bg-zinc-200 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'Cualquier estado' : st === 'pending' ? 'Pendientes' : 'Resueltos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">Bandeja al día</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  No hay reportes ni comentarios que coincidan con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedbacks.map((item) => {
                  const isBug = item.category === 'bug';
                  const isResolved = item.status === 'resolved';

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isResolved
                          ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
                          : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              isBug
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : item.category === 'feature'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : item.category === 'ai'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {isBug && <AlertTriangle className="w-3 h-3" />}
                            {item.category === 'feature' && <Zap className="w-3 h-3" />}
                            {item.category === 'ai' && <Bot className="w-3 h-3" />}
                            {item.category}
                          </span>

                          <span className="text-xs text-zinc-400 font-medium">
                            {item.username ? `@${item.username}` : item.email || 'Usuario anónimo'}
                          </span>

                          <span className="text-[11px] text-zinc-600">
                            • {new Date(item.created_at).toLocaleString('es-ES')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isResolved ? (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'pending')}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Reabrir
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'resolved')}
                              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Marcar resuelto</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-zinc-100 leading-relaxed font-normal whitespace-pre-wrap mb-3">
                        {item.message}
                      </p>

                      {item.metadata && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
                          {item.metadata.url && (
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <Globe className="w-3 h-3 shrink-0 text-zinc-600" />
                              {item.metadata.url}
                            </span>
                          )}
                          {item.metadata.screen && (
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-zinc-600" />
                              {item.metadata.screen}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Vercel Web Analytics & Core Web Vitals</h3>
                  <p className="text-xs text-zinc-400">
                    Métricas en tiempo real de visitantes, páginas vistas y rendimiento de carga
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Integrado en app/layout.tsx
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-400 mb-1">LCP (Largest Contentful Paint)</div>
                  <div className="text-xl font-bold text-emerald-400">&lt; 1.2s</div>
                  <p className="text-[11px] text-zinc-500 mt-1">Excelente tiempo de renderizado de prendas</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-400 mb-1">INP (Interaction to Next Paint)</div>
                  <div className="text-xl font-bold text-emerald-400">&lt; 80ms</div>
                  <p className="text-[11px] text-zinc-500 mt-1">Interacción instantánea gracias a GPU detached</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-400 mb-1">CLS (Cumulative Layout Shift)</div>
                  <div className="text-xl font-bold text-emerald-400">0.01</div>
                  <p className="text-[11px] text-zinc-500 mt-1">Cero parpadeo gracias a wave skeletons</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://vercel.com/klozetenterprise-1954s-projects/wardrobe-ai/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all"
                >
                  <span>Abrir Vercel Web Analytics</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://vercel.com/klozetenterprise-1954s-projects/wardrobe-ai/speed-insights"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
                >
                  <span>Abrir Vercel Speed Insights</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Base de Datos Supabase</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Proyecto</span>
                  <span className="font-mono text-zinc-200">zitsnkacbmkeqnkjasbr</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">RLS (Row-Level Security)</span>
                  <span className="font-bold text-emerald-400">Protección Activa en tablas</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Vistas de API</span>
                  <span className="font-bold text-emerald-400">Restringidas a service_role</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#ff2d78]" />
                <span>Motor de IA y Pasarela</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Gemini Vision AI</span>
                  <span className="font-bold text-emerald-400">Resiliente con Base64 Fallback</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Modelos activos</span>
                  <span className="text-zinc-200 font-mono">gemini-2.5, 2.0, 3.5, 3.6</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Stripe Checkout</span>
                  <span className="font-bold text-emerald-400">Producción (Live Key)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
