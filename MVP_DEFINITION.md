# MVP - Wardrobe.AI

## 📋 Resumen Ejecutivo

**Wardrobe.AI** es una aplicación móvil inteligente que combina un armario personal digital con un asistente de IA para la gestión de vestuario y generación de outfits personalizados.

## 🎯 Objetivo del MVP

Crear una aplicación móvil que permita a los usuarios:

1. Digitalizar y gestionar su armario personal
2. Interactuar con un chatbot de IA para recibir recomendaciones de outfit personalizadas
3. Generar combinaciones de ropa basadas en contexto, clima y preferencias

---

## 👤 Flujo de Usuario Principal

```
1. Descarga de la app
2. Login/Registro
3. Acceso directo a la aplicación
   ├─→ Armario Personal
   └─→ Chatbot de Recomendaciones
```

---

## 🎨 Funcionalidades Principales

### 1. Armario Personal Digital

#### Descripción

Espacio digital donde el usuario gestiona todas sus prendas de ropa.

#### Métodos de Añadir Prendas

##### A. Captura por Fotografía + IA/Librería

- **Flujo**: Usuario toma foto de una prenda → Modelo de IA/Librería procesa la imagen → Extrae la prenda en 2D → Guarda en el armario
- **Tecnología**: Visión por computadora + Segmentación de imágenes
- **Salida**: Imagen limpia de la prenda en 2D (fondo transparente/neutro)
- **Autocompletado inteligente**: El modelo interpretará la información de la prenda, autocompletando el formulario pero siendo accesible para su posterior edición

##### B. Importación por URL

- **Fuente**: Tiendas online (Zara, Bershka, Pull&Bear, H&M, etc.)
- **Flujo**: Usuario pega enlace → Sistema extrae imagen del producto → Guarda en armario
- **Ventaja**: Permite planificar compras futuras o combinar ropa existente con nueva
- **Autocompletado inteligente**: El scraping interpretará la información de la prenda, autocompletando el formulario pero siendo accesible para su posterior edición

##### C. Entrada Manual

- Subida directa de imagen desde galería
- Formulario con detalles de la prenda
- **Nota**: Resultado visual menos pulido que las opciones con procesamiento IA

#### Información de Cada Prenda

- Imagen en 2D procesada
- Categoría (camiseta, pantalón, chaqueta, zapatos, etc.)
- Color dominante
- Tipo de tela/material (opcional)
- Temporada (verano, invierno, entretiempo)
- Tags personalizados
- Tienda de origen (si aplica)
- Fecha de adquisición (si aplica)

#### Beneficios

- ✅ **Recordatorio visual**: Evita olvidar prendas que tienes
- ✅ **Organización**: Todo tu vestuario en un solo lugar
- ✅ **Planificación**: Base de datos para generar outfits

---

### 2. Chatbot de Recomendaciones con IA

#### Descripción

Asistente conversacional inteligente que entiende contexto, clima y preferencias del usuario para generar recomendaciones de outfit personalizadas.

#### Casos de Uso

##### Ejemplo 1: Contexto Social + Clima

```
Usuario: "Hoy salgo con una chica que me gusta, va a hacer fresquito
         y quiero ir arreglado. ¿Qué me recomiendas?"

IA: Analiza:
    - Contexto: Cita romántica (formal/elegante)
    - Clima: Fresco (necesita capas)
    - Objetivo: Ir arreglado

    Genera:
    - Outfit completo con prendas del armario
    - Alternativas si hay varias opciones
    - Justificación de la elección
```

##### Ejemplo 2: Combinación Específica

```
Usuario: [Inserta imagen de una prenda del armario]
         "Con esta prenda, ¿qué me recomiendas que combine
         para una tarde de amigos con una temperatura de 20°C?"

IA: Analiza:
    - Prenda base seleccionada
    - Contexto: Casual con amigos
    - Temperatura: 20°C (entretiempo)

    Genera:
    - Combinaciones que incluyan esa prenda
    - Sugerencias de capas adicionales
    - Opciones de calzado
```

#### Capacidades del Chatbot

- 🧠 **Comprensión de contexto**: Eventos, clima, formalidad
- 👔 **Conocimiento de moda**: Reglas de combinación de colores y estilos
- 🌡️ **Adaptación al clima**: Sugiere capas según temperatura
- 💾 **Memoria conversacional**: Recuerda preferencias durante la sesión
- 💬 **Lenguaje natural**: Conversación fluida y personalizada
- 🎯 **Acceso al armario**: Solo sugiere prendas que el usuario posee

#### Opciones de Salida

- Vista del outfit completo generado (estilo pinterest, Collage)
- Botón "Guardar outfit" para uso futuro
- Botón "Generar alternativa" si no convence
- Desglose de cada prenda con imagen

---

### 3. Generador de Outfits Automático

#### Descripción

Funcionalidad directa desde el armario para generar outfits sin necesidad de conversación con el chatbot.

#### Ubicación

Botón destacado en la vista del Armario Personal: **"Generar Outfit"**

#### Parámetros de Generación

##### Filtros Básicos

- **Temporada**: Verano, Invierno, Otoño, Primavera, Entretiempo
- **Ocasión**: Casual, Formal, Deportivo, Fiesta, Trabajo
- **Clima**: Calor, Frío, Lluvia, Nieve

##### Filtros Avanzados

- **Filtrar por prenda específica**: "Quiero usar esta chaqueta específicamente"
- **Estilo**: Elegante, Street, Minimalista, Bohemio
- **Paleta de colores**: Monocromático, Contrastes, Tonos tierra

#### Flujo de Uso

```
1. Usuario entra al Armario
2. Presiona "Generar Outfit"
3. Selecciona filtros deseados (opcionales)
4. IA genera outfit instantáneamente
5. Opciones:
   - Guardar outfit
   - Regenerar con otros parámetros
   - Editar manualmente (cambiar una prenda)
```

#### Ventajas

- ⚡ **Rapidez**: Outfit listo en segundos sin conversación
- 🎲 **Inspiración**: Descubre combinaciones que no habías considerado
- 📅 **Planificación**: Genera outfits para toda la semana
- 🔄 **Variedad**: Múltiples opciones con los mismos filtros

---

## 🛠️ Tecnologías Sugeridas

### Frontend (Móvil)

- React Native / Flutter
- Expo (si React Native)

### Backend

- Node.js + Express / FastAPI (Python)
- Base de datos: PostgreSQL / MongoDB

### IA y Machine Learning

- **Procesamiento de imágenes**:
  - OpenCV para segmentación
  - Rembg / U2-Net para eliminación de fondo
  - CLIP / ResNet para clasificación de prendas
- **Chatbot**:
  - GPT-4 / Claude (APIs)
  - RAG (Retrieval Augmented Generation) para acceso al armario
- **Generador de outfits**:
  - Modelo de recomendación personalizado
  - Reglas de moda + ML

### APIs Externas

- Web scraping para importar desde tiendas (Puppeteer/Cheerio)
- API del clima (OpenWeatherMap)

---

## 📱 Pantallas Principales del MVP

### 1. Pantalla de Login/Registro

- Autenticación simple
- Opción de login social (Google, Apple)

### 2. Dashboard/Home

- Acceso rápido a:
  - Mi Armario
  - Chatbot
  - Outfits Guardados

### 3. Armario Personal

- Vista en grid de todas las prendas
- Filtros por categoría, color, temporada
- Botón "Añadir Prenda" (foto/URL)
- Botón "Generar Outfit"

### 4. Chat con IA

- Interfaz de mensajería
- Opción de adjuntar imágenes
- Visualización de outfits generados
- Botón de guardado rápido

### 5. Detalle de Outfit

- Vista del outfit completo
- Desglose de prendas individuales
- Editar/Eliminar outfit
- Compartir (opcional MVP extendido)

### 6. Mis Outfits Guardados

- Galería de outfits creados
- Organización por carpetas/tags
- Búsqueda y filtros

---

## 🎯 Alcance del MVP

### ✅ Incluido en MVP

- [ ] Sistema de login/registro
- [ ] Armario personal con categorización
- [ ] Captura de prendas por foto con IA (extracción 2D)
- [ ] Importación de prendas por URL (tiendas)
- [ ] Chatbot conversacional con IA
- [ ] Generador automático de outfits con filtros
- [ ] Guardado de outfits favoritos
- [ ] Visualización de outfits completos

### 🚀 Funcionalidades Futuras (Post-MVP)

- Social: Compartir outfits con amigos
- Calendario de outfits: Planificar vestuario semanal
- Análisis de uso: Qué prendas usas más/menos
- Recomendaciones de compra: Detectar gaps en el armario
- Integración con e-commerce: Compra directa desde la app
- Realidad aumentada: Probar outfits virtualmente
- Análisis de estilo personal: Colorimetría, morfología

---

## 📊 Métricas de Éxito del MVP

- **Retención**: % usuarios que vuelven después de 7 días
- **Engagement**: Número de outfits generados por usuario/semana
- **Valor percibido**: Número de prendas añadidas al armario
- **Precisión IA**: % de outfits guardados vs generados
- **Satisfacción**: Rating de recomendaciones del chatbot

---

## 🗓️ Fases de Desarrollo

### Fase 1: Core Infrastructure (Semana 1-2)

- Setup de proyecto móvil
- Sistema de autenticación
- Base de datos y modelos

### Fase 2: Armario Personal (Semana 3-4)

- CRUD de prendas
- Procesamiento de imágenes con IA
- Scraping de tiendas online

### Fase 3: IA y Generación (Semana 5-6)

- Integración de chatbot
- Algoritmo de generación de outfits
- Sistema de guardado de favoritos

### Fase 4: Testing y Refinamiento (Semana 7-8)

- Testing con usuarios beta
- Optimización de modelos de IA
- Ajustes de UX/UI

---

## 💡 Propuesta de Valor

> **"Tu armario digital con un estilista personal IA en tu bolsillo. Nunca más te quedes sin ideas de qué ponerte."**

### Beneficios Clave

1. **Organización**: Todos tus looks en un solo lugar
2. **Inspiración diaria**: Combinaciones que no habías imaginado
3. **Ahorro de tiempo**: De 20 minutos decidiendo a 30 segundos
4. **Optimización**: Aprovecha toda tu ropa, no solo el 20%
5. **Decisiones inteligentes**: Recomendaciones basadas en contexto real

---

## 🎨 Diferenciadores

- ✨ **IA verdaderamente útil**: No solo genera, sino que entiende contexto
- 📸 **Facilidad**: Foto → Prenda digitalizada automáticamente
- 🛍️ **Integración tiendas**: Mezcla lo que tienes con lo que quieres
- 💬 **Conversacional**: Habla naturalmente con tu asistente
- 🎯 **Personalizado**: Se adapta a TU armario, no genérico

---

## 📝 Notas Técnicas

### Consideraciones de Privacidad

- Las fotos de prendas se almacenan de forma segura
- Opción de procesamiento local de imágenes
- No compartir datos personales con terceros sin consentimiento

### Escalabilidad

- Cloud storage para imágenes (AWS S3 / Cloudinary)
- Cache de outfits frecuentes
- Optimización de llamadas a APIs de IA

### Monetización Futura

- Freemium: Límite de prendas/outfits en versión gratuita
- Premium: Acceso ilimitado + funciones avanzadas
- Afiliados: Comisión por compras desde enlaces de tiendas

---

**Fecha de creación**: 3 de enero de 2026  
**Versión**: 1.0  
**Estado**: MVP en definición
