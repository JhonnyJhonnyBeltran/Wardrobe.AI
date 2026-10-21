# KLOZET — Manual de Marca y Sistema de Diseño

> **Fuente suprema de verdad visual.** Extraído de lo ya construido en la app (`app/globals.css`, logos en `/public`, componentes de `app/(app)`), no de la landing. Cualquier pantalla nueva (app, landing, legales, emails, stories) se valida contra este documento. Si algo contradice este manual, gana el manual.

---

## 0. La idea en una frase

**"Un juguete dentro de un iPhone."**

La marca es **ruidosa, blanda y con cara** (letras de chicle inflado, rosa chicle, ojos). La interfaz es **silenciosa, precisa y Apple** (blanco/negro, vidrio translúcido, grises iOS, pastillas). La personalidad vive en la marca y en momentos concretos; la interfaz nunca compite con ella.

| Capa | Carácter | Dónde |
|---|---|---|
| **Marca** | Bubble, juguetón, Gen-Z, descarado | Logo, Kloe, estados vacíos, celebraciones, splash |
| **Interfaz** | Sobria, nativa iOS, táctil | Navegación, listas, formularios, ajustes, legales |
| **Contenido** | Ropa real, fotos reales | Feed, armario, outfits |

Klozet **no es** "quiet luxury", ni minimalismo beige, ni editorial serif. Tampoco es gradiente neón morado. Es rosa chicle + negro tinta + blanco, con vidrio.

---

## 1. Logotipos

### 1.1 Activos oficiales (usar SIEMPRE el PNG, nunca recrearlo)

| Activo | Archivo | Uso |
|---|---|---|
| Monograma apilado `KL/ZT` (K rosa, resto negro) | `/klozet-logo.png` | Icono de app, favicon, avatar de marca, cabeceras compactas (modo claro) |
| Monograma modo oscuro | `/klozet-logo-dark.png` | Mismo uso sobre fondos oscuros |
| Wordmark `Klozet` (todo rosa, con ojos en la K) | `/landing/klozet-nombre-grande.png` | Cabecera de landing, splash, hero, firma de exportaciones |
| Wordmark `Kloe` (rosa, con ojos) | `/landing/kloe-grande-landing.png` | Sub-marca de la asistente |
| Kloe sobre fondo rosa | `/landing/kloe-landing-blanco.png` | Kloe en blanco sobre superficies rosas |

### 1.2 Anatomía del logo (por qué es así)
- **Letras de chicle inflado** (*bubble lettering*) dibujadas a mano: trazo gordo, terminaciones redondas, sin ninguna esquina.
- **Brillos blancos**: trazos curvos blancos dentro de cada letra que simulan reflejo de plástico/globo. Es la firma gráfica.
- **Ojos** en la `K` (dos óvalos con pupila en cuña): la marca tiene cara. Klozet y Kloe son personajes, no corporaciones.
- **Baile vertical**: las letras no comparten línea base; suben y bajan. Nada en la marca está rígido.

### 1.3 Reglas del logo
- ✅ Wordmark sobre blanco, negro o vidrio translúcido. Monograma sobre blanco o negro.
- ✅ Área de respeto mínima = altura de la `o` del wordmark alrededor.
- ✅ Tamaño mínimo: wordmark 24px de alto; monograma 28×28px.
- ❌ Escribir "KLOZET" con una fuente (Inter, Outfit, serif, uppercase con tracking) en lugar del logo. **Prohibido.**
- ❌ Usar el wordmark como marca de agua gigante de fondo, estirarlo, rotarlo, recolorearlo (no morado, no degradado, no contorno).
- ❌ Poner el wordmark rosa sobre fondo rosa (usar `kloe-landing-blanco.png` / versión blanca).
- ❌ Añadir sombras, glow o efectos 3D al logo.

---

## 2. Color

### 2.1 Paleta (tokens reales de `globals.css`)

| Rol | Token | Hex | Notas |
|---|---|---|---|
| **Klozet Pink** | `--brand-pink` | `#FF66C4` | El rosa del logo. Único color de marca. |
| Pink pressed / texto rosa sobre blanco | `--brand-pink-dark` | `#ED4C9E` | Hover/active, y texto rosa pequeño (mejor contraste) |
| Pink tint | `--brand-pink-light` | `#FFB3DE` | Fondos suaves, selección, chips activos tenues |
| Tinta | `--pure-black` | `#000000` | Texto y UI en modo claro. Las letras negras del monograma. |
| Papel | `--pure-white` | `#FFFFFF` | Fondo modo claro |
| Noche | `--background` (dark) | `#111113` | Fondo modo oscuro (no negro puro) |
| Superficie noche | `--card-bg` (dark) | `#18181B` | Tarjetas modo oscuro |
| Grises iOS | `--gray-100…900` | `#F2F2F7 … #1C1C1E` | Escala de sistema Apple. Fondos secundarios, separadores, texto secundario |

### 2.2 Proporción obligatoria
**60 / 30 / 10 → Blanco o Noche / Negro y Grises iOS / Rosa.**
El rosa nunca supera el ~10% de una pantalla. Si todo es rosa, nada es rosa.

### 2.3 Dónde va el rosa (y solo aquí)
1. Logo y Kloe.
2. **Un** CTA primario por pantalla.
3. Estado activo/seleccionado (tab activa, chip seleccionado, toggle on, like).
4. Foco de teclado (`ring` rosa).
5. Micro-acentos de marca en celebraciones y estados vacíos.

### 2.4 Prohibido
- ❌ Degradados rosa→morado, rosa→naranja, cualquier `from-pink via-purple`. El morado no existe en Klozet.
- ❌ Texto en degradado (`bg-clip-text text-transparent`).
- ❌ Manchas de luz/blur de color de fondo ("auroras", orbes difuminados).
- ❌ Paletas beige/crema/"quiet luxury", serif editorial, zinc frío como identidad.
- ❌ Verde/ámbar/azul como color decorativo. Solo para semántica (éxito, aviso, error, enlaces de sistema) y en pequeño.

---

## 3. Tipografía

### 3.1 Dos voces
| Voz | Qué es | Regla |
|---|---|---|
| **Voz de marca** | El lettering bubble del logo | Solo existe como imagen. No hay fuente que lo imite. No se escriben titulares "en estilo logo". |
| **Voz de interfaz** | **Inter** (`--font-inter`), fallback `-apple-system, SF Pro` | Todo el texto de producto, landing y legales. Se comporta como SF Pro. |

`Outfit` (`--font-outfit`) está cargada: reservada **solo** para cifras grandes de display (contadores, precios del plan, estadísticas). Nunca para párrafos ni navegación.

### 3.2 Escala (estilo iOS Dynamic Type)
| Estilo | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| Large Title | 34 / 41 | 700 | Título de pantalla |
| Title 1 | 28 / 34 | 700 | Hero de landing (móvil) — escala hasta 56–64px en desktop |
| Title 2 | 22 / 28 | 700 | Secciones |
| Headline | 17 / 22 | 600 | Cabecera de tarjeta, fila destacada |
| Body | 17 / 22 (web: 15–16) | 400 | Texto general |
| Callout | 16 / 21 | 400–500 | Descripciones |
| Subhead | 15 / 20 | 500 | Metadatos |
| Footnote | 13 / 18 | 400 | Legales, ayudas |
| Caption | 12 / 16 | 500 | Etiquetas, chips |

### 3.3 Reglas Generales de Interfaz
- Pesos en interfaz: 400, 500, 600, 700 para navegación y formularios.
- Tracking en interfaz: `-0.02em` (`tracking-tight`); cuerpo normal.

### 3.4 Titulares de Alto Impacto Editorial (Directiva Commit fc899bc)
- **Directiva Oficial de Marca para Titulares**: En la landing page y páginas editoriales destacadas, los titulares principales deben llamar la atención y adoptar la composición de alto impacto del commit `fc899bc`:
  - **Composición**: Titulares monumentales con `font-black tracking-tighter uppercase leading-[0.9]`.
  - **Mezcla de Cursivas y Bold**: La primera letra de cada bloque o palabra clave se resalta con capitular en cursiva serif acentuada (`<span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">X</span>`), fusionando el trazo display rotundo con cursivas serif para generar una jerarquía visual audaz y con identidad de moda.

---

## 4. Materiales (vidrio translúcido Apple)

El vidrio es el "aire" entre la marca y el contenido. Tres materiales, nada más:

| Material | Clase/receta | Uso |
|---|---|---|
| **Barra de vidrio** | `.apple-glass-bar` → `rgba(255,255,255,.82)` + `blur(24px) saturate(180%)` + borde `rgba(0,0,0,.06)` · dark `rgba(17,17,19,.82)` + borde `rgba(255,255,255,.08)` | Cabeceras, tab bar, barras flotantes |
| **Tarjeta flotante** | `bg-[var(--card-bg)]/90–95` + `backdrop-blur-xl` + `border-[var(--border-color)]` + `--shadow-float` | Sheets, menús, popovers, banner de cookies, pastillas sobre fotos claras |
| **Velo sobre foto** | `bg-black/40–60` + `backdrop-blur-md` + texto blanco | Etiquetas y controles encima de imágenes |

Reglas:
- El vidrio siempre lleva **borde hairline** (1px, 6–8% opacidad). Sin borde parece un error.
- Sombras suaves de la escala `--shadow-float*`. ❌ Sombras de color (salvo `--shadow-glow-pink` en el CTA de marca y con moderación).
- Máximo **2 capas de vidrio** apiladas.

---

## 5. Forma

La blandura del logo se traduce en geometría redonda. **No hay esquinas vivas en Klozet.**

| Elemento | Radio |
|---|---|
| Botones, chips, inputs de búsqueda, tab activa, badges | **Pastilla** `rounded-full` |
| Tarjetas de prenda / post / outfit | `--radius-lg` 20px – `--radius-xl` 24px |
| Sheets y modales | 32px superiores (`--radius-2xl`) |
| Inputs de formulario | 12–16px |
| Miniaturas pequeñas | 12px |

- Áreas táctiles mínimo **44×44** (`.touch-target-44`).
- Espaciado en múltiplos de 4 (`--spacing-*`): 8 / 12 / 16 / 24 / 32 / 48.

---

## 6. Componentes canónicos

- **Botón primario**: pastilla, `bg-[var(--brand-pink)]`, texto blanco 600, 44–52px de alto, `active:scale-[0.97]`. **Uno por pantalla.**
- **Botón secundario**: pastilla, fondo `--background-secondary` (gris iOS) o vidrio, texto `--foreground`.
- **Botón terciario**: texto `--foreground` o rosa oscuro, sin fondo.
- **Botón de marca en negro**: pastilla negra con texto blanco (modo claro) → permitido como alternativa al rosa en CTAs secundarios fuertes. Reproduce el contraste rosa/negro del monograma.
- **Chip**: pastilla gris iOS; seleccionado = rosa tint + texto rosa oscuro, o rosa sólido + blanco.
- **Tab bar / cabecera**: `.apple-glass-bar`, icono activo rosa, inactivos gris 600.
- **Listas de ajustes**: `.apple-inset-group` + `.apple-inset-row` (estilo Settings de iOS).
- **Sheets**: `.apple-sheet-handle` + radio 32px + tarjeta flotante.
- **Iconos**: `lucide-react`, trazo 1.75–2, 20–24px, color de texto. ❌ `Sparkles`/destellos para "IA".

---

## 7. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--ease-apple` | `cubic-bezier(0.32, 0.72, 0, 1)` | Todo por defecto (sheets, navegación, aparición) |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | **Solo momentos de marca**: like, guardar, logo, Kloe respondiendo, logro |
| Tap | `scale(0.97)` + opacidad .88, 150ms | Cualquier elemento pulsable (`.apple-tap-feedback`) |

- Duraciones: 150ms (micro), 250ms (componentes), 350ms (pantallas). Nada > 500ms.
- Respetar `prefers-reduced-motion`.
- ❌ Secuestro de scroll (`onWheel` que bloquea), carruseles de diapositivas a pantalla completa, parallax gratuito, órbitas giratorias, `animate-pulse` decorativo.
- Loaders desacoplados de la GPU (sin blur animado ni filtros pesados en bucle).

---

## 8. Kloe (sub-marca)

- Kloe es **un personaje rosa con ojos**, hermana del logo. Siempre su wordmark/avatar oficial.
- Voz: cercana, directa, con humor ligero, en español natural. Nunca "Como IA…", nunca "asistente inteligente".
- ❌ Badges "IA", "IA personal", "Powered by AI", robots, destellos, cerebros.
- Las respuestas de Kloe usan tarjetas de la interfaz (sobrias); la personalidad está en el texto y en el avatar, no en la decoración.

---

## 9. Fotografía y producto

- Ropa **real**, luz natural o fondo neutro. Outfits en tarjetas con la foto a sangre (`object-cover`).
- Recortes (PNG sin fondo) solo si están **verificados**: bordes limpios, sin cortes rectos (ej. suela amputada), sin halo blanco. Si hay duda → tarjeta con foto, no recorte flotante.
- ❌ Collages de recortes flotando rotados con sombras de color.
- ❌ Imágenes de stock genéricas o generadas que no muestren ropa real.

---

## 10. Voz y copy

- Tuteo, frases cortas, verbos activos. "Sube tu ropa", "¿Qué me pongo hoy?", "Guardado".
- Humor permitido en estados vacíos y celebraciones ("Tu armario está más vacío que un lunes por la mañana").
- Interfaz: literal y clara. Marca: descarada.
- ❌ Contadores tipo "1 publicación encontrada" como titular, jerga de IA, superlativos vacíos ("revolucionario", "experiencia premium").

---

## 11. Lista de prohibiciones (resumen rápido)

1. Escribir KLOZET con una fuente en vez del logo.
2. Degradados de color y texto en degradado. Morado.
3. `font-black` / `font-extrabold`, titulares en MAYÚSCULAS monumentales, serif/cursivas.
4. Orbes de luz difuminados, marcas de agua del logo gigantes.
5. Badges/destellos de "IA".
6. Esquinas vivas.
7. Más de un CTA rosa por pantalla.
8. Secuestro de scroll y diapositivas 100vh.
9. Recortes PNG defectuosos.
10. "Quiet luxury", beige, zinc frío como identidad.

---

## 12. Checklist de validación (antes de cada commit de UI)

- [ ] ¿El logo es el PNG oficial y respeta área y tamaño?
- [ ] ¿El rosa ocupa ≤10% y solo en los usos de §2.3?
- [ ] ¿Solo Inter (y Outfit en cifras), pesos 400–700, sentence case?
- [ ] ¿Cabeceras/barras con `.apple-glass-bar` o receta equivalente con borde hairline?
- [ ] ¿Todo redondeado; botones en pastilla; áreas táctiles ≥44px?
- [ ] ¿Movimiento con `--ease-apple`; bounce solo en momentos de marca?
- [ ] ¿Funciona en modo claro y oscuro con los tokens (`var(--background)`, `var(--foreground)`, `var(--card-bg)`, `var(--border-color)`)?
- [ ] ¿Cero elementos de §11?
- [ ] `npm run build` OK.
