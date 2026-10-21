# Klozet / Wardrobe.AI - Resolución de Alertas de Seguridad en Supabase

Este documento detalla la solución técnica a las dos alertas críticas reportadas por el **Supabase Security Advisor / Database Linter** en el proyecto `zitsnkacbmkeqnkjasbr`.

El script maestro para aplicar todas las correcciones en un solo clic se encuentra en:
📁 [`sql/fix_supabase_security_advisors.sql`](./fix_supabase_security_advisors.sql)

---

## 1. Alerta Crítica 1: `rls_disabled_in_public` (Table publicly accessible)

### Diagnóstico Técnico
- **Causa**: Varias tablas creadas en el esquema `public` (como `follow_requests`, `push_subscriptions`, `saved_posts`, `style_options`, `users`, etc.) no tenían habilitado **Row-Level Security (RLS)**.
- **Riesgo**: En Supabase y PostgREST, una tabla en el esquema `public` sin RLS activo y con permisos por defecto otorga acceso de lectura y/o escritura a cualquier usuario anónimo o autenticado que realice peticiones directas a la API REST.

### Solución Implementada en el Script
1. **Activación Dinámica de RLS en todas las tablas**:
   Se implementó un bloque procedural PL/pgSQL que itera automáticamente sobre `pg_tables` donde `schemaname = 'public'` y ejecuta `ALTER TABLE public.<tabla> ENABLE ROW LEVEL SECURITY;`. Esto asegura que ninguna tabla presente o futura quede expuesta.
2. **Políticas de Aislamiento de Datos por Usuario**:
   - `follow_requests`: Los usuarios únicamente pueden consultar, actualizar o eliminar solicitudes de seguimiento en las que sean el emisor o el receptor (`auth.uid() = follower_id OR auth.uid() = following_id`), y solo pueden insertar solicitudes donde ellos sean el emisor (`auth.uid() = follower_id`). Soporta de forma resiliente tanto esquemas con `follower_id`/`following_id` como `requester_id`/`target_id`.
   - `push_subscriptions`: Aislamiento estricto por usuario (`auth.uid() = user_id`). Ningún usuario puede interceptar ni listar tokens o suscripciones push de terceros.
   - `saved_posts` y `saves`: Acceso exclusivo al propietario (`auth.uid() = user_id`).
   - `save_folders` y `save_folder_items`: Validación de propiedad directa y relacional (`auth.uid() = user_id` y pertenencia a la carpeta del usuario).
   - `style_options`: Catálogo de lectura pública para todos (`USING (true)`), con inserción/modificación estrictamente restringida a `service_role`.
   - `users` (tabla legacy): Lectura pública de perfiles, con mutaciones (INSERT, UPDATE, DELETE) restringidas estrictamente a `auth.uid() = id`.
   - `user_feedback`: Inserción permitida a usuarios autenticados; lectura reservada exclusivamente al rol de servicio / administración (`auth.role() = 'service_role'`).
   - Tablas núcleo de Klozet (`profiles`, `posts`, `clothing_items`, `outfits`, `outfit_items`, `likes`, `comments`, `follows`, `messages`, `notifications`, etc.): Se garantiza la existencia de sus políticas RLS para evitar bloqueos operativos.

---

## 2. Alerta Crítica 2: `auth_users_exposed` (User data exposed through a view)

### Diagnóstico Técnico
- **Causa**: Supabase detecta vistas en el esquema `public` que leen directa o indirectamente de la tabla interna `auth.users` sin las restricciones correspondientes o con permisos de lectura concedidos a los roles de PostgREST `anon` o `authenticated`.
- **Riesgo**: En PostgreSQL, las vistas estándar se ejecutan por defecto con la identidad de su creador (`SECURITY DEFINER`), ignorando las políticas de RLS de `auth.users` y exponiendo credenciales, correos electrónicos, metadatos y UUIDs a clientes no autorizados.

### Solución Implementada en el Script
1. **Aseguramiento de `public.v_user_subscriptions`**:
   - Se recrea la vista utilizando `WITH (security_invoker = true)` para que evalúe las políticas RLS del usuario que invoca la consulta.
   - Se asegura que la vista consulte únicamente la tabla pública `public.profiles` (la cual ya cuenta con RLS y no expone credenciales privadas de `auth.users`).
   - Se revocan de inmediato los privilegios de PostgREST para roles públicos:
     ```sql
     REVOKE ALL ON public.v_user_subscriptions FROM PUBLIC, anon, authenticated;
     GRANT SELECT ON public.v_user_subscriptions TO service_role, postgres;
     ```
2. **Auditoría y Blindaje Dinámico de Vistas**:
   - Se incluye un bloque PL/pgSQL que consulta el catálogo interno de PostgreSQL (`pg_class`, `pg_rewrite`, `pg_depend`) para detectar cualquier vista en el esquema `public` con dependencias hacia `auth.users`.
   - Para cada vista detectada, revoca automáticamente los permisos de los roles `anon` y `authenticated`, restringiéndola a `service_role` y activando `security_invoker = true`.
3. **Recarga de Esquema PostgREST**:
   - Se emite `NOTIFY pgrst, 'reload schema';` para forzar la actualización inmediata de la caché de PostgREST sin necesidad de reiniciar la base de datos.

---

## 3. Instrucciones de Ejecución en 1 Clic

Para aplicar estas correcciones en el proyecto Supabase:

1. Inicia sesión en el panel de **[Supabase](https://supabase.com/dashboard/project/zitsnkacbmkeqnkjasbr)**.
2. Ve a la sección **SQL Editor** en la barra lateral izquierda.
3. Haz clic en **"New Query"**.
4. Abre el archivo local [`sql/fix_supabase_security_advisors.sql`](./fix_supabase_security_advisors.sql), copia todo su contenido y pégalo en el editor de Supabase.
5. Haz clic en el botón verde **"Run"** (o presiona `Ctrl + Enter` / `Cmd + Enter`).
6. Observa la pestaña de mensajes de salida: verás las confirmaciones `NOTICE` de activación de RLS en cada tabla y el blindaje de las vistas.

---

## 4. Consultas de Verificación Inmediata

Puedes ejecutar estas dos consultas en el SQL Editor para certificar que el sistema está 100% libre de alertas:

### Verificación 1: Tablas con RLS desactivado (Debe devolver 0 filas)
```sql
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
```

### Verificación 2: Vistas expuestas a `anon`/`authenticated` que accedan a `auth.users` (Debe devolver 0 filas)
```sql
SELECT DISTINCT
  c.relname AS exposed_view,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_select,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS auth_can_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_rewrite r ON r.ev_class = c.oid
JOIN pg_depend d ON d.objid = r.oid
JOIN pg_class ref ON ref.oid = d.refobjid
JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('v', 'm')
  AND ref_ns.nspname = 'auth'
  AND ref.relname = 'users'
  AND (
    has_table_privilege('anon', c.oid, 'SELECT') 
    OR has_table_privilege('authenticated', c.oid, 'SELECT')
  );
```

Tras la ejecución, ve a la sección **Security Advisor** / **Database Linter** en el dashboard de Supabase y pulsa **"Refresh"**. Ambas alertas críticas desaparecerán.
