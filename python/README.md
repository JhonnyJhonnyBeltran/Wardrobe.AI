# Background Removal Service (rembg)

## Instalación

```bash
cd python
pip install -r requirements.txt
```

## Ejecutar el servidor

```bash
python bg_removal_server.py
```

El servidor correrá en `http://localhost:5000`

## Endpoints

- **POST /remove-bg** - Elimina el fondo de una imagen
  - Input: FormData con campo `image` (archivo)
  - Output: PNG con fondo transparente

- **GET /health** - Health check

## Uso desde Next.js

El servicio ya está integrado en `services/backgroundRemoval.ts`:

```typescript
import { removeBackgroundRembg } from '@/services/backgroundRemoval';

const result = await removeBackgroundRembg(imageFile);
if (result.success) {
  // Use result.imageUrl
}
```

## Nota

La primera ejecución descargará el modelo de IA (~180MB).
