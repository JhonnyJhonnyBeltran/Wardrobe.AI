# 📦 SQL Setup para Klozet (Wardrobe.AI)

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos en Supabase.

## 🚀 Orden de Ejecución

**IMPORTANTE:** Ejecuta los scripts en el siguiente orden en el SQL Editor de Supabase:

### 1. Setup Inicial (OBLIGATORIO)
```
sql/setup/01_initial_setup.sql
```
Este archivo contiene:
- Extensiones necesarias (UUID)
- Tabla `users` (legacy)
- Tabla `profiles` (social)
- Tabla `clothing_items`
- Tabla `outfits`
- Tablas sociales (posts, follows, likes, comments)
- Políticas RLS para todas las tablas
- Trigger para crear usuario automáticamente al registrarse

### 2. Mensajería (OBLIGATORIO si usas DMs)
```
sql/features/messaging.sql
```
Este archivo contiene:
- Tabla `conversations`
- Tabla `messages`
- Funciones helper para mensajería
- Políticas RLS para mensajes

### 3. Storage (OBLIGATORIO para subir imágenes)
```
sql/setup/02_storage.sql
```
Este archivo configura:
- Bucket para avatares
- Políticas de acceso a storage

### 4. Realtime (OPCIONAL - solo si necesitas actualizaciones en tiempo real)
```
sql/features/realtime.sql
```
Habilita realtime para:
- Tabla follows
- Tabla messages
- Tabla conversations

## 📁 Estructura de Carpetas

```
sql/
├── setup/              # Scripts de configuración inicial
│   ├── 01_initial_setup.sql    # Tablas principales + trigger
│   └── 02_storage.sql          # Configuración de storage
├── features/           # Features adicionales
│   ├── messaging.sql           # Sistema de mensajería
│   └── realtime.sql            # Configuración realtime
└── README.md           # Este archivo
```

## ⚠️ Notas Importantes

1. **Siempre ejecuta `01_initial_setup.sql` primero** - Este contiene las tablas base requeridas por otros scripts.

2. **Los scripts son idempotentes** - Puedes ejecutarlos múltiples veces sin problemas.

3. **Configura tu .env** - Asegúrate de tener las variables de Supabase configuradas:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave
   ```

## 🔧 Solución de Problemas

### Error: "Database error saving new user"
Significa que el trigger `handle_new_user` no está funcionando correctamente.
Ejecuta nuevamente `sql/setup/01_initial_setup.sql`.

### Error: "relation does not exist"
Ejecuta los scripts en el orden correcto, empezando por `01_initial_setup.sql`.
