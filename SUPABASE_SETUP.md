# 🚀 Guía de Configuración de Supabase

## ✅ Checklist Rápido

- [ ] 1. Crear cuenta en Supabase
- [ ] 2. Crear proyecto
- [ ] 3. Ejecutar SQL para crear tablas
- [ ] 4. Crear bucket de storage
- [ ] 5. Configurar .env.local
- [ ] 6. ¡Listo para usar!

---

## 📋 Paso a Paso Detallado

### 1️⃣ Crear Cuenta y Proyecto (5 min)

1. Ve a **https://supabase.com**
2. Clic en **"Start your project"**
3. **Sign up** con GitHub (más rápido)
4. Clic en **"New project"**
5. Configuración:
   ```
   Name: wardrobe-ai
   Database Password: [Genera una fuerte - GUÁRDALA]
   Region: Europe West (London)
   Plan: Free
   ```
6. Clic en **"Create new project"** (tarda 2 minutos)

---

### 2️⃣ Ejecutar SQL para Crear Tablas (3 min)

1. En el dashboard de tu proyecto, ve a **SQL Editor** (icono de código en el menú lateral)
2. Clic en **"+ New query"**
3. **Copia todo el contenido** del archivo `lib/supabase/schema.sql`
4. **Pégalo** en el editor
5. Clic en **"Run"** (abajo a la derecha)
6. ✅ Deberías ver "Success. No rows returned"

---

### 3️⃣ Crear Storage Bucket para Imágenes (2 min)

1. Ve a **Storage** en el menú lateral
2. Clic en **"Create a new bucket"**
3. Configuración:
   ```
   Name: clothing-images
   Public bucket: ✅ YES (marca la casilla)
   ```
4. Clic en **"Create bucket"**

#### Configurar Políticas del Bucket:

1. Clic en el bucket **"clothing-images"**
2. Ve a **"Policies"** (pestaña)
3. Clic en **"New policy"** dos veces para crear:

**Política 1 - Upload (Usuarios pueden subir):**

```
Name: Allow authenticated uploads
Target roles: authenticated
WITH CHECK: bucket_id = 'clothing-images'
```

**Política 2 - Read (Todos pueden ver):**

```
Name: Allow public read
Target roles: public
USING: bucket_id = 'clothing-images'
```

---

### 4️⃣ Configurar Variables de Entorno (2 min)

1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia estos dos valores:

   - **Project URL** (ejemplo: `https://xyzabc123.supabase.co`)
   - **anon public key** (empieza con `eyJhbGci...`)

3. Abre el archivo **`.env.local`** en tu proyecto
4. Reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...tu_key_aquí
```

5. **GUARDA el archivo**

---

### 5️⃣ Habilitar Autenticación por Email (Opcional pero recomendado)

1. Ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** esté habilitado
3. (Opcional) Habilita **Google** para login social:
   - Clic en Google
   - Sigue las instrucciones para crear OAuth en Google Cloud
   - Pega Client ID y Secret

---

## 🎉 ¡Listo! Verificación

Para verificar que todo funciona:

1. Reinicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

2. Deberías poder:
   - ✅ Registrarte con email/password
   - ✅ Iniciar sesión
   - ✅ Añadir prendas a tu armario
   - ✅ Ver las prendas persistir al recargar

---

## 📊 Estructura de la Base de Datos

### Tabla: `users`

```sql
id (UUID) - Primary Key, referencia a auth.users
email (TEXT) - Email del usuario
name (TEXT) - Nombre del usuario
avatar (TEXT) - URL del avatar
created_at, updated_at
```

### Tabla: `clothing_items`

```sql
id (UUID) - Primary Key
user_id (UUID) - Foreign Key a users
name (TEXT) - Nombre de la prenda
category (TEXT) - Categoría (top, bottom, shoes, etc.)
color (TEXT) - Color principal
image_url (TEXT) - URL de la imagen
season (TEXT[]) - Array de temporadas
brand (TEXT) - Marca
tags (TEXT[]) - Etiquetas
favorite (BOOLEAN) - ¿Es favorita?
created_at, updated_at
```

### Tabla: `outfits`

```sql
id (UUID) - Primary Key
user_id (UUID) - Foreign Key a users
name (TEXT) - Nombre del outfit
items (UUID[]) - Array de IDs de clothing_items
season (TEXT) - Temporada
occasion (TEXT) - Ocasión
favorite (BOOLEAN)
created_at, updated_at
```

---

## 🔒 Seguridad (Row Level Security)

Todas las tablas tienen RLS habilitado:

- ✅ Los usuarios solo ven sus propios datos
- ✅ No pueden acceder a datos de otros usuarios
- ✅ El backend maneja la autenticación automáticamente

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"

→ Verifica que `.env.local` tenga las dos variables correctamente configuradas

### Error: "relation 'clothing_items' does not exist"

→ No ejecutaste el SQL. Ve al paso 2️⃣ y ejecuta `schema.sql`

### Las imágenes no se suben

→ Verifica que el bucket `clothing-images` exista y sea público (paso 3️⃣)

### No puedo registrarme

→ Ve a Authentication > Email Templates y verifica que el email esté habilitado

---

## 📞 Soporte

Si algo no funciona, revisa:

1. La consola del navegador (F12)
2. Los logs de Supabase (Dashboard > Logs)
3. Que todas las variables de entorno estén bien escritas

---

**¡Todo configurado!** 🎉 Ahora tienes una base de datos real con autenticación y storage para tu MVP.
