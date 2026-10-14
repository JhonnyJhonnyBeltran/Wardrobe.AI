/**
 * Translations for Klozet App
 * Supports: Spanish (es), English (en)
 * 
 * Note: Some anglicized words like "outfit" are kept in Spanish as they're commonly used
 */

// Removed import from store
export type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

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
    shirt: string;
    sweater: string;
    hoodie: string;
    jacket: string;
    bottom: string;
    shorts: string;
    skirt: string;
    dress: string;
    outerwear: string;
    shoes: string;
    bag: string;
    accessory: string;
    accessories: string;
    other: string;
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
      top: 'Camiseta / Top',
      shirt: 'Camisa',
      sweater: 'Jersey / Suéter',
      hoodie: 'Sudadera',
      jacket: 'Chaqueta / Cazadora',
      bottom: 'Pantalón',
      shorts: 'Shorts',
      skirt: 'Falda',
      dress: 'Vestido',
      outerwear: 'Abrigo',
      shoes: 'Zapatos / Sneakers',
      bag: 'Bolso / Mochila',
      accessory: 'Accesorios',
      accessories: 'Accesorios',
      other: 'Otros (Libros, objetos, etc.)',
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
      top: 'T-Shirt / Top',
      shirt: 'Shirt',
      sweater: 'Sweater',
      hoodie: 'Hoodie / Sweatshirt',
      jacket: 'Jacket',
      bottom: 'Pants / Trousers',
      shorts: 'Shorts',
      skirt: 'Skirt',
      dress: 'Dress',
      outerwear: 'Coat / Outerwear',
      shoes: 'Shoes / Sneakers',
      bag: 'Bag / Backpack',
      accessory: 'Accessories',
      accessories: 'Accessories',
      other: 'Others (Books, objects, etc.)',
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
  fr: {
    nav: {
      home: 'Accueil',
      closet: 'Dressing',
      create: 'Créer',
      social: 'Social',
      messages: 'Messages',
      kloe: 'Kloe',
      profile: 'Profil',
      search: 'Recherche',
    },
    closet: {
      title: 'Mon Dressing',
      search: 'Rechercher...',
      filters: 'Filtres',
      favorites: 'Favoris',
      viewMode: 'Vue',
      quickActions: 'Actions rapides',
      createOutfit: 'Créer une tenue',
      createOutfitDesc: 'Générez des looks avec l\'IA basés sur votre dressing',
      addItem: 'Ajouter un vêtement',
      addItemDesc: 'Téléchargez des photos ou scannez des liens',
      myItems: 'Mes Vêtements',
      addFirstItem: 'Ajoutez un vêtement',
      wardrobeWaiting: 'Votre dressing vous attend',
      addItemButton: 'Ajouter un vêtement',
      all: 'Tout',
      clear: 'Effacer',
      deleteConfirm: 'Supprimer le vêtement ?',
      deleteMessage: 'Voulez-vous vraiment supprimer "{name}" de votre dressing ? Cette action est irréversible.',
      delete: 'Supprimer',
      cancel: 'Annuler',
      itemDeleted: 'Vêtement supprimé',
      itemDeletedMessage: 'Le vêtement a été supprimé de votre dressing.',
      error: 'Erreur',
      deleteError: 'Impossible de supprimer le vêtement. Veuillez réessayer.',
      close: 'Fermer',
      understood: 'Compris',
      thisItem: 'ce vêtement',
    },
    itemTypes: {
      top: 'T-shirt / Haut',
      shirt: 'Chemise',
      sweater: 'Pull',
      hoodie: 'Sweat à capuche',
      jacket: 'Veste',
      bottom: 'Pantalon',
      shorts: 'Short',
      skirt: 'Jupe',
      dress: 'Robe',
      outerwear: 'Manteau / Parka',
      shoes: 'Chaussures / Baskets',
      bag: 'Sac / Sac à dos',
      accessory: 'Accessoires',
      accessories: 'Accessoires',
      other: 'Autres (Livres, objets, etc.)',
    },
    profile: {
      settings: 'Paramètres',
      posts: 'Publications',
      outfits: 'Tenues',
      followers: 'Abonnés',
      following: 'Abonnements',
      backToProfile: 'Retour au profil',
      configuration: 'Configuration',
      generalSettings: 'Paramètres généraux',
      generalSettingsDesc: 'Thème, langue et plus',
      theme: 'Thème',
      light: 'Clair',
      dark: 'Sombre',
      language: 'Langue',
      notifications: 'Notifications',
      notificationsDesc: 'Gérez vos alertes',
      newFollowers: 'Nouveaux abonnés',
      likesOnPosts: 'J\'aime sur les publications',
      comments: 'Commentaires',
      security: 'Sécurité',
      securityDesc: 'Mot de passe et authentification',
      changePassword: 'Changer le mot de passe',
      twoFactor: 'Authentification à deux facteurs',
      privacy: 'Confidentialité',
      privacyDesc: 'Données et autorisations',
      privateProfile: 'Profil privé',
      showActivity: 'Afficher l\'activité',
      yourStyle: 'Votre Style',
      edit: 'Modifier',
      editProfile: 'Modifier le profil',
      gender: 'Genre',
      age: 'Âge',
      height: 'Taille',
      accessories: 'Accessoires',
      yes: 'Oui',
      minimalist: 'Minimaliste',
      preferredStyles: 'Styles préférés',
      preferences: 'Préférences',
      account: 'Compte',
      logout: 'Déconnexion',
      deleteAccount: 'Supprimer le compte',
      deleteAccountDesc: 'Supprimer définitivement votre compte et vos données',
      deleteAccountConfirm: 'Supprimer le compte ?',
      deleteAccountMessage: 'Cette action est irréversible. Toutes vos données seront définitivement effacées.',
      editYourStyle: 'Modifier votre style',
      editStyleDesc: 'Mettez à jour vos préférences de style',
      styleFormPlaceholder: 'Formulaire de modification du style',
      toImplement: '(À implémenter)',
      noPostsYet: 'Aucune publication pour l\'instant',
      shareOutfits: 'Partagez vos tenues préférées avec la communauté',
      noPublicOutfits: 'Aucune tenue publique',
      markOutfitsPublic: 'Rendez vos tenues publiques pour les afficher ici',
      goToCloset: 'Aller au dressing',
    },
    create: {
      title: 'Créer une tenue',
      description: 'Générez des looks personnalisés avec l\'IA',
      generateOutfit: 'Générer une tenue',
      myOutfits: 'Mes Tenues',
      noOutfits: 'Vous n\'avez pas encore de tenues',
      createFirst: 'Créez votre première tenue',
    },
    social: {
      title: 'Social',
      trending: 'Tendances',
      following: 'Abonnements',
      forYou: 'Pour vous',
    },
    messaging: {
      title: 'Messages',
      search: 'Rechercher',
      suggestions: 'Suggestions',
      results: 'Résultats',
      messagesTab: 'Messages',
      requestsTab: 'Demandes',
      yourMessages: 'Vos messages',
      sendPrivateMessages: 'Envoyez des messages privés à vos amis',
      noRequests: 'Aucune demande de message',
      noRequestsDesc: 'Vous n\'avez aucune demande de message.',
      startConversation: 'Démarrer une conversation',
      sendMessage: 'Envoyer un message...',
      viewProfile: 'Voir le profil',
      wantsToMessage: 'souhaite vous envoyer un message.',
      accept: 'Accepter',
      restrict: 'Restreindre',
      onlyOneMessage: 'Vous ne pouvez envoyer qu\'un seul message jusqu\'à acceptation.',
      seen: 'Vu',
      noUsersFound: 'Aucun utilisateur trouvé',
    },
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      finish: 'Terminer',
      skip: 'Passer',
      noImage: 'Aucune image',
    },
    colors: {
      white: 'Blanc',
      black: 'Noir',
      gray: 'Gris',
      beige: 'Beige',
      brown: 'Marron',
      blue: 'Bleu',
      red: 'Rouge',
      green: 'Vert',
      pink: 'Rose',
      yellow: 'Jaune',
      purple: 'Violet',
      orange: 'Orange',
    },
    styleQuiz: {
      title: 'Quiz de Style',
      subtitle: 'Aidez-nous à cerner votre style',
      gender: 'Genre',
      male: 'Homme',
      female: 'Femme',
      nonBinary: 'Non-binaire',
      preferNotToSay: 'Préfère ne pas le dire',
      ageRange: 'Tranche d\'âge',
      height: 'Taille',
      heightCm: 'Taille (cm)',
      heightRange: 'Gabarit',
      short: 'Petit(e)',
      average: 'Moyen(ne)',
      tall: 'Grand(e)',
      preferredStyles: 'Styles préférés',
      selectMultiple: 'Sélectionnez tout ce qui s\'applique',
      accessories: 'Accessoires',
      accessoriesDesc: 'Portez-vous régulièrement des accessoires ?',
      visualPreferences: 'Préférences visuelles',
      visualPreferencesDesc: 'Qu\'aimez-vous voir dans vos vêtements ?',
      complete: 'Terminer',
      next: 'Suivant',
      back: 'Retour',
    },
    onboarding: {
      slides: {
        inspiration: {
          title: 'Inspiration Instantanée',
          description: 'En panne d\'idées le matin ? Recevez des suggestions de looks fraîches selon votre style et la météo.',
        },
        time: {
          title: 'Gagnez un Temps Précieux',
          description: 'Habillez-vous en quelques secondes. Planifiez vos tenues depuis votre canapé sans essayages superflus.',
        },
        rediscover: {
          title: 'Redécouvrez Votre Dressing',
          description: 'Notre IA compose d\'incroyables tenues avec vos vêtements existants. L\'impression d\'avoir une garde-robe neuve !',
        },
        discovery: {
          title: 'Trouvez ce que Vous Aimez',
          description: 'Explorez de nouvelles tendances et découvrez des pièces qui complètent votre collection.',
        },
      },
      cta: {
        title: 'Prêt à commencer ?',
        description: 'Créez votre compte et révolutionnez votre style dès aujourd\'hui.',
        signup: 'Créer un compte gratuit',
        login: 'J\'ai déjà un compte',
      },
    },
    privacyPage: {
      back: 'Retour',
      title: 'Confidentialité',
      visibility: 'Visibilité',
      publicProfile: 'Profil public',
      publicProfileDesc: 'Permettre aux autres de voir votre profil',
      shareAnalytics: 'Partager les analyses',
      shareAnalyticsDesc: 'Aidez-nous à nous améliorer en partageant des données anonymes',
      dataAndPersonalization: 'Données et Personnalisation',
      personalizedRecommendations: 'Recommandations personnalisées',
      personalizedRecommendationsDesc: 'Utiliser votre historique pour affiner les suggestions',
      saveHistory: 'Historique des tenues',
      saveHistoryDesc: 'Conserver un historique de vos looks générés',
      yourData: 'Vos Données',
      downloadData: 'Télécharger mes données',
      downloadDataDesc: 'Obtenir une copie de toutes vos informations',
      download: 'Télécharger',
      legal: 'Mentions Légales',
      privacyPolicy: 'Politique de Confidentialité',
      termsConditions: 'Conditions Générales',
      gdprMessage: '🔒 Votre confidentialité est primordiale. Nous respectons le RGPD et vos données ne sont jamais revendues.',
    },
    premium: {
      title: 'Premium',
      active: 'Actif',
      unlockAll: 'Tout débloquer',
      upgrade: 'Passer à Pro',
    },
    app: {
      tagline: 'Votre styliste personnel',
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      closet: 'Kleiderschrank',
      create: 'Erstellen',
      social: 'Community',
      messages: 'Nachrichten',
      kloe: 'Kloe',
      profile: 'Profil',
      search: 'Suche',
    },
    closet: {
      title: 'Mein Kleiderschrank',
      search: 'Suchen...',
      filters: 'Filter',
      favorites: 'Favoriten',
      viewMode: 'Ansicht',
      quickActions: 'Schnellaktionen',
      createOutfit: 'Outfit erstellen',
      createOutfitDesc: 'KI-Outfits basierend auf deiner Garderobe generieren',
      addItem: 'Kleidungsstück hinzufügen',
      addItemDesc: 'Fotos hochladen oder Shop-Links scannen',
      myItems: 'Meine Kleidung',
      addFirstItem: 'Füge ein Kleidungsstück hinzu',
      wardrobeWaiting: 'Dein Kleiderschrank wartet auf dich',
      addItemButton: 'Kleidungsstück hinzufügen',
      all: 'Alle',
      clear: 'Löschen',
      deleteConfirm: 'Kleidungsstück löschen?',
      deleteMessage: 'Möchtest du "{name}" wirklich aus deinem Kleiderschrank entfernen? Dies kann nicht rückgängig gemacht werden.',
      delete: 'Löschen',
      cancel: 'Abbrechen',
      itemDeleted: 'Kleidungsstück gelöscht',
      itemDeletedMessage: 'Das Kleidungsstück wurde erfolgreich entfernt.',
      error: 'Fehler',
      deleteError: 'Konnte nicht gelöscht werden. Bitte erneut versuchen.',
      close: 'Schließen',
      understood: 'Verstanden',
      thisItem: 'dieses Kleidungsstück',
    },
    itemTypes: {
      top: 'T-Shirt / Oberteil',
      shirt: 'Hemd / Bluse',
      sweater: 'Pullover',
      hoodie: 'Hoodie / Sweatshirt',
      jacket: 'Jacke',
      bottom: 'Hose',
      shorts: 'Shorts',
      skirt: 'Rock',
      dress: 'Kleid',
      outerwear: 'Mantel / Parka',
      shoes: 'Schuhe / Sneaker',
      bag: 'Tasche / Rucksack',
      accessory: 'Accessoires',
      accessories: 'Accessoires',
      other: 'Sonstiges (Bücher, Objekte usw.)',
    },
    profile: {
      settings: 'Einstellungen',
      posts: 'Beiträge',
      outfits: 'Outfits',
      followers: 'Follower',
      following: 'Gefolgt',
      backToProfile: 'Zurück zum Profil',
      configuration: 'Konfiguration',
      generalSettings: 'Allgemeine Einstellungen',
      generalSettingsDesc: 'Design, Sprache und mehr',
      theme: 'Design',
      light: 'Hell',
      dark: 'Dunkel',
      language: 'Sprache',
      notifications: 'Benachrichtigungen',
      notificationsDesc: 'Verwalte deine Hinweise',
      newFollowers: 'Neue Follower',
      likesOnPosts: 'Likes auf Beiträge',
      comments: 'Kommentare',
      security: 'Sicherheit',
      securityDesc: 'Passwort und Authentifizierung',
      changePassword: 'Passwort ändern',
      twoFactor: 'Zwei-Faktor-Authentifizierung',
      privacy: 'Datenschutz',
      privacyDesc: 'Daten und Berechtigungen',
      privateProfile: 'Privates Profil',
      showActivity: 'Aktivität anzeigen',
      yourStyle: 'Dein Stil',
      edit: 'Bearbeiten',
      editProfile: 'Profil bearbeiten',
      gender: 'Geschlecht',
      age: 'Alter',
      height: 'Größe',
      accessories: 'Accessoires',
      yes: 'Ja',
      minimalist: 'Minimalistisch',
      preferredStyles: 'Bevorzugte Stile',
      preferences: 'Präferenzen',
      account: 'Konto',
      logout: 'Abmelden',
      deleteAccount: 'Konto löschen',
      deleteAccountDesc: 'Konto und alle Daten unwiderruflich löschen',
      deleteAccountConfirm: 'Konto wirklich löschen?',
      deleteAccountMessage: 'Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden gelöscht.',
      editYourStyle: 'Deinen Stil anpassen',
      editStyleDesc: 'Aktualisiere deine Stilpräferenzen',
      styleFormPlaceholder: 'Stil-Formular',
      toImplement: '(Wird implementiert)',
      noPostsYet: 'Noch keine Beiträge',
      shareOutfits: 'Teile deine Lieblingsoutfits mit der Community',
      noPublicOutfits: 'Keine öffentlichen Outfits',
      markOutfitsPublic: 'Mache Outfits öffentlich, um sie hier zu zeigen',
      goToCloset: 'Zum Kleiderschrank',
    },
    create: {
      title: 'Outfit erstellen',
      description: 'Erstelle individuelle Looks mit KI',
      generateOutfit: 'Outfit generieren',
      myOutfits: 'Meine Outfits',
      noOutfits: 'Du hast noch keine Outfits',
      createFirst: 'Erstelle dein erstes Outfit',
    },
    social: {
      title: 'Community',
      trending: 'Trends',
      following: 'Gefolgt',
      forYou: 'Für dich',
    },
    messaging: {
      title: 'Nachrichten',
      search: 'Suchen',
      suggestions: 'Vorschläge',
      results: 'Ergebnisse',
      messagesTab: 'Nachrichten',
      requestsTab: 'Anfragen',
      yourMessages: 'Deine Nachrichten',
      sendPrivateMessages: 'Sende private Nachrichten an Freunde',
      noRequests: 'Keine Nachrichtenanfragen',
      noRequestsDesc: 'Du hast keine neuen Anfragen.',
      startConversation: 'Gespräch beginnen',
      sendMessage: 'Nachricht schreiben...',
      viewProfile: 'Profil ansehen',
      wantsToMessage: 'möchte dir eine Nachricht senden.',
      accept: 'Annehmen',
      restrict: 'Einschränken',
      onlyOneMessage: 'Du kannst nur eine Nachricht senden, bis die Anfrage angenommen wird.',
      seen: 'Gesehen',
      noUsersFound: 'Keine Benutzer gefunden',
    },
    common: {
      loading: 'Wird geladen...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      close: 'Schließen',
      confirm: 'Bestätigen',
      back: 'Zurück',
      next: 'Weiter',
      finish: 'Fertig',
      skip: 'Überspringen',
      noImage: 'Kein Bild',
    },
    colors: {
      white: 'Weiß',
      black: 'Schwarz',
      gray: 'Grau',
      beige: 'Beige',
      brown: 'Braun',
      blue: 'Blau',
      red: 'Rot',
      green: 'Grün',
      pink: 'Rosa',
      yellow: 'Gelb',
      purple: 'Lila',
      orange: 'Orange',
    },
    styleQuiz: {
      title: 'Stil-Quiz',
      subtitle: 'Hilf uns, deinen Stil zu verstehen',
      gender: 'Geschlecht',
      male: 'Männlich',
      female: 'Weiblich',
      nonBinary: 'Nicht-binär',
      preferNotToSay: 'Keine Angabe',
      ageRange: 'Altersgruppe',
      height: 'Größe',
      heightCm: 'Größe (cm)',
      heightRange: 'Körpergröße',
      short: 'Klein',
      average: 'Mittel',
      tall: 'Groß',
      preferredStyles: 'Bevorzugte Stile',
      selectMultiple: 'Wähle alle passenden aus',
      accessories: 'Accessoires',
      accessoriesDesc: 'Trägst du regelmäßig Accessoires?',
      visualPreferences: 'Visuelle Vorlieben',
      visualPreferencesDesc: 'Welche Ästhetik gefällt dir am besten?',
      complete: 'Abschließen',
      next: 'Weiter',
      back: 'Zurück',
    },
    onboarding: {
      slides: {
        inspiration: {
          title: 'Sofortige Inspiration',
          description: 'Keine Ahnung, was du anziehen sollst? Erhalte jeden Morgen frische Outfit-Ideen passend zu Wetter und Stil.',
        },
        time: {
          title: 'Wertvolle Zeit Sparen',
          description: 'In Sekunden angezogen sein. Plane Looks bequem vom Sofa ohne endloses Anprobieren.',
        },
        rediscover: {
          title: 'Kleiderschrank Neu Entdecken',
          description: 'Unsere KI kombiniert deine vorhandene Kleidung überraschend neu. Wie eine neue Garderobe!',
        },
        discovery: {
          title: 'Finde Was Dir Steht',
          description: 'Entdecke neue Trends und passende Ergänzungen zu deiner Kollektion.',
        },
      },
      cta: {
        title: 'Bereit durchzustarten?',
        description: 'Erstelle dein Konto und revolutioniere deinen Stil noch heute.',
        signup: 'Kostenloses Konto erstellen',
        login: 'Ich habe bereits ein Konto',
      },
    },
    privacyPage: {
      back: 'Zurück',
      title: 'Datenschutz',
      visibility: 'Sichtbarkeit',
      publicProfile: 'Öffentliches Profil',
      publicProfileDesc: 'Anderen erlauben, dein Profil zu sehen',
      shareAnalytics: 'Analysen teilen',
      shareAnalyticsDesc: 'Hilf uns mit anonymen Daten, die App zu verbessern',
      dataAndPersonalization: 'Daten & Personalisierung',
      personalizedRecommendations: 'Personalisierte Empfehlungen',
      personalizedRecommendationsDesc: 'Verwende den Verlauf für bessere Vorschläge',
      saveHistory: 'Verlauf speichern',
      saveHistoryDesc: 'Behalte den Überblick über deine generierten Outfits',
      yourData: 'Deine Daten',
      downloadData: 'Meine Daten herunterladen',
      downloadDataDesc: 'Erhalte eine Kopie all deiner Daten',
      download: 'Herunterladen',
      legal: 'Rechtliches',
      privacyPolicy: 'Datenschutzerklärung',
      termsConditions: 'AGB',
      gdprMessage: '🔒 Datenschutz steht an erster Stelle. Wir halten die DSGVO ein und verkaufen deine Daten niemals.',
    },
    premium: {
      title: 'Premium',
      active: 'Aktiv',
      unlockAll: 'Alles freischalten',
      upgrade: 'Upgrade durchführen',
    },
    app: {
      tagline: 'Dein persönlicher Stylist',
    },
  },
  it: {
    nav: {
      home: 'Home',
      closet: 'Armadio',
      create: 'Crea',
      social: 'Social',
      messages: 'Messaggi',
      kloe: 'Kloe',
      profile: 'Profilo',
      search: 'Cerca',
    },
    closet: {
      title: 'Il mio Armadio',
      search: 'Cerca...',
      filters: 'Filtri',
      favorites: 'Preferiti',
      viewMode: 'Vista',
      quickActions: 'Azioni rapide',
      createOutfit: 'Crea Outfit',
      createOutfitDesc: 'Genera look con l\'IA basati sul tuo armadio',
      addItem: 'Aggiungi Capo',
      addItemDesc: 'Carica foto o scansiona link di negozi',
      myItems: 'I miei Capi',
      addFirstItem: 'Aggiungi un capo',
      wardrobeWaiting: 'Il tuo armadio ti sta aspettando',
      addItemButton: 'Aggiungi capo',
      all: 'Tutti',
      clear: 'Cancella',
      deleteConfirm: 'Eliminare il capo?',
      deleteMessage: 'Sei sicuro di voler eliminare "{name}" dal tuo armadio? L\'azione è irreversibile.',
      delete: 'Elimina',
      cancel: 'Annulla',
      itemDeleted: 'Capo eliminato',
      itemDeletedMessage: 'Il capo è stato rimosso con successo dal tuo armadio.',
      error: 'Errore',
      deleteError: 'Impossibile eliminare il capo. Riprova.',
      close: 'Chiudi',
      understood: 'Ho capito',
      thisItem: 'questo capo',
    },
    itemTypes: {
      top: 'T-shirt / Top',
      shirt: 'Camicia',
      sweater: 'Maglione',
      hoodie: 'Felpa con cappuccio',
      jacket: 'Giacca',
      bottom: 'Pantaloni',
      shorts: 'Pantaloncini',
      skirt: 'Gonna',
      dress: 'Abito',
      outerwear: 'Cappotto / Giubbotto',
      shoes: 'Scarpe / Sneakers',
      bag: 'Borsa / Zaino',
      accessory: 'Accessori',
      accessories: 'Accessori',
      other: 'Altro (Libri, oggetti, ecc.)',
    },
    profile: {
      settings: 'Impostazioni',
      posts: 'Post',
      outfits: 'Outfit',
      followers: 'Follower',
      following: 'Seguiti',
      backToProfile: 'Torna al profilo',
      configuration: 'Configurazione',
      generalSettings: 'Impostazioni generali',
      generalSettingsDesc: 'Tema, lingua e altro',
      theme: 'Tema',
      light: 'Chiaro',
      dark: 'Scuro',
      language: 'Lingua',
      notifications: 'Notifiche',
      notificationsDesc: 'Gestisci i tuoi avvisi',
      newFollowers: 'Nuovi follower',
      likesOnPosts: 'Mi piace ai post',
      comments: 'Commenti',
      security: 'Sicurezza',
      securityDesc: 'Password e autenticazione',
      changePassword: 'Cambia password',
      twoFactor: 'Autenticazione a due fattori',
      privacy: 'Privacy',
      privacyDesc: 'Dati e permessi',
      privateProfile: 'Profilo privato',
      showActivity: 'Mostra attività',
      yourStyle: 'Il tuo Stile',
      edit: 'Modifica',
      editProfile: 'Modifica profilo',
      gender: 'Genere',
      age: 'Età',
      height: 'Altezza',
      accessories: 'Accessori',
      yes: 'Sì',
      minimalist: 'Minimalista',
      preferredStyles: 'Stili preferiti',
      preferences: 'Preferenze',
      account: 'Account',
      logout: 'Esci',
      deleteAccount: 'Elimina account',
      deleteAccountDesc: 'Elimina definitivamente il tuo account e tutti i tuoi dati',
      deleteAccountConfirm: 'Eliminare l\'account?',
      deleteAccountMessage: 'Questa azione non può essere annullata. Tutti i tuoi dati verranno cancellati.',
      editYourStyle: 'Modifica il tuo stile',
      editStyleDesc: 'Aggiorna le preferenze di stile',
      styleFormPlaceholder: 'Modulo di stile',
      toImplement: '(Da implementare)',
      noPostsYet: 'Nessun post ancora',
      shareOutfits: 'Condividi i tuoi outfit preferiti con la community',
      noPublicOutfits: 'Nessun outfit pubblico',
      markOutfitsPublic: 'Rendi pubblici i tuoi outfit per mostrarli qui',
      goToCloset: 'Vai all\'armadio',
    },
    create: {
      title: 'Crea Outfit',
      description: 'Genera look personalizzati con l\'IA',
      generateOutfit: 'Genera Outfit',
      myOutfits: 'I miei Outfit',
      noOutfits: 'Non hai ancora nessun outfit',
      createFirst: 'Crea il tuo primo outfit',
    },
    social: {
      title: 'Social',
      trending: 'Tendenze',
      following: 'Seguiti',
      forYou: 'Per te',
    },
    messaging: {
      title: 'Messaggi',
      search: 'Cerca',
      suggestions: 'Suggerimenti',
      results: 'Risultati',
      messagesTab: 'Messaggi',
      requestsTab: 'Richieste',
      yourMessages: 'I tuoi messaggi',
      sendPrivateMessages: 'Invia messaggi privati ai tuoi amici',
      noRequests: 'Nessuna richiesta di messaggio',
      noRequestsDesc: 'Non hai richieste di messaggi.',
      startConversation: 'Inizia una conversazione',
      sendMessage: 'Scrivi un messaggio...',
      viewProfile: 'Visualizza profilo',
      wantsToMessage: 'vuole inviarti un messaggio.',
      accept: 'Accetta',
      restrict: 'Limita',
      onlyOneMessage: 'Puoi inviare solo un messaggio finché non viene accettata la richiesta.',
      seen: 'Visualizzato',
      noUsersFound: 'Nessun utente trovato',
    },
    common: {
      loading: 'Caricamento...',
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      edit: 'Modifica',
      close: 'Chiudi',
      confirm: 'Conferma',
      back: 'Indietro',
      next: 'Avanti',
      finish: 'Fine',
      skip: 'Salta',
      noImage: 'Nessuna immagine',
    },
    colors: {
      white: 'Bianco',
      black: 'Nero',
      gray: 'Grigio',
      beige: 'Beige',
      brown: 'Marrone',
      blue: 'Blu',
      red: 'Rosso',
      green: 'Verde',
      pink: 'Rosa',
      yellow: 'Giallo',
      purple: 'Viola',
      orange: 'Arancione',
    },
    styleQuiz: {
      title: 'Quiz di Stile',
      subtitle: 'Aiutaci a capire il tuo stile',
      gender: 'Genere',
      male: 'Uomo',
      female: 'Donna',
      nonBinary: 'Non binario',
      preferNotToSay: 'Preferisco non specificare',
      ageRange: 'Fascia d\'età',
      height: 'Altezza',
      heightCm: 'Altezza (cm)',
      heightRange: 'Statura',
      short: 'Basso/a',
      average: 'Medio/a',
      tall: 'Alto/a',
      preferredStyles: 'Stili preferiti',
      selectMultiple: 'Seleziona tutti quelli pertinenti',
      accessories: 'Accessori',
      accessoriesDesc: 'Indossi accessori regolarmente?',
      visualPreferences: 'Preferenze visive',
      visualPreferencesDesc: 'Cosa ti piace vedere nei tuoi capi?',
      complete: 'Completa',
      next: 'Avanti',
      back: 'Indietro',
    },
    onboarding: {
      slides: {
        inspiration: {
          title: 'Ispirazione Istantanea',
          description: 'Non sai cosa indossare? Dimentica il blocco creativo. Ricevi idee fresche ogni mattina in base al meteo e al tuo stile.',
        },
        time: {
          title: 'Risparmia Tempo Prezioso',
          description: 'Vestiti in pochi secondi. Pianifica i tuoi look dal divano senza inutili prove.',
        },
        rediscover: {
          title: 'Riscopri il Tuo Armadio',
          description: 'La nostra IA combina i tuoi capi attuali in modi sorprendenti. Sembrerà di avere abiti nuovi!',
        },
        discovery: {
          title: 'Trova Ciò che Ami',
          description: 'Esplora nuove tendenze e scopri capi perfetti da abbinare alla tua collezione.',
        },
      },
      cta: {
        title: 'Pronto a iniziare?',
        description: 'Crea il tuo account e rivoluziona il tuo stile oggi stesso.',
        signup: 'Crea account gratuito',
        login: 'Ho già un account',
      },
    },
    privacyPage: {
      back: 'Indietro',
      title: 'Privacy',
      visibility: 'Visibilità',
      publicProfile: 'Profilo pubblico',
      publicProfileDesc: 'Consenti agli altri di vedere il tuo profilo',
      shareAnalytics: 'Condividi statistiche',
      shareAnalyticsDesc: 'Aiutaci a migliorare condividendo dati anonimi',
      dataAndPersonalization: 'Dati e Personalizzazione',
      personalizedRecommendations: 'Raccomandazioni personalizzate',
      personalizedRecommendationsDesc: 'Usa la tua cronologia per migliorare i suggerimenti',
      saveHistory: 'Salva cronologia',
      saveHistoryDesc: 'Tieni traccia degli outfit generati',
      yourData: 'I tuoi Dati',
      downloadData: 'Scarica i miei dati',
      downloadDataDesc: 'Ottieni una copia di tutte le tue informazioni',
      download: 'Scarica',
      legal: 'Legale',
      privacyPolicy: 'Informativa sulla Privacy',
      termsConditions: 'Termini e Condizioni',
      gdprMessage: '🔒 La tua privacy è fondamentale. Rispettiamo il GDPR e non vendiamo mai i tuoi dati a terzi.',
    },
    premium: {
      title: 'Premium',
      active: 'Attivo',
      unlockAll: 'Sblocca tutto',
      upgrade: 'Passa a Pro',
    },
    app: {
      tagline: 'Il tuo stilista personale',
    },
  },
  pt: {
    nav: {
      home: 'Início',
      closet: 'Guarda-roupa',
      create: 'Criar',
      social: 'Social',
      messages: 'Mensagens',
      kloe: 'Kloe',
      profile: 'Perfil',
      search: 'Pesquisar',
    },
    closet: {
      title: 'Meu Guarda-roupa',
      search: 'Pesquisar...',
      filters: 'Filtros',
      favorites: 'Favoritos',
      viewMode: 'Visualização',
      quickActions: 'Ações Rápidas',
      createOutfit: 'Criar Look',
      createOutfitDesc: 'Gere looks com IA baseados no seu guarda-roupa',
      addItem: 'Adicionar Peça',
      addItemDesc: 'Envie fotos ou escaneie links de lojas',
      myItems: 'Minhas Peças',
      addFirstItem: 'Adicione uma peça',
      wardrobeWaiting: 'Seu guarda-roupa está esperando por você',
      addItemButton: 'Adicionar peça',
      all: 'Tudo',
      clear: 'Limpar',
      deleteConfirm: 'Excluir peça?',
      deleteMessage: 'Tem certeza de que deseja excluir "{name}" do seu guarda-roupa? Essa ação não pode ser desfeita.',
      delete: 'Excluir',
      cancel: 'Cancelar',
      itemDeleted: 'Peça excluída',
      itemDeletedMessage: 'A peça foi removida com sucesso do seu guarda-roupa.',
      error: 'Erro',
      deleteError: 'Não foi possível excluir a peça. Tente novamente.',
      close: 'Fechar',
      understood: 'Entendi',
      thisItem: 'esta peça',
    },
    itemTypes: {
      top: 'Camiseta / Top',
      shirt: 'Camisa',
      sweater: 'Suéter / Casaco',
      hoodie: 'Moletom com capuz',
      jacket: 'Jaqueta',
      bottom: 'Calça',
      shorts: 'Shorts / Bermudas',
      skirt: 'Saia',
      dress: 'Vestido',
      outerwear: 'Casaco / Sobretudo',
      shoes: 'Sapatos / Tênis',
      bag: 'Bolsa / Mochila',
      accessory: 'Acessórios',
      accessories: 'Acessórios',
      other: 'Outros (Livros, objetos, etc.)',
    },
    profile: {
      settings: 'Configurações',
      posts: 'Publicações',
      outfits: 'Looks',
      followers: 'Seguidores',
      following: 'Seguindo',
      backToProfile: 'Voltar ao perfil',
      configuration: 'Configuração',
      generalSettings: 'Configurações gerais',
      generalSettingsDesc: 'Tema, idioma e mais',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Escuro',
      language: 'Idioma',
      notifications: 'Notificações',
      notificationsDesc: 'Gerencie seus alertas',
      newFollowers: 'Novos seguidores',
      likesOnPosts: 'Curtidas em posts',
      comments: 'Comentários',
      security: 'Segurança',
      securityDesc: 'Senha e autenticação',
      changePassword: 'Alterar senha',
      twoFactor: 'Autenticação de dois fatores',
      privacy: 'Privacidade',
      privacyDesc: 'Dados e permissões',
      privateProfile: 'Perfil privado',
      showActivity: 'Mostrar atividade',
      yourStyle: 'Seu Estilo',
      edit: 'Editar',
      editProfile: 'Editar perfil',
      gender: 'Gênero',
      age: 'Idade',
      height: 'Altura',
      accessories: 'Acessórios',
      yes: 'Sim',
      minimalist: 'Minimalista',
      preferredStyles: 'Estilos preferidos',
      preferences: 'Preferências',
      account: 'Conta',
      logout: 'Sair',
      deleteAccount: 'Excluir conta',
      deleteAccountDesc: 'Exclua permanentemente sua conta e todos os seus dados',
      deleteAccountConfirm: 'Excluir conta?',
      deleteAccountMessage: 'Esta ação não pode ser desfeita. Todos os seus dados serão apagados permanentemente.',
      editYourStyle: 'Editar seu estilo',
      editStyleDesc: 'Atualize suas preferências de estilo',
      styleFormPlaceholder: 'Formulário de estilo',
      toImplement: '(A implementar)',
      noPostsYet: 'Nenhuma publicação ainda',
      shareOutfits: 'Compartilhe seus looks favoritos com a comunidade',
      noPublicOutfits: 'Nenhum look público',
      markOutfitsPublic: 'Torne seus looks públicos para exibi-los aqui',
      goToCloset: 'Ir para o guarda-roupa',
    },
    create: {
      title: 'Criar Look',
      description: 'Gere looks personalizados com inteligência artificial',
      generateOutfit: 'Gerar Look',
      myOutfits: 'Meus Looks',
      noOutfits: 'Você ainda não tem looks',
      createFirst: 'Crie seu primeiro look',
    },
    social: {
      title: 'Social',
      trending: 'Tendências',
      following: 'Seguindo',
      forYou: 'Para você',
    },
    messaging: {
      title: 'Mensagens',
      search: 'Pesquisar',
      suggestions: 'Sugestões',
      results: 'Resultados',
      messagesTab: 'Mensagens',
      requestsTab: 'Solicitações',
      yourMessages: 'Suas mensagens',
      sendPrivateMessages: 'Envie mensagens privadas para seus amigos',
      noRequests: 'Nenhuma solicitação de mensagem',
      noRequestsDesc: 'Você não tem solicitações de mensagem.',
      startConversation: 'Iniciar conversa',
      sendMessage: 'Enviar mensagem...',
      viewProfile: 'Ver perfil',
      wantsToMessage: 'quer enviar uma mensagem.',
      accept: 'Aceitar',
      restrict: 'Restringir',
      onlyOneMessage: 'Você só pode enviar uma mensagem até que aceitem sua solicitação.',
      seen: 'Visto',
      noUsersFound: 'Nenhum usuário encontrado',
    },
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      close: 'Fechar',
      confirm: 'Confirmar',
      back: 'Voltar',
      next: 'Avançar',
      finish: 'Concluir',
      skip: 'Pular',
      noImage: 'Sem imagem',
    },
    colors: {
      white: 'Branco',
      black: 'Preto',
      gray: 'Cinza',
      beige: 'Bege',
      brown: 'Marrom',
      blue: 'Azul',
      red: 'Vermelho',
      green: 'Verde',
      pink: 'Rosa',
      yellow: 'Amarelo',
      purple: 'Roxo',
      orange: 'Laranja',
    },
    styleQuiz: {
      title: 'Quiz de Estilo',
      subtitle: 'Ajude-nos a entender seu estilo',
      gender: 'Gênero',
      male: 'Masculino',
      female: 'Feminino',
      nonBinary: 'Não-binário',
      preferNotToSay: 'Prefiro não dizer',
      ageRange: 'Faixa etária',
      height: 'Altura',
      heightCm: 'Altura (cm)',
      heightRange: 'Estatura',
      short: 'Baixo(a)',
      average: 'Médio(a)',
      tall: 'Alto(a)',
      preferredStyles: 'Estilos preferidos',
      selectMultiple: 'Selecione todos os aplicáveis',
      accessories: 'Acessórios',
      accessoriesDesc: 'Você usa acessórios com frequência?',
      visualPreferences: 'Preferências visuais',
      visualPreferencesDesc: 'O que você mais gosta nas suas roupas?',
      complete: 'Concluir',
      next: 'Avançar',
      back: 'Voltar',
    },
    onboarding: {
      slides: {
        inspiration: {
          title: 'Inspiração Instantânea',
          description: 'Sem saber o que vestir? Esqueça o bloqueio matinal. Receba ideias de looks frescas de acordo com seu estilo e clima.',
        },
        time: {
          title: 'Poupe Tempo Valioso',
          description: 'Vista-se em segundos. Planeje seus looks do sofá sem provações demoradas.',
        },
        rediscover: {
          title: 'Redescubra Seu Guarda-roupa',
          description: 'Nossa IA combina suas roupas atuais de formas surpreendentes. É como ter um armário novo!',
        },
        discovery: {
          title: 'Encontre o que Combina com Você',
          description: 'Explore novas tendências e descubra peças perfeitas para complementar sua coleção.',
        },
      },
      cta: {
        title: 'Pronto para começar?',
        description: 'Crie sua conta e revolucione seu estilo hoje mesmo.',
        signup: 'Criar conta grátis',
        login: 'Já tenho uma conta',
      },
    },
    privacyPage: {
      back: 'Voltar',
      title: 'Privacidade',
      visibility: 'Visibilidade',
      publicProfile: 'Perfil público',
      publicProfileDesc: 'Permitir que outros vejam seu perfil',
      shareAnalytics: 'Compartilhar análises',
      shareAnalyticsDesc: 'Ajude-nos a melhorar compartilhando dados anônimos',
      dataAndPersonalization: 'Dados e Personalização',
      personalizedRecommendations: 'Recomendações personalizadas',
      personalizedRecommendationsDesc: 'Use seu histórico para aprimorar sugestões',
      saveHistory: 'Salvar histórico',
      saveHistoryDesc: 'Mantenha um registro dos looks gerados',
      yourData: 'Seus Dados',
      downloadData: 'Baixar meus dados',
      downloadDataDesc: 'Obtenha uma cópia de todas as suas informações',
      download: 'Baixar',
      legal: 'Legal',
      privacyPolicy: 'Política de Privacidade',
      termsConditions: 'Termos e Condições',
      gdprMessage: '🔒 Sua privacidade é prioridade. Cumprimos o RGPD/LGPD e nunca vendemos seus dados a terceiros.',
    },
    premium: {
      title: 'Premium',
      active: 'Ativo',
      unlockAll: 'Desbloquear tudo',
      upgrade: 'Fazer Upgrade',
    },
    app: {
      tagline: 'Seu estilista pessoal',
    },
  },
};
