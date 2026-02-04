/**
 * Translations for Klozet App
 * Supports: Spanish (es), English (en)
 * 
 * Note: Some anglicized words like "outfit" are kept in Spanish as they're commonly used
 */

// Removed import from store
export type Language = 'es' | 'en';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    closet: string;
    create: string;
    social: string;
    messages: string;
    kloe: string;
    profile: string;
    search: string;
  };

  // Closet Page
  closet: {
    title: string;
    search: string;
    filters: string;
    favorites: string;
    viewMode: string;
    quickActions: string;
    createOutfit: string;
    createOutfitDesc: string;
    addItem: string;
    addItemDesc: string;
    myItems: string;
    addFirstItem: string;
    wardrobeWaiting: string;
    addItemButton: string;
    all: string;
    clear: string;
    deleteConfirm: string;
    deleteMessage: string;
    delete: string;
    cancel: string;
    itemDeleted: string;
    itemDeletedMessage: string;
    error: string;
    deleteError: string;
    close: string;
    understood: string;
    thisItem: string;
  };

  // Item Types
  itemTypes: {
    top: string;
    bottom: string;
    dress: string;
    outerwear: string;
    shoes: string;
    accessories: string;
  };

  // Profile
  profile: {
    settings: string;
    posts: string;
    outfits: string;
    followers: string;
    following: string;
    backToProfile: string;
    configuration: string;
    generalSettings: string;
    generalSettingsDesc: string;
    theme: string;
    light: string;
    dark: string;
    language: string;
    notifications: string;
    notificationsDesc: string;
    newFollowers: string;
    likesOnPosts: string;
    comments: string;
    security: string;
    securityDesc: string;
    changePassword: string;
    twoFactor: string;
    privacy: string;
    privacyDesc: string;
    privateProfile: string;
    showActivity: string;
    yourStyle: string;
    edit: string;
    editProfile: string;
    gender: string;
    age: string;
    height: string;
    accessories: string;
    yes: string;
    minimalist: string;
    preferredStyles: string;
    preferences: string;
    account: string;
    logout: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    deleteAccountConfirm: string;
    deleteAccountMessage: string;
    editYourStyle: string;
    editStyleDesc: string;
    styleFormPlaceholder: string;
    toImplement: string;
    noPostsYet: string;
    shareOutfits: string;
    noPublicOutfits: string;
    markOutfitsPublic: string;
    goToCloset: string;
  };

  // Create Page
  create: {
    title: string;
    description: string;
    generateOutfit: string;
    myOutfits: string;
    noOutfits: string;
    createFirst: string;
  };

  // Social Page
  social: {
    title: string;
    trending: string;
    following: string;
    forYou: string;
  };

  // Messages
  messaging: {
    title: string;
    search: string;
    suggestions: string;
    results: string;
    messagesTab: string;
    requestsTab: string;
    yourMessages: string;
    sendPrivateMessages: string;
    noRequests: string;
    noRequestsDesc: string;
    startConversation: string;
    sendMessage: string;
    viewProfile: string;
    wantsToMessage: string;
    accept: string;
    restrict: string;
    onlyOneMessage: string;
    seen: string;
    noUsersFound: string;
  };

  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    confirm: string;
    back: string;
    next: string;
    finish: string;
    skip: string;
    noImage: string;
  };

  // Colors
  colors: {
    white: string;
    black: string;
    gray: string;
    beige: string;
    brown: string;
    blue: string;
    red: string;
    green: string;
    pink: string;
    yellow: string;
    purple: string;
    orange: string;
  };

  // Style Quiz
  styleQuiz: {
    title: string;
    subtitle: string;
    gender: string;
    male: string;
    female: string;
    nonBinary: string;
    preferNotToSay: string;
    ageRange: string;
    height: string;
    heightCm: string;
    heightRange: string;
    short: string;
    average: string;
    tall: string;
    preferredStyles: string;
    selectMultiple: string;
    accessories: string;
    accessoriesDesc: string;
    visualPreferences: string;
    visualPreferencesDesc: string;
    complete: string;
    next: string;
    back: string;
  };

  // Premium
  premium: {
    title: string;
    active: string;
    unlockAll: string;
    upgrade: string;
  };

  // App
  app: {
    tagline: string;
  };
  // Onboarding
  onboarding: {
    slides: {
      inspiration: { title: string; description: string; };
      time: { title: string; description: string; };
      rediscover: { title: string; description: string; };
      discovery: { title: string; description: string; };
    };
    cta: {
      title: string;
      description: string;
      signup: string;
      login: string;
    };
  };

  // Privacy Page
  privacyPage: {
    back: string;
    title: string;
    visibility: string;
    publicProfile: string;
    publicProfileDesc: string;
    shareAnalytics: string;
    shareAnalyticsDesc: string;
    dataAndPersonalization: string;
    personalizedRecommendations: string;
    personalizedRecommendationsDesc: string;
    saveHistory: string;
    saveHistoryDesc: string;
    yourData: string;
    downloadData: string;
    downloadDataDesc: string;
    download: string;
    legal: string;
    privacyPolicy: string;
    termsConditions: string;
    gdprMessage: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      home: 'Inicio',
      closet: 'Armario',
      create: 'Crear',
      social: 'Social',
      messages: 'Mensajes',
      kloe: 'Kloe',
      profile: 'Perfil',
      search: 'Buscar',
    },
    closet: {
      title: 'Mi Armario',
      search: 'Buscar...',
      filters: 'Filtros',
      favorites: 'Favoritos',
      viewMode: 'Vista',
      quickActions: 'Acciones Rápidas',
      createOutfit: 'Crear Outfit',
      createOutfitDesc: 'Genera looks con IA basados en tu armario',
      addItem: 'Añadir Prenda',
      addItemDesc: 'Sube fotos o escanea URLs de tiendas',
      myItems: 'Mis Prendas',
      addFirstItem: 'Añade una prenda',
      wardrobeWaiting: 'Tu armario te está esperando',
      addItemButton: 'Añadir prenda',
      all: 'Todo',
      clear: 'Limpiar',
      deleteConfirm: '¿Eliminar prenda?',
      deleteMessage: '¿Estás seguro de que quieres eliminar "{name}" de tu armario? Esta acción no se puede deshacer.',
      delete: 'Eliminar',
      cancel: 'Cancelar',
      itemDeleted: 'Prenda eliminada',
      itemDeletedMessage: 'La prenda se ha eliminado correctamente de tu armario.',
      error: 'Error',
      deleteError: 'No se pudo eliminar la prenda. Inténtalo de nuevo.',
      close: 'Cerrar',
      understood: 'Entendido',
      thisItem: 'esta prenda',
    },
    itemTypes: {
      top: 'Parte superior',
      bottom: 'Parte inferior',
      dress: 'Vestido',
      outerwear: 'Abrigo',
      shoes: 'Zapatos',
      accessories: 'Accesorios',
    },
    profile: {
      settings: 'Configuración',
      posts: 'Publicaciones',
      outfits: 'Outfits',
      followers: 'Seguidores',
      following: 'Siguiendo',
      backToProfile: 'Volver al perfil',
      configuration: 'Configuración',
      generalSettings: 'Ajustes generales',
      generalSettingsDesc: 'Tema, idioma y más',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      language: 'Idioma',
      notifications: 'Notificaciones',
      notificationsDesc: 'Gestiona tus alertas',
      newFollowers: 'Nuevos seguidores',
      likesOnPosts: 'Me gusta en publicaciones',
      comments: 'Comentarios',
      security: 'Seguridad',
      securityDesc: 'Contraseña y autenticación',
      changePassword: 'Cambiar contraseña',
      twoFactor: 'Autenticación de dos factores',
      privacy: 'Privacidad',
      privacyDesc: 'Datos y permisos',
      privateProfile: 'Perfil privado',
      showActivity: 'Mostrar actividad',
      yourStyle: 'Tu Estilo',
      edit: 'Editar',
      editProfile: 'Editar perfil',
      gender: 'Género',
      age: 'Edad',
      height: 'Altura',
      accessories: 'Accesorios',
      yes: 'Sí',
      minimalist: 'Minimalista',
      preferredStyles: 'Estilos preferidos',
      preferences: 'Preferencias',
      account: 'Cuenta',
      logout: 'Cerrar sesión',
      deleteAccount: 'Eliminar cuenta',
      deleteAccountDesc: 'Elimina permanentemente tu cuenta y todos tus datos',
      deleteAccountConfirm: '¿Eliminar cuenta?',
      deleteAccountMessage: 'Esta acción no se puede deshacer. Todos tus datos, prendas y outfits serán eliminados permanentemente.',
      editYourStyle: 'Editar Tu Estilo',
      editStyleDesc: 'Actualiza tus preferencias de estilo y personaliza tu experiencia',
      styleFormPlaceholder: 'Formulario de edición de estilo',
      toImplement: '(Por implementar)',
      noPostsYet: 'No hay publicaciones aún',
      shareOutfits: 'Comparte tus outfits favoritos con la comunidad',
      noPublicOutfits: 'No hay outfits públicos',
      markOutfitsPublic: 'Marca tus outfits como públicos para mostrarlos aquí',
      goToCloset: 'Ir al armario',
    },
    create: {
      title: 'Crear Outfit',
      description: 'Genera looks personalizados con IA',
      generateOutfit: 'Generar Outfit',
      myOutfits: 'Mis Outfits',
      noOutfits: 'Aún no tienes outfits',
      createFirst: 'Crea tu primer outfit',
    },
    social: {
      title: 'Social',
      trending: 'Tendencias',
      following: 'Siguiendo',
      forYou: 'Para ti',
    },
    messaging: {
      title: 'Mensajes',
      search: 'Buscar',
      suggestions: 'Sugerencias',
      results: 'Resultados',
      messagesTab: 'Mensajes',
      requestsTab: 'Solicitudes',
      yourMessages: 'Tus mensajes',
      sendPrivateMessages: 'Envía mensajes privados a tus amigos',
      noRequests: 'No hay solicitudes de mensajes',
      noRequestsDesc: 'No tienes ninguna solicitud de mensaje.',
      startConversation: 'Inicia una conversación',
      sendMessage: 'Envía un mensaje...',
      viewProfile: 'Ver perfil',
      wantsToMessage: 'quiere enviarte un mensaje.',
      accept: 'Aceptar',
      restrict: 'Restringir',
      onlyOneMessage: 'Solo puedes enviar un mensaje hasta que acepten tu solicitud.',
      seen: 'Visto',
      noUsersFound: 'No se encontraron usuarios',
    },
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      back: 'Atrás',
      next: 'Siguiente',
      finish: 'Finalizar',
      skip: 'Omitir',
      noImage: 'Sin imagen',
    },
    colors: {
      white: 'Blanco',
      black: 'Negro',
      gray: 'Gris',
      beige: 'Beige',
      brown: 'Marrón',
      blue: 'Azul',
      red: 'Rojo',
      green: 'Verde',
      pink: 'Rosa',
      yellow: 'Amarillo',
      purple: 'Morado',
      orange: 'Naranja',
    },
    styleQuiz: {
      title: 'Cuestionario de Estilo',
      subtitle: 'Ayúdanos a conocer tu estilo',
      gender: 'Género',
      male: 'Masculino',
      female: 'Femenino',
      nonBinary: 'No binario',
      preferNotToSay: 'Prefiero no decir',
      ageRange: 'Rango de edad',
      height: 'Altura',
      heightCm: 'Altura (cm)',
      heightRange: 'Rango de altura',
      short: 'Bajo',
      average: 'Promedio',
      tall: 'Alto',
      preferredStyles: 'Estilos preferidos',
      selectMultiple: 'Selecciona todos los que apliquen',
      accessories: 'Accesorios',
      accessoriesDesc: '¿Usas accesorios regularmente?',
      visualPreferences: 'Preferencias visuales',
      visualPreferencesDesc: '¿Qué te gusta ver en tu ropa?',
      complete: 'Completar',
      next: 'Siguiente',
      back: 'Atrás',
    },
    onboarding: {
      slides: {
        inspiration: {
          title: 'Inspiración al Instante',
          description: '¿No sabes qué ponerte? Olvídate del bloqueo creativo. Recibe ideas frescas de outfits cada mañana según tu estilo y el clima.',
        },
        time: {
          title: 'Ahorro de Tiempo Valioso',
          description: 'Vístete en segundos, no en minutos. Planifica tus looks desde el sofá y deja de probarte ropa innecesariamente.',
        },
        rediscover: {
          title: 'Redescubre tu Armario',
          description: 'Nuestra IA encuentra combinaciones increíbles con la ropa que ya tienes. ¡Parecerá que estrenas ropa nueva!',
        },
        discovery: {
          title: 'Encuentra lo que Amas',
          description: 'Explora nuevas tendencias y descubre prendas que encajan perfectamente con tu colección actual.',
        },
      },
      cta: {
        title: '¿Listo para empezar?',
        description: 'Crea tu cuenta y comienza a revolucionar tu estilo hoy mismo.',
        signup: 'Crear cuenta gratis',
        login: 'Ya tengo cuenta',
      },
    },
    privacyPage: {
      back: 'Volver',
      title: 'Privacidad',
      visibility: 'Visibilidad',
      publicProfile: 'Perfil público',
      publicProfileDesc: 'Permite que otros vean tu perfil',
      shareAnalytics: 'Compartir analíticas',
      shareAnalyticsDesc: 'Ayúdanos a mejorar compartiendo datos anónimos',
      dataAndPersonalization: 'Datos y Personalización',
      personalizedRecommendations: 'Recomendaciones personalizadas',
      personalizedRecommendationsDesc: 'Usa tu historial para mejorar sugerencias',
      saveHistory: 'Guardar historial',
      saveHistoryDesc: 'Mantén un registro de tus outfits generados',
      yourData: 'Tus Datos',
      downloadData: 'Descargar mis datos',
      downloadDataDesc: 'Obtén una copia de toda tu información',
      download: 'Descargar',
      legal: 'Legal',
      privacyPolicy: 'Política de Privacidad',
      termsConditions: 'Términos y Condiciones',
      gdprMessage: '🔒 Tu privacidad es importante. Cumplimos con GDPR y otras regulaciones de protección de datos. Tus datos nunca se venden a terceros.',
    },
    premium: {
      title: 'Premium',
      active: 'Activo',
      unlockAll: 'Desbloquea todo',
      upgrade: 'Mejorar',
    },
    app: {
      tagline: 'Tu estilista personal',
    },
  },
  en: {
    nav: {
      home: 'Home',
      closet: 'Closet',
      create: 'Create',
      social: 'Social',
      messages: 'Messages',
      kloe: 'Kloe',
      profile: 'Profile',
      search: 'Search',
    },
    closet: {
      title: 'My Closet',
      search: 'Search...',
      filters: 'Filters',
      favorites: 'Favorites',
      viewMode: 'View',
      quickActions: 'Quick Actions',
      createOutfit: 'Create Outfit',
      createOutfitDesc: 'Generate AI-powered looks from your wardrobe',
      addItem: 'Add Item',
      addItemDesc: 'Upload photos or scan store URLs',
      myItems: 'My Items',
      addFirstItem: 'Add an item',
      wardrobeWaiting: 'Your wardrobe is waiting for you',
      addItemButton: 'Add item',
      all: 'All',
      clear: 'Clear',
      deleteConfirm: 'Delete item?',
      deleteMessage: 'Are you sure you want to delete "{name}" from your wardrobe? This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      itemDeleted: 'Item deleted',
      itemDeletedMessage: 'The item has been successfully removed from your wardrobe.',
      error: 'Error',
      deleteError: 'Could not delete the item. Please try again.',
      close: 'Close',
      understood: 'Got it',
      thisItem: 'this item',
    },
    itemTypes: {
      top: 'Top',
      bottom: 'Bottom',
      dress: 'Dress',
      outerwear: 'Outerwear',
      shoes: 'Shoes',
      accessories: 'Accessories',
    },
    profile: {
      settings: 'Settings',
      posts: 'Posts',
      outfits: 'Outfits',
      followers: 'Followers',
      following: 'Following',
      backToProfile: 'Back to profile',
      configuration: 'Configuration',
      generalSettings: 'General settings',
      generalSettingsDesc: 'Theme, language and more',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      language: 'Language',
      notifications: 'Notifications',
      notificationsDesc: 'Manage your alerts',
      newFollowers: 'New followers',
      likesOnPosts: 'Likes on posts',
      comments: 'Comments',
      security: 'Security',
      securityDesc: 'Password and authentication',
      changePassword: 'Change password',
      twoFactor: 'Two-factor authentication',
      privacy: 'Privacy',
      privacyDesc: 'Data and permissions',
      privateProfile: 'Private profile',
      showActivity: 'Show activity',
      yourStyle: 'Your Style',
      edit: 'Edit',
      editProfile: 'Edit profile',
      gender: 'Gender',
      age: 'Age',
      height: 'Height',
      accessories: 'Accessories',
      yes: 'Yes',
      minimalist: 'Minimalist',
      preferredStyles: 'Preferred styles',
      preferences: 'Preferences',
      account: 'Account',
      logout: 'Log out',
      deleteAccount: 'Delete account',
      deleteAccountDesc: 'Permanently delete your account and all your data',
      deleteAccountConfirm: 'Delete account?',
      deleteAccountMessage: 'This action cannot be undone. All your data, items and outfits will be permanently deleted.',
      editYourStyle: 'Edit Your Style',
      editStyleDesc: 'Update your style preferences and customize your experience',
      styleFormPlaceholder: 'Style editing form',
      toImplement: '(To be implemented)',
      noPostsYet: 'No posts yet',
      shareOutfits: 'Share your favorite outfits with the community',
      noPublicOutfits: 'No public outfits',
      markOutfitsPublic: 'Mark your outfits as public to show them here',
      goToCloset: 'Go to closet',
    },
    create: {
      title: 'Create Outfit',
      description: 'Generate personalized AI-powered looks',
      generateOutfit: 'Generate Outfit',
      myOutfits: 'My Outfits',
      noOutfits: 'You don\'t have any outfits yet',
      createFirst: 'Create your first outfit',
    },
    social: {
      title: 'Social',
      trending: 'Trending',
      following: 'Following',
      forYou: 'For you',
    },
    messaging: {
      title: 'Messages',
      search: 'Search',
      suggestions: 'Suggestions',
      results: 'Results',
      messagesTab: 'Messages',
      requestsTab: 'Requests',
      yourMessages: 'Your messages',
      sendPrivateMessages: 'Send private messages to your friends',
      noRequests: 'No message requests',
      noRequestsDesc: 'You don\'t have any message requests.',
      startConversation: 'Start a conversation',
      sendMessage: 'Send a message...',
      viewProfile: 'View profile',
      wantsToMessage: 'wants to send you a message.',
      accept: 'Accept',
      restrict: 'Restrict',
      onlyOneMessage: 'You can only send one message until they accept your request.',
      seen: 'Seen',
      noUsersFound: 'No users found',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      skip: 'Skip',
      noImage: 'No image',
    },
    colors: {
      white: 'White',
      black: 'Black',
      gray: 'Gray',
      beige: 'Beige',
      brown: 'Brown',
      blue: 'Blue',
      red: 'Red',
      green: 'Green',
      pink: 'Pink',
      yellow: 'Yellow',
      purple: 'Purple',
      orange: 'Orange',
    },
    styleQuiz: {
      title: 'Style Quiz',
      subtitle: 'Help us understand your style',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      nonBinary: 'Non-binary',
      preferNotToSay: 'Prefer not to say',
      ageRange: 'Age range',
      height: 'Height',
      heightCm: 'Height (cm)',
      heightRange: 'Height range',
      short: 'Short',
      average: 'Average',
      tall: 'Tall',
      preferredStyles: 'Preferred styles',
      selectMultiple: 'Select all that apply',
      accessories: 'Accessories',
      accessoriesDesc: 'Do you wear accessories regularly?',
      visualPreferences: 'Visual preferences',
      visualPreferencesDesc: 'What do you like to see in your clothes?',
      complete: 'Complete',
      next: 'Next',
      back: 'Back',
    },
    onboarding: {
      slides: {
        inspiration: {
          title: 'Instant Inspiration',
          description: 'Don\'t know what to wear? Forget creative block. Get fresh outfit ideas every morning based on your style and weather.',
        },
        time: {
          title: 'Save Valuable Time',
          description: 'Get dressed in seconds, not minutes. Plan your looks from the couch and stop trying on clothes unnecessarily.',
        },
        rediscover: {
          title: 'Rediscover Your Wardrobe',
          description: 'Our AI finds incredible combinations with clothes you already own. It\'ll feel like you\'re wearing new clothes!',
        },
        discovery: {
          title: 'Find What You Love',
          description: 'Explore new trends and discover items that fit perfectly with your current collection.',
        },
      },
      cta: {
        title: 'Ready to start?',
        description: 'Create your account and start revolutionizing your style today.',
        signup: 'Create free account',
        login: 'I already have an account',
      },
    },
    privacyPage: {
      back: 'Back',
      title: 'Privacy',
      visibility: 'Visibility',
      publicProfile: 'Public profile',
      publicProfileDesc: 'Allow others to see your profile',
      shareAnalytics: 'Share analytics',
      shareAnalyticsDesc: 'Help us improve by sharing anonymous data',
      dataAndPersonalization: 'Data & Personalization',
      personalizedRecommendations: 'Personalized recommendations',
      personalizedRecommendationsDesc: 'Use your history to improve suggestions',
      saveHistory: 'Save history',
      saveHistoryDesc: 'Keep a record of your generated outfits',
      yourData: 'Your Data',
      downloadData: 'Download my data',
      downloadDataDesc: 'Get a copy of all your information',
      download: 'Download',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      termsConditions: 'Terms & Conditions',
      gdprMessage: '🔒 Your privacy is important. We comply with GDPR and other data protection regulations. Your data is never sold to third parties.',
    },
    premium: {
      title: 'Premium',
      active: 'Active',
      unlockAll: 'Unlock everything',
      upgrade: 'Upgrade',
    },
    app: {
      tagline: 'Your personal stylist',
    },
  },
};
