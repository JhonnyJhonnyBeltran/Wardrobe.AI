# Sistema de Diseño Apple HIG - Klozet / Wardrobe.AI

Este documento establece los principios y reglas universales adaptadas de las **Human Interface Guidelines (HIG) de Apple** para asegurar que cada pantalla, componente y flujo de interacción en Klozet ofrezca una experiencia premium, táctil y coherente.

---

## 1. Principios Fundamentales

### A. Claridad y Jerarquía Visual (Clarity & Hierarchy)
- **Contraste de Tipografía:** Jerarquía clara con títulos en `font-bold` / `font-semibold` y tracking ajustado (`letter-spacing: -0.022em`).
- **Contraste de Color:** Ratios de contraste ≥ 4.5:1 para texto principal y ≥ 3:1 para elementos de control gráfico.
- **Capas de Elevación:** 
  1. Fondo base (`var(--background)` / `var(--background-secondary)`).
  2. Tarjetas y contenedores de contenido (`var(--card-bg)` con bordes ultrafinos).
  3. Barras flotantes y navegación (`apple-glass-bar`, `backdrop-blur-2xl`).
  4. Hojas de acción / Modales inferiores (`z-[1000]`).
  5. Notificaciones toast y alertas (`z-[100000]`).

### B. Ergonomía Táctil y Zonas de Toque (Touch Targets)
- **Tamaño Mínimo Táctil:** Cualquier botón, icono interactivo, enlace o selector en móvil debe tener un área táctil mínima de **44×44px** (`touch-target-44`). Si el icono visual es menor (ej. 20×20px), se añade padding transparente para alcanzar los 44px.
- **Zonas Seguras (Safe Areas):** Respeto obligatorio a los insets de pantalla completa (`env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`) mediante las clases `.pt-safe` y `.pb-safe`.
- **Navegación con el Pulgar (Thumb Zone):** Las acciones principales (TabBar, botones de acción flotantes, selectores de hoja) deben ser fácilmente accesibles con una sola mano.

### C. Materiales, Translucidez y Liquid Glass (Materials & Depth)
- **Efecto Frosted Glass:** Barras superiores e inferiores con `backdrop-filter: blur(24px) saturate(180%)`.
- **Bordes Hairline (Micro-bordes):** Bordes sutiles de 1px con opacidad reducida (`rgba(0,0,0,0.06)` en claro, `rgba(255,255,255,0.08)` en oscuro) que capturan la luz sin delimitar con dureza.
- **Sombras Difusas:** Sombras ambientales suaves (`shadow-[0_4px_24px_-1px_rgba(0,0,0,0.05)]`) que transmiten flotabilidad sin oscurecer.

### D. Física de Movimiento y Retroalimentación Táctil (Spring Physics & Haptics)
- **Curvas Spring:** Transiciones suaves con curvas de entrada elásticas (`cubic-bezier(0.32, 0.72, 0, 1)`).
- **Efecto Prensa (Tap Feedback):** Escala sutil `active:scale-[0.97]` o `active:scale-95` en tarjetas interactivas, botones y celdas.
- **Haptic Feedback:** Vibraciones hápticas contextuales (`haptics.light()`, `haptics.selection()`, `haptics.heavy()`) en interacciones clave (guardar, like, deslizar hojas).

---

## 2. Componentes y Patrones Estándar

### Listas Agrupadas Tipo iOS (Grouped Inset Lists)
- Utilizadas en Ajustes, Perfil, Preferencias y Formularios.
- Contenedor con esquinas redondeadas squircle (`rounded-2xl` o `rounded-3xl`), fondo sutil (`bg-[var(--background-secondary)]`), divisores suaves entre filas (`divide-y divide-[var(--border-color)]/50`).
- Fila con altura mínima de 48px, icono representativo con fondo en pastilla squircle y chevron indicador hacia la derecha.

### Hojas de Acción Inferiores (Bottom Action Sheets)
- Agarrador superior visible (`apple-sheet-handle`, píldora de 36×4px redondeada centrada).
- Fondo de cristal oscuro o blanco translúcido con desenfoque (`backdrop-blur-xl`).
- Gesto de arrastre vertical para descartar con efecto elástico.

### Segmented Controls (Controles Segmentados)
- Contenedor en píldora con fondo neutro.
- Pastilla activa con fondo contrastado, sombra sutil y transición deslizante con resorte elástico.

### Entradas de Datos y Búsqueda (Search & Inputs)
- Barra de búsqueda inset con icono de lupa, texto placeholder claro y botón 'X' de borrado rápido.
- Campos de formulario con focus rings suaves en color de marca (`--brand-pink`) sin contornos toscos.

---

## 3. Checklist de Verificación para Cada Pantalla
1. [ ] ¿Los botones e iconos tienen al menos 44×44px de área táctil?
2. [ ] ¿La barra superior y barra inferior respetan `pt-safe` y `pb-safe`?
3. [ ] ¿Las tarjetas y botones responden con microinteracción táctil (`active:scale-[0.97]`)?
4. [ ] ¿Las listas de configuración y formularios usan el estilo agrupado inset?
5. [ ] ¿Los contrastes de texto y colores son nítidos en modo claro y oscuro?
6. [ ] ¿Las pantallas de carga usan Skeletons Wave fluidos en lugar de spinners molestos?
