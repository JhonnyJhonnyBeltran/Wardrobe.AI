# Klozet 👗✨

**Tu asistente personal de moda impulsado por IA**

Una aplicación web progresiva (PWA) de última generación con estética premium estilo Apple/Revolut, diseñada para revolucionar tu experiencia de moda mediante inteligencia artificial avanzada y análisis personalizado.

---

## 🎨 Características Principales

### 🤖 **Generación de Outfits con IA**
- Animación tipo "slot machine" ultra-fluida para revelar tu look perfecto
- Integración con Fashion Bot para sugerencias dinámicas
- Swipe horizontal para cambiar prendas individuales del outfit
- Compatible con modo local si el bot no está disponible

### 👕 **Armario Inteligente Híbrido**
- **Digitalización automática**: Sube fotos y se elimina el fondo automáticamente
- **Smart Scraping**: Pega URLs de Zara, Mango, H&M y extrae datos automáticamente
- **Sistema de Favoritos**: Prendas favoritas tienen 40% más probabilidad de aparecer en outfits
- **Filtros Avanzados**: Por categoría, estación, tejido, color, tienda y precio
- **Vistas Múltiples**: Grid o lista con estadísticas en tiempo real

### 🎨 **Smart Profiling (Análisis Biométrico)**
- **Análisis Morfológico**: Cuestionario visual para determinar tu tipo de cuerpo
  - Triángulo, Triángulo Invertido, Rectángulo, Reloj de Arena, Óvalo
  - Recomendaciones personalizadas de cortes y siluetas
- **Colorimetría Avanzada**: Determina tu paleta estacional perfecta
  - Primavera, Verano, Otoño, Invierno
  - Basado en tono de piel, subtono, color de ojos y cabello
- **Avatar Personalizado**: Visualiza outfits con tu imagen (Paper Doll moderno)

### 💬 **Asistente de Moda IA**
- Chatbot especializado exclusivamente en moda
- Micro-scraping de Vogue, ELLE, Who What Wear
- Respuestas personalizadas según tu perfil y preferencias
- Redirección elegante si preguntas fuera de tema

### 💎 **Modelo Freemium**
- **Free**: Últimos 3 outfits en historial
- **Premium**: 
  - Historial ilimitado
  - Análisis de colorimetría avanzado
  - Prioridad en generación con IA
  - Sin anuncios

---

## 🎯 Diseño y Estética

### **Apple/Revolut Premium Style**
- Minimalismo extremo con limpieza y sofisticación
- Componentes flotantes sin marcos rígidos
- Sombras sutiles para profundidad
- Animaciones elásticas a 60fps
- Border radius ultra-redondeado (20-32px)

### **Dark Mode Nativo**
- Transiciones suaves entre modos
- Paleta optimizada para cada tema
- Persistencia en localStorage

### **Sistema de Colores**
```css
Blanco Puro (#FFFFFF)
Negro Profundo (#0A0A0A)
Rosa Klozet (#FF69B4)
```

### **Tipografía**
- Inter (principal) - estilo Apple
- Weights: 300, 400, 500, 600, 700, 800, 900
- Font smoothing antialiased

---

## 📱 Screenshots

### Desktop View
![Home Desktop - Outfit Generator](docs/screenshots/home-desktop.png)
![Closet Desktop - Smart Wardrobe](docs/screenshots/closet-desktop.png)

### Mobile View
![Home Mobile](docs/screenshots/home-mobile.png)
![Closet Mobile - Filters](docs/screenshots/closet-mobile.png)
![Smart Profile - Colorimetry](docs/screenshots/colorimetry-mobile.png)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm o yarn

### Installation

```bash
# Clone el repositorio
git clone https://github.com/DaniFdezCab/Wardrobe.AI.git

# Navega al directorio
cd Wardrobe.AI

# Instala dependencias
npm install

# Ejecuta el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### Build para Producción

```bash
# Crea un build optimizado
npm run build

# Inicia el servidor de producción
npm start
```

---

## 📁 Estructura del Proyecto

```
Klozet/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout con providers
│   ├── page.tsx                 # Home - Generador de Outfits
│   ├── closet/                  # Armario Inteligente
│   ├── chat/                    # Asistente IA de Moda
│   ├── profile/                 # Perfil y Smart Profile
│   └── globals.css              # Sistema de diseño global
│
├── components/                   # Componentes UI
│   ├── Button.tsx               # Botón premium con variantes
│   ├── Card.tsx                 # Tarjeta flotante
│   ├── ClothingItem.tsx         # Prenda sin fondo
│   ├── SlotMachineGenerator.tsx # Animación de generación
│   ├── ThemeToggle.tsx          # Switch de tema
│   ├── Sidebar.tsx              # Navegación desktop
│   ├── TabBar.tsx               # Navegación móvil
│   └── SmartProfile/            # Componentes de análisis
│       ├── MorphologyQuiz.tsx   # Quiz de morfología
│       └── ColorimetryAnalyzer.tsx # Análisis de color
│
├── store/                        # State management
│   ├── userStore.tsx            # Usuario y suscripción
│   └── themeStore.tsx           # Dark mode
│
├── lib/                          # Utilidades y lógica
│   └── fashion/                 # Motor de estilismo IA
│       └── outfitGenerator.ts   # Generador de outfits
│
├── services/                     # APIs y servicios
│   ├── backgroundRemoval.ts     # Eliminación de fondo
│   ├── smartScraper.ts          # Scraping de tiendas
│   └── fashionBotClient.ts      # Cliente del Fashion Bot
│
├── types/                        # TypeScript definitions
│   ├── clothing.ts              # Tipos de prendas
│   ├── outfit.ts                # Tipos de outfits
│   └── user.ts                  # Usuario y perfil
│
└── public/                       # Recursos estáticos
    ├── manifest.json            # PWA manifest
    └── images/                  # Imágenes y assets
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Animaciones**: Framer Motion 12
- **Iconos**: Lucide React
- **State**: React Context API
- **PWA**: Next-PWA

### APIs y Servicios Integrados
- Fashion Bot (IA generativa)
- Remove.bg / rembg (Background removal)
- Web Scraping (Cheerio/Puppeteer)
- Fashion Trends APIs

---

## 🎯 Funcionalidades Clave

### 🎭 **Generación de Outfits**
```typescript
// Ejemplo de uso del generador
const outfit = await generateOutfit({
  style: 'casual',
  occasion: 'everyday',
  season: 'winter',
  userProfile: {
    bodyType: 'hourglass',
    colorSeason: 'winter',
    favorites: clothingItems.filter(i => i.isFavorite),
  },
});
```

### 👗 **Sistema de Prendas Flotantes**
```css
.clothing-item {
  background: transparent;
  border: none;
  transition: all 0.3s var(--ease-smooth);
}

.clothing-item:hover {
  transform: translateY(-4px) scale(1.02);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
}
```

### 🎨 **CSS Variables para Theming**
```css
:root {
  --brand-pink: #FF69B4;
  --background: #FFFFFF;
  --foreground: #0A0A0A;
  --shadow-float: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.dark {
  --background: #0A0A0A;
  --foreground: #FAFAFA;
  --shadow-float: 0 2px 8px rgba(0, 0, 0, 0.6);
}
```

---

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm start        # Servidor de producción
npm run lint     # Ejecuta ESLint
```

---

## 🎨 Sistema de Diseño

### **Animaciones Clave**
- `slot-machine`: Carrusel vertical rápido con desaceleración
- `elastic-appear`: Aparición con rebote elástico
- `float-smooth`: Flotación suave continua
- `pulse-glow`: Efecto de brillo pulsante

### **Componentes Base**
- **Button**: 5 variantes (primary, secondary, outline, ghost, glass)
- **Card**: 3 variantes (default, glass, gradient)
- **ClothingItem**: Elemento flotante sin fondo
- **ThemeToggle**: Switch animado tipo Apple

### **Breakpoints Responsive**
```
sm:  640px   (Mobile landscape)
md:  768px   (Tablet)
lg:  1024px  (Desktop)
xl:  1280px  (Large desktop)
```

---

## 🔮 Roadmap

### ✅ Fase 1: Sistema de Diseño (COMPLETADO)
- [x] CSS Global refactorizado
- [x] Componentes base premium
- [x] Dark mode nativo
- [x] Animaciones elásticas

### ✅ Fase 2: Funcionalidades Core (COMPLETADO)
- [x] Generador de outfits con slot machine
- [x] Armario inteligente con filtros
- [x] Sistema de favoritos
- [x] Navegación refactorizada

### ✅ Fase 3: Smart Profiling (COMPLETADO)
- [x] Análisis morfológico
- [x] Colorimetría estacional
- [ ] Avatar personalizado (Paper Doll)
- [ ] Upload de foto facial

### � Fase 4: Armario Avanzado (EN PROGRESO)
- [ ] Background removal real
- [ ] Smart scraping de URLs
- [ ] Sistema de etiquetas
- [ ] Estadísticas de uso

### 📋 Fase 5: IA Avanzada (PENDIENTE)
- [ ] Gap Analysis
- [ ] Sugerencias de compra
- [ ] Análisis de tendencias
- [ ] Recomendaciones personalizadas

### 📋 Fase 6: Social Features (PENDIENTE)
- [ ] Feed social
- [ ] Carpetas de inspiración
- [ ] Compartir outfits
- [ ] Seguir usuarios

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## 👥 Equipo

- **Lead Developer & Designer**: [@DaniFdezCab](https://github.com/DaniFdezCab)
- **AI/ML Consultant**: Fashion Bot Team
- **UX Research**: Community contributors

---

## � Contacto

**Klozet** - Tu asistente personal de moda

- Website: [klozet.app](https://klozet.app)
- Email: hola@klozet.app
- Instagram: [@klozet.ai](https://instagram.com/klozet.ai)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animaciones
- [Lucide](https://lucide.dev/) - Iconos
- Comunidad de diseñadores y desarrolladores que inspiran esta app

---

⭐️ Si te gusta Klozet, dale una estrella en GitHub!

**Hecho con 💖 y mucho ☕ por el equipo de Klozet**
