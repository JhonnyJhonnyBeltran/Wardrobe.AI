export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  coverImage: string;
  tags: string[];
  content: {
    intro: string;
    sections: Array<{
      heading: string;
      body: string[];
      keyTakeaways?: string[];
      quote?: string;
    }>;
    conclusion: string;
  };
}

export const ARTICLES_DATA: Article[] = [
  {
    slug: 'armario-capsula-2026',
    title: 'Guía Definitiva del Armario Cápsula: Elegancia Atemporal con 25 Prendas Clave',
    excerpt: 'Aprende a construir un fondo de armario minimalista, versátil y duradero que te permita crear más de 70 combinaciones distintas sin esfuerzo cada mañana.',
    category: 'Estilo & Organización',
    readingTime: '9 min de lectura',
    publishedAt: '2026-10-28',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/women/clean-look.jpg',
    tags: ['Armario Cápsula', 'Minimalismo', 'Fondo de Armario', 'Sostenibilidad'],
    content: {
      intro: 'En una era dominada por ciclos de microtendencias efímeras y consumo acelerado, el armario cápsula emerge como la respuesta más inteligente, económica y sofisticada. No se trata de imponer una restricción aburrida ni de vestir siempre igual, sino de seleccionar entre 25 y 30 piezas con una cohesión cromática y de patronaje tan cuidada que cualquiera de tus partes superiores combine de forma inmediata con cualquiera de tus partes inferiores y calzado.',
      sections: [
        {
          heading: '1. La Matemática del Armario Cápsula: Por Qué Menos Prendas Multiplican tus Looks',
          body: [
            'La paradoja del armario saturado es real: cuando acumulas más de 100 prendas desconectadas entre sí —compradas por impulso o en rebajas sin pensar con qué combinarlas—, terminas utilizando siempre el mismo 20% de ropa. El resto genera ruido visual y fatiga de decisión.',
            'En cambio, una arquitectura modular compuesta por 8 partes superiores, 5 partes inferiores, 4 prendas de abrigo o tercera capa y 4 pares de calzado genera matemáticamente 640 permutaciones posibles, de las cuales al menos 75 son conjuntos armónicos listos para oficina, universidad, fin de semana o cenas especiales.',
            'El secreto radica en eliminar las prendas "huérfanas": aquellas piezas que solo funcionan con un único pantalón o zapato específico y que, el resto del año, ocupan espacio en la percha.'
          ],
          keyTakeaways: [
            '8 partes superiores × 5 partes inferiores × 4 terceras capas = más de 75 outfits reales',
            'Elimina las prendas huérfanas que no combinen con al menos 3 piezas de tu armario actual',
            'Prioriza el gramaje del tejido y la caída sobre los estampados estacionales pasajeros',
          ],
        },
        {
          heading: '2. Los Pilares Cromáticos: La Regla 60-30-10 Aplicada al Vestidor',
          body: [
            'El cimiento de un armario donde todo encaja con todo es la disciplina en la paleta de colores. Antes de elegir prendas concretas, define tres bloques cromáticos que favorezcan tu contraste natural de piel, ojos y cabello.',
            'El 60% de tus prendas (especialmente abrigos, blazers, pantalones sastre y calzado) debe pertenecer a tus neutros base: negro profundo, azul marino medianoche, gris antracita o blanco roto. El 30% secundario lo forman los neutros cálidos o medios: beige arena, camel, piedra, caqui suave o denim lavado medio.',
            'Finalmente, reserva el 10% para dos colores de acento con personalidad —como burdeos, verde bosque, azul cobalto o rosa empolvado— aplicados en camisetas, punto ligero, bolsos o gorras.'
          ],
          quote: '«La elegancia no consiste en llamar la atención por el exceso, sino en ser recordado por la armonía de las proporciones.» — Giorgio Armani',
        },
        {
          heading: '3. Desglose de las 25 Prendas Esenciales por Categoría',
          body: [
            'En la categoría de partes superiores (9 piezas), incluye: dos camisetas blancas de algodón peinado de alto gramaje (220-260 gsm) que no transparenten, una camiseta negra o gris vigoré, una camiseta de rayas marineras clásicas, una camisa blanca de popelín con corte relajado, una camisa azul celeste de algodón Oxford, un jersey fino de lana merino con cuello redondo, un cárdigan estructurado y una sudadera limpia sin grandes logotipos.',
            'En partes inferiores (6 piezas), selecciona: un vaquero de corte recto (straight fit) en azul medio sin rotos, un vaquero negro o crudo de tiro medio-alto, un pantalón sastre de pinzas con caída fluida (wide-leg), un pantalón chino o carpintero en tono arena, una bermuda o falda midi neutra y un pantalón cómodo de punto estructurado.',
            'En terceras capas y abrigo (5 piezas): una blazer ligeramente oversized en gris o marino, una cazadora vaquera o sobrecamisa de sarga, una gabardina (trench) impermeable para entretiempo, una cazadora de piel o efecto ante y un abrigo largo de paño de lana para el invierno.',
            'Completa con 5 pares de calzado: zapatillas blancas minimalistas de piel, zapatillas retro de ante o running urbano, mocasines de cuero (negros o chocolate), botines Chelsea o de caña media y un calzado formal o sandalia minimalista según la estación.'
          ],
          keyTakeaways: [
            '9 partes superiores: algodón de alto gramaje, popelín, Oxford y punto merino',
            '6 partes inferiores: denim recto limpio, pantalón de pinzas fluido y chino neutro',
            '5 prendas exteriores: blazer, sobrecamisa, gabardina, cazadora de piel y abrigo de lana',
            '5 pares de calzado que cubren desde deporte casual hasta eventos formales'
          ],
        },
        {
          heading: '4. Cómo Digitalizar y Mantener tu Cápsula Activa Todo el Año',
          body: [
            'El mayor obstáculo para mantener un armario cápsula funcional es la memoria visual: lo que no se ve en los primeros tres segundos al abrir las puertas del armario, no se usa. Digitalizar tus 25 prendas en un armario virtual como Klozet te permite ver todo tu inventario de un solo vistazo en la pantalla de tu móvil.',
            'Además, al registrar cada prenda con su categoría, color, tejido y estación, puedes planificar tus conjuntos de lunes a viernes en el calendario semanal en menos de tres minutos el domingo por la tarde, ahorrando más de 90 horas al año de indecisión matutina.'
          ],
        },
      ],
      conclusion: 'Construir un armario cápsula no es un destino rígido, sino un hábito de curaduría personal. Empieza hoy mismo separando las 25 prendas que mejor te sientan, digitalízalas con luz natural y descubre decenas de combinaciones nuevas sin necesidad de gastar en ropa nueva.',
    },
  },
  {
    slug: 'quiet-luxury-streetwear',
    title: 'Streetwear & Quiet Luxury: La Fusión Estética que Domina la Moda Urbana',
    excerpt: 'Descubre cómo las siluetas urbanas relajadas se combinan con tejidos nobles, sastrería desestructurada y calzado clásico para redefinir el estilo diario.',
    category: 'Tendencias & Vanguardia',
    readingTime: '8 min de lectura',
    publishedAt: '2026-10-25',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/men/streetwear.jpg',
    tags: ['Streetwear', 'Lujo Silencioso', 'Siluetas Oversize', 'Sastrería Urbana'],
    content: {
      intro: 'Durante décadas, la moda urbana (streetwear) y la sastrería clásica habitaron en extremos opuestos: el primero impulsado por el skate, el hip-hop y los gráficos llamativos; el segundo regido por códigos corporativos y cortes entallados. Hoy vivimos la consolidación de su cruce más interesante: la estética que une la comodidad y amplitud del streetwear con la calidad textil y sobriedad cromática del lujo silencioso.',
      sections: [
        {
          heading: '1. Del Logotipo Gigante a la Excelencia del Gramaje y el Patrón',
          body: [
            'El cambio más profundo en la cultura urbana actual es el paso de la logomanía al protagonismo de la silueta y la textura. El consumidor informado ya no busca validar un conjunto mediante un logotipo impreso en el pecho, sino a través de la arquitectura de la prenda: hombros caídos con precisión, cuellos de canalé grueso de 3 centímetros que no ceden con los lavados y algodones peinados de 400 a 500 gramos por metro cuadrado.',
            'Firmas españolas y europeas de nueva generación —como Scuffers, Eme Studios, Yuxus, Nude Project o Cold Culture— han sabido interpretar esta demanda ofreciendo sudaderas boxy fit, prendas de punto con textura jacquard y pantalones de caída limpia que dialogan perfectamente con abrigos clásicos y mocasines.'
          ],
          keyTakeaways: [
            'Prioriza el corte boxy (ancho pero ligeramente corto a la cintura) para alargar las piernas',
            'Fíjate en el cuello de las camisetas: un canalé grueso y cerrado eleva cualquier look casual',
            'Sustituye los estampados estridentes por texturas ricas: pana fina, lana cepillada, sarga y punto trenzado'
          ],
        },
        {
          heading: '2. La Regla del Contraste Formal-Casual (High-Low Styling)',
          body: [
            'El secreto para dominar esta estética sin parecer demasiado arreglado ni descuidado consiste en aplicar la regla del equilibrio 50/50 entre piezas formales y piezas relajadas en cada outfit.',
            'Si llevas una sudadera con capucha (hoodie) en tono gris piedra o crema, contrarréstala llevando encima un abrigo largo de lana estructurado o una gabardina clásica y unos pantalones de pinzas oscuros. Si por el contrario eliges una camisa de rayas diplomáticas y un jersey de pico, relaja la mitad inferior con unos vaqueros holgados de lavado vintage y unas zapatillas retro como las Onitsuka Tiger o Adidas Samba.'
          ],
          quote: '«El verdadero estilo moderno nace en la tensión entre una prenda de sastrería impecable y una pieza urbana vivida.»',
        },
        {
          heading: '3. Proporciones y Volúmenes: Cómo Dominar el Corte Wide-Leg',
          body: [
            'El pantalón pitillo ha cedido su lugar de forma definitiva a los cortes rectos (straight) y anchos (wide-leg o relaxed). Sin embargo, vestir prendas amplias requiere controlar dónde descansa la cintura y cómo cae el bajo sobre el calzado.',
            'Para evitar que un pantalón ancho acorte visualmente tu estatura, busca que el tiro sea medio o alto y que el largo descanse con un único pliegue limpio (single break) sobre el empeine del zapato, sin arrastrar por el suelo. Combínalo con partes superiores que terminen justo a la altura del cinturón o mete ligeramente la camiseta por dentro para marcar el tercio superior del cuerpo.'
          ],
        },
        {
          heading: '4. Tres Fórmulas Infalibles para Aplicar Esta Semana',
          body: [
            'Fórmula 1 (Día de Universidad u Oficina Creativa): Camisa Oxford celeste abierta sobre camiseta blanca de alto gramaje + pantalón carpintero o chino ancho en color topo + mocasines de piel o zapatillas retro de ante.',
            'Fórmula 2 (Fin de Semana Urbano): Sudadera boxy en tono crudo o gris vigoré + vaquero recto azul lavado medio + abrigo largo negro o camel + gorra minimalista sin logo.',
            'Fórmula 3 (Cena o Evento Nocturno): Cárdigan de punto grueso o polo de manga larga en negro/burdeos + pantalón sastre de pinzas ancho + botines de cuero de suela limpia + reloj clásico metálico.'
          ],
        },
      ],
      conclusion: 'Combinar el confort del streetwear con la sobriedad clásica te permite adaptar un mismo armario a cualquier contexto social. Prueba estas mezclas en el lienzo interactivo de Klozet antes de vestirte y descubre qué proporciones encajan mejor con tu silueta.',
    },
  },
  {
    slug: 'teoria-del-color-moda',
    title: 'La Teoría del Color en tu Ropa: Cómo Dominar Contrastes, Subtonos y Armonías',
    excerpt: 'Guía práctica completa para entender el círculo cromático aplicado al vestir, identificar tu subtono de piel y mezclar tonos neutros con colores de acento.',
    category: 'Colorimetría & Estilismo',
    readingTime: '8 min de lectura',
    publishedAt: '2026-10-22',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/women/streetwear.jpg',
    tags: ['Colorimetría', 'Estilismo', 'Regla 60-30-10', 'Outfits Diarios'],
    content: {
      intro: 'El color es el primer estímulo visual que el cerebro humano procesa al observar un conjunto: en menos de medio segundo, mucho antes de identificar la marca, el precio o el corte de una prenda, percibimos si la combinación cromática transmite armonía o disonancia. Aprender las leyes básicas de la colorimetría te permitirá multiplicar las combinaciones de tu armario actual.',
      sections: [
        {
          heading: '1. Cómo Identificar tu Contraste Personal (Cabello, Ojos y Piel)',
          body: [
            'En estilismo profesional, el primer paso antes de combinar prendas entre sí es observar tu nivel de contraste natural. Si tienes el cabello oscuro y la piel clara u ojos muy marcados, posees un contraste alto: te favorecen los conjuntos que replican esa intensidad, como blanco óptico con negro, azul marino con crudo o burdeos profundo.',
            'Si tu cabello es castaño claro o rubio ceniza y tu piel tiene un tono suave similar, tienes un contraste bajo o medio: los bloques de color demasiado bruscos pueden eclipsar tus facciones, mientras que las transiciones suaves —como beige con blanco roto, gris perla con azul empolvado o verde salvia con tierra— iluminan tu rostro de inmediato.'
          ],
          keyTakeaways: [
            'Contraste alto (pelo oscuro + piel clara): apuesta por combinaciones nítidas de claro/oscuro',
            'Contraste medio/bajo: prioriza gamas tonales suaves, tierras, grises y azules medios',
            'La prenda más cercana al rostro (camisa, jersey, bufanda) es la que determina la luminosidad de la piel'
          ],
        },
        {
          heading: '2. Las Cuatro Armonías del Círculo Cromático en Moda',
          body: [
            '1. Armonía Monocromática (Tono sobre Tono): Consiste en vestir distintas luminosidades de un mismo color (por ejemplo, azul marino en el pantalón, azul medio en la camisa y celeste en el abrigo). Alarga la figura verticalmente y estiliza cualquier tipo de cuerpo. El truco indispensable es mezclar texturas distintas (lana, algodón, cuero, denim) para que el look tenga profundidad.',
            '2. Armonía Análoga: Combina colores vecinos en el círculo cromático, como verde oliva, caqui y beige, o azul marino, índigo y gris azulado. Es la fórmula más sencilla y elegante para el día a día.',
            '3. Armonía Complementaria Moderada: Empareja tonos opuestos pero apagados o envejecidos, como un pantalón azul marino con una cazadora color teja o marrón tabaco, o un jersey verde botella con detalles en granate.',
            '4. Base Neutra con Acento Único (Pop of Color): Un conjunto 90% neutro (negro, gris o crudo) roto por un único accesorio vibrante en calzado, bolso o prenda interior.'
          ],
          quote: '«El mejor color del mundo es aquel que te sienta bien a ti y armoniza con tu energía.» — Coco Chanel',
        },
        {
          heading: '3. Combinaciones Ganadoras que Nunca Fallan',
          body: [
            '• Azul Marino + Marrón Chocolate o Camel: Durante años existió el falso mito de no mezclar azul oscuro y marrón. En la sastrería italiana contemporánea es una de las parejas más ricas y elegantes.',
            '• Gris Vigoré + Burdeos (Cherry Red) + Blanco: El gris actúa como puente neutro que suaviza la fuerza del rojo oscuro, mientras el blanco aporta luz.',
            '• Verde Oliva + Crudo (Off-White) + Denim Azul: Una tríada inspirada en la indumentaria utilitaria clásica que funciona los 365 días del año.',
            '• Negro + Arena + Plata: Ideal para estilismos nocturnos limpios donde los herrajes metálicos del cinturón o el reloj aportan el punto de luz.'
          ],
        },
        {
          heading: '4. El Límite de los Tres Colores por Outfit',
          body: [
            'Una regla práctica infalible al vestirte por la mañana es no superar nunca los tres colores distintos en un mismo conjunto (sin contar el tejido vaquero azul clásico, que en estilismo funciona como un neutro comodín). Si tu outfit incluye cuatro o más colores sin relación entre sí, retira uno y sustitúyelo por un tono que ya esté presente en otra prenda del look (método "sandwiching": repetir el color del calzado en la prenda superior o en una gorra).'
          ],
        },
      ],
      conclusion: 'Cuando etiquetas correctamente el color principal de tus prendas en Klozet y configuras tu color de ojos y pelo en tu perfil, nuestra estilista Kloe aplica automáticamente estas reglas de colorimetría para proponerte conjuntos equilibrados en segundos.',
    },
  },
  {
    slug: 'moda-circular-digitalizacion',
    title: 'Moda Circular y Coste por Puesta (CPW): Cómo Exprimir el 100% de tu Armario',
    excerpt: 'Descubre cómo calcular el verdadero valor económico de tu ropa mediante el Cost Per Wear y por qué digitalizar tus prendas evita compras impulsivas duplicadas.',
    category: 'Sostenibilidad & Consumo Inteligente',
    readingTime: '7 min de lectura',
    publishedAt: '2026-10-19',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/men/clean-look.jpg',
    tags: ['Moda Circular', 'Coste por Puesta', 'Armario Digital', 'Consumo Consciente'],
    content: {
      intro: 'Los estudios sobre hábitos de consumo textil en Europa revelan un dato sorprendente: el ciudadano medio deja sin usar más del 60% de las prendas que cuelgan en su armario durante todo el año, y aun así siente cada mañana que "no tiene nada que ponerse". La raíz del problema no es la falta de ropa, sino la falta de visibilidad y organización.',
      sections: [
        {
          heading: '1. La Fórmula del Coste por Puesta (Cost Per Wear)',
          body: [
            'Para dejar de comprar ropa que acaba olvidada con la etiqueta puesta, los compradores profesionales utilizan una métrica financiera muy simple llamada Coste por Puesta (CPW): se divide el precio de compra de la prenda entre el número de veces que realmente la vas a vestir.',
            'Por ejemplo, un abrigo de buena lana o unas zapatillas versátiles de 120 € que utilizas 150 días a lo largo de dos años tienen un coste real de 0,80 € por uso. En cambio, una prenda llamativa de baja calidad de 29 € comprada por impulso para un único fin de semana y que nunca vuelves a ponerte te ha costado 29 € por uso: es 36 veces más cara en términos reales.'
          ],
          keyTakeaways: [
            'CPW = Precio de la prenda ÷ Número de días que la vistes',
            'Antes de comprar algo nuevo, pregúntate con qué 3 prendas de tu armario actual lo vas a combinar mañana mismo',
            'Las prendas básicas de buen tejido tienen el CPW más bajo y la mayor rentabilidad estética'
          ],
        },
        {
          heading: '2. El Fenómeno de las Compras Duplicadas por Ceguera de Armario',
          body: [
            '¿Cuántas veces has comprado una camiseta negra, una sudadera gris o un vaquero parecido a otro que ya tenías en el fondo del cajón simplemente porque no recordabas que lo tenías? Al no contar con un catálogo visual de nuestra ropa en el teléfono, cuando vamos de tiendas o navegamos online compramos desde la memoria reciente, no desde las necesidades reales de nuestro vestidor.',
            'Tener tu armario digitalizado te permite comprobar en cinco segundos desde el probador si esa prenda nueva realmente aporta algo distinto o si ya posees una alternativa idéntica en casa.'
          ],
          quote: '«La prenda más sostenible y rentable del mundo es aquella que ya cuelga en tu propio armario.»',
        },
        {
          heading: '3. Rotación Estacional y Segunda Vida Textil',
          body: [
            'Cada cambio de estación —en octubre al entrar el frío y en abril con la llegada de la primavera— es el momento ideal para auditar tu armario. Agrupa tus prendas por categorías, revisa el estado de costuras y botones, y detecta qué piezas llevan más de un año sin salir a la calle.',
            'Muchas veces, una prenda olvidada vuelve a cobrar protagonismo cuando descubres una forma distinta de combinarla —por ejemplo, llevando una camisa de verano abierta como sobrecamisa sobre un cuello cisne fino en otoño—.'
          ],
        },
      ],
      conclusion: 'Digitalizar tu ropa transforma tu relación con la moda: pasas de acumular prendas por impulso a curar una colección personal donde cada pieza tiene un propósito, ahorrando dinero y espacio.',
    },
  },
  {
    slug: 'guia-calzado-imprescindible',
    title: 'Guía de Calzado Imprescindible: Los 5 Pares que Cubren Todas las Ocasiones del Año',
    excerpt: 'De zapatillas blancas minimalistas y sneakers retro a mocasines de piel y botines Chelsea: cómo elegir y cuidar los zapatos que sostienen tu estilo.',
    category: 'Calzado & Accesorios',
    readingTime: '7 min de lectura',
    publishedAt: '2026-10-16',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/men/casual-moderno.jpg',
    tags: ['Calzado', 'Sneakers', 'Mocasines', 'Cuidado del Calzado'],
    content: {
      intro: 'En estilismo existe una máxima universal: los zapatos son el ancla visual de cualquier conjunto. Un pantalón y una camiseta sencillos se transforman en un look digno de revista cuando el calzado está limpio, bien proporcionado y acorde con la silueta del pantalón. Por el contrario, el mejor traje o abrigo pierde toda su fuerza si se acompaña de un calzado descuidado o descontextualizado.',
      sections: [
        {
          heading: '1. La Zapatilla Blanca de Piel Lisa (El Comodín Diario)',
          body: [
            'Una zapatilla blanca de corte bajo en cuero liso o vegano de calidad, sin suelas exageradas ni logotipos estridentes, es la pieza más polivalente del vestidor moderno. Funciona igual de bien con vaqueros rectos que con pantalones sastre de pinzas, vestidos midi o bermudas en verano.',
            'Para que conserve su efecto elegante, mantenla impecable pasando un paño húmedo tras cada uso y utilizando borradores específicos para la entresuela de goma.'
          ],
          keyTakeaways: [
            'Zapatilla blanca de piel lisa: el puente perfecto entre formal e informal',
            'Sneaker retro de ante (perfil bajo): aporta textura y toque urbano',
            'Mocasín de cuero o antifaz: eleva un vaquero al instante sin perder comodidad',
            'Botín Chelsea o bota de piel: estructura e impermeabilidad para otoño/invierno'
          ],
        },
        {
          heading: '2. La Sneaker Retro de Perfil Bajo y Textura en Ante',
          body: [
            'Inspiradas en el calzado clásico de pista de los años 70 y 80 (como siluetas tipo Onitsuka Tiger, Gazelle, Spezial o runner clásica), estas zapatillas de suela fina y empeine de ante aportan dinamismo y color controlado. Funcionan especialmente bien con pantalones anchos (wide-leg) porque su silueta estilizada asoma con elegancia bajo el dobladillo sin abultar.'
          ],
        },
        {
          heading: '3. El Mocasín Clásico (Penny Loafer o Mocasín con Suela Track)',
          body: [
            'El mocasín en cuero negro o marrón chocolate oscuro ha dejado de ser un zapato exclusivo de oficina para convertirse en el favorito del street style. Combinado con calcetines blancos o grises de canalé y unos vaqueros rectos o una falda de tablas, crea un contraste preppy contemporáneo lleno de personalidad.'
          ],
          quote: '«Invierte siempre en buen calzado y en un buen abrigo: son los dos extremos que definen la silueta de una persona al caminar.»',
        },
        {
          heading: '4. El Botín de Caña Media y el Mantenimiento de la Piel',
          body: [
            'Para los días de lluvia y bajas temperaturas, un botín Chelsea o una bota con cremallera lateral en piel tratada te permite vestir pantalones de lana o denim sin que el bajo se moje. Utiliza hormas de madera de cedro al guardarlos para absorber la humedad interior y evitar que se marquen arrugas profundas en el empeine.'
          ],
        },
      ],
      conclusion: 'No necesitas veinte pares de zapatos para vestir de diez: con cinco pares bien elegidos, limpios y rotados adecuadamente para dejar descansar la piel entre puestas, tendrás cubierto el 100% de tu calendario social y profesional.',
    },
  },
  {
    slug: 'como-vestir-segun-tipo-cuerpo',
    title: 'Morfología y Proporciones: Cómo Elegir Cortes, Tiros y Siluetas Según tu Cuerpo',
    excerpt: 'Aprende la regla de los tercios, cómo influye el tiro del pantalón en tu estatura visual y qué cortes potencian cada tipo de silueta femenina y masculina.',
    category: 'Morfología & Patronaje',
    readingTime: '9 min de lectura',
    publishedAt: '2026-10-14',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/women/clean-look.jpg',
    tags: ['Morfología', 'Proporciones', 'Regla de los Tercios', 'Asesoría de Imagen'],
    content: {
      intro: '¿Alguna vez has visto un conjunto increíble en un maniquí o en una foto, pero al probártelo sentiste que no te favorecía igual? La respuesta casi nunca está en tu cuerpo, sino en la proporción matemática del patrón respecto a tu altura y estructura ósea. Comprender la regla de los tercios y el impacto de las líneas de corte transforma por completo tu forma de comprar y combinar ropa.',
      sections: [
        {
          heading: '1. La Regla de los Tercios (1/3 vs. 2/3) Frente al Corte 50/50',
          body: [
            'El error de proporción más frecuente al vestirse consiste en dividir el cuerpo exactamente por la mitad (50% parte superior y 50% parte inferior) llevando un jersey o camiseta larga suelta por encima de la cadera con un pantalón de tiro bajo. Esa división simétrica acorta visualmente las piernas y resta dinamismo a la figura.',
            'La regla áurea del estilismo consiste en dividir la silueta en un tercio (1/3) para la parte superior y dos tercios (2/3) para la inferior —utilizando pantalones de tiro medio-alto y prendas superiores cortas o metidas ligeramente por dentro (french tuck)—, o bien dos tercios arriba (con un abrigo largo de tres cuartos) y un tercio visible abajo.'
          ],
          keyTakeaways: [
            'Evita partir tu silueta en dos mitades iguales (50/50) a la altura de la cadera',
            'Aplica la proporción 1/3 arriba y 2/3 abajo para alargar visualmente las piernas al instante',
            'El largo de la manga y el hombro de las chaquetas son las dos líneas que estructuran el torso'
          ],
        },
        {
          heading: '2. Guía de Cortes para Siluetas Femeninas',
          body: [
            '• Silueta Reloj de Arena (Hombros y caderas alineados con cintura definida): Te favorecen las prendas que acompañan la línea natural de la cintura sin añadir volumen rígido en exceso, como pantalones de tiro alto con pinzas suaves, cárdigans entallados o blazers cruzadas con cinturón.',
            '• Silueta Triángulo o Caderas Más Anchas: Para equilibrar la proporción, aporta estructura e interés visual en la mitad superior mediante cuellos barco, solapas anchas, hombreras sutiles, rayas horizontales o tonos luminosos arriba, combinados con pantalones de corte recto o wide-leg de caída limpia desde la cadera hasta el suelo.',
            '• Silueta Atlética o Rectangular: Crea sensación de movimiento jugando con el layering (capas superpuestas), chaquetas cropped, cinturones que marquen el punto medio y pantalones con textura o pliegues frontales.'
          ],
          quote: '«La ropa no debe intentar cambiar tu cuerpo, sino enmarcar tus proporciones con líneas que te hagan sentir cómodo y seguro.»',
        },
        {
          heading: '3. Guía de Cortes para Siluetas Masculinas',
          body: [
            '• Silueta Atlética o En V (Hombros anchos y cintura estrecha): Evita los pantalones excesivamente pitillo (skinny), ya que descompensan el tren superior creando un efecto cono. Opta por pantalones de corte recto (regular/straight) que equilibren el volumen de los hombros con las piernas.',
            '• Silueta Robusta o Más Abombada: Prioriza tejidos con estructura y cuerpo (algodón pesado, sarga, lana fría) que caigan en línea vertical sin adherirse. Las sobrecamisas abiertas sobre una camiseta interior crean dos líneas verticales en el torso que estilizan notablemente.',
            '• Estatura Alta y Estilizada vs. Estatura Compacta: Si mides más de 1,85 m, puedes jugar con contrastes fuertes entre pantalón, cinturón y camisa, además de abrigos largos y dobladillos vueltos. Si buscas ganar altura visual, utiliza conjuntos monocromáticos o coordina el color del pantalón con el del calzado para crear una línea continua sin cortes.'
          ],
        },
      ],
      conclusion: 'En la sección "Dinos cómo eres" de Klozet puedes indicar tu altura y tu tipo de cuerpo en segundos para que Kloe tenga siempre en cuenta tus proporciones reales al recomendarte qué prendas de tu armario combinar.',
    },
  },
  {
    slug: 'guia-tejidos-cuidado-ropa',
    title: 'Manual de Tejidos y Cuidado Textil: Cómo Reconocer la Calidad y Hacer que tu Ropa Dure Años',
    excerpt: 'Guía práctica para leer etiquetas de composición, distinguir entre fibras naturales y sintéticas y lavar tus prendas favoritas sin que pierdan forma ni color.',
    category: 'Calidad Textil & Cuidado',
    readingTime: '8 min de lectura',
    publishedAt: '2026-10-11',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/men/clean-look.jpg',
    tags: ['Tejidos', 'Cuidado de la Ropa', 'Algodón', 'Lana Merino'],
    content: {
      intro: 'Dos prendas pueden parecer idénticas en la percha de una tienda o en una fotografía online, pero tras el tercer lavado una mantiene su caída intacta y la otra se deforma, encoge o se llena de bolitas (pilling). La diferencia reside en la longitud de la fibra textil, el gramaje del tejido y la forma en que cuidamos cada material en casa.',
      sections: [
        {
          heading: '1. Cómo Leer la Etiqueta Interior en 10 Segundos',
          body: [
            'Antes de mirar la talla o el precio, busca la etiqueta interior de composición. Como regla general, cuantas menos fibras distintas se mezclen en un tejido (monomateriales como 100% algodón, 100% lino o 100% lana), mejor transpirará la prenda, mejor envejecerá con los años y más sencillo será su reciclaje futuro.',
            'Existen excepciones técnicas justificadas: un 1% o 2% de elastano en un pantalón chino aporta comodidad articular, y un 15-20% de poliamida en un jersey de lana o en unos calcetines refuerza las zonas de roce (codos y talones) para evitar roturas.'
          ],
          keyTakeaways: [
            'Algodón peinado o orgánico (>200 gsm en camisetas, >400 gsm en sudaderas): mayor durabilidad y opacidad',
            'Lana merino y cachemira: termorreguladoras naturales que no retienen olores y requieren pocos lavados',
            'Lino y Lyocell (Tencel): máxima transpirabilidad y caída fluida para primavera y verano'
          ],
        },
        {
          heading: '2. El Secreto para Evitar las Bolitas (Pilling) en el Punto',
          body: [
            'Las bolitas aparecen cuando las fibras cortas se rompen por la fricción (por ejemplo, el roce de la correa de una mochila o del cinturón de seguridad) y se enredan entre sí. Para minimizarlas, lava siempre tus prendas de punto del revés, en bolsa de malla protectora, con programa delicado en agua fría (máximo 20-30°C) y centrifugado suave (máximo 600 rpm).',
            'Nunca cuelgues un jersey de lana mojado en una percha, ya que el peso del agua estirará los hombros de forma irreversible: sécalo siempre en horizontal sobre una toalla.'
          ],
          quote: '«Lavar menos a menor temperatura y airear las prendas al llegar a casa duplica la vida útil de cualquier armario.»',
        },
        {
          heading: '3. Cómo Cuidar el Denim (Vaqueros) para Conservar su Color',
          body: [
            'El tejido vaquero de algodón índigo está diseñado para adaptarse a la forma de tu cuerpo con el uso. Lavarlo después de cada puesta desgasta prematuramente el tinte y debilita las costuras. Airear los vaqueros tras usarlos y lavarlos del revés con agua fría cada 6 a 10 puestas mantiene el color profundo y el ajuste original durante años.'
          ],
        },
      ],
      conclusion: 'Cuando subes tus prendas a Klozet, etiquetar su material principal (algodón, lana, lino, cuero, denim) permite que Kloe no solo combine colores, sino que adapte tus outfits a la temperatura y humedad real de tu ciudad.',
    },
  },
  {
    slug: 'como-hacer-maleta-viaje-perfecta',
    title: 'Método 5-4-3-2-1 para Viajar Ligero: Cómo Empacar 10 Días de Outfits en Equipaje de Mano',
    excerpt: 'Olvídate de facturar maletas pesadas llenas de "por si acasos": aprende la fórmula modular de estilismo para viajar con 15 prendas y vestir impecable cada día.',
    category: 'Viajes & Organización',
    readingTime: '7 min de lectura',
    publishedAt: '2026-10-08',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/men/casual-moderno.jpg',
    tags: ['Maleta de Viaje', 'Método 5-4-3-2-1', 'Equipaje de Mano', 'Organización'],
    content: {
      intro: 'El error más habitual al preparar una maleta de viaje consiste en empacar "conjuntos cerrados" día por día (el look del viernes, el look del sábado, el look del domingo) más un montón de prendas extra "por si acaso". El resultado es una maleta sobrecargada donde la mitad de la ropa regresa sin estrenar. El método 5-4-3-2-1 aplica la lógica del armario cápsula a tu equipaje de cabina.',
      sections: [
        {
          heading: '1. En Qué Consiste Exactamente la Fórmula 5-4-3-2-1',
          body: [
            'Esta regla nemotécnica limita tu selección a exactamente 15 piezas clave que comparten una misma paleta cromática (por ejemplo, negro, blanco, beige y denim):',
            '• 5 partes superiores (tres camisetas o tops transpirables, una camisa versátil que funcione abierta o cerrada y un jersey fino).',
            '• 4 partes inferiores (dos pantalones largos cómodos para caminar, un pantalón o falda más arreglado para cenar y una tercera opción adaptada al clima del destino).',
            '• 3 capas exteriores o vestidos/monos (una chaqueta impermeable o gabardina, una blazer o sobrecamisa y una sudadera o cárdigan para el avión).',
            '• 2 pares de calzado (unas zapatillas todo terreno ya domadas para caminar 15.000 pasos diarios y unos mocasines o botines limpios para la noche).',
            '• 1 conjunto de accesorios estratégicos (gafas de sol, gorra o pañuelo y bolso bandolera seguro).'
          ],
          keyTakeaways: [
            '5 partes superiores + 4 partes inferiores = 20 combinaciones distintas para más de 10 días',
            'Lleva puestas en el trayecto de avión o tren las prendas que más ocupan (abrigo, jersey grueso y calzado más pesado)',
            'Elige tejidos que no se arruguen fácilmente en la maleta, como punto merino, denim y mezclas con lyocell'
          ],
        },
        {
          heading: '2. Cómo Planificar tu Maleta en el Móvil Antes de Abrirla',
          body: [
            'En lugar de sacar toda la ropa del armario y tirarla sobre la cama la noche antes del vuelo, utiliza el lienzo y el calendario de Klozet para montar tus looks del viaje con antelación. Así verás al instante si hay algún zapato o chaqueta que solo combina con un pantalón y podrás sustituirlo antes de guardar nada en la maleta.'
          ],
          quote: '«Viajar ligero es el mayor lujo moderno: menos tiempo cargando peso y cero tiempo decidiendo qué ponerte en el hotel.»',
        },
      ],
      conclusion: 'La próxima vez que tengas una escapada de fin de semana o unas vacaciones largas, aplica la regla 5-4-3-2-1 con las prendas de tu armario digital y comprueba la libertad de viajar solo con equipaje de mano.',
    },
  },
  {
    slug: 'errores-comunes-al-vestir-soluciones',
    title: '10 Errores de Estilismo que Arruinan un Buen Outfit y Cómo Corregirlos en 1 Minuto',
    excerpt: 'Desde el largo incorrecto del pantalón hasta el exceso de colores o tallas mal elegidas: soluciones rápidas de estilista para pulir tu imagen diaria.',
    category: 'Trucos de Estilista',
    readingTime: '8 min de lectura',
    publishedAt: '2026-10-04',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/women/streetwear.jpg',
    tags: ['Trucos de Estilo', 'Errores al Vestir', 'Asesoría de Moda', 'Outfits'],
    content: {
      intro: 'A menudo la diferencia entre un conjunto normal y un conjunto que hace girar cabezas por la calle no reside en comprar ropa más cara, sino en pequeños ajustes de colocación, dobladillo y proporción que llevan menos de sesenta segundos frente al espejo.',
      sections: [
        {
          heading: '1. El Bajo del Pantalón Acumulado ("Efecto Acordeón")',
          body: [
            'Cuando un pantalón recto o ajustado es demasiado largo, el exceso de tela se arruga en múltiples pliegues sobre el tobillo, rompiendo la verticalidad de la pierna y dando sensación de descuido.',
            'Solución: Haz un dobladillo limpio hacia dentro o hacia fuera según el estilo del pantalón, o llévalo a una modista de barrio (un arreglo de bajo cuesta entre 6 y 10 € y hace que un pantalón de 30 € parezca hecho a medida).'
          ],
          keyTakeaways: [
            'Ajusta el largo de tus pantalones para que caigan con un solo pliegue limpio sobre el zapato',
            'Remanga las camisas con el método italiano (dos vueltas hasta debajo del codo) para estructurar el antebrazo',
            'Coordina los metales (hebilla de cinturón, reloj, cierre de bolso) o mézclalos con intención'
          ],
        },
        {
          heading: '2. Llevar Todas las Prendas del Mismo Volumen',
          body: [
            'Vestir tres prendas ultra ajustadas a la vez o tres prendas gigantescas sin estructura puede desdibujar tu silueta. Aplica el contraste de volúmenes: pantalón holgado con camiseta o jersey que marque bien la línea de los hombros, o pantalón recto con sudadera o blazer de corte relajado.'
          ],
          quote: '«Los detalles no son solo detalles: son los que construyen el acabado final de todo el conjunto.» — Charles Eames',
        },
        {
          heading: '3. Descuidar la Tercera Pieza y las Texturas',
          body: [
            'Un pantalón y una camiseta forman una base funcional, pero es la "tercera pieza" (una sobrecamisa abierta, un jersey anudado sobre los hombros, una cazadora, un chaleco o un buen bolso/gorra) la que convierte el acto de vestirse en estilismo con intención.'
          ],
        },
      ],
      conclusion: 'Antes de salir de casa, dedica 30 segundos a revisar el bajo del pantalón, el cuello de la prenda superior y el equilibrio de colores. Esos micro-ajustes marcan el 90% del resultado visual.',
    },
  },
  {
    slug: 'psicologia-del-color-y-estilo-personal',
    title: 'Psicología del Vestir y Fatiga de Decisión: Por Qué Pierdes 91 Horas al Año Frente al Espejo',
    excerpt: 'El análisis matemático y psicológico detrás del estrés matutino al elegir ropa y cómo la organización visual recupera casi 4 días completos de tu año.',
    category: 'Psicología & Hábitos',
    readingTime: '7 min de lectura',
    publishedAt: '2026-10-01',
    author: {
      name: 'Ethan',
      role: 'Creador de Klozet',
      avatarUrl: '/about/ethan-fundador.jpg',
    },
    coverImage: '/styles/men/streetwear.jpg',
    tags: ['Psicología de la Moda', 'Fatiga de Decisión', 'Productividad', 'Hábitos'],
    content: {
      intro: 'Cada mañana, antes siquiera de tomar el primer café o salir hacia el trabajo o la universidad, nuestro cerebro se enfrenta a decenas de micro-decisiones frente a las puertas abiertas del armario: ¿qué tiempo hará a las cinco de la tarde?, ¿esta camisa pega con este pantalón?, ¿me puse esto mismo hace tres días? Ese desgaste silencioso se conoce en psicología cognitiva como fatiga de decisión.',
      sections: [
        {
          heading: '1. El Cálculo Real: 15 Minutos al Día Son 91 Horas al Año',
          body: [
            'Las encuestas de hábitos cotidianos muestran que una persona invierte de media entre 14 y 17 minutos diarios en elegir qué ponerse, probarse prendas que luego descarta sobre la silla o la cama y cambiar de opinión en el último minuto.',
            'Si multiplicamos 15 minutos diarios por los 365 días del año, el resultado es contundente: 5.475 minutos, lo que equivale a 91,25 horas anuales. Son casi 4 días enteros de 24 horas al año pasados de pie frente al armario con dudas.',
            'Invertir 15 minutos una sola tarde en fotografiar tus prendas principales y dejarlas organizadas en tu armario digital elimina esa fricción durante los 365 días siguientes.'
          ],
          keyTakeaways: [
            '15 minutos cada mañana × 365 días = 5.475 minutos = +91 horas al año (~4 días completos)',
            'Separar el momento de "planificar el outfit" del momento de "vestirse con prisa" reduce el estrés matutino un 80%',
            'La cognición enclothed demuestra que vestir un conjunto con el que te sientes seguro mejora tu concentración y confianza social'
          ],
        },
        {
          heading: '2. "Enclothed Cognition": Cómo Influye tu Ropa en tu Estado de Ánimo',
          body: [
            'Los investigadores Hajo Adam y Adam Galinsky acuñaron el término "cognición investida" (enclothed cognition) para describir el impacto medible que tienen las prendas que llevamos puestas sobre nuestros procesos psicológicos, nuestra postura corporal y nuestra seguridad al hablar en público.',
            'Cuando sales de casa con la sensación de haberte puesto lo primero que encontraste por falta de tiempo, arrastras cierta incomodidad durante toda la mañana. En cambio, cuando llevas un conjunto pensado y equilibrado, tu atención queda libre al 100% para tus proyectos y tus relaciones.'
          ],
          quote: '«Organizar tu armario no es vanidad; es diseñar tus mañanas para empezar el día con claridad mental.»',
        },
      ],
      conclusion: 'Recupera tus mañanas y transforma el momento de vestirte en algo ágil, creativo y divertido. Digitaliza tus primeras 20 prendas hoy mismo en Klozet y deja que tu armario trabaje a tu favor.',
    },
  },
];
