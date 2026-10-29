# ⚖️ DICTAMEN DEL CONSEJO DE NEGOCIO Y BUSINESS PLAN MAESTRO: KLOZET (WARDROBE.AI)

**Para:** Ethan Curro (Fundador & Operador Técnico)  
**De:** Consejo de Negocio (Believer, Hater, Investor, Judge) + Directrices Ejecutivas de Producto  
**Fecha:** 29 de Octubre de 2026  
**Estado:** Implementado en Producción con Decisiones Definitivas del Fundador

---

## 1. VEREDICTO EJECUTIVO Y DECISIONES DE PRODUCTO APLICADAS

* **ESTADO:** **EJECUTADO Y ALINEADO CON ESTRATEGIA DE CRECIMIENTO SOCIAL**
* **PUNTUACIÓN DE VIABILIDAD:** **92 / 100**
* **SÍNTESIS EJECUTIVA DE DECISIONES DEL FUNDADOR:**
  1. **Armario Ilimitado + Subida por Lotes de hasta 20 Prendas:** Se descarta cualquier límite de 12 o 25 prendas totales. El usuario puede subir todas las prendas que quiera (en lotes de hasta 20 fotos simultáneas) para nutrir la red social y el uso diario.
  2. **Onboarding Guiado por Fases con Punto de Dolor Matemático (15 min hoy = 91 horas/año ahorradas):**
     - Cálculo real: *15 min/día decidiendo qué ponerse × 365 días = 5.475 minutos = +91 horas al año (~4 días enteros frente al armario)*.
     - El onboarding guía paso a paso cómo hacer fotos con luz natural o capturas de tienda online y lleva al usuario directamente a subir su primer lote de hasta 20 prendas.
  3. **Eliminación de Reconocimiento Facial/Corporal $\rightarrow$ Perfil Físico "Dinos cómo eres":**
     - Se elimina la subida de 6 fotos biométricas (3 cara + 3 cuerpo) en Kloe, erradicando el riesgo de Art. 9 RGPD.
     - Se sustituye por la ficha **"Dinos cómo eres"** (Chica/Chico/Unisex, Altura en cm, Tipo de cuerpo adaptado a Chica/Chico —caderas más anchas, reloj de arena, más abombado/robusto, atlético, etc.—, Color de ojos y Color de pelo), integrada en el Onboarding, en Kloe y editable desde Ajustes del Perfil.
  4. **Mantenimiento Íntegro de Puppeteer en `/api/scrape-product`:**
     - Se mantiene intacto el motor actual con Puppeteer para garantizar la máxima precisión en la extracción e inspección visual de productos de tiendas web.
  5. **Visión Contextual Inteligente en Kloe (Metadatos Primero, Imagen Como Último Recurso):**
     - **Posts adjuntos:** Cuando el usuario adjunta un post y pregunta qué lleva la persona en ese outfit, Kloe analiza la imagen y metadatos del post para desglosar cada prenda del look.
     - **Prendas y Outfits propios:** Kloe lee primero todos los metadatos (`nombre`, `marca`, `categoría`, `color`, `tejido`, `temporada`). Si la prenda está bien etiquetada (ej. *"Camiseta Eme Studios de rayas, color azul"*), no gasta tokens descargando la foto. Solo analiza la imagen de la prenda como último recurso si faltan datos o si el usuario pide inspección visual explícita.
  6. **Estructura de Precios, Calendario 100% Gratis y Cero Afiliados:**
     - **Armario y Calendario:** 100% gratuitos e ilimitados para todos los usuarios.
     - **Kloe Free:** **3 consultas al día** gratuitas.
     - **Kloe Pro:** Hasta 35 consultas/día, con un **Plan Anual irresistible** para maximizar conversión inmediata a anual:
       - **Plan Mensual:** **4,99 € / mes**
       - **Plan Anual (Oferta Gancho):** **19,99 € / año** (**solo 1,66 € / mes · Ahorra 67%** — menos de lo que cuestan 4 meses sueltos).
     - **Afiliación de Moda:** Eliminada por completo del plan y de la app (no se abordará hasta superar 15.000–20.000 usuarios activos).
  7. **Notificaciones Diarias Planificadas por Clima, Estacionalidad y Progreso (08:00, 15:00 o 16:00):**
     - Se elimina el intervalo repetitivo de 3 horas y se programa una notificación diaria inteligente en franjas clave (08:00, 15:00 o 16:00) que alterna entre el recordatorio de subida (*"Sube una prenda hoy: estás más cerca de digitalizar tu armario entero. 15 min ahora te ahorran 91 horas al año"*) y avisos meteorológicos/estacionales en tiempo real (*"Hace sol, saca tus looks de verano a pasear"* / *"Refresca fuera, saca tus looks de invierno a pasear"*).

---

## 2. AUDITORÍA DE LOS SUBAGENTES (ACTUALIZADA)

### A. Propuesta de Valor & Moat
* **Identidad "Un juguete dentro de un iPhone":** Logo bubble rosa `#FF66C4` con ojos + interfaz Apple blanca/negra translúcida `.apple-glass-bar`.
* **Lienzo Táctil Espacial (`/create`) y Calendario Social Abierto:** Creación de looks arrastrando prendas en un canvas interactivo y planificación semanal 100% gratuita para impulsar la retención diaria.
* **Corte de Fondos a Coste Cero (`@imgly/background-removal`):** Procesamiento en cliente con WebAssembly (WASM) y subida por lotes de hasta 20 prendas simultáneas.
* **Efecto Strava en Instagram Stories:** Exportación en 1 toque en formato *Foto Limpia* o *Sticker PNG Transparente* para compartir looks diarios.

### B. Optimización de Costes IA y Cumplimiento Legal
* **100% Libre de Biometría RGPD:** El perfil físico descriptivo (*"Dinos cómo eres"*) permite a Kloe recomendar cortes, proporciones y colores según altura, morfología, ojos y pelo sin almacenar ni procesar fotografías faciales.
* **Ahorro de Tokens por Prioridad de Metadatos:** Al leer primero los metadatos de prendas bien etiquetadas y reservar Gemini Vision para posts adjuntos o prendas incompletas, el coste medio por consulta cae más de un 65%.

---

## 3. ESTRUCTURA DE PRECIOS Y UNIT ECONOMICS

### A. Planes de Suscripción
* **Klozet Free (0 €):**
  * Subida de prendas **ilimitada** (en lotes de hasta 20 fotos a la vez).
  * **Calendario semanal 100% gratis** e ilimitado.
  * Lienzo interactivo, exportación de Stories y red social completa.
  * **3 consultas diarias** con Kloe IA.
* **Klozet Pro:**
  * **Plan Anual (Recomendado · Conversión Directa):** **19,99 € / año** (**~1,66 € / mes · Ahorra 67%**).
  * **Plan Mensual:** **4,99 € / mes**.
  * Incluye hasta 35 consultas diarias con Kloe 24/7, análisis contextual de outfits y posts de otros usuarios, y recomendaciones personalizadas según morfología y clima.
  * Pago directo en 1 toque mediante **Hoja de Pago Rápido (Apple Pay Payment Sheet, Google Pay Payment Sheet y Tarjeta)** integrada con Stripe.

### B. Unit Economics por Suscriptor
* **Plan Mensual (4,99 €):**
  * IVA (21%): -0,87 €
  * Stripe (1,4% + 0,25 €): -0,32 €
  * Gemini Flash (con filtro de metadatos primero): -0,12 €
  * **Beneficio Neto Limpio:** **3,68 € / mes (~89% margen)**.
* **Plan Anual Gancho (19,99 €):**
  * IVA (21%): -3,47 €
  * Stripe (un único cobro anual): -0,53 €
  * IA + Servidores (año con optimización de metadatos): -1,20 €
  * **Beneficio Neto Limpio en Caja Día 1:** **14,79 € (~89% margen y 0% churn durante 12 meses)**.

---

## 4. MATRIZ OPERATIVA PARA EL SOLOPRENEUR

| Fase | Usuarios Activos | Foco Principal | Monetización |
| :--- | :--- | :--- | :--- |
| **Fase 1 (Tracción & Hábito)** | **0 – 5.000** | Onboarding guiado (15 min = 91h/año), notificaciones climáticas a las 08h/15h/16h y viralidad en Stories. | 100% Suscripción Pro (Foco en Plan Anual de 19,99 €/año). |
| **Fase 2 (Comunidad)** | **5.000 – 15.000** | Crecimiento orgánico del feed social, uso intensivo del calendario gratuito y análisis de posts con Kloe. | 100% Suscripción Pro con Apple Pay / Google Pay. |
| **Fase 3 (Escala Comercial)** | **> 15.000 – 20.000** | Negociación directa con marcas y plataformas cuando exista masa crítica demostrada. | Suscripción Pro + Evaluación de partnerships/afiliación a gran escala. |
