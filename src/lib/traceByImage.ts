// traceByImage.ts

export type ImageTraceScore = {
  passed: boolean;
  coverage: number;
  overshoot: number;
};

function getMask(imageData: ImageData, isInk: (a: number) => boolean): Uint8Array {
  const { width, height, data } = imageData;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = isInk(data[i * 4 + 3]) ? 1 : 0;
  }
  return mask;
}

function dilateMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return mask;
  const horizontal = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const xMin = Math.max(0, x - radius);
      const xMax = Math.min(width - 1, x + radius);
      let found = 0;
      for (let xx = xMin; xx <= xMax; xx++) {
        if (mask[rowOffset + xx]) { found = 1; break; }
      }
      horizontal[rowOffset + x] = found;
    }
  }
  const result = new Uint8Array(width * height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const yMin = Math.max(0, y - radius);
      const yMax = Math.min(height - 1, y + radius);
      let found = 0;
      for (let yy = yMin; yy <= yMax; yy++) {
        if (horizontal[yy * width + x]) { found = 1; break; }
      }
      result[y * width + x] = found;
    }
  }
  return result;
}

export function scoreTraceByImage(
  drawingCanvas: HTMLCanvasElement,
  referenceElement: HTMLElement,
  value: string,
  options?: { toleranceRadius?: number; minCoverage?: number; maxOvershoot?: number }
): ImageTraceScore {
  const width = drawingCanvas.width;
  const height = drawingCanvas.height;
  const toleranceRadius = options?.toleranceRadius ?? 16;
  const minCoverage = options?.minCoverage ?? 0.75;
  const maxOvershoot = options?.maxOvershoot ?? 0.35;

  // маска нарисованного (сразу с реального canvas, без ресэмплинга точек)
  const drawCtx = drawingCanvas.getContext('2d')!;
  const drawnMask = getMask(drawCtx.getImageData(0, 0, width, height), (a) => a > 40);

  // маска эталона — тем же шрифтом, что и видимый серый placeholder
  const computed = window.getComputedStyle(referenceElement);
  const refCanvas = document.createElement('canvas');
  refCanvas.width = width;
  refCanvas.height = height;
  const refCtx = refCanvas.getContext('2d')!;
  refCtx.fillStyle = '#000';
  refCtx.textAlign = 'center';
  refCtx.textBaseline = 'middle';
  refCtx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
  refCtx.fillText(value, width / 2, height / 2);
  const refMask = getMask(refCtx.getImageData(0, 0, width, height), (a) => a > 40);

  const refDilated = dilateMask(refMask, width, height, toleranceRadius);
  const drawnDilated = dilateMask(drawnMask, width, height, toleranceRadius);

  let refInk = 0, refCovered = 0;
  for (let i = 0; i < refMask.length; i++) {
    if (refMask[i]) {
      refInk++;
      if (drawnDilated[i]) refCovered++;
    }
  }
  const coverage = refInk === 0 ? 0 : refCovered / refInk;

  let drawnInk = 0, drawnOutside = 0;
  for (let i = 0; i < drawnMask.length; i++) {
    if (drawnMask[i]) {
      drawnInk++;
      if (!refDilated[i]) drawnOutside++;
    }
  }
  const overshoot = drawnInk === 0 ? 0 : drawnOutside / drawnInk;

  return { passed: coverage >= minCoverage && overshoot <= maxOvershoot, coverage, overshoot };
}