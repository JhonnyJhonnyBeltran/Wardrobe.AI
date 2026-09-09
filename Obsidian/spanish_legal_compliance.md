# Marco Jurídico Español y Normativa Europea Aplicable a Klozet (Wardrobe.AI)

Este documento recopila la auditoría legal integral y los requisitos normativos aplicables a la plataforma **Klozet (Wardrobe.AI)** de acuerdo con la legislación vigente en España y la Unión Europea.

---

## 1. Legislación Aplicable

### 1.1. Protección de Datos Personales
- **RGPD (Reglamento UE 2016/679)**: Reglamento General de Protección de Datos.
- **LOPDGDD (Ley Orgánica 3/2018)**: Ley Orgánica de Protección de Datos Personales y garantía de los derechos digitales.
- **Autoridad de Control**: Agencia Española de Protección de Datos (AEPD - [www.aepd.es](https://www.aepd.es)).

**Principios clave aplicados en Klozet**:
- **Minimización de datos (Art. 5.1.c RGPD)**: Sólo se recopilan los datos estrictamente necesarios para el funcionamiento del armario inteligente (email, nombre de usuario, fotos de prendas y preferencias estéticas optativas).
- **Transparencia y Deber de Información (Arts. 13 y 14 RGPD / Art. 11 LOPDGDD)**: Información por capas en el registro y detalle exhaustivo en `/privacy`.
- **Derechos ARCO-POL (Arts. 15 a 22 RGPD)**:
  - **Acceso**: El usuario puede ver todo su perfil y contenido en la app.
  - **Rectificación**: Edición de perfil, prendas, contraseñas y tallas desde `/profile/settings`.
  - **Supresión ("Derecho al Olvido")**: Borrado total e irreversible de cuenta y datos en cascada vía `/api/user/delete`.
  - **Limitación y Oposición**: Canales de contacto directo (`privacidad@klozet.app` o `soporte@klozet.app`).
  - **Portabilidad**: Exportación de datos de usuario previa solicitud.

---

### 1.2. Servicios de la Sociedad de la Información y Comercio Electrónico
- **LSSI-CE (Ley 34/2002)**: Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico.

**Requisitos aplicados en Klozet**:
- **Información General Previa (Art. 10 LSSI-CE)**: Datos identificativos del titular del servicio accesibles en `/terms` y `/privacy`.
- **Contratación Electrónica (Arts. 23 a 29 LSSI-CE)**:
  - Condiciones claras accesibles antes de la contratación de planes de suscripción (Klozet Pro mensual y anual).
  - Confirmación documental inmediata de la transacción mediante Stripe Checkout y recibos digitales por correo electrónico.
- **Régimen de Cookies y Almacenamiento Local (Art. 22.2 LSSI-CE)**:
  - Consentimiento previo, libre, informado e inequívoco antes de la instalación de cookies no técnicas.
  - Guía de la AEPD: Botón de "Rechazar" en el mismo nivel visual, tamaño y facilidad que el de "Aceptar".

---

### 1.3. Defensa de Consumidores y Usuarios y Comercio Digital
- **TRLGDCU (Real Decreto Legislativo 1/2007)**: Texto Refundido de la Ley General para la Defensa de los Consumidores y Usuarios.

**Requisitos aplicados en Klozet**:
- **Precios Transparentes con IVA Incluido (Art. 60 TRLGDCU)**:
  - Klozet Pro Mensual: 3,99 €/mes (21% IVA incluido).
  - Klozet Pro Anual: 29,99 €/año (21% IVA incluido).
  - Desglose y moneda (EUR €) visible antes del pago en Stripe.
- **Derecho Legal de Desistimiento (Arts. 102 a 108 TRLGDCU)**:
  - Plazo legal de **14 días naturales** para desistir de la suscripción sin necesidad de justificación.
  - **Excepción para contenido/servicio digital (Art. 103.m TRLGDCU)**: En el momento en que el usuario consiente expresamente el inicio de la ejecución del servicio digital Kloe Pro durante el plazo de desistimiento y reconoce la pérdida de dicho derecho tras la ejecución completa.
- **Resolución de Litigios en Línea (ODR)**: Enlace a la plataforma europea de resolución de disputas en línea: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).

---

### 1.4. Inteligencia Artificial y Transparencia
- **Reglamento Europeo de Inteligencia Artificial (EU AI Act - Reglamento UE 2024/1689)**:

**Requisitos aplicados en Klozet**:
- **Deber de Transparencia (Art. 50 EU AI Act)**: Se informa explícitamente al usuario de que interactúa con un sistema de inteligencia artificial generativa (Kloe AI / Gemini Vision).
- **Prohibición de Afirmaciones Engañosas ("No Unsupported Claims")**:
  - Toda recomendación de estilismo, combinación o análisis de colorimetría se declara expresamente como orientativa y de asistencia personal.
  - Se eliminan afirmaciones de infalibilidad o garantías comerciales absolutas.

---

## 2. Inventario de Cookies y Almacenamiento Local (AEPD)

| Identificador / Clave | Tipo | Finalidad | Duración | Titular |
| :--- | :--- | :--- | :--- | :--- |
| `sb-*-auth-token` | Técnica (Estrictamente necesaria) | Mantiene la sesión segura autenticada del usuario (Supabase GoTrue). | Sesión / 1 año | Propia (Supabase) |
| `klozet_cookie_consent_v1` | Técnica (Estrictamente necesaria) | Almacena la preferencia de consentimiento de cookies del usuario. | 12 meses | Propia |
| `klozet-theme` | Preferencias / Personalización | Recuerda la preferencia de modo claro u oscuro del usuario. | Persistente | Propia |
| `wardrobe_user_profile` | Técnica / Rendimiento (Caché SWR) | Optimiza la carga instantánea del perfil sin peticiones redundantes. | Sesión / Local | Propia |
| `__stripe_mid` / `__stripe_sid` | Técnica / Seguridad | Detección y prevención de fraude en transacciones de pago con Stripe. | 1 año / 30 min | Tercero (Stripe Inc.) |

---

## 3. Lista de Verificación de Cumplimiento Técnico

- [x] **Banner de Cookies AEPD**: Doble capa con Aceptar / Rechazar / Configurar.
- [x] **Página de Política de Cookies**: Accesible en `/cookies`.
- [x] **Términos y Condiciones LSSI/TRLGDCU**: Actualizados en `/terms`.
- [x] **Política de Privacidad RGPD/LOPDGDD**: Actualizada en `/privacy`.
- [x] **Eliminación Total de Cuenta**: Operativa en `/api/user/delete`.
- [x] **Minimización de Datos**: Formulario de onboarding sin campos innecesarios.
- [x] **Transparencia de IA**: Indicación clara de modelo conversacional e IA generativa en `/closet/kloe`.
- [x] **Accesibilidad WCAG 2.1 AA**: Ratios de contraste ≥ 4.5:1, `alt` en imágenes y `aria-label` en controles.
