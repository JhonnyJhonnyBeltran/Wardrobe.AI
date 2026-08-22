/**
 * Fast-Response Engine for Klosy AI Assistant
 * Intercepts courtesies, greetings, acknowledgements, farewells, compliments, and capability FAQs
 * to provide instant, friendly, in-character answers with 0 token consumption, 0 cost, and 0 latency.
 * Contains +25 dynamic fast-response templates with natural contextual variations.
 */

interface FastResponseResult {
  isFastResponse: boolean;
  message: string;
  follow_up_suggestions: string[];
}

/**
 * Normalizes text for intent matching: lowercase, strip accents, remove punctuation and extra spaces.
 */
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s]/gi, ' ')       // remove punctuation
    .replace(/\s+/g, ' ')            // collapse spaces
    .trim();
}

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Styling intent keywords that indicate the user is actually asking for styling advice
const STYLING_INTENT_KEYWORDS = [
  'combinar', 'combino', 'combina', 'outfit', 'outfits', 'look', 'looks', 'ropa', 'prenda', 'prendas',
  'boda', 'fiesta', 'pantalon', 'pantalones', 'zapatillas', 'camiseta', 'camisa', 'ponerme',
  'recomienda', 'recomiendame', 'zapatos', 'sudadera', 'chaqueta', 'abrigo', 'cuero', 'evento',
  'cena', 'cita', 'trabajo', 'jeans', 'gorra', 'gafas', 'cinturon', 'botas', 'biker', 'traje',
  'blazer', 'vestido', 'falda', 'polo', 'calcetines', 'bufanda', 'colores'
];

export function getFastCourtesyResponse(rawPrompt: string, username?: string): FastResponseResult | null {
  const normalized = normalizeText(rawPrompt);
  if (!normalized) return null;

  const words = normalized.split(' ').filter(Boolean);

  // If prompt is too long (> 9 words), it's likely a detailed fashion query, let LLM handle it
  if (words.length > 9) {
    return null;
  }

  // If prompt contains styling/clothing inquiry keywords, let LLM handle it
  const hasStylingIntent = words.some(w => STYLING_INTENT_KEYWORDS.includes(w));
  if (hasStylingIntent) {
    return null;
  }

  const name = username ? ` ${username}` : '';

  // 1. GREETINGS / SALUDOS (+6 variaciones)
  const greetingKeywords = [
    'hola', 'buenas', 'hey', 'ey', 'holi', 'holaa', 'holaaa', 'saludos',
    'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'como estas',
    'que pasa', 'wena', 'wenas'
  ];

  if (greetingKeywords.some(k => normalized === k || normalized.startsWith(k + ' ') || normalized.endsWith(' ' + k))) {
    const responses = [
      `¡Hola${name}! ✨ Estoy lista para ayudarte. Cuéntame qué tienes pensado: ¿un look para una ocasión especial o cómo combinar alguna prenda de tu armario?`,
      `¡Buenas${name}! ¿Qué estilo te apetece llevar hoy? Dime y montamos un outfit perfecto en segundos.`,
      `¡Hola! 👋 Aquí estoy a tu servicio. ¿Buscamos un look casual, algo más formal o tienes una prenda específica que quieras lucir hoy?`,
      `¡Ey${name}! Qué bueno verte. Dime la ocasión o la prenda que tienes en mente y nos ponemos a combinar.`
    ];
    return {
      isFastResponse: true,
      message: getRandomItem(responses),
      follow_up_suggestions: [
        'Arma un look casual con mis prendas',
        'Recomiéndame un outfit para una cena',
        '¿Cómo combinar mis zapatillas?'
      ]
    };
  }

  // 2. THANKS / AGRADECIMIENTOS (+6 variaciones)
  const thanksKeywords = [
    'gracias', 'muchas gracias', 'muchisimas gracias', 'mil gracias', 'gracias klosy',
    'grx', 'ty', 'thx', 'thanks', 'thank you', 'agradezco', 'agradecido', 'agradecida',
    'de diez gracias', 'te lo agradezco', 'muy amable'
  ];

  if (thanksKeywords.some(k => normalized.includes(k))) {
    const responses = [
      `¡A ti! 💖 Que tengas un día estupendo y disfrutes mucho luciendo tu outfit. Aquí estaré siempre que quieras armar otra combinación.`,
      `¡De nada${name}! Es un placer ayudarte con tu estilo. Si te surge cualquier otra duda con tu armario, ¡avísame!`,
      `¡Para eso estamos! Disfruta mucho de tu look hoy. Vuelve cuando quieras crear un nuevo conjunto. ✨`,
      `¡Un placer! Seguro que te queda impecable. ¡Que tengas un día increíble!`
    ];
    return {
      isFastResponse: true,
      message: getRandomItem(responses),
      follow_up_suggestions: [
        'Crear un look casual',
        'Recomiéndame un outfit para una cena',
        'Ver mis prendas'
      ]
    };
  }

  // 3. FAREWELLS / DESPEDIDAS (+6 variaciones)
  const farewellKeywords = [
    'adios', 'chao', 'chau', 'bye', 'bye bye', 'hasta luego', 'hasta pronto',
    'hasta manana', 'nos vemos', 'cuidate', 'hasta la proxima', 'hasta luego klosy',
    'chao klosy', 'adios klosy'
  ];

  if (farewellKeywords.some(k => normalized.includes(k))) {
    const responses = [
      `¡Hasta pronto${name}! Que tengas un gran día luciendo tu mejor estilo. ✨`,
      `¡Chao! Aquí estaré esperándote para la próxima vez que necesites inspiración para vestir. 👋`,
      `¡Nos vemos! Que disfrutes mucho de tu jornada. ¡A brillar con tu look!`,
      `¡Adiós${name}! Cuídate mucho y nos vemos pronto en tu armario.`
    ];
    return {
      isFastResponse: true,
      message: getRandomItem(responses),
      follow_up_suggestions: [
        'Arma un look casual',
        'Recomiéndame un outfit para el fin de semana'
      ]
    };
  }

  // 4. ACKNOWLEDGEMENTS / CONFIRMACIONES / OK / VALE (+6 variaciones)
  const ackKeywords = [
    'vale', 'ok', 'oka', 'oki', 'okey', 'okay', 'perfecto', 'genial', 'guay', 'top',
    'de acuerdo', 'entendido', 'bien', 'listo', 'hecho', 'bueno', 'todo claro',
    'me gusta', 'me encanta', 'esta bien', 'está bien', 'brutal', 'fino', 'tremendo'
  ];

  if (ackKeywords.some(p => normalized === p || normalized.startsWith(p + ' ') || normalized.endsWith(' ' + p))) {
    const responses = [
      `¡Genial! 🎯 Si más adelante necesitas cualquier otro conjunto, consejo de estilo o cómo adaptar una prenda, solo tienes que decírmelo.`,
      `¡Perfecto! Recuerda que puedes abrir cualquier look en el lienzo para mover y personalizar las prendas como tú quieras.`,
      `¡Me alegro de que te guste! Cuando quieras probar otra combinación para otro día o evento, aquí me tienes.`,
      `¡Trato hecho! A disfrutar de ese look. ✨`
    ];
    return {
      isFastResponse: true,
      message: getRandomItem(responses),
      follow_up_suggestions: [
        '¿Cómo puedo combinar otras zapatillas?',
        'Dame una opción más abrigada',
        'Armar un look formal'
      ]
    };
  }

  // 5. COMPLIMENTS / ELOGIOS (+4 variaciones)
  const complimentKeywords = [
    'eres la mejor', 'eres el mejor', 'increible', 'me salvaste', 'que estilazo',
    'buen trabajo', 'excelente', 'muy top', 'crack', 'eres genial', 'maquina', 'grande',
    'me encanta tu ayuda', 'buen gusto'
  ];

  if (complimentKeywords.some(k => normalized.includes(k))) {
    const responses = [
      `¡Muchísimas gracias${name}! 🥰 Me encanta ayudarte a sacar el máximo potencial a tu armario. ¡Tienes un estilazo increíble!`,
      `¡Qué detalle! Mi objetivo es que siempre te sientas con máxima seguridad y estilo. ¡Gracias por confiar en mí! ✨`,
      `¡Gracias a ti! Hacemos un equipo de estilismo imparable. 👗👟`
    ];
    return {
      isFastResponse: true,
      message: getRandomItem(responses),
      follow_up_suggestions: [
        'Crea otro outfit para mí',
        '¿Qué colores me favorecen más?',
        'Ver mi armario'
      ]
    };
  }

  // 6. CAPABILITIES & FAQ / ¿QUÉ PUEDES HACER? (+3 variaciones)
  const faqKeywords = [
    'que puedes hacer', 'como funcionas', 'en que me ayudas', 'quien eres',
    'presentate', 'para que sirves', 'que sabes hacer', 'como te llamas'
  ];

  if (faqKeywords.some(k => normalized.includes(k))) {
    return {
      isFastResponse: true,
      message: `¡Soy **Klosy**, tu estilista personal con IA! 🤖✨ Puedo:\n\n` +
        `• **Analizar tu armario real** y crear outfits completos y equilibrados.\n` +
        `• **Adaptar looks a eventos**: bodas, citas, trabajo, fiestas o diario.\n` +
        `• **Combinar prendas difíciles**: dime qué zapatillas o prenda quieres llevar y te armo el resto.\n` +
        `• **Montar el look en el lienzo interactivo** para que lo personalices y guardes.\n\n` +
        `¿Qué te gustaría probar hoy?`,
      follow_up_suggestions: [
        'Arma un look casual con mis prendas',
        '¿Cómo combinar mi prenda favorita?',
        'Outfit para una cena'
      ]
    };
  }

  return null;
}
