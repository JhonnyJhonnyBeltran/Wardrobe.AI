# ⚖️ DICTAMEN DEL CONSEJO DE NEGOCIO Y BUSINESS PLAN MAESTRO: KLOZET (WARDROBE.AI)

**Para:** Ethan Curro (Fundador & Operador Técnico)  
**De:** Consejo de Negocio (Believer, Hater, Investor, Judge)  
**Fecha:** 28 de Octubre de 2026  
**Estado:** Dictamen Ejecutivo Aprobado con Condiciones Críticas de Pivote

---

## 1. VEREDICTO EJECUTIVO

* **ESTADO:** **APROBADO CON CONDICIONES CRÍTICAS DE PIVOTE TÉCNICO**
* **PUNTUACIÓN DE VIABILIDAD:** **86 / 100**
* **SÍNTESIS EJECUTIVA:**
  1. Klozet posee un magnetismo de producto sobresaliente gracias a su concepto *"un juguete dentro de un iPhone"*, el avatar Kloe, el lienzo táctil interactivo y la exportación viral estilo Strava para Instagram Stories.
  2. Albergaba 3 riesgos críticos descubiertos por el Red Team (Hater): riesgo sancionador RGPD (extracción biométrica de fotos en avatar), fragilidad de Puppeteer en serverless y una fricción de entrada del 85% ("armario vacío").
  3. Con las 4 correcciones quirúrgicas dictadas por el Juez y la reconfiguración de precios del Inversor (**4,99 €/mes** y **29,99 € - 34,99 €/año**), Klozet se convierte en un SaaS B2C solopreneur de alta rentabilidad con márgenes netos >87% y break-even con solo 14 clientes de pago.

---

## 2. AUDITORÍA DE LOS SUBAGENTES

### A. Informe del Believer (Propuesta de Valor & Moat)
* **Antítesis del software aburrido:** Rompe con las hojas de cálculo impersonales de Whering o Acloset gracias a una interfaz lúdica, limpia y artesanal con estándares Apple HIG.
* **Lienzo Táctil Espacial (`/create`):** Creación de looks arrastrando prendas como stickers en un canvas interactivo, conectado directamente con Kloe en 1 clic.
* **Corte de Fondos a Coste Cero (`@imgly/background-removal`):** Procesamiento en cliente con WebAssembly (WASM). Coste de servidor: **0,00 €** vs 0,20€ de APIs de terceros.
* **Caché Criptográfica SHA-256 en Gemini Vision:** Las imágenes ya analizadas se resuelven en memoria o base de datos con consumo de **0 tokens y 0,00 €**.
* **Efecto Strava en Instagram Stories:** Exportación en 1 toque en formato *Foto Limpia* o *Sticker PNG Transparente* para pegar sobre fotos en el espejo, convirtiendo a cada usuario en un canal de adquisición orgánico.

### B. Informe del Hater (Fisuras Críticas & Red Team)
* **La Trampa del Armario Vacío:** Digitalizar 70 prendas exige 1,5 horas de trabajo manual. Si el usuario no sube ropa, Kloe no puede recomendar nada (>85% abandono el primer día). Los recordatorios cada 3 horas queman al usuario.
* **Bomba Regulatoria RGPD (Art. 9):** Solicitar 3 fotos de cara y 3 de cuerpo en `/api/closy/generate-avatar` y enviarlas a APIs de EE.UU. para extraer biometría corporal/facial expone al fundador a sanciones graves de la AEPD sin una DPIA previa y consentimiento reforzado.
* **Fallo de Puppeteer en Serverless (`/api/scrape-product`):** Chromium pesa 170MB, causa timeouts de 15s en Vercel y es bloqueado por Akamai/Cloudflare en tiendas de Inditex o Mango.
* **Unit Economics Invertidos en Heavy Users:** Prompts con hasta 22 imágenes en base64 y 35 consultas diarias pueden costar más que la suscripción de 2,99€ en usuarios intensivos.

### C. Informe del Investor (Unit Economics & Rentabilidad)
* **Trampa del Micro-Ticket:** Cobrar 2,99€/mes deja a Stripe con el 9,8% a 11,8% del ticket neto (0,25€ fijos + 1,4%). Se debe subir a **4,99 €/mes** y **34,99 €/año** (+75% de beneficio neto por usuario).
* **El Plan Anual como Ancla:** Aporta 20,05€ netos de caja en día 1 con solo 2,4% de comisión Stripe y cero churn mensual durante 12 meses.
* **Costes Fijos Mínimos:** Vercel Pro ($20) + Supabase Pro ($25) + Dominio (~10€) = **~51 € / mes**. Se cubren con solo **14 suscriptores**.
* **Segunda Vía de Ingresos:** Afiliación de compras (LTK, Awin, Inditex) cuando Kloe detecte prendas faltantes en el armario (+15-25% de ARPU con 100% de margen).

---

## 3. RESOLUCIÓN Y CONDICIONES CRÍTICAS DE PIVOTE

Para autorizar el lanzamiento, se deben ejecutar obligatoriamente 4 medidas:

1. **Onboarding con "Armario Cápsula Base" (1-Tap Setup):**
   - Al registrarse, el usuario elige su pack inicial de 8-12 prendas esenciales precargadas según su estilo y género (ej. camiseta blanca, vaquero azul, polo negro, zapatillas blancas, sudadera gris).
   - El usuario entra con un armario funcional desde el segundo 10; Kloe puede armar looks de inmediato sin fricción fotográfica.
   - Purgar el recordatorio intrusivo cada 3 horas (`usePeriodicReminders.ts`) y sustituirlo por una única notificación matutina opcional a las 08:30 AM con el look sugerido del día.
2. **Blindaje Legal RGPD (Desactivación de Biometría Fotográfica):**
   - Suprimir la captura de fotos faciales y corporales en `/api/closy/generate-avatar`.
   - Sustituir por selector de complexión y arquetipos estilizados (maniquí / silueta ilustrada) sin extracción de rasgos físicos reales. 100% libre de Art. 9 RGPD.
3. **Sustitución de Puppeteer por OpenGraph / JSON-LD:**
   - Eliminar Puppeteer y Chromium de las lambdas de Vercel.
   - En `/api/scrape-product`, usar un parser HTTP ligero que lea etiquetas `<meta property="og:image">` y schema JSON-LD en 15ms. Permitir además subir prendas mediante captura de pantalla directa con recorte WASM.
4. **Pre-filtrado Semántico para Gemini Vision:**
   - Limitar el contexto visual de Kloe a un máximo de 6 prendas clave por consulta (2 superiores, 2 inferiores, 2 calzados).
   - Coste por consulta blindado en **< 0,012 €**, protegiendo el margen bruto por encima del 87%.

---

## 4. BUSINESS PLAN OPERATIVO

### A. Audiencia Objetivo (ICP Hiper-Específico)
* **Arquetipo:** *"El Curador Urbano Digital"* (19 a 32 años, Gen Z tardío y Young Professional).
* **Dolores Clave:** 20 minutos perdidos cada mañana decidiendo qué ponerse, 65% del armario olvidado sin usar y compras duplicadas innecesarias.
* **Mecánica Viral:** Exportación OOTD a Instagram Stories (sticker transparente o ficha editorial Strava con mención `@klozet`).

### B. Estructura de Precios
* **Klozet Free:** Hasta 25 prendas, Armario Cápsula Base incluido, 3 consultas/día con Kloe, lienzo táctil y feed.
* **Klozet Pro:**
  * **4,99 € / mes** (IVA incl.)
  * **29,99 € / año** (precio de lanzamiento para los primeros 500 suscriptores) $\rightarrow$ **34,99 € / año** estándar (~2,91 €/mes).
  * Armario ilimitado, consultas ilimitadas con Kloe (hasta 30/día), exportación en alta definición sin marcas de agua y calendario.
* **Afiliación de Moda:** Comisión media del 7% al 12% en prendas recomendadas por Kloe vía Awin / LTK / Stylink.

### C. Unit Economics por Suscriptor
* **Plan Mensual (4,99 €):**
  * IVA (21%): -0,87 €
  * Stripe (1,4% + 0,25 €): -0,32 €
  * Gemini Flash + Supabase Storage: -0,20 €
  * **Beneficio Neto Limpio:** **3,60 € / mes (>87% margen)**.
* **Plan Anual (34,99 €):**
  * IVA (21%): -6,07 €
  * Stripe: -0,74 €
  * IA + Servidores (año): -2,00 €
  * **Beneficio Neto Limpio en Caja:** **26,18 € (>90% margen)**.

### D. Proyección Financiera (12 Meses)
* **Mes 1:** 40 suscriptores $\rightarrow$ 900 € en caja (costes fijos cubiertos).
* **Mes 3:** 180 suscriptores $\rightarrow$ ~750 € MRR equivalente.
* **Mes 6:** 550 suscriptores + afiliados $\rightarrow$ **~2.500 € / mes**.
* **Mes 12:** 1.500 suscriptores + afiliados $\rightarrow$ **~6.500 € – 8.000 € / mes netos** para el fundador.

---

## 5. MATRIZ DE DELEGACIÓN PARA EL SOLOPRENEUR

| Fase | Umbral MRR | Qué ejecuta Ethan (con IA) | Qué se delega / subcontrata |
| :--- | :--- | :--- | :--- |
| **Fase 0 (Génesis)** | **0 € – 1.500 €** | • Desarrollo Fullstack (Next.js, Supabase, Tailwind).<br>• Soporte de usuario directo.<br>• 2 vídeos diarios en TikTok/Reels mostrando Kloe y las Stories.<br>• Infraestructura y base de datos. | **Cero delegación.** Todo automatizado o ejecutado por el fundador. Costes externos = 0 €. |
| **Fase 1 (Sustento)** | **1.500 € – 4.000 €** | • Arquitectura core y nuevas features.<br>• Estrategia de crecimiento y partnerships con marcas. | • **Asesoría fiscal/contable:** Gestoría especializada en SaaS en España (~120 €/mes).<br>• **Revisión legal:** Auditoría puntual de Términos y RGPD (~400 €). |
| **Fase 2 (Escala)** | **4.000 € – 8.000 €** | • Supervisión técnica y roadmap.<br>• Optimización de conversión y retención. | • **Creadores UGC:** Red de 5-10 microcreadores en TikTok/IG generando contenido constante a cambio de Pro + comisión de afiliado + bonus.<br>• **Atención al Cliente N1:** Asistente virtual a tiempo parcial (~350 €/mes). |
| **Fase 3 (Expansión)** | **> 10.000 €** | • Dirección de Producto y expansión internacional (UK, Francia, EE.UU.). | • **Ingeniero Mobile:** App nativa (Swift / React Native).<br>• **Performance Marketing:** Campañas de pago escalables (Meta/TikTok Ads). |

---

## 6. PLAN DE EJECUCIÓN (4 SEMANAS)

* **Semana 1 (Saneamiento):** Desactivar biometría en avatar, reemplazar Puppeteer por OpenGraph en scraping y limitar imágenes a 6 en Kloe.
* **Semana 2 (Fricción Cero):** Implementar selector de Armario Cápsula Base de 1 toque y notificaciones matutinas inteligentes (retirar bucle de 3h).
* **Semana 3 (Monetización):** Actualizar precios de Stripe a 4,99 €/mes y 29,99 €/año en `/premium` y pulir tarjeta de Stories.
* **Semana 4 (Lanzamiento):** Publicación de landing legal y arranque de tracción orgánica en TikTok/Reels (*"Organizando mi armario con IA"*).

---

## 7. ACCIONES INMEDIATAS IRRENUNCIABLES

1. **Parche Legal y Serverless:** Eliminar la captura de fotos corporales de avatar y retirar Puppeteer de Vercel.
2. **Armario Cápsula Base (1-Tap):** Crear el catálogo de 12 básicos precargados para erradicar la trampa del armario vacío.
3. **Actualización de Pricing en Stripe:** Configurar **4,99 €/mes** y **29,99 €/año** en Stripe Dashboard y en el frontend.
