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
    excerpt: 'Aprende a construir un fondo de armario minimalista, versátil y duradero que te permita crear más de 70 combinaciones distintas sin esfuerzo.',
    category: 'Estilo & Organización',
    readingTime: '7 min de lectura',
    publishedAt: '2026-10-18',
    author: {
      name: 'Equipo Editorial Klozet',
      role: 'Estilistas & Curadores de Moda',
      avatarUrl: '/landing/golden-goose.png',
    },
    coverImage: '/styles/women/clean-look.jpg',
    tags: ['Armario Cápsula', 'Minimalismo', 'Quiet Luxury', 'Sostenibilidad'],
    content: {
      intro: 'En una era dominada por ciclos de microtendencias efímeras y consumo acelerado, el armario cápsula emerge como la respuesta más inteligente y sofisticada. No se trata de limitar tus opciones estilísticas, sino de maximizar la calidad y cohesión de cada pieza para que vestirse cada mañana sea un acto de pura creatividad sin fricción.',
      sections: [
        {
          heading: '1. Los Pilares Fundamentales: La Paleta de Colores Cohesiva',
          body: [
            'El secreto de un armario cápsula donde todo combina con todo radica en la disciplina cromática. La regla de oro consiste en seleccionar tres tonos neutros primarios (blanco óptico o crudo, negro profundo y gris jaspeado o azul marino), dos tonos neutros secundarios (camel, beige o topo) y dos acentos de temporada.',
            'Al mantener las prendas estructurales —pantalones sastre, blazers y abrigos— dentro de la gama neutra, garantizas que cualquier camiseta básica o accesorio cromático encaje de manera orgánica sin sobrecargar la silueta.',
          ],
          keyTakeaways: [
            '60% tonos neutros base (negro, blanco, azul marino, gris)',
            '30% tonos neutros cálidos (beige, camel, arena)',
            '10% acentos tonales o texturas llamativas',
          ],
        },
        {
          heading: '2. Las 25 Prendas Esenciales que Transforman tu Día a Día',
          body: [
            'Para estructurar una cápsula verdaderamente funcional para todo el año, divide tu selección en cuatro categorías maestras: prendas superiores (tops, camisas y punto), prendas inferiores (sastrería y denim), piezas de abrigo estructuradas y calzado polivalente.',
            'Comienza por una camisa de popelín blanca impecable de corte holgado, dos camisetas de algodón pima de alto gramaje (blanca y negra), un jersey de cuello redondo en lana merino o cachemira, y un cardigan con botones de cuerno.',
            'En cuanto a pantalones, un vaquero recto de lavado medio sin rotos y un pantalón sastre de pinzas con caída fluida (wide-leg) formarán el 80% de tus combinaciones tanto diurnas como nocturnas.',
          ],
          quote: '«La elegancia no consiste en llamar la atención, sino en ser recordado.» — Giorgio Armani',
        },
        {
          heading: '3. La Regla de las Fórmulas de Outfit: De la Oficina a la Cena',
          body: [
            'Una fórmula de outfit es una combinación estructural de siluetas probada que siempre funciona. Por ejemplo, la fórmula "Sartorial Casual": pantalón de pinzas fluido + camiseta básica de algodón metida por dentro + blazer oversized + zapatillas bajas de cuero minimalista.',
            'Para transformar este look en un atuendo de noche, simplemente sustituye las zapatillas por unos mocasines de piel pulida o botines de tacón sensato y añade joyería dorada sutil.',
          ],
        },
        {
          heading: '4. Digitalización y Mantenimiento de tu Cápsula',
          body: [
            'El mayor error al construir un armario cápsula es no visualizar con claridad lo que ya posees. La digitalización de prendas mediante herramientas como Klozet te permite registrar visualmente cada pieza sin fondos molestos y simular combinaciones antes de comprarlas.',
            'Revisa tu colección al final de cada temporada: si una pieza no ha sido vestida en más de 90 días, evalúa si necesita un arreglo de sastrería o si debe ser donada o vendida para mantener el espacio limpio y curado.',
          ],
        },
      ],
      conclusion: 'Construir un armario cápsula no es un destino estático, sino una práctica continua de autoconocimiento y aprecio por las buenas prendas. Invierte en buenos tejidos, prioriza cortes limpios y utiliza la tecnología para redescubrir el verdadero potencial de tu ropa.',
    },
  },
  {
    slug: 'quiet-luxury-streetwear',
    title: 'Streetwear & Quiet Luxury: La Fusión Estética que Domina 2026',
    excerpt: 'Descubre cómo las siluetas urbanas desestructuradas se combinan con tejidos nobles y acabados sartoriales para redefinir el estilo contemporáneo.',
    category: 'Tendencias & Vanguardia',
    readingTime: '6 min de lectura',
    publishedAt: '2026-10-15',
    author: {
      name: 'Equipo Editorial Klozet',
      role: 'Estilistas & Curadores de Moda',
      avatarUrl: '/landing/zara-chaleco.jpg',
    },
    coverImage: '/styles/men/streetwear.jpg',
    tags: ['Streetwear', 'Quiet Luxury', 'Siluetas Oversize', 'Minimalismo Urbano'],
    content: {
      intro: 'Durante años, el streetwear y el lujo tradicional habitaron en universos paralelos: el primero dominado por logomanía vibrante y estética deportiva; el segundo por sastrería rígida y códigos conservadores. Hoy presenciamos la consagración de su punto de encuentro definitivo: el streetwear de lujo silencioso o "Quiet Streetwear".',
      sections: [
        {
          heading: '1. El Ocaso de los Grandes Logotipos y el Triunfo de la Textura',
          body: [
            'El nuevo consumidor de moda urbana rechaza los estampados gigantescos en favor de tejidos de gramaje superior, costuras reforzadas y caídas pesadas. Una sudadera hoodie ya no destaca por un logo frontal, sino por un patrón de hombro caído en algodón francés de 450 gsm y un teñido en prenda (garment dye) con matices descoloridos artesanales.',
            'Marcas como Scuffers, Nude Project, Stüssy y marcas de nicho independiente han refinado sus propuestas para dialogar con casas como The Row o Lemaire: lujo tangible al tacto, pero discreto a la vista.',
          ],
        },
        {
          heading: '2. La Proporción y la Silueta: El Dominio del Wide-Leg',
          body: [
            'La silueta predominante es generosa y estructurada. Los pantalones vaqueros ajustados han dado paso a pantalones carpintero de loneta gruesa, cargos técnicos con bolsillos integrados y pantalones sastre con pinzas dobles que caen elegantemente sobre la zapatilla sin arrugas forzadas.',
            'La clave para no perder esbeltez con prendas oversize es el equilibrio de volúmenes: si la parte inferior es ancha y con peso visual, la parte superior debe definir los hombros o recortarse ligeramente en la cintura (cropped boxy fit).',
          ],
        },
        {
          heading: '3. El Calzado Híbrido: El Puente Entre Dos Mundos',
          body: [
            'El calzado es la pieza que articula toda la propuesta. Mocasines de suela track de cuero combinados con pantalones de chándal de corte recto, o zapatillas retro de running con suelas técnicas emparejadas con abrigos de lana de tres cuartos.',
            'Esta yuxtaposición deliberada entre lo formal y lo desenfadado es la seña de identidad del vestir moderno.',
          ],
        },
      ],
      conclusion: 'La unión entre streetwear y quiet luxury demuestra que la comodidad no está reñida con la elegancia. Viste prendas que te hagan sentir libre, pero elige siempre materiales que perduren en el tiempo.',
    },
  },
  {
    slug: 'teoria-del-color-moda',
    title: 'La Teoría del Color en tu Ropa: Cómo Dominar Contrastes y Armonías',
    excerpt: 'Guía práctica para entender el círculo cromático, aprender a mezclar tonos neutros con colores de acento y potenciar tu tono natural de piel.',
    category: 'Colorimetría & Estilismo',
    readingTime: '6 min de lectura',
    publishedAt: '2026-10-12',
    author: {
      name: 'Equipo Editorial Klozet',
      role: 'Estilistas & Curadores de Moda',
      avatarUrl: '/landing/golden-goose.png',
    },
    coverImage: '/styles/women/streetwear.jpg',
    tags: ['Colorimetría', 'Estilismo', 'Consejos de Moda', 'Outfits Diarios'],
    content: {
      intro: 'El color es el primer elemento visual que el cerebro procesa al mirar un conjunto, mucho antes de percibir la marca, el tejido o el corte. Dominar las combinaciones de color te permite transformar prendas ordinarias en atuendos magnéticos y llenos de armonía.',
      sections: [
        {
          heading: '1. Armonía Monocromática: El Poder de un Solo Tono',
          body: [
            'Vestir de un solo color de pies a cabeza (monocromático) es la técnica más eficaz para alargar visualmente la silueta y proyectar sofisticación instantánea. Sin embargo, el secreto para que no resulte plano es variar las texturas y profundidades tonales.',
            'Un conjunto en tonos crema gana vida cuando combinas un jersey de punto trenzado de lana, un pantalón de pana fina o lino pesado y una cazadora de piel vuelta. Mismo color, múltiples dimensiones sensoriales.',
          ],
        },
        {
          heading: '2. Colores Análogos vs. Colores Complementarios',
          body: [
            'Los colores análogos se encuentran contiguos en el círculo cromático (como el verde oliva, el caqui y el amarillo mostaza). Producen una sensación relajada, natural y muy orgánica que funciona a la perfección en atuendos de otoño e invierno.',
            'Por el contrario, los complementarios se sitúan en extremos opuestos (como el azul marino y el teja o naranja quemado). Utilizados con moderación —por ejemplo, un jersey azul oscuro con un pañuelo o gorra en tono teja— crean un contraste dinámico y enérgico.',
          ],
        },
        {
          heading: '3. El Acento de Color: La Regla del "Pop of Color"',
          body: [
            'Si prefieres una base neutra pero quieres añadir personalidad, recurre a un acento cromático único. Un outfit completamente negro o gris oscuro adquiere un aire editorial cuando añades una gorra verde bosque, un bolso burdeos o unos calcetines rojo carmín visibles entre el bajo del pantalón y el mocasín.',
          ],
        },
      ],
      conclusion: 'Experimenta con los colores sin miedo. La mejor combinación es aquella que no solo luce equilibrada en el espejo, sino que te transmite seguridad y energía para afrontar el día.',
    },
  },
  {
    slug: 'moda-circular-digitalizacion',
    title: 'Moda Circular y Armario Digital: Redescubre la Ropa que ya Tienes',
    excerpt: 'Por qué la digitalización de prendas y el estilismo con inteligencia artificial son el futuro para reducir el impacto textil sin sacrificar la creatividad.',
    category: 'Sostenibilidad & Tech',
    readingTime: '5 min de lectura',
    publishedAt: '2026-10-09',
    author: {
      name: 'Equipo Editorial Klozet',
      role: 'Estilistas & Curadores de Moda',
      avatarUrl: '/landing/zara-chaleco.jpg',
    },
    coverImage: '/styles/men/clean-look.jpg',
    tags: ['Moda Circular', 'Sostenibilidad', 'Armario Digital', 'IA de Moda'],
    content: {
      intro: 'Diversos estudios europeos señalan que la mayoría de las personas solo utilizan activamente entre el 20% y el 30% de la ropa que guardan en sus armarios. El resto permanece olvidado en baldas y perchas, eclipsado por las compras más recientes. La moda circular empieza en tu propio armario.',
      sections: [
        {
          heading: '1. El Coste Real por Puesta (Cost Per Wear)',
          body: [
            'El verdadero valor de una prenda no lo determina su etiqueta de precio inicial, sino su coste por puesta (CPW = Precio / Veces utilizada). Una cazadora de cuero de alta calidad de 200€ vestida 200 veces tiene un CPW de 1€, mientras que un vestido de fiesta de poliéster de 30€ usado una única noche cuesta 30€ por puesta.',
            'Invertir en prendas bien confeccionadas y mantenerlas activas durante años es el mayor acto de sostenibilidad individual accesible para cualquier amante de la moda.',
          ],
        },
        {
          heading: '2. Cómo la Digitalización Combate la Fatiga de Decisión',
          body: [
            'Al tener tu armario completo fotografiado y clasificado en tu móvil, desaparece la sensación abrumadora de "no tengo nada que ponerme". Puedes explorar combinaciones en el trayecto en metro o tumbado en el sofá, probando emparejamientos que jamás habrías considerado frente al espejo físico.',
            'Nuestra inteligencia artificial Kloe actúa como una estilista personal que no te juzga ni intenta venderte ropa nueva: analiza las prendas que ya son tuyas y te sugiere combinaciones frescas adaptadas al clima y a la ocasión.',
          ],
        },
      ],
      conclusion: 'Comprar menos, elegir mejor y usar mucho más. La tecnología no está para incitarnos a acumular prendas, sino para inspirarnos a exprimir cada costura y crear un estilo genuinamente propio.',
    },
  },
  {
    slug: 'guia-calzado-imprescindible',
    title: 'Guía de Calzado Imprescindible: Los 5 Pares que Cubren Todo el Año',
    excerpt: 'De zapatillas blancas minimalistas a mocasines penny y botines Chelsea: el calzado esencial para elevar cualquier conjunto de lunes a domingo.',
    category: 'Calzado & Accesorios',
    readingTime: '5 min de lectura',
    publishedAt: '2026-10-05',
    author: {
      name: 'Equipo Editorial Klozet',
      role: 'Estilistas & Curadores de Moda',
      avatarUrl: '/landing/golden-goose.png',
    },
    coverImage: '/styles/men/casual-moderno.jpg',
    tags: ['Calzado', 'Sneakers', 'Mocasines', 'Guía de Compras'],
    content: {
      intro: 'Un outfit impecable puede desmoronarse en un segundo si el calzado no acompaña la intención del look. Por el contrario, un par de zapatos bien seleccionados tiene el poder de elevar unos simples vaqueros y camiseta blanca a la categoría de look editorial.',
      sections: [
        {
          heading: '1. La Zapatilla Blanca de Piel Minimalista',
          body: [
            'Es el comodín universal del armario contemporáneo. De silueta baja y limpia, sin gráficos estridentes y con una piel flexible fácil de limpiar. Funciona con vaqueros relajados, con pantalones cortos en verano y con trajes de chaqueta para restarles rigidez en entornos profesionales.',
          ],
        },
        {
          heading: '2. El Mocasín de Cuero o Antelina (Penny Loafer)',
          body: [
            'El mocasín es la pieza maestra de la elegancia sin esfuerzo. En color negro o marrón chocolate oscuro, aporta sofisticación inmediata tanto con calcetines blancos de canalé y pantalón cropped como descalzo con pantalones de lino en los meses cálidos.',
          ],
        },
        {
          heading: '3. El Botín de Caña Media o Chelsea Boot',
          body: [
            'Para los meses fríos y lluviosos, un botín de piel resistente con suela de goma proporciona estructura, calor y un acabado robusto pero limpio. Ideal debajo de pantalones rectos y abrigos de lana.',
          ],
        },
      ],
      conclusion: 'Cuida tu calzado: límpialo con frecuencia, hidrata la piel y utiliza hormas de cedro para conservar la silueta. Un calzado bien mantenido puede durar décadas y lucir mejor con el paso de los años.',
    },
  },
];
