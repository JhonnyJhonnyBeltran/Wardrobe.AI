/**
 * OPTIMIZACIONES DE IMÁGENES - Guía de Implementación
 * 
 * Aplica estas prácticas para maximizar performance con Next.js Image
 * 
 * 1. SIEMPRE usa next/image en lugar de <img>
 * 2. Añade el atributo `sizes` para responsive images
 * 3. Usa `priority` solo para imágenes críticas (LCP)
 * 4. Implementa blur placeholders para skeleton loading
 * 5. Comprime imágenes al máximo (WebP, AVIF)
 */

// ❌ MAL
import Image from 'next/image';

export function BadImage() {
  return (
    <img 
      src="/klozet-logo.png" 
      alt="Logo"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

// ✅ BIEN - Componente con todas las optimizaciones
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="/klozet-logo.png"
      alt="Logo"
      width={160}
      height={64}
      priority={true} // Solo para imágenes críticas (hero, header logo)
      sizes="(max-width: 640px) 80px, (max-width: 1024px) 120px, 160px"
      placeholder="blur" // Necesita blurDataURL
      blurDataURL="data:image/webp;base64,..." // Genera con herramientas
      loading="lazy" // Por defecto para non-priority images
    />
  );
}

// ✅ MEJOR - Componente para imágenes de producto (variable width)
export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        quality={80} // Default 75, aumentar para catálogos visuales
        onError={(e) => {
          console.warn(`Image failed to load: ${src}`);
        }}
      />
    </div>
  );
}

/**
 * PASOS DE IMPLEMENTACIÓN INMEDIATA:
 * 
 * 1. En /components/ClothingItem.tsx:
 *    - Cambiar <img> por <Image>
 *    - Añadir sizes atributo
 *    - Añadir placeholder blur
 * 
 * 2. En /components/OutfitCard.tsx:
 *    - Cambiar <img> por <Image>
 *    - Usar fill + sizes
 *    - Priority solo para visible cards
 * 
 * 3. En /app/closet/page.tsx:
 *    - Usar sizes="(max-width: 640px) calc(50vw - 8px), ..."
 *    - Implementar lazy loading en grid items
 * 
 * 4. Generar blur placeholders:
 *    ```bash
 *    npm install --save-dev plaiceholder
 *    # O usar: https://blurred.dev/
 *    ```
 * 
 * 5. En next.config.ts, añadir:
 *    ```ts
 *    images: {
 *      formats: ['image/avif', 'image/webp'],
 *      minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año
 *      densities: [1, 2], // Soportar 2x density
 *    }
 *    ```
 */

export const IMAGE_OPTIMIZATION_CHECKLIST = {
  phase1_critical: [
    '✅ Remover preloading automático de modelos IA',
    '✅ Hacer dynamic imports de html2canvas',
    '✅ Hacer dynamic imports de @imgly/background-removal',
    '✅ Reorganizar providers para minimizar re-renders',
  ],
  phase2_high_priority: [
    '⏳ Cambiar <img> por <Image> en ClothingItem',
    '⏳ Cambiar <img> por <Image> en OutfitCard',
    '⏳ Implementar blur placeholders en galería',
    '⏳ Añadir sizes en componentes responsivos',
  ],
  phase3_complementary: [
    '⏳ Generar blur DataURLs con plaiceholder',
    '⏳ Configurar AVIF/WebP en next.config.ts',
    '⏳ Implementar intersection observer para lazy-load',
    '⏳ Optimizar CSS (eliminar unused styles)',
  ],
};
