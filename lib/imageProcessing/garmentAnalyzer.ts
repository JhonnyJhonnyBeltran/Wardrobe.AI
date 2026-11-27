/**
 * Garment Quality & Broken Mask Analyzer
 * Diagnoses segmentation failures, protects light-colored garments,
 * and repairs internal transparent holes ("prendas rotas").
 */

export interface GarmentPreAnalysis {
  garmentLuminance: number;       // 0-255 average center brightness
  backgroundLuminance: number;    // 0-255 average border brightness
  contrastDelta: number;          // Absolute difference
  isLightGarment: boolean;        // True if clothing is white/beige/light pastel
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface GarmentMaskAnalysis {
  isBroken: boolean;
  isLightGarment: boolean;
  solidPixels: number;
  internalHolesCount: number;
  internalHolesRatio: number;     // Percentage of garment area with holes
  retainedAreaRatio: number;      // Garment area relative to total image
  status: 'pristine' | 'repaired' | 'severely_broken_fallback';
  diagnosticMessage: string;
}

export interface GarmentProcessOutput {
  blob: Blob;
  analysis: GarmentMaskAnalysis;
}

/**
 * Calculates perceived luminance of an RGB pixel (ITU-R BT.601)
 */
function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Analyzes the input image before segmentation to evaluate light garment risk
 */
export async function analyzeGarmentInput(imageSource: CanvasImageSource | Blob): Promise<GarmentPreAnalysis> {
  let imgElement: HTMLImageElement;
  let objectUrlToRevoke: string | null = null;

  if (imageSource instanceof Blob) {
    imgElement = new Image();
    objectUrlToRevoke = URL.createObjectURL(imageSource);
    imgElement.src = objectUrlToRevoke;
    await new Promise((res, rej) => {
      imgElement.onload = res;
      imgElement.onerror = rej;
    });
  } else {
    imgElement = imageSource as HTMLImageElement;
  }

  // Fast analysis canvas (200x200 downscale for instant speed <5ms)
  const W = 200;
  const H = 200;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    return {
      garmentLuminance: 128,
      backgroundLuminance: 128,
      contrastDelta: 50,
      isLightGarment: false,
      riskLevel: 'low',
      recommendation: 'Normal segmentation',
    };
  }

  ctx.drawImage(imgElement, 0, 0, W, H);
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;

  // 1. Sample border pixels (background)
  let bgLumSum = 0;
  let bgCount = 0;
  const borderMargin = Math.floor(W * 0.08); // 8% border

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const isBorder = x < borderMargin || x >= W - borderMargin || y < borderMargin || y >= H - borderMargin;
      if (isBorder) {
        const idx = (y * W + x) * 4;
        bgLumSum += getLuminance(data[idx], data[idx + 1], data[idx + 2]);
        bgCount++;
      }
    }
  }

  // 2. Sample center pixels (clothing candidate area)
  let centerLumSum = 0;
  let centerCount = 0;
  const cXStart = Math.floor(W * 0.25);
  const cXEnd = Math.floor(W * 0.75);
  const cYStart = Math.floor(W * 0.25);
  const cYEnd = Math.floor(W * 0.75);

  for (let y = cYStart; y < cYEnd; y++) {
    for (let x = cXStart; x < cXEnd; x++) {
      const idx = (y * W + x) * 4;
      centerLumSum += getLuminance(data[idx], data[idx + 1], data[idx + 2]);
      centerCount++;
    }
  }

  if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);

  const bgLum = bgCount > 0 ? bgLumSum / bgCount : 128;
  const centerLum = centerCount > 0 ? centerLumSum / centerCount : 128;
  const contrastDelta = Math.abs(centerLum - bgLum);
  const isLightGarment = centerLum > 185;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let recommendation = 'Segmentación estándar adecuada.';

  if (isLightGarment && contrastDelta < 35) {
    riskLevel = 'high';
    recommendation = 'Riesgo alto: prenda clara sobre fondo claro. Se aplica contraste inteligente y refuerzo de máscara.';
  } else if (isLightGarment || contrastDelta < 40) {
    riskLevel = 'medium';
    recommendation = 'Riesgo moderado: detección de bordes asistida y verificación de huecos activada.';
  }

  return {
    garmentLuminance: Math.round(centerLum),
    backgroundLuminance: Math.round(bgLum),
    contrastDelta: Math.round(contrastDelta),
    isLightGarment,
    riskLevel,
    recommendation,
  };
}

/**
 * Pre-processes high-risk light garments by applying adaptive boundary enhancement
 * to prevent the segmentation AI from dissolving light fabrics into the background.
 */
export async function enhanceLightGarmentForSegmentation(blob: Blob): Promise<Blob> {
  try {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      URL.revokeObjectURL(url);
      return blob;
    }

    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    // Subtle adaptive contrast curve (S-curve) to accentuate fabric borders
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Only gently modulate pixels in the light-mid boundary region
      if (lum > 140 && lum < 240) {
        // Boost fabric shadows/textures slightly
        const factor = 0.92;
        data[i] = Math.max(0, Math.min(255, r * factor));
        data[i + 1] = Math.max(0, Math.min(255, g * factor));
        data[i + 2] = Math.max(0, Math.min(255, b * factor));
      }
    }

    ctx.putImageData(imgData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((enhancedBlob) => {
        resolve(enhancedBlob || blob);
      }, 'image/png');
    });
  } catch (err) {
    console.warn('[GarmentAnalyzer] Preprocessing skipped due to error:', err);
    return blob;
  }
}

/**
 * Analyzes and REPAIRS segmented garment masks:
 * - Detects broken garments ("prendas rotas") with transparent interior voids
 * - Uses flood-fill from edges to distinguish true background from internal holes
 * - Restores original fabric colors into interior holes, saving white/light garments!
 */
export async function analyzeAndRepairGarment(
  segmentedBlob: Blob,
  originalBlob: Blob,
  isLightGarmentHint: boolean = false
): Promise<GarmentProcessOutput> {
  const [segImg, origImg] = await Promise.all([
    createImageFromBlob(segmentedBlob),
    createImageFromBlob(originalBlob),
  ]);

  const W = segImg.naturalWidth || segImg.width;
  const H = segImg.naturalHeight || segImg.height;

  const segCanvas = document.createElement('canvas');
  segCanvas.width = W;
  segCanvas.height = H;
  const segCtx = segCanvas.getContext('2d', { willReadFrequently: true });

  const origCanvas = document.createElement('canvas');
  origCanvas.width = W;
  origCanvas.height = H;
  const origCtx = origCanvas.getContext('2d', { willReadFrequently: true });

  if (!segCtx || !origCtx) {
    return {
      blob: segmentedBlob,
      analysis: {
        isBroken: false,
        isLightGarment: isLightGarmentHint,
        solidPixels: 0,
        internalHolesCount: 0,
        internalHolesRatio: 0,
        retainedAreaRatio: 0.5,
        status: 'pristine',
        diagnosticMessage: 'Canvas no disponible para diagnóstico.',
      },
    };
  }

  segCtx.drawImage(segImg, 0, 0);
  origCtx.drawImage(origImg, 0, 0, W, H);

  const segData = segCtx.getImageData(0, 0, W, H);
  const origData = origCtx.getImageData(0, 0, W, H);
  const sPixels = segData.data;
  const oPixels = origData.data;

  const totalPixels = W * H;
  const ALPHA_THRESHOLD = 30; // Anything below this is considered transparent

  // 1. Mark which pixels are transparent (0) vs solid (1)
  const isSolid = new Uint8Array(totalPixels);
  let solidCount = 0;

  for (let i = 0; i < totalPixels; i++) {
    const alpha = sPixels[i * 4 + 3];
    if (alpha >= ALPHA_THRESHOLD) {
      isSolid[i] = 1;
      solidCount++;
    }
  }

  // 2. Flood-fill from borders to discover genuine outer background
  // 0 = unvisited transparent, 1 = solid garment, 2 = confirmed outer background
  const maskType = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    if (isSolid[i] === 1) maskType[i] = 1;
  }

  // Queue for BFS flood fill
  // Use typed array or standard array for queue
  const queue: number[] = [];

  // Seed borders
  for (let x = 0; x < W; x++) {
    const topIdx = x;
    const botIdx = (H - 1) * W + x;
    if (maskType[topIdx] === 0) { maskType[topIdx] = 2; queue.push(topIdx); }
    if (maskType[botIdx] === 0) { maskType[botIdx] = 2; queue.push(botIdx); }
  }
  for (let y = 0; y < H; y++) {
    const leftIdx = y * W;
    const rightIdx = y * W + (W - 1);
    if (maskType[leftIdx] === 0) { maskType[leftIdx] = 2; queue.push(leftIdx); }
    if (maskType[rightIdx] === 0) { maskType[rightIdx] = 2; queue.push(rightIdx); }
  }

  // 4-way flood fill
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % W;
    const y = Math.floor(idx / W);

    // Neighbors
    if (x > 0) {
      const n = idx - 1;
      if (maskType[n] === 0) { maskType[n] = 2; queue.push(n); }
    }
    if (x < W - 1) {
      const n = idx + 1;
      if (maskType[n] === 0) { maskType[n] = 2; queue.push(n); }
    }
    if (y > 0) {
      const n = idx - W;
      if (maskType[n] === 0) { maskType[n] = 2; queue.push(n); }
    }
    if (y < H - 1) {
      const n = idx + W;
      if (maskType[n] === 0) { maskType[n] = 2; queue.push(n); }
    }
  }

  // 3. Any pixel that is NOT solid (not 1) AND NOT outer background (not 2)
  // is an INTERNAL HOLE ("prenda rota")!
  let internalHolesCount = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (maskType[i] === 0) {
      internalHolesCount++;
    }
  }

  const garmentArea = solidCount + internalHolesCount;
  const internalHolesRatio = garmentArea > 0 ? (internalHolesCount / garmentArea) * 100 : 0;
  const retainedAreaRatio = solidCount / totalPixels;

  const isBroken = internalHolesRatio > 2.5 || retainedAreaRatio < 0.08;

  let status: GarmentMaskAnalysis['status'] = 'pristine';
  let diagnosticMessage = 'Prenda segmentada limpiamente con estructura intacta.';

  // 4. AUTO-REPAIR: If interior holes detected, fill them with original garment fabric!
  if (internalHolesCount > 0) {
    for (let i = 0; i < totalPixels; i++) {
      if (maskType[i] === 0) {
        const pIdx = i * 4;
        // Restore original RGB and make it solid
        sPixels[pIdx] = oPixels[pIdx];
        sPixels[pIdx + 1] = oPixels[pIdx + 1];
        sPixels[pIdx + 2] = oPixels[pIdx + 2];
        sPixels[pIdx + 3] = 255;
      }
    }
    segCtx.putImageData(segData, 0, 0);

    status = 'repaired';
    diagnosticMessage = `Se detectaron ${internalHolesCount} píxeles de agujeros internos en la prenda (${internalHolesRatio.toFixed(1)}% del área). Se han restaurado automáticamente protegiendo el tejido original.`;
  } else if (retainedAreaRatio < 0.08) {
    status = 'severely_broken_fallback';
    diagnosticMessage = 'El borrador eliminó más del 92% de la prenda debido a bajo contraste con el fondo.';
  }

  const analysis: GarmentMaskAnalysis = {
    isBroken,
    isLightGarment: isLightGarmentHint,
    solidPixels: solidCount,
    internalHolesCount,
    internalHolesRatio: Number(internalHolesRatio.toFixed(2)),
    retainedAreaRatio: Number(retainedAreaRatio.toFixed(2)),
    status,
    diagnosticMessage,
  };

  const finalBlob = await new Promise<Blob>((resolve) => {
    segCanvas.toBlob((b) => resolve(b || segmentedBlob), 'image/png');
  });

  return {
    blob: finalBlob,
    analysis,
  };
}

function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
}
