import { create } from 'zustand';

export type TourStepId = 
  | 'style_preferences' 
  | 'avatar' 
  | 'upload_clothes' 
  | 'create_outfit' 
  | 'talk_to_kloe' 
  | 'create_post'
  | 'schedule_outfit' 
  | 'explore_like';

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
  weight: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'style_preferences',
    title: 'Estilo y preferencias definidos',
    shortTitle: 'Tus estilos',
    subtitle: 'Define tus gustos y vibes de moda',
    description: 'Tu edad, silueta y catálogo de estilos favoritos para que el feed y Kloe se adapten a tu estilo personal.',
    actionText: 'Personalizar estilos',
    actionUrl: '/onboarding/preferences',
    badge: 'Paso 1 de 6',
    weight: 20
  },
  {
    id: 'upload_clothes',
    title: 'Añade tus primeras 3 prendas',
    shortTitle: 'Sube tu ropa',
    subtitle: 'Sube fotos reales, capturas web o carga básicos de prueba',
    description: 'Para montar un look completo necesitas al menos una parte de arriba, una de abajo y calzado. Sube hasta 20 prendas de golpe o prueba con nuestros básicos en 1 toque.',
    actionText: 'Añadir prendas ahora',
    actionUrl: '/closet?action=new-item',
    tipTitle: '3 formas de llenar tu armario en segundos',
    tips: [
      'Cámara o galería: Haz foto sobre la cama o percha. Recortamos el fondo automáticamente.',
      'Capturas de tiendas: Sube fotos de Zara, Mango, Bershka, Pull&Bear, Nike o Scuffers.',
      'Básicos en 1 toque: Si estás en el sofá sin fotos, carga 4 básicos de muestra desde tu armario vacío para probar el lienzo ya.'
    ],
    badge: 'Paso 2 de 6',
    weight: 25
  },
  {
    id: 'create_outfit',
    title: 'Crea tu primer outfit en el lienzo',
    shortTitle: 'Crea tu look',
    subtitle: 'Tu estudio blanco interactivo',
    description: 'Combina tus prendas en el lienzo blanco: muévelas, escala proporciones, guárdalo en tu calendario o cópialo como Sticker HD para Instagram Stories.',
    actionText: 'Montar look en el lienzo',
    actionUrl: '/create',
    badge: 'Paso 3 de 6',
    weight: 20
  },
  {
    id: 'talk_to_kloe',
    title: 'Pídele un look a Kloe',
    shortTitle: 'Habla con Kloe',
    subtitle: 'Tu estilista personal 24/7',
    description: 'Pídele a Kloe que te arme un outfit con tu ropa para hoy, para una cita, trabajo o fiesta según el clima de tu ciudad.',
    actionText: 'Probar asesoría con Kloe',
    actionUrl: '/closet/kloe',
    badge: 'Paso 4 de 6',
    weight: 15
  },
  {
    id: 'create_post',
    title: 'Publica un look en la comunidad',
    shortTitle: 'Comparte tu look',
    subtitle: 'Inspira y conecta con tu estilo',
    description: 'Comparte tu outfit en el feed social, etiqueta tus prendas interactivas y recibe inspiración de otros creadores.',
    actionText: 'Compartir publicación',
    actionUrl: '/create-post',
    badge: 'Paso 5 de 6',
    weight: 10
  },
  {
    id: 'avatar',
    title: 'Personaliza tu foto de perfil',
    shortTitle: 'Foto de perfil',
    subtitle: 'Tu identidad en la comunidad',
    description: 'Añade tu foto de perfil para que otros creadores y amigos reconozcan tus outfits y publicaciones.',
    actionText: 'Añadir foto de perfil',
    actionUrl: '/profile/edit',
    badge: 'Paso 6 de 6',
    weight: 10
  }
];

export function calculateTourProgress(completedSteps: TourStepId[]): number {
  let score = 0;
  for (const step of TOUR_STEPS) {
    if (completedSteps.includes(step.id)) {
      score += step.weight;
    }
  }
  return Math.min(100, score);
}

interface TourState {
  currentUserId: string | null;
  isOpen: boolean;
  hasStartedTour: boolean;
  currentStepIndex: number;
  completedSteps: TourStepId[];
  isDismissed: boolean;
  isCompleted: boolean;
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
  completeTour: (userId?: string | null) => void;
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
      isDismissed: false,
      isCompleted: false
    };
  }

  const isCompletedKey = `klozet_tour_completed_${userId}`;
  const isCompletedFlag = localStorage.getItem(isCompletedKey) === 'true';

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      const isDismissed = Boolean(parsed.isDismissed || isCompletedFlag);
      const isCompleted = Boolean(parsed.isCompleted || isCompletedFlag);
      const loadedCompleted = Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [];

      return {
        isOpen: Boolean(parsed.isOpen && !isDismissed && !isCompleted),
        hasStartedTour: Boolean(parsed.hasStartedTour && !isDismissed && !isCompleted),
        currentStepIndex: typeof parsed.currentStepIndex === 'number' ? parsed.currentStepIndex : 0,
        completedSteps: isCompleted ? TOUR_STEPS.map(s => s.id) : loadedCompleted,
        isDismissed,
        isCompleted
      };
    }
  } catch (e) {
    console.warn('Could not parse tour state from storage:', e);
  }

  return {
    isOpen: false,
    hasStartedTour: false,
    currentStepIndex: 0,
    completedSteps: isCompletedFlag ? TOUR_STEPS.map(s => s.id) : [],
    isDismissed: isCompletedFlag,
    isCompleted: isCompletedFlag
  };
};

const persistUserState = (userId: string | null, state: { 
  isOpen: boolean; 
  hasStartedTour: boolean; 
  currentStepIndex: number; 
  completedSteps: TourStepId[]; 
  isDismissed: boolean;
  isCompleted?: boolean;
}) => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
    if (state.isCompleted) {
      localStorage.setItem(`klozet_tour_completed_${userId}`, 'true');
    }
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
  isCompleted: false,
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
      isDismissed: userState.isDismissed,
      isCompleted: userState.isCompleted
    });
  },

  startNewUserTour: (userId: string) => {
    if (typeof window !== 'undefined' && localStorage.getItem(`klozet_tour_completed_${userId}`) === 'true') {
      // Completed account: NEVER re-activate tutorial
      return;
    }
    const newState = {
      isOpen: false,
      hasStartedTour: true,
      currentStepIndex: 1,
      completedSteps: ['style_preferences'] as TourStepId[],
      isDismissed: false,
      isCompleted: false
    };
    set({
      currentUserId: userId,
      ...newState
    });
    persistUserState(userId, newState);
  },

  openTour: () => {
    const { currentStepIndex, completedSteps, isCompleted } = get();
    // Auto-focus first incomplete step if possible
    let targetIndex = currentStepIndex;
    const firstPending = TOUR_STEPS.findIndex(s => !completedSteps.includes(s.id));
    if (firstPending !== -1 && !completedSteps.includes(TOUR_STEPS[currentStepIndex]?.id)) {
      targetIndex = firstPending;
    }

    set({ isOpen: true, hasStartedTour: true, currentStepIndex: targetIndex });
    const current = get();
    persistUserState(current.currentUserId, {
      isOpen: true,
      hasStartedTour: true,
      currentStepIndex: targetIndex,
      completedSteps: current.completedSteps,
      isDismissed: false,
      isCompleted
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
      isDismissed: current.isDismissed,
      isCompleted: current.isCompleted
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
      isDismissed: true,
      isCompleted: current.isCompleted
    });
  },

  completeTour: (userId?: string | null) => {
    const uid = userId || get().currentUserId;
    if (typeof window !== 'undefined' && uid) {
      localStorage.setItem(`klozet_tour_completed_${uid}`, 'true');
    }
    const allSteps = TOUR_STEPS.map(s => s.id);
    const completedState = {
      isOpen: false,
      hasStartedTour: false,
      currentStepIndex: 0,
      completedSteps: allSteps,
      isDismissed: true,
      isCompleted: true,
      showCelebration: false
    };
    set(completedState);
    if (uid) {
      persistUserState(uid, completedState);
    }
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
      isDismissed: current.isDismissed,
      isCompleted: current.isCompleted
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
      isDismissed: current.isDismissed,
      isCompleted: current.isCompleted
    });
  },

  goToStep: (index: number) => {
    const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
    set({ currentStepIndex: clamped, isOpen: true });
    const current = get();
    persistUserState(current.currentUserId, {
      isOpen: true,
      hasStartedTour: current.hasStartedTour,
      currentStepIndex: clamped,
      completedSteps: current.completedSteps,
      isDismissed: current.isDismissed,
      isCompleted: current.isCompleted
    });
  },

  markStepComplete: (stepId: TourStepId, customMessage?: string, shouldCelebrate: boolean = true) => {
    const { completedSteps, hasStartedTour, isDismissed, isCompleted, currentStepIndex, currentUserId } = get();
    const alreadyDone = completedSteps.includes(stepId);
    const nextCompleted = alreadyDone ? completedSteps : [...completedSteps, stepId];
    
    const stepIdx = TOUR_STEPS.findIndex(s => s.id === stepId);
    const stepObj = TOUR_STEPS[stepIdx];
    const title = alreadyDone ? '¡Completado!' : `¡${stepObj?.shortTitle || 'Hito'} conseguido!`;
    const msg = customMessage || (alreadyDone 
      ? 'Ya has completado esta acción con éxito.' 
      : '¡Genial! Tu armario y perfil han ganado nivel.');

    const canCelebrate = shouldCelebrate && hasStartedTour && !isDismissed && !isCompleted;

    // Check if all steps reached
    const progress = calculateTourProgress(nextCompleted);
    const isNowAllDone = progress >= 100 || TOUR_STEPS.every(s => nextCompleted.includes(s.id));

    // Determine next step index (find first uncompleted step)
    let nextStepIdx = currentStepIndex;
    const firstPendingIdx = TOUR_STEPS.findIndex(s => !nextCompleted.includes(s.id));
    if (firstPendingIdx !== -1) {
      nextStepIdx = firstPendingIdx;
    }

    const nextStepObj = TOUR_STEPS[nextStepIdx];

    const nextState = {
      completedSteps: nextCompleted,
      currentStepIndex: nextStepIdx,
      isCompleted: isNowAllDone,
      isDismissed: isNowAllDone ? true : isDismissed,
      hasStartedTour: isNowAllDone ? false : hasStartedTour,
      showCelebration: canCelebrate,
      ...(canCelebrate ? { 
        celebrationTitle: title, 
        celebrationMessage: msg,
        celebrationNextUrl: nextStepObj?.actionUrl
      } : {})
    };

    set(nextState);

    persistUserState(currentUserId, {
      isOpen: isNowAllDone ? false : get().isOpen,
      hasStartedTour: isNowAllDone ? false : hasStartedTour,
      currentStepIndex: nextStepIdx,
      completedSteps: nextCompleted,
      isDismissed: isNowAllDone ? true : isDismissed,
      isCompleted: isNowAllDone
    });
  },

  resetTour: () => {
    const { currentUserId } = get();
    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.removeItem(`klozet_tour_completed_${currentUserId}`);
    }
    const newState = {
      isOpen: true,
      hasStartedTour: true,
      currentStepIndex: 0,
      completedSteps: [],
      isDismissed: false,
      isCompleted: false
    };
    set(newState);
    persistUserState(currentUserId, newState);
  },

  hideCelebration: () => {
    set({ showCelebration: false });
  }
}));
