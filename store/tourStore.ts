import { create } from 'zustand';

export type TourStepId = 'upload_clothes' | 'create_outfit' | 'schedule_outfit' | 'talk_to_kloe' | 'create_post' | 'explore_like';

export interface TourStep {
  id: TourStepId;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  actionText: string;
  actionUrl: string;
  tipTitle?: string;
  tips?: string[];
  badge: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'upload_clothes',
    title: 'Añade tus primeras 2 prendas',
    shortTitle: 'Subir 2 prendas',
    subtitle: 'El corazón de tu armario virtual',
    description: 'Sube al menos 2 prendas de tu ropa para empezar a crear combinaciones automáticas.',
    actionText: 'Subir mi primera prenda',
    actionUrl: '/closet?action=new-item',
    tipTitle: 'Consejos para fotos perfectas',
    tips: [
      'Luz natural directa: Haz la foto cerca de una ventana para captar los tonos reales.',
      'Fondo liso y despejado: Extiende la prenda sobre la cama o cuélgala en una percha contra una pared neutra.',
      'O capturas de tiendas online: Puedes subir fotos de webs (Zara, ASOS, Nike) y la IA eliminará el fondo automáticamente.'
    ],
    badge: 'Paso 1 de 6'
  },
  {
    id: 'create_outfit',
    title: 'Crea tu primer look en el lienzo',
    shortTitle: 'Crear outfit',
    subtitle: 'Lienzo interactivo de estilo',
    description: 'Combina tus prendas en el lienzo interactivo arrastrándolas, rotándolas y ajustando proporciones a tu gusto.',
    actionText: 'Ir al lienzo y montar look',
    actionUrl: '/create',
    badge: 'Paso 2 de 6'
  },
  {
    id: 'schedule_outfit',
    title: 'Planifica tu outfit en el calendario',
    shortTitle: 'Planificar look',
    subtitle: 'Olvídate de pensar qué ponerte cada día',
    description: 'Asigna tu look para hoy o para una fecha especial en tu calendario inteligente.',
    actionText: 'Ver mi calendario de estilo',
    actionUrl: '/closet?tab=calendar',
    badge: 'Paso 3 de 6'
  },
  {
    id: 'talk_to_kloe',
    title: 'Pide asesoría y estilismo a Kloe',
    shortTitle: 'Hablar con Kloe',
    subtitle: 'Tu estilista inteligente 24/7',
    description: 'Kloe analiza tus prendas reales y fotos para darte combinaciones y consejos de moda según la ocasión.',
    actionText: 'Consultar a Kloe',
    actionUrl: '/closet/kloe',
    badge: 'Paso 4 de 6'
  },
  {
    id: 'create_post',
    title: 'Comparte tu look con la comunidad',
    shortTitle: 'Publicar look',
    subtitle: 'Inspira a otros amantes de la moda',
    description: 'Publica tu outfit en el feed social para recibir feedback y conectar con personas de tu mismo estilo.',
    actionText: 'Crear publicación',
    actionUrl: '/create-post',
    badge: 'Paso 5 de 6'
  },
  {
    id: 'explore_like',
    title: 'Explora tendencias y da me gusta',
    shortTitle: 'Explorar y dar Like',
    subtitle: 'Entrena tu algoritmo de estilo',
    description: 'Busca prendas o marcas (como "Scuffers", "Zapatos" o "Sudaderas") y da like a los looks que te inspiren.',
    actionText: 'Ir a Explorar y Buscar',
    actionUrl: '/search',
    badge: 'Paso 6 de 6'
  }
];

interface TourState {
  currentUserId: string | null;
  isOpen: boolean;
  hasStartedTour: boolean;
  currentStepIndex: number;
  completedSteps: TourStepId[];
  isDismissed: boolean;
  showCelebration: boolean;
  celebrationTitle: string;
  celebrationMessage: string;
  celebrationNextUrl?: string;

  // Actions
  initUserTour: (userId: string) => void;
  startNewUserTour: (userId: string) => void;
  openTour: () => void;
  closeTour: () => void;
  dismissTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  markStepComplete: (stepId: TourStepId, customMessage?: string, shouldCelebrate?: boolean) => void;
  resetTour: () => void;
  hideCelebration: () => void;
}

const getStorageKey = (userId?: string | null) => {
  return userId ? `klozet_tour_user_${userId}` : 'klozet_tour_anon';
};

const loadUserState = (userId: string | null) => {
  if (typeof window === 'undefined' || !userId) {
    return {
      isOpen: false,
      hasStartedTour: false,
      currentStepIndex: 0,
      completedSteps: [] as TourStepId[],
      isDismissed: false
    };
  }

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isOpen: Boolean(parsed.isOpen),
        hasStartedTour: Boolean(parsed.hasStartedTour),
        currentStepIndex: typeof parsed.currentStepIndex === 'number' ? parsed.currentStepIndex : 0,
        completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [],
        isDismissed: typeof parsed.isDismissed === 'boolean' ? parsed.isDismissed : false
      };
    }
  } catch (e) {
    console.warn('Could not parse tour state from storage:', e);
  }

  return {
    isOpen: false,
    hasStartedTour: false,
    currentStepIndex: 0,
    completedSteps: [] as TourStepId[],
    isDismissed: false
  };
};

const persistUserState = (userId: string | null, state: { isOpen: boolean; hasStartedTour: boolean; currentStepIndex: number; completedSteps: TourStepId[]; isDismissed: boolean }) => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch (e) {
    console.warn('Could not persist tour state:', e);
  }
};

export const useTourStore = create<TourState>((set, get) => ({
  currentUserId: null,
  isOpen: false,
  hasStartedTour: false,
  currentStepIndex: 0,
  completedSteps: [],
  isDismissed: false,
  showCelebration: false,
  celebrationTitle: '¡Bien hecho!',
  celebrationMessage: 'Has completado una micro-acción de estilo.',
  celebrationNextUrl: undefined,

  initUserTour: (userId: string) => {
    if (!userId) return;
    const { currentUserId } = get();
    if (currentUserId === userId) return; // already initialized for this user

    const userState = loadUserState(userId);
    set({
      currentUserId: userId,
      isOpen: userState.isOpen,
      hasStartedTour: userState.hasStartedTour,
      currentStepIndex: userState.currentStepIndex,
      completedSteps: userState.completedSteps,
      isDismissed: userState.isDismissed
    });
  },

  startNewUserTour: (userId: string) => {
    const newState = {
      isOpen: true,
      hasStartedTour: true,
      currentStepIndex: 0,
      completedSteps: [],
      isDismissed: false
    };
    set({
      currentUserId: userId,
      ...newState
    });
    persistUserState(userId, newState);
  },

  openTour: () => {
    set({ isOpen: true, hasStartedTour: true, isDismissed: false });
    const current = get();
    persistUserState(current.currentUserId, {
      isOpen: true,
      hasStartedTour: true,
      currentStepIndex: current.currentStepIndex,
      completedSteps: current.completedSteps,
      isDismissed: false
    });
  },

  closeTour: () => {
    set({ isOpen: false });
    const current = get();
    persistUserState(current.currentUserId, {
      isOpen: false,
      hasStartedTour: current.hasStartedTour,
      currentStepIndex: current.currentStepIndex,
      completedSteps: current.completedSteps,
      isDismissed: current.isDismissed
    });
  },

  dismissTour: () => {
    set({ isOpen: false, isDismissed: true, hasStartedTour: false, showCelebration: false });
    const current = get();
    persistUserState(current.currentUserId, {
      isOpen: false,
      hasStartedTour: false,
      currentStepIndex: current.currentStepIndex,
      completedSteps: current.completedSteps,
      isDismissed: true
    });
  },

  nextStep: () => {
    const { currentStepIndex, currentUserId } = get();
    const nextIdx = Math.min(TOUR_STEPS.length - 1, currentStepIndex + 1);
    set({ currentStepIndex: nextIdx });
    const current = get();
    persistUserState(currentUserId, {
      isOpen: current.isOpen,
      hasStartedTour: current.hasStartedTour,
      currentStepIndex: nextIdx,
      completedSteps: current.completedSteps,
      isDismissed: current.isDismissed
    });
  },

  prevStep: () => {
    const { currentStepIndex, currentUserId } = get();
    const prevIdx = Math.max(0, currentStepIndex - 1);
    set({ currentStepIndex: prevIdx });
    const current = get();
    persistUserState(currentUserId, {
      isOpen: current.isOpen,
      hasStartedTour: current.hasStartedTour,
      currentStepIndex: prevIdx,
      completedSteps: current.completedSteps,
      isDismissed: current.isDismissed
    });
  },

  goToStep: (index: number) => {
    const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
    set({ currentStepIndex: clamped, isOpen: true, hasStartedTour: true, isDismissed: false });
    const current = get();
    persistUserState(current.currentUserId, {
      isOpen: true,
      hasStartedTour: true,
      currentStepIndex: clamped,
      completedSteps: current.completedSteps,
      isDismissed: false
    });
  },

  markStepComplete: (stepId: TourStepId, customMessage?: string, shouldCelebrate: boolean = true) => {
    const { completedSteps, hasStartedTour, isDismissed, currentStepIndex, currentUserId } = get();
    const alreadyDone = completedSteps.includes(stepId);
    const nextCompleted = alreadyDone ? completedSteps : [...completedSteps, stepId];
    
    const stepIdx = TOUR_STEPS.findIndex(s => s.id === stepId);
    const stepObj = TOUR_STEPS[stepIdx];
    const title = alreadyDone ? '¡Completado!' : `¡${stepObj?.shortTitle || 'Hito'} conseguido!`;
    const msg = customMessage || (alreadyDone 
      ? 'Ya has completado esta acción con éxito.' 
      : '¡Genial! Tu armario y perfil han ganado nivel.');

    const canCelebrate = shouldCelebrate && hasStartedTour && !isDismissed;

    // Determine next step index (find first uncompleted step)
    let nextStepIdx = currentStepIndex;
    const firstPendingIdx = TOUR_STEPS.findIndex(s => !nextCompleted.includes(s.id));
    if (firstPendingIdx !== -1) {
      nextStepIdx = firstPendingIdx;
    }

    const nextStepObj = TOUR_STEPS[nextStepIdx];

    set({
      completedSteps: nextCompleted,
      currentStepIndex: nextStepIdx,
      showCelebration: canCelebrate,
      ...(canCelebrate ? { 
        celebrationTitle: title, 
        celebrationMessage: msg,
        celebrationNextUrl: nextStepObj?.actionUrl
      } : {})
    });

    persistUserState(currentUserId, {
      isOpen: get().isOpen,
      hasStartedTour: hasStartedTour,
      currentStepIndex: nextStepIdx,
      completedSteps: nextCompleted,
      isDismissed: isDismissed
    });
  },

  resetTour: () => {
    const { currentUserId } = get();
    const newState = {
      isOpen: true,
      hasStartedTour: true,
      currentStepIndex: 0,
      completedSteps: [],
      isDismissed: false
    };
    set(newState);
    persistUserState(currentUserId, newState);
  },

  hideCelebration: () => {
    set({ showCelebration: false });
  }
}));

