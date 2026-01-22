/**
 * Image Processing Service - 100% Frontend
 * Procesa imágenes de ropa en el navegador sin servidor
 */

import { removeBackground } from '@imgly/background-removal';

export interface ProcessingOptions {
    normalize?: boolean; // Enderezar y centrar
    canvasWidth?: number; // Ancho del canvas
    canvasHeight?: number; // Alto del canvas
    quality?: 'low' | 'medium' | 'high'; // Calidad del modelo de IA
    transparentBackground?: boolean; // Fondo transparente
}

export interface ProcessingResult {
    success: boolean;
    imageUrl?: string;
    blob?: Blob;
    error?: string;
}

/**
 * Detecta el bounding box preciso del objeto (solo píxeles no transparentes)
 */
function getContentBoundingBox(imageData: ImageData): { minX: number; minY: number; maxX: number; maxY: number } | null {
    const { data, width, height } = imageData;

    let minX = width, minY = height;
    let maxX = 0, maxY = 0;
    let hasContent = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];

            // Umbral más estricto para mejor detección
            if (alpha > 20) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                hasContent = true;
            }
        }
    }

    if (!hasContent) return null;

    // Añadir un pequeño margen para no cortar bordes
    const margin = 2;
    return {
        minX: Math.max(0, minX - margin),
        minY: Math.max(0, minY - margin),
        maxX: Math.min(width - 1, maxX + margin),
        maxY: Math.min(height - 1, maxY + margin)
    };
}

/**
 * Detecta el ángulo de inclinación del objeto en una imagen
 */
function detectRotationAngle(imageData: ImageData): number {
    const { data, width, height } = imageData;

    // Encontrar todos los píxeles no transparentes
    const points: { x: number; y: number }[] = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];

            // Si el píxel tiene algo de opacidad
            if (alpha > 50) {
                points.push({ x, y });
            }
        }
    }

    if (points.length < 100) return 0; // No hay suficientes puntos

    // Calcular el ángulo usando PCA simplificado
    // Encontrar el centro de masa
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Calcular covarianza
    let sxx = 0, syy = 0, sxy = 0;

    points.forEach(p => {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        sxx += dx * dx;
        syy += dy * dy;
        sxy += dx * dy;
    });

    // Calcular el ángulo principal
    const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy) * (180 / Math.PI);

    // Solo retornar si el ángulo es significativo (> 5 grados)
    return Math.abs(angle) > 5 ? angle : 0;
}

/**
 * Normaliza y centra la imagen en un canvas blanco
 */
function normalizeImage(
    imageBlob: Blob,
    canvasWidth = 800,
    canvasHeight = 1000,
    options: { transparentBackground?: boolean } = {}
): Promise<{ blob: Blob; url: string }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);

        img.onload = () => {
            try {
                // Canvas temporal para extraer datos de imagen
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

                if (!tempCtx) {
                    reject(new Error('No se pudo crear el contexto del canvas'));
                    return;
                }

                tempCtx.drawImage(img, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

                // 1. Obtener el bounding box preciso del contenido
                const bbox = getContentBoundingBox(imageData);

                if (!bbox) {
                    reject(new Error('No se detectó contenido en la imagen'));
                    return;
                }

                // 2. Recortar al bounding box
                const contentWidth = bbox.maxX - bbox.minX;
                const contentHeight = bbox.maxY - bbox.minY;

                // Canvas para la imagen recortada
                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = contentWidth;
                croppedCanvas.height = contentHeight;
                const croppedCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });

                if (!croppedCtx) {
                    reject(new Error('No se pudo crear el contexto del canvas'));
                    return;
                }

                // Dibujar solo el contenido recortado
                croppedCtx.drawImage(
                    img,
                    bbox.minX, bbox.minY, contentWidth, contentHeight,
                    0, 0, contentWidth, contentHeight
                );

                // 3. Detectar ángulo de la imagen recortada
                // NOTA: Rotación automática desactivada - causaba giros incorrectos en productos
                // El usuario puede rotar manualmente usando los botones de la interfaz
                const croppedImageData = croppedCtx.getImageData(0, 0, contentWidth, contentHeight);
                // const angle = detectRotationAngle(croppedImageData);
                const angle = 0; // Sin rotación automática

                // 4. Crear canvas final con el tamaño deseado
                const canvas = document.createElement('canvas');
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('No se pudo crear el contexto del canvas'));
                    return;
                }

                // Fondo: Transparente por defecto
                // Solo si explícitamente se pide NO transparenre (opcional, por ahora siempre transparente)
                // if (!options.transparentBackground) {
                //    ctx.fillStyle = 'white';
                //    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                // }

                // 5. Calcular escala para ajustar al canvas con padding
                const padding = 40;
                const maxWidth = canvasWidth - padding * 2;
                const maxHeight = canvasHeight - padding * 2;

                const scale = Math.min(
                    maxWidth / contentWidth,
                    maxHeight / contentHeight,
                    1.2 // No agrandar demasiado imágenes pequeñas
                );

                const scaledWidth = contentWidth * scale;
                const scaledHeight = contentHeight * scale;

                // 6. Aplicar rotación si es necesario y centrar
                ctx.save();
                ctx.translate(canvasWidth / 2, canvasHeight / 2);

                if (Math.abs(angle) > 0) {
                    ctx.rotate(angle * Math.PI / 180);
                }

                // Dibujar centrado
                ctx.drawImage(
                    croppedCanvas,
                    -scaledWidth / 2,
                    -scaledHeight / 2,
                    scaledWidth,
                    scaledHeight
                );

                ctx.restore();

                // Convertir a Data URL (Base64) para persistencia
                // Blob URLs se pierden al recargar, Base64 se guarda en la DB
                try {
                    const dataUrl = canvas.toDataURL('image/png', 0.9);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({ blob, url: dataUrl }); // Usar DataURL en lugar de blob URL
                        } else {
                            resolve({ blob: undefined as any, url: dataUrl });
                        }
                    }, 'image/png');
                } catch (e) {
                    reject(e);
                }

            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Error al cargar la imagen'));
        };

        img.src = url;
    });
}

/**
 * Procesa una imagen de ropa: remueve fondo y normaliza
 * TODO en el navegador, sin servidor backend
 */
export async function processClothingImage(
    imageFile: File | string,
    options: ProcessingOptions = {}
): Promise<ProcessingResult> {
    const {
        normalize = true,
        canvasWidth = 800,
        canvasHeight = 1000,
        quality = 'medium',
    } = options;

    try {
        // 1. Convertir a Blob si es necesario
        let inputBlob: Blob;

        if (typeof imageFile === 'string') {
            // Check if it's an external URL (http/https) vs data URL
            if (imageFile.startsWith('http://') || imageFile.startsWith('https://')) {
                // Use server-side proxy to avoid CORS issues with external images
                console.log('[Processing] Fetching image via proxy...');
                const proxyResponse = await fetch('/api/proxy-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: imageFile }),
                });

                if (!proxyResponse.ok) {
                    const errorData = await proxyResponse.json().catch(() => ({}));
                    throw new Error(errorData.error || `Proxy failed with status ${proxyResponse.status}`);
                }

                const proxyData = await proxyResponse.json();

                if (!proxyData.success || !proxyData.dataUrl) {
                    throw new Error(proxyData.error || 'Proxy returned no image data');
                }

                // Convert data URL to Blob
                const dataUrlResponse = await fetch(proxyData.dataUrl);
                inputBlob = await dataUrlResponse.blob();
                console.log('[Processing] Image fetched via proxy successfully');
            } else {
                // Data URL - fetch directly
                const response = await fetch(imageFile);
                inputBlob = await response.blob();
            }
        } else {
            inputBlob = imageFile;
        }

        // 2. Remover el fondo usando IA en el navegador
        console.log('Removiendo fondo...');
        let removedBgBlob: Blob;
        try {
            removedBgBlob = await removeBackground(inputBlob, {
                model: 'isnet_fp16',
                // Official IMG.LY CDN - the only one with 1.7.0 model data
                publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
                debug: true,
                progress: (key: string, current: number, total: number) => {
                    if (key.startsWith('fetch')) {
                        console.log(`[Processing] Fetching model resource ${key}: ${Math.round(current / total * 100)}%`);
                    }
                },
                output: {
                    format: 'image/png',
                    quality: 1.0
                }
            });
            console.log('[Processing] Background removed successfully');
        } catch (bgError) {
            console.error('[Processing] Background removal failed:', bgError);
            throw new Error(`Fallo al eliminar fondo: ${(bgError as Error).message}.`);
        }

        // 3. Normalizar si se solicita
        let finalBlob: Blob;
        let finalUrl: string;

        if (normalize) {
            console.log('Normalizando imagen...');
            const result = await normalizeImage(
                removedBgBlob,
                canvasWidth,
                canvasHeight,
                { transparentBackground: options.transparentBackground }
            );
            finalBlob = result.blob;
            finalUrl = result.url;
        } else {
            // Si no normalizamos, convertimos el resultado a Base64 también
            finalBlob = removedBgBlob;
            finalUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(removedBgBlob);
            });
        }

        return {
            success: true,
            imageUrl: finalUrl,
            blob: finalBlob,
        };

    } catch (error) {
        console.error('Error procesando imagen:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Versión simplificada: solo remoción de fondo
 */
export async function removeBackgroundOnly(
    imageFile: File | string,
    quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<ProcessingResult> {
    return processClothingImage(imageFile, {
        normalize: false,
        quality,
    });
}
