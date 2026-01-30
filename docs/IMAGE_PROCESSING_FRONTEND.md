# Procesamiento de Imágenes 100% Frontend 🎨

Sistema completo de procesamiento de imágenes de ropa que funciona **completamente en el navegador**, sin necesidad de servidor backend. **Optimizado para completar en menos de 10 segundos**.

## ✨ Características

- ✅ **Remoción de fondo con IA** (usando modelos U2-Net optimizados)
- ✅ **Procesamiento en menos de 10 segundos** (garantizado)
- ✅ **Compresión automática** de imágenes grandes antes de procesar
- ✅ **Precarga del modelo** al iniciar la app para procesamiento instantáneo
- ✅ **Procesamiento en batch** para múltiples imágenes con cola de prioridad
- ✅ **Centrado y normalización** en canvas transparente
- ✅ **100% privado** - todo se procesa en el dispositivo del usuario
- ✅ **Gratuito** - sin costos de API
- ✅ **Funciona offline** - una vez cargado el modelo
- ✅ **Compatible con móviles** - funciona en cualquier dispositivo

## 🏗️ Arquitectura Modular

El sistema está organizado en módulos independientes:

```
lib/imageProcessing/
├── index.ts              # Punto de entrada y re-exports
├── types.ts              # Definiciones de tipos
├── config.ts             # Configuración centralizada
├── processor.ts          # Pipeline principal
├── backgroundRemoval.ts  # Remoción de fondo con IA
├── imageCompression.ts   # Compresión previa
├── imageNormalization.ts # Recorte y centrado
└── processingQueue.ts    # Cola de procesamiento batch
```

## 🚀 Uso Rápido

### 1. Usar el componente React

```tsx
import ImageProcessor from "@/components/ImageProcessor";

export default function MyPage() {
  const handleImageProcessed = (result) => {
    console.log("Imagen procesada:", result);
    // Hacer algo con la imagen procesada
  };

  return <ImageProcessor onImageProcessed={handleImageProcessed} />;
}
```

### 2. Usar directamente la función

```typescript
import { processClothingImage } from "@/lib/imageProcessing";

// Procesar una imagen (calidad 'fast' para < 10 segundos garantizados)
const result = await processClothingImage(imageFile, {
  normalize: true,      // Enderezar y centrar
  canvasWidth: 800,     // Ancho del canvas
  canvasHeight: 1000,   // Alto del canvas
  quality: "fast",      // 'fast' | 'balanced' | 'quality'
});

if (result.success) {
  console.log("URL de la imagen:", result.imageUrl);
  console.log("Tiempo de procesamiento:", result.processingTime, "ms");
}
```

### 3. Procesamiento en batch (múltiples imágenes)

```typescript
import { processBatch } from "@/lib/imageProcessing";

const images = [file1, file2, file3];

const results = await processBatch(
  images.map(input => ({ input, options: { quality: 'fast' } })),
  (completed, total, current) => {
    console.log(`Procesando ${completed}/${total}`);
  }
);

console.log(`Éxitos: ${results.successCount}, Fallos: ${results.failureCount}`);
console.log(`Tiempo total: ${results.totalTime}ms`);
```

### 4. Solo remover fondo (sin normalización)

```typescript
import { removeBackgroundOnly } from "@/lib/imageProcessing";

const result = await removeBackgroundOnly(imageFile, "fast");
```

### 5. Precargar el modelo

```typescript
import { preloadModel, isModelLoaded } from "@/lib/imageProcessing";

// Precargar al iniciar la app
if (!isModelLoaded('fast')) {
  await preloadModel('fast');
}
```

## 📦 API de `processClothingImage`

### Parámetros

```typescript
interface ProcessingOptions {
  normalize?: boolean;           // Enderezar y centrar (default: true)
  canvasWidth?: number;          // Ancho del canvas (default: 800)
  canvasHeight?: number;         // Alto del canvas (default: 1000)
  quality?: 'fast' | 'balanced' | 'quality';  // Velocidad vs calidad
  timeout?: number;              // Timeout en ms (default: 10000)
  skipBackgroundRemoval?: boolean; // Omitir remoción de fondo
  priority?: number;             // Prioridad en cola (mayor = primero)
}
```

### Niveles de Calidad

| Calidad    | Modelo        | Tiempo Aprox. | Uso Recomendado           |
|------------|---------------|---------------|---------------------------|
| `fast`     | isnet_quint8  | 3-6 segundos  | Subida masiva de ropa     |
| `balanced` | isnet_quint8  | 5-8 segundos  | Uso general               |
| `quality`  | isnet_fp16    | 7-10 segundos | Imágenes para publicar    |

### Retorno

```typescript
interface ProcessingResult {
  success: boolean;        // Si el procesamiento fue exitoso
  imageUrl?: string;       // Data URL de la imagen procesada
  blob?: Blob;             // Blob de la imagen procesada
  error?: string;          // Mensaje de error si falló
  processingTime?: number; // Tiempo de procesamiento en ms
}
```

## ⚡ Optimizaciones de Rendimiento

### 1. Compresión Previa
Las imágenes grandes (>2MB) se comprimen automáticamente antes de procesar, reduciendo significativamente el tiempo de IA.

### 2. Modelo Cuantizado
Por defecto usa el modelo `isnet_quint8` que es ~4x más rápido que el modelo FP16 con calidad similar.

### 3. Precarga del Modelo
El componente `ModelPreloader` carga el modelo en segundo plano 2 segundos después de iniciar la app:

```tsx
// Ya incluido en app/layout.tsx
<ModelPreloader delay={2000} />
```

### 4. Procesamiento en Cola
Las imágenes se procesan en cola con límite de concurrencia para evitar bloquear el navegador.

## 🔧 Cómo Funciona

### 1. Remoción de Fondo

- Usa la librería `@imgly/background-removal`
- Carga un modelo de IA U2-Net cuantizado en WebAssembly
- Procesa la imagen completamente en el navegador
- Primera carga: ~5-10MB (modelo se guarda en caché)

### 2. Detección de Ángulo

- Analiza los píxeles no transparentes
- Calcula el centro de masa del objeto
- Usa análisis de componentes principales (PCA) simplificado
- Detecta el ángulo de rotación necesario

### 3. Normalización

- Encuentra el bounding box del contenido
- Calcula la escala óptima con padding
- Rota la imagen si es necesario (>5°)
- Centra en un canvas blanco del tamaño especificado

## 💡 Mejores Prácticas

### Para obtener mejores resultados:

1. **Iluminación**: Usa luz natural o iluminación uniforme
2. **Superficie**: Coloca la prenda sobre una superficie plana y lisa
3. **Contraste**: Mayor contraste con el fondo = mejores resultados
4. **Calidad**: Fotos de 1000-2000px de ancho son ideales
5. **Extensión**: Extiende bien la prenda antes de fotografiar

### Configuración recomendada según uso:

```typescript
// Para móviles (más rápido)
const result = await processClothingImage(file, {
  quality: "low",
  canvasWidth: 600,
  canvasHeight: 800,
});

// Para desktop (mejor calidad)
const result = await processClothingImage(file, {
  quality: "high",
  canvasWidth: 1000,
  canvasHeight: 1200,
});

// Para preview rápido
const result = await removeBackgroundOnly(file, "low");
```

## 📱 Integración con Supabase

Ejemplo de cómo subir la imagen procesada a Supabase:

```typescript
import { processClothingImage } from "@/lib/imageProcessing";
import { createClient } from "@/lib/supabase/client";

async function uploadProcessedImage(file: File) {
  // 1. Procesar la imagen
  const result = await processClothingImage(file);

  if (!result.success || !result.blob) {
    throw new Error("Error procesando imagen");
  }

  // 2. Subir a Supabase
  const supabase = createClient();
  const fileName = `clothing-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from("wardrobe")
    .upload(fileName, result.blob, {
      contentType: "image/png",
      cacheControl: "3600",
    });

  if (error) throw error;

  // 3. Obtener URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from("wardrobe").getPublicUrl(fileName);

  return publicUrl;
}
```

## 🎨 Personalización del Componente

Puedes personalizar el componente `ImageProcessor`:

```tsx
<ImageProcessor
  onImageProcessed={(result) => {
    // Guardar en base de datos
    // Mostrar notificación
    // Navegar a otra página
  }}
/>
```

O crear tu propia UI:

```tsx
"use client";
import { useState } from "react";
import { processClothingImage } from "@/lib/imageProcessing";

export function CustomProcessor() {
  const [result, setResult] = useState<string>("");

  const handleUpload = async (file: File) => {
    const processed = await processClothingImage(file);
    if (processed.success) {
      setResult(processed.imageUrl!);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      {result && <img src={result} alt="Processed" />}
    </div>
  );
}
```

## ⚡ Rendimiento

### Tiempos de procesamiento estimados:

| Dispositivo     | Calidad | Tiempo |
| --------------- | ------- | ------ |
| Desktop moderno | High    | 2-4s   |
| Desktop moderno | Medium  | 1-2s   |
| Desktop moderno | Low     | 0.5-1s |
| Móvil gama alta | High    | 5-8s   |
| Móvil gama alta | Medium  | 3-5s   |
| Móvil gama alta | Low     | 2-3s   |

### Optimizaciones:

1. **Primera carga**: El modelo se descarga y guarda en caché
2. **Cargas siguientes**: Carga instantánea desde caché
3. **Service Worker**: Puedes configurarlo para funcionamiento offline completo

## 🔒 Privacidad y Seguridad

- ✅ **Sin envío de datos**: Todo se procesa localmente
- ✅ **Sin tracking**: No se registran las imágenes
- ✅ **GDPR compliant**: Los datos nunca salen del dispositivo
- ✅ **Offline capable**: Funciona sin conexión una vez cargado

## 🆚 Comparación: Frontend vs Backend

| Aspecto           | Frontend (actual)            | Backend (Python)          |
| ----------------- | ---------------------------- | ------------------------- |
| **Costo**         | Gratis                       | Gratis (local) o servidor |
| **Privacidad**    | ✅ Total                     | ⚠️ Envía imágenes         |
| **Velocidad**     | ⚡ Rápido                    | 🐌 Red + procesamiento    |
| **Escalabilidad** | ✅ Infinita                  | ❌ Limitada por servidor  |
| **Offline**       | ✅ Sí (después de 1ra carga) | ❌ No                     |
| **Móviles**       | ✅ Funciona                  | ⚠️ Depende de red         |
| **Mantenimiento** | ✅ Sin servidor              | ⚠️ Servidor requerido     |

## 🛠️ Tecnologías Utilizadas

- **@imgly/background-removal**: Librería de remoción de fondo
- **ONNX Runtime**: Ejecución de modelos de IA en WebAssembly
- **U2-Net**: Modelo de segmentación de imagen
- **Canvas API**: Manipulación de imágenes
- **TypeScript**: Type safety
- **React 19**: UI
- **Next.js 15**: Framework

## 🐛 Troubleshooting

### Error: "Module parse failed: Unexpected character"

Asegúrate de que `next.config.ts` tiene la configuración de WebAssembly:

```typescript
config.experiments = {
  asyncWebAssembly: true,
};
```

### La imagen no se procesa

- Verifica que el archivo es una imagen válida
- Comprueba el tamaño (máx 10MB por defecto)
- Revisa la consola del navegador para errores

### Procesamiento muy lento en móvil

- Usa `quality: 'low'` para móviles
- Reduce el tamaño del canvas
- Considera mostrar un indicador de progreso

### Error de memoria

- Reduce la calidad
- Procesa imágenes más pequeñas
- Libera memoria con `URL.revokeObjectURL()`

## 📚 Recursos Adicionales

- [imgly/background-removal GitHub](https://github.com/imgly/background-removal-js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [U2-Net Paper](https://arxiv.org/abs/2005.09007)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🎉 Conclusión

Esta solución frontend es **superior al backend** para la mayoría de casos de uso:

- ✅ Sin costos de servidor
- ✅ Privacidad total
- ✅ Mejor experiencia de usuario
- ✅ Escalabilidad infinita
- ✅ Funciona en móviles

¡Disfruta procesando imágenes sin límites! 🚀
