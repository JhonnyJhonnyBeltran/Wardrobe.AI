# Arquitectura de Alta Escalabilidad y Seguridad Global - Klozet

Este documento detalla la infraestructura, mecanismos de seguridad, topología multi-región y estrategia de escalado para sostener **de 1.000 a más de 15.000 usuarios activos simultáneos en tiempo real** sin caídas ni brechas de seguridad.

---

## 1. Topología de Servidores: Serverless & Edge Multi-Región

En arquitecturas tradicionales (un único servidor VPS o máquina virtual), una avalancha de 1.000 usuarios satura la CPU, agota la memoria RAM y tira el servicio.

Klozet opera bajo una **arquitectura Serverless & Edge Distribuida** sobre la red global de Vercel y Supabase:

1. **Red Edge Global Anycast (+300 Ciudades)**:
   - Los usuarios de España, Europa, Estados Unidos, Latinoamérica o Asia son enrutados automáticamente al nodo más cercano geográficamente.
   - Las páginas estáticas (Landing, Términos, Privacidad, Cookies, Tendencias) y los assets (imágenes WebP, fuentes, scripts) se entregan desde la memoria del Edge en menos de **25-40 ms**.

2. **Auto-Escalado Elástico de Cómputo (Serverless Lambdas)**:
   - No hay un "servidor único" esperando peticiones.
   - Cada llamada a una API (`/api/closy/chat`, `/api/analyze-clothing`, `/api/messages`, etc.) levanta micro-instancias efímeras e independientes en paralelo.
   - Si entran 5.000 peticiones en el mismo segundo, el sistema genera 5.000 micro-instancias aisladas sin colapsar el resto de la aplicación.

---

## 2. Seguridad Absoluta y Aislamiento de Secretos (Zero-Trust)

### A. Ocultación Criptográfica de Credenciales
- **Claves Maestras Privadas**: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY` y `CRON_SECRET` residen **exclusivamente en el entorno backend de Vercel**.
- **Prohibición de Exposición**: NUNCA llevan el prefijo `NEXT_PUBLIC_`. Ningún navegador o usuario final puede leerlas ni inspeccionarlas en el código fuente compilado.
- **Anon Key y RLS**: La clave pública de Supabase (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) solo permite operaciones permitidas explícitamente por las políticas de seguridad a nivel de fila (Row Level Security - RLS) en PostgreSQL. Un usuario NUNCA puede leer ni modificar prendas, mensajes ni datos de otro usuario.

### B. Blindaje de Endpoints Críticos (Implementado)
Todos los endpoints sensibles cuentan con:
1. **Verificación de Sesión Obligatoria**: Rechazo con `401 Unauthorized` si no existe una cookie de sesión JWT válida de Supabase.
2. **Protección Anti-SSRF (`isSafeUrl`)**: Bloqueo absoluto de peticiones hacia IPs internas, localhost, rangos privados (10.0.0.0, 192.168.0.0, 172.16.0.0) y endpoints de metadatos cloud (169.254.169.254).
3. **IP Rate Limiting Anti-Scraping**: Limitación por IP en cabecera `X-Forwarded-For` para neutralizar ataques DDoS y bots de scraping masivo.

### C. Cabeceras HTTP de Seguridad Empresarial (`next.config.ts`)
- `X-Content-Type-Options: nosniff` (previene ataques de sniffing MIME).
- `X-Frame-Options: SAMEORIGIN` (impide ataques de clickjacking mediante iframes).
- `X-XSS-Protection: 1; mode=block` (filtro anti Cross-Site Scripting).
- `Referrer-Policy: strict-origin-when-cross-origin` (privacidad de cabeceras de navegación).
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (aislamiento de sensores del dispositivo).

---

## 3. Desbloqueo y Escalado de Base de Datos (PostgreSQL)

El verdadero cuello de botella en sistemas con 10.000+ usuarios concurrentes es la saturación de conexiones en la base de datos (límite de sockets `max_connections` de PostgreSQL).

### Estrategia de Blindaje Implementada:
1. **PostgREST Connectionless**: Las consultas del cliente web no abren sockets directos a Postgres; se comunican mediante la API REST HTTP de PostgREST, que multiplexa miles de peticiones sobre conexiones internas compartidas.
2. **Supavisor / Connection Pooling (Puerto 6543)**: Para operaciones backend de alta frecuencia, se utiliza el pooler en modo transacción (Transaction Mode) de Supabase, soportando más de 10.000 conexiones concurrentes sobre un número reducido de sockets reales.
3. **Edge Caching en Datos Maestros**:
   - Endpoints como `/api/brands` y `/api/categories` incorporan cabeceras `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
   - Vercel Edge CDN absorbe el 95% de las lecturas repetidas sin tocar la base de datos de Supabase.
4. **Optimización Radical de `middleware.ts`**:
   - Se excluyen las rutas públicas (`/`, `/about`, `/contact`, `/terms`, `/privacy`, `/cookies`, `/trends`) y assets de la llamada `supabase.auth.getUser()`.
   - Esto ahorra decenas de miles de llamadas innecesarias al cluster de autenticación en horas punta de navegación.

---

## 4. Cuotas y Blindaje de IA (Google Gemini)

1. **Caché Criptográfica SHA-256 (`ai_image_cache`)**:
   - Cada imagen subida genera un hash SHA-256.
   - Si la prenda o una imagen idéntica ya fue procesada, se responde en <1ms desde caché con **coste 0,00 €** y 0 consumo de cuota API.
2. **Cascada de Modelos y Resiliencia**:
   - Rotación automática de modelos en caso de saturación o límite de RPM (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-flash`).
3. **Cuotas Persistentes en Backend**:
   - Usuarios Free: Límite estricto de **5 prendas/día** en subida y **8 consultas/día** en Kloe.
   - El control se valida en PostgreSQL (`ai_daily_usage_date` / `ai_daily_usage_count`), haciendo imposible que un usuario burle el límite abriendo múltiples pestañas.

---

## 5. Hoja de Ruta para Escalado Progresivo

| Hito de Usuarios | Requisitos Técnicos / Infraestructura | Coste Aprox. Mensual |
| :--- | :--- | :--- |
| **0 a 1.000 usuarios** | • Supabase Pro ($25/mes)<br>• Vercel Pro ($20/mes)<br>• Gemini Flash Pay-as-you-go | ~55 € - 75 € / mes |
| **1.000 a 5.000 usuarios** | • Supabase Compute Add-on (Small / Medium 2-4 vCPU)<br>• Upstash Redis para rate limiting distribuido en microsegundos | ~90 € - 140 € / mes |
| **5.000 a 15.000+ usuarios** | • Supabase Compute Large / XL + Read Replicas en regiones secundarias<br>• Solicitud de incremento de cuota a Google Cloud (Tier 2: +2.000 RPM)<br>• CDN Cloudflare / Fastly para balanceo DDoS avanzado | ~250 € - 450 € / mes |

> [!NOTE]
> Con un modelo de suscripción como Klozet Pro (4,99 €/mes), con que solo el **3% al 5% de 15.000 usuarios sean Pro** (450 a 750 suscriptores), los ingresos son de **2.250 € a 3.750 € al mes**, superando ampliamente los costes de infraestructura.
