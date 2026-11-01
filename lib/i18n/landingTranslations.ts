import type { Language } from './translations';

export interface LandingTranslationSet {
  // Header
  myCloset: string;
  login: string;
  register: string;

  // Frame 0
  f0_title1_drop: string;
  f0_title1_rest: string;
  f0_title2_drop: string;
  f0_title2_rest: string;
  f0_desc: string;
  f0_cta_start: string;
  f0_cta_closet: string;
  tag_jersey_rayas: string;
  tag_top_halter: string;
  tag_jacket_militar: string;
  tag_denim_wide: string;
  tag_cartier_tank: string;
  tag_bolso_ante: string;
  tag_alaia_strass: string;

  // Frame 1
  f1_title1_drop: string;
  f1_title1_rest: string;
  f1_title2_drop: string;
  f1_title2_rest: string;
  f1_desc: string;
  tag_jersey_punto: string;
  tag_replica_gat: string;
  tag_top_plisado: string;
  tag_denim_gris: string;
  tag_bailarinas: string;

  // Frame 2
  f2_title1_drop: string;
  f2_title1_rest: string;
  f2_title2_drop: string;
  f2_title2_rest: string;
  f2_desc: string;
  f2_chat_user: string;
  f2_chat_kloe: string;
  tag_miu_miu: string;

  // Frame 3
  f3_title1_drop: string;
  f3_title1_rest: string;
  f3_title2_drop: string;
  f3_title2_rest: string;
  f3_desc: string;
  tag_look_mujer: string;
  tag_replica: string;
  tag_lienzo_hoy: string;
  tag_alaia: string;
  tag_look_diario: string;

  // Frame 4
  f4_title1_drop: string;
  f4_title1_rest: string;
  f4_title2_drop: string;
  f4_title2_rest: string;
  f4_desc: string;
  f4_cta_join: string;
  f4_cta_closet: string;
  tag_hombre_denim: string;
  tag_mujer_kloe: string;

  // Footer & Navigation
  footer_rights: string;
  footer_trends: string;
  footer_about: string;
  footer_terms: string;
  footer_privacy: string;
  footer_cookies: string;
  footer_contact: string;
  aria_next: string;
}

export const LANDING_TRANSLATIONS: Record<Language, LandingTranslationSet> = {
  es: {
    myCloset: 'Mi Armario',
    login: 'Entrar',
    register: 'Registro',

    f0_title1_drop: 'A',
    f0_title1_rest: 'rmario Lleno',
    f0_title2_drop: 'N',
    f0_title2_rest: 'ada que ponerte',
    f0_desc: 'Todas las mañanas el mismo lío frente al espejo. Klozet organiza tus prendas reales en un lookbook interactivo para que salgas con el fit clavado.',
    f0_cta_start: 'Empezar gratis',
    f0_cta_closet: 'Ir a mi armario',
    tag_jersey_rayas: 'Jersey Rayas',
    tag_top_halter: 'Top Halter',
    tag_jacket_militar: 'Jacket Militar',
    tag_denim_wide: 'Denim Wide',
    tag_cartier_tank: 'Cartier Tank',
    tag_bolso_ante: 'Bolso Ante',
    tag_alaia_strass: 'Alaïa Strass',

    f1_title1_drop: 'T',
    f1_title1_rest: 'oda tu ropa',
    f1_title2_drop: 'E',
    f1_title2_rest: 'n un toque',
    f1_desc: 'Saca una foto en la percha o en la puerta de tu cuarto. El fondo desaparece al instante y tu ropa real queda limpia, ordenada y lista para combinar.',
    tag_jersey_punto: 'Jersey Punto',
    tag_replica_gat: 'Replica GAT',
    tag_top_plisado: 'Top Plisado',
    tag_denim_gris: 'Denim Gris',
    tag_bailarinas: 'Bailarinas',

    f2_title1_drop: 'Q',
    f2_title1_rest: 'ué me pongo',
    f2_title2_drop: 'K',
    f2_title2_rest: 'loe te ayuda',
    f2_desc: 'Dile qué plan tienes o qué tiempo hace. Kloe revisa tus prendas reales y te compone el outfit perfecto al segundo, sin gastar un euro en ropa nueva.',
    f2_chat_user: '“¿Qué me pongo hoy para salir de chill?”',
    f2_chat_kloe: 'Top Halter + Wide Denim + Bailarinas Alaïa. Cómodo y clavado.',
    tag_miu_miu: 'Miu Miu',

    f3_title1_drop: 'M',
    f3_title1_rest: 'onta tu fit',
    f3_title2_drop: 'L',
    f3_title2_rest: 'isto para hoy',
    f3_desc: 'Prueba combinaciones en el lienzo libre, guarda tus looks favoritos y sal de casa sabiendo qué ponerte antes de desordenar el cuarto.',
    tag_look_mujer: 'Look Mujer',
    tag_replica: 'Replica',
    tag_lienzo_hoy: 'Lienzo de Hoy',
    tag_alaia: 'Alaïa',
    tag_look_diario: 'Look Diario',

    f4_title1_drop: 'V',
    f4_title1_rest: 'ístete mejor',
    f4_title2_drop: 'D',
    f4_title2_rest: 'isfruta tu ropa',
    f4_desc: 'Regístrate gratis en menos de un minuto y empieza a organizar tus outfits favoritos.',
    f4_cta_join: 'Entrar a Klozet gratis',
    f4_cta_closet: 'Ir a mi armario',
    tag_hombre_denim: 'Hombre • Denim',
    tag_mujer_kloe: 'Mujer • Kloe',

    footer_rights: 'Todos los derechos reservados.',
    footer_trends: 'Revista & Tendencias',
    footer_about: 'Sobre Nosotros',
    footer_terms: 'Términos',
    footer_privacy: 'Privacidad',
    footer_cookies: 'Cookies',
    footer_contact: 'Contacto',
    aria_next: 'Siguiente pantalla',
  },

  en: {
    myCloset: 'My Closet',
    login: 'Log In',
    register: 'Sign Up',

    f0_title1_drop: 'F',
    f0_title1_rest: 'ull Closet',
    f0_title2_drop: 'N',
    f0_title2_rest: 'othing to Wear',
    f0_desc: 'Every morning the same struggle in front of the mirror. Klozet organizes your real clothes into an interactive lookbook so you step out with the perfect fit.',
    f0_cta_start: 'Start for free',
    f0_cta_closet: 'Go to my closet',
    tag_jersey_rayas: 'Striped Knit',
    tag_top_halter: 'Halter Top',
    tag_jacket_militar: 'Military Jacket',
    tag_denim_wide: 'Wide Denim',
    tag_cartier_tank: 'Cartier Tank',
    tag_bolso_ante: 'Suede Bag',
    tag_alaia_strass: 'Alaïa Strass',

    f1_title1_drop: 'A',
    f1_title1_rest: 'll Your Clothes',
    f1_title2_drop: 'I',
    f1_title2_rest: 'n One Tap',
    f1_desc: 'Snap a photo on a hanger or your bedroom door. The background disappears instantly and your real clothes stay clean, organized, and ready to style.',
    tag_jersey_punto: 'Knit Sweater',
    tag_replica_gat: 'Replica GAT',
    tag_top_plisado: 'Pleated Top',
    tag_denim_gris: 'Grey Denim',
    tag_bailarinas: 'Flats',

    f2_title1_drop: 'W',
    f2_title1_rest: 'hat to Wear',
    f2_title2_drop: 'K',
    f2_title2_rest: 'loe Got You',
    f2_desc: 'Tell her your plans or the forecast. Kloe scans your real clothes and styles the perfect outfit in seconds, without spending a dime on new clothes.',
    f2_chat_user: '“What should I wear today to hang out chill?”',
    f2_chat_kloe: 'Halter Top + Wide Denim + Alaïa Flats. Effortless and on point.',
    tag_miu_miu: 'Miu Miu',

    f3_title1_drop: 'B',
    f3_title1_rest: 'uild Your Fit',
    f3_title2_drop: 'R',
    f3_title2_rest: 'eady for Today',
    f3_desc: 'Experiment freely on the infinite canvas, save your favorite looks, and step out confident before messing up your bedroom.',
    tag_look_mujer: "Women's Look",
    tag_replica: 'Replica',
    tag_lienzo_hoy: "Today's Canvas",
    tag_alaia: 'Alaïa',
    tag_look_diario: 'Daily Look',

    f4_title1_drop: 'D',
    f4_title1_rest: 'ress Better',
    f4_title2_drop: 'E',
    f4_title2_rest: 'njoy Your Clothes',
    f4_desc: 'Sign up free in less than a minute and start organizing your favorite outfits.',
    f4_cta_join: 'Join Klozet for free',
    f4_cta_closet: 'Go to my closet',
    tag_hombre_denim: 'Men • Denim',
    tag_mujer_kloe: 'Women • Kloe',

    footer_rights: 'All rights reserved.',
    footer_trends: 'Magazine & Trends',
    footer_about: 'About Us',
    footer_terms: 'Terms',
    footer_privacy: 'Privacy',
    footer_cookies: 'Cookies',
    footer_contact: 'Contact',
    aria_next: 'Next screen',
  },

  fr: {
    myCloset: 'Mon Dressing',
    login: 'Connexion',
    register: "S'inscrire",

    f0_title1_drop: 'D',
    f0_title1_rest: 'ressing Plein',
    f0_title2_drop: 'R',
    f0_title2_rest: 'ien à Mettre',
    f0_desc: 'Chaque matin le même casse-tête devant le miroir. Klozet organise vos vrais vêtements dans un lookbook interactif pour sortir toujours impeccable.',
    f0_cta_start: 'Commencer gratuit',
    f0_cta_closet: 'Aller à mon dressing',
    tag_jersey_rayas: 'Pull Rayé',
    tag_top_halter: 'Top Dos Nu',
    tag_jacket_militar: 'Veste Militaire',
    tag_denim_wide: 'Denim Large',
    tag_cartier_tank: 'Cartier Tank',
    tag_bolso_ante: 'Sac Daim',
    tag_alaia_strass: 'Alaïa Strass',

    f1_title1_drop: 'T',
    f1_title1_rest: 'ous Vos Habits',
    f1_title2_drop: 'E',
    f1_title2_rest: 'n Un Clic',
    f1_desc: "Prenez une photo sur cintre ou sur votre porte. L'arrière-plan disparaît instantanément et vos vrais vêtements restent nets et prêts à assortir.",
    tag_jersey_punto: 'Pull Maille',
    tag_replica_gat: 'Replica GAT',
    tag_top_plisado: 'Top Plissé',
    tag_denim_gris: 'Denim Gris',
    tag_bailarinas: 'Ballerines',

    f2_title1_drop: 'Q',
    f2_title1_rest: 'uoi Porter',
    f2_title2_drop: 'K',
    f2_title2_rest: 'loe Vous Guide',
    f2_desc: 'Partagez votre programme ou la météo. Kloe compose la tenue idéale en quelques secondes avec vos vêtements réels, sans dépenser un euro.',
    f2_chat_user: '« Qu’est-ce que je mets aujourd’hui pour sortir chill ? »',
    f2_chat_kloe: 'Top Dos Nu + Wide Denim + Ballerines Alaïa. Confortable et parfait.',
    tag_miu_miu: 'Miu Miu',

    f3_title1_drop: 'C',
    f3_title1_rest: 'réez Votre Fit',
    f3_title2_drop: 'P',
    f3_title2_rest: 'rêt Pour Aujourd’hui',
    f3_desc: 'Testez vos associations sur la toile libre, sauvegardez vos looks préférés et sortez serein sans mettre la chambre en désordre.',
    tag_look_mujer: 'Look Femme',
    tag_replica: 'Replica',
    tag_lienzo_hoy: 'Look du Jour',
    tag_alaia: 'Alaïa',
    tag_look_diario: 'Look Quotidien',

    f4_title1_drop: 'H',
    f4_title1_rest: 'abillez-vous Mieux',
    f4_title2_drop: 'A',
    f4_title2_rest: 'ppréciez Vos Habits',
    f4_desc: "Inscrivez-vous gratuitement en moins d'une minute et commencez à organiser vos tenues préférées.",
    f4_cta_join: 'Rejoindre Klozet gratuit',
    f4_cta_closet: 'Aller à mon dressing',
    tag_hombre_denim: 'Homme • Denim',
    tag_mujer_kloe: 'Femme • Kloe',

    footer_rights: 'Tous droits réservés.',
    footer_trends: 'Magazine & Tendances',
    footer_about: 'À propos',
    footer_terms: 'Conditions',
    footer_privacy: 'Confidentialité',
    footer_cookies: 'Cookies',
    footer_contact: 'Contact',
    aria_next: 'Écran suivant',
  },

  de: {
    myCloset: 'Mein Kleiderschrank',
    login: 'Anmelden',
    register: 'Registrieren',

    f0_title1_drop: 'S',
    f0_title1_rest: 'chrank Voll',
    f0_title2_drop: 'N',
    f0_title2_rest: 'ichts Anzuziehen',
    f0_desc: 'Jeden Morgen das gleiche Dilemma vor dem Spiegel. Klozet organisiert deine echte Kleidung in einem interaktiven Lookbook für den perfekten Fit.',
    f0_cta_start: 'Kostenlos starten',
    f0_cta_closet: 'Zu meinem Kleiderschrank',
    tag_jersey_rayas: 'Streifenpullover',
    tag_top_halter: 'Halter Top',
    tag_jacket_militar: 'Militärjacke',
    tag_denim_wide: 'Wide Denim',
    tag_cartier_tank: 'Cartier Tank',
    tag_bolso_ante: 'Wildledertasche',
    tag_alaia_strass: 'Alaïa Strass',

    f1_title1_drop: 'D',
    f1_title1_rest: 'eine Kleidung',
    f1_title2_drop: 'M',
    f1_title2_rest: 'it Einem Klick',
    f1_desc: 'Mach ein Foto am Bügel oder an der Zimmertür. Der Hintergrund verschwindet sofort und deine echten Stücke sind startklar zum Kombinieren.',
    tag_jersey_punto: 'Strickpullover',
    tag_replica_gat: 'Replica GAT',
    tag_top_plisado: 'Plissee Top',
    tag_denim_gris: 'Grauer Denim',
    tag_bailarinas: 'Ballerinas',

    f2_title1_drop: 'W',
    f2_title1_rest: 'as Anziehen',
    f2_title2_drop: 'K',
    f2_title2_rest: 'loe Hilft Dir',
    f2_desc: 'Sag ihr deinen Plan oder das Wetter. Kloe scannt deine echte Kleidung und stellt sekundenschnell das perfekte Outfit zusammen, ohne Neukauf.',
    f2_chat_user: '„Was ziehe ich heute für ein chilliges Treffen an?“',
    f2_chat_kloe: 'Halter Top + Wide Denim + Alaïa Ballerinas. Bequem und auf den Punkt.',
    tag_miu_miu: 'Miu Miu',

    f3_title1_drop: 'B',
    f3_title1_rest: 'aue Deinen Fit',
    f3_title2_drop: 'B',
    f3_title2_rest: 'ereit Für Heute',
    f3_desc: 'Probiere Kombinationen auf der freien Leinwand aus, speichere deine Lieblingslooks und gehe entspannt los ohne Zimmerchaos.',
    tag_look_mujer: 'Damen Look',
    tag_replica: 'Replica',
    tag_lienzo_hoy: 'Heutiges Canvas',
    tag_alaia: 'Alaïa',
    tag_look_diario: 'Tages Look',

    f4_title1_drop: 'B',
    f4_title1_rest: 'esser Kleiden',
    f4_title2_drop: 'K',
    f4_title2_rest: 'leidung Genießen',
    f4_desc: 'Kostenlos in unter einer Minute registrieren und deine Lieblingsoutfits organisieren.',
    f4_cta_join: 'Klozet kostenlos beitreten',
    f4_cta_closet: 'Zu meinem Kleiderschrank',
    tag_hombre_denim: 'Herren • Denim',
    tag_mujer_kloe: 'Damen • Kloe',

    footer_rights: 'Alle Rechte vorbehalten.',
    footer_trends: 'Magazin & Trends',
    footer_about: 'Über uns',
    footer_terms: 'Bedingungen',
    footer_privacy: 'Datenschutz',
    footer_cookies: 'Cookies',
    footer_contact: 'Kontakt',
    aria_next: 'Nächster Bildschirm',
  },

  it: {
    myCloset: 'Mio Guardaroba',
    login: 'Accedi',
    register: 'Registrati',

    f0_title1_drop: 'A',
    f0_title1_rest: 'rmadio Pieno',
    f0_title2_drop: 'N',
    f0_title2_rest: 'ulla da Mettere',
    f0_desc: 'Ogni mattina lo stesso dilemma davanti allo specchio. Klozet organizza i tuoi capi reali in un lookbook interattivo per uscire sempre con il fit perfetto.',
    f0_cta_start: 'Inizia gratis',
    f0_cta_closet: 'Vai al guardaroba',
    tag_jersey_rayas: 'Maglione Righe',
    tag_top_halter: 'Top Halter',
    tag_jacket_militar: 'Giacca Militare',
    tag_denim_wide: 'Denim Largo',
    tag_cartier_tank: 'Cartier Tank',
    tag_bolso_ante: 'Borsa Scamosciata',
    tag_alaia_strass: 'Alaïa Strass',

    f1_title1_drop: 'T',
    f1_title1_rest: 'utti i Tuoi Capi',
    f1_title2_drop: 'I',
    f1_title2_rest: 'n un Tocco',
    f1_desc: 'Scatta una foto sulla gruccia o sulla porta di camera tua. Lo sfondo scompare all’istante e i tuoi capi veri sono pronti da abbinare.',
    tag_jersey_punto: 'Maglia Punto',
    tag_replica_gat: 'Replica GAT',
    tag_top_plisado: 'Top Pieghe',
    tag_denim_gris: 'Denim Grigio',
    tag_bailarinas: 'Ballerine',

    f2_title1_drop: 'C',
    f2_title1_rest: 'osa Mettere',
    f2_title2_drop: 'K',
    f2_title2_rest: 'loe ti Aiuta',
    f2_desc: 'Dille che programma hai o che tempo fa. Kloe esamina i tuoi capi reali e compone l’outfit perfetto in un secondo, senza comprare nulla.',
    f2_chat_user: '“Cosa mi metto oggi per uscire chill?”',
    f2_chat_kloe: 'Top Halter + Wide Denim + Ballerine Alaïa. Comodo e azzeccato.',
    tag_miu_miu: 'Miu Miu',

    f3_title1_drop: 'C',
    f3_title1_rest: 'rea il Tuo Fit',
    f3_title2_drop: 'P',
    f3_title2_rest: 'ronto per Oggi',
    f3_desc: 'Sperimenta combinazioni sulla tela libera, salva i tuoi look preferiti ed esci sicuro senza disordinare la camera.',
    tag_look_mujer: 'Look Donna',
    tag_replica: 'Replica',
    tag_lienzo_hoy: 'Tela di Oggi',
    tag_alaia: 'Alaïa',
    tag_look_diario: 'Look Giornaliero',

    f4_title1_drop: 'V',
    f4_title1_rest: 'estiti Meglio',
    f4_title2_drop: 'A',
    f4_title2_rest: 'mma i Tuoi Capi',
    f4_desc: 'Registrati gratis in meno di un minuto e inizia a organizzare i tuoi outfit preferiti.',
    f4_cta_join: 'Entra gratis in Klozet',
    f4_cta_closet: 'Vai al guardaroba',
    tag_hombre_denim: 'Uomo • Denim',
    tag_mujer_kloe: 'Donna • Kloe',

    footer_rights: 'Tutti i diritti riservati.',
    footer_trends: 'Rivista & Tendenze',
    footer_about: 'Chi siamo',
    footer_terms: 'Termini',
    footer_privacy: 'Privacy',
    footer_cookies: 'Cookies',
    footer_contact: 'Contatto',
    aria_next: 'Schermata successiva',
  },

  pt: {
    myCloset: 'Meu Guarda-roupa',
    login: 'Entrar',
    register: 'Registar',

    f0_title1_drop: 'A',
    f0_title1_rest: 'rmário Cheio',
    f0_title2_drop: 'N',
    f0_title2_rest: 'ada para Vestir',
    f0_desc: 'Todas as manhãs o mesmo dilema em frente ao espelho. O Klozet organiza as tuas peças reais num lookbook interativo para saíres com o look perfeito.',
    f0_cta_start: 'Começar grátis',
    f0_cta_closet: 'Ir para o meu guarda-roupa',
    tag_jersey_rayas: 'Camisola Riscas',
    tag_top_halter: 'Top Halter',
    tag_jacket_militar: 'Casaco Militar',
    tag_denim_wide: 'Denim Largo',
    tag_cartier_tank: 'Cartier Tank',
    tag_bolso_ante: 'Mala de Camurça',
    tag_alaia_strass: 'Alaïa Strass',

    f1_title1_drop: 'T',
    f1_title1_rest: 'oda a Tua Roupa',
    f1_title2_drop: 'N',
    f1_title2_rest: 'um Toque',
    f1_desc: 'Tira uma foto no cabide ou na porta do teu quarto. O fundo desaparece no instante e as tuas peças ficam limpas, organizadas e prontas a combinar.',
    tag_jersey_punto: 'Camisola Malha',
    tag_replica_gat: 'Replica GAT',
    tag_top_plisado: 'Top Plissado',
    tag_denim_gris: 'Denim Cinzento',
    tag_bailarinas: 'Bailarinas',

    f2_title1_drop: 'O',
    f2_title1_rest: 'que Vestir',
    f2_title2_drop: 'K',
    f2_title2_rest: 'loe Ajuda-te',
    f2_desc: 'Diz-lhe que planos tens ou que tempo faz. A Kloe analisa a tua roupa real e compõe o look ideal num segundo, sem gastar nada em roupa nova.',
    f2_chat_user: '“O que visto hoje para sair chill?”',
    f2_chat_kloe: 'Top Halter + Wide Denim + Bailarinas Alaïa. Confortável e no ponto.',
    tag_miu_miu: 'Miu Miu',

    f3_title1_drop: 'M',
    f3_title1_rest: 'onta o Teu Fit',
    f3_title2_drop: 'P',
    f3_title2_rest: 'ronto para Hoje',
    f3_desc: 'Experimenta combinações no quadro livre, guarda os teus looks favoritos e sai de casa seguro sem desarrumar o quarto.',
    tag_look_mujer: 'Look Mulher',
    tag_replica: 'Replica',
    tag_lienzo_hoy: 'Quadro de Hoje',
    tag_alaia: 'Alaïa',
    tag_look_diario: 'Look Diário',

    f4_title1_drop: 'V',
    f4_title1_rest: 'este-te Melhor',
    f4_title2_drop: 'D',
    f4_title2_rest: 'esfruta da Tua Roupa',
    f4_desc: 'Regista-te grátis em menos de um minuto e começa a organizar os teus looks favoritos.',
    f4_cta_join: 'Entrar no Klozet grátis',
    f4_cta_closet: 'Ir para o meu guarda-roupa',
    tag_hombre_denim: 'Homem • Denim',
    tag_mujer_kloe: 'Mulher • Kloe',

    footer_rights: 'Todos os direitos reservados.',
    footer_trends: 'Revista & Tendências',
    footer_about: 'Sobre Nós',
    footer_terms: 'Termos',
    footer_privacy: 'Privacidade',
    footer_cookies: 'Cookies',
    footer_contact: 'Contacto',
    aria_next: 'Ecrã seguinte',
  },
};
