# REGLA IRREBATIBLE DE MARCA — KLOZET

Toda UI de Klozet (app, landing, legales, trends, emails, exportaciones a Instagram) DEBE cumplir `Obsidian/brand_kit.md`. Leerlo antes de tocar cualquier interfaz. Esta regla prevalece sobre preferencias estéticas genéricas de cualquier skill (incluidas `taste-skill` e `impeccable`): esas skills se aplican DENTRO de esta identidad, nunca para sustituirla.

## Identidad (no negociable)
- Concepto: **"un juguete dentro de un iPhone"**. Marca bubble, rosa y con cara; interfaz Apple sobria, blanca/negra y translúcida.
- Colores: Klozet Pink `#FF66C4` (`--brand-pink`), pressed `#ED4C9E`, tint `#FFB3DE`; negro `#000`; blanco `#FFF`; noche `#111113`/`#18181B`; grises iOS `--gray-*`. Proporción 60/30/10, rosa ≤10%.
- Logo: siempre los PNG oficiales (`/klozet-logo.png`, `/klozet-logo-dark.png`, `/landing/klozet-nombre-grande.png`, `/landing/kloe-grande-landing.png`). Nunca escribir "KLOZET" con una fuente.
- Tipografía: Inter para todo (Outfit solo cifras display). Pesos 400–700. Sentence case.
- Materiales: `.apple-glass-bar` y tarjetas `card-bg/90-95 + backdrop-blur-xl + borde hairline`. Velo `bg-black/40-60` sobre fotos.
- Forma: todo redondeado, botones/chips en pastilla, tarjetas 20–24px, sheets 32px, táctil ≥44px.
- Movimiento: `--ease-apple`; bounce solo en momentos de marca; tap `scale(0.97)`.
- Usar siempre tokens CSS (`var(--background)`, `var(--foreground)`, `var(--card-bg)`, `var(--border-color)`, `var(--brand-pink)`) para soportar claro/oscuro. No hardcodear paletas `zinc-*` como identidad.

## Prohibido
Degradados y texto en degradado · morado · `font-black`/`font-extrabold` · titulares en MAYÚSCULAS monumentales · serif/cursivas · orbes de luz difuminados · logo como marca de agua · badges/destellos de "IA" · esquinas vivas · >1 CTA rosa por pantalla · secuestro de scroll / diapositivas 100vh · recortes PNG defectuosos · estética "quiet luxury"/beige/editorial.

## Validación
Antes de cada commit de UI, pasar el checklist §12 de `Obsidian/brand_kit.md` y `npm run build`.
