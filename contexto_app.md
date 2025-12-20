# PRODUCT REQUIREMENTS DOCUMENT (PRD) - FASHION AI STYLIST APP

## 1. Visión del Proyecto
Crear una aplicación web progresiva (PWA) "Mobile First" centrada en la moda femenina. La app utiliza IA para generar outfits coherentes (colorimetría y estilo), gestionar un armario virtual y ofrecer un asistente de moda conversacional. Debe ser totalmente responsive (funcionar en móvil, tablet y escritorio) usando un sistema Flex/Grid robusto.

## 2. Estética y UX/UI (Design System)
* *Estilo Visual:* "Clean Girl Aesthetic". Minimalista, moderno, con mucho aire (whitespace).
* *Formas:* Predominio de bordes redondeados (rounded-2xl o rounded-3xl en botones y tarjetas).
* *Tipografía:* Sans-serif moderna (ej. Inter, Poppins o Geist).
* *Paleta de Colores:* Tonos neutros de fondo (blanco, gris perla) con colores de acento pasteles o vibrantes según la temporada.
* *Navegación:*
    * Móvil: Tab Bar inferior flotante con iconos redondeados.
    * Tablet/Desktop: Sidebar lateral izquierda o Header responsivo.

## 3. Arquitectura Técnica Sugerida
* *Frontend:* React (Next.js o Vite) + Tailwind CSS.
* *Iconos:* Lucide React o Heroicons (estilos redondeados).
* *Estado:* React Context o Zustand para manejar el estado del usuario (Free vs Premium).
* *Responsividad:* Uso estricto de clases de Tailwind (ej. grid-cols-1 md:grid-cols-2 lg:grid-cols-3) para asegurar que se ve bien en cualquier dispositivo.

## 4. Funcionalidades Principales (Core Features)

### A. Pantalla Principal (Home)
* *Elemento Central:* Un botón grande, llamativo y animado que diga "GENERAR OUTFIT".
* *Lógica de Generación:* Al pulsar, debe simular (o conectar con API) la creación de un look basado en:
    * Clima actual.
    * Estilo seleccionado.
    * Reglas de colorimetría (colores que matcheen).
* *Output:* Muestra una tarjeta con el outfit completo (Top, Bottom, Zapatos, Accesorios) y un breve texto de por qué funciona.

### B. Pantalla de Armario (Wardrobe & History)
* *Lista de Outfits:* Muestra el historial de outfits generados.
* *Regla de Negocio (FREEMIUM):*
    * Usuario *FREE*: Solo puede ver los últimos 3 outfits generados. Los anteriores aparecen bloqueados o borrosos con un CTA "Pásate a Premium".
    * Usuario *PREMIUM*: Scroll infinito de todo su historial.
* *Detalle de Prenda:* Al hacer clic en una prenda del outfit, abre un modal/pantalla con:
    * Foto de la prenda.
    * Nombre de la tienda/marca.
    * Referencia/Link de compra.

### C. Chatbot de Moda (Fashion Assistant)
* *Interfaz:* Estilo chat moderno (burbujas de mensaje).
* *Botones Rápidos (Quick Actions):*
    1.  "Cuéntame tendencias" (Resumen de lo que se lleva ahora).
    2.  "Ponte al día con tus influencers" (Novedades de it-girls).
* *Personalidad:* El bot debe hablar como una amiga experta en moda, tono cercano, uso de emojis, motivador.

### D. Perfil de Usuario
* Ajustes básicos.
* Switch para simular estado "Premium" vs "Free" (para pruebas).
* Preferencias de estilo (Boho, Chic, Streetwear, etc.).

## 5. Reglas de Negocio Específicas
1.  *Flexibilidad:* La interfaz no puede romperse al cambiar el tamaño de la pantalla. En escritorio, el contenido debe centrarse o expandirse en grids, no estirarse horriblemente.
2.  *Monetización:* El bloqueo de los outfits antiguos es la principal feature para convertir a pago. Debe ser visualmente claro (candados, blur).
3.  *Intuitiva:* Máximo 2 clics para llegar a cualquier funcionalidad principal.

## 6. Prompt para el Modelo de Datos (Ejemplo)
El sistema debe manejar un objeto Outfit que contenga:
```json
{
  "id": "123",
  "date": "2023-10-27",
  "style": "Casual Chic",
  "items": [
    { "type": "top", "name": "Camisa Blanca Oversize", "brand": "Zara", "ref": "LINK" },
    { "type": "bottom", "name": "Jeans Mom Fit", "brand": "Levi's", "ref": "LINK" }
  ]
}


---