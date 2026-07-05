import type { LocaleCode } from "./locales";

export type TraceOcrTarget = { kind: "number" } | { kind: "letter"; locale: LocaleCode };

export type TraceOcrConfig = {
  languages: string[];
  whitelist: string;
  pageSegMode: "single_word" | "single_char";
  minConfidence: number;
  locale?: LocaleCode;
};

export type OcrTraceScore = {
  passed: boolean;
  recognizedText: string;
  confidence: number;
};

type TesseractWorker = {
  recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string; confidence: number } }>;
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  terminate: () => Promise<unknown>;
};

type TesseractRuntime = {
  createWorker: (languages: string | string[]) => Promise<TesseractWorker>;
  PSM: Record<"SINGLE_WORD" | "SINGLE_CHAR", string>;
};

type TesseractImport = Partial<TesseractRuntime> & {
  default?: TesseractRuntime;
};

const DIGIT_WHITELIST = "0123456789";
const ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const RUSSIAN_LETTERS = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
const KAZAKH_LETTERS = "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ";

const workerPromises = new Map<string, Promise<TesseractWorker>>();

function getConfigKey(config: TraceOcrConfig) {
  return `${config.languages.join("+")}:${config.whitelist}:${config.pageSegMode}`;
}

function getPageSegModeName(config: TraceOcrConfig) {
  return config.pageSegMode === "single_char" ? "SINGLE_CHAR" : "SINGLE_WORD";
}

async function loadTesseractRuntime() {
  const runtime = (await import("tesseract.js")) as unknown as TesseractImport;

  if (runtime.createWorker && runtime.PSM) {
    return runtime as TesseractRuntime;
  }

  return runtime.default;
}

export function getTraceOcrConfig(target: TraceOcrTarget): TraceOcrConfig {
  if (target.kind === "number") {
    return {
      languages: ["eng"],
      whitelist: DIGIT_WHITELIST,
      pageSegMode: "single_word",
      minConfidence: 45
    };
  }

  if (target.locale === "kk") {
    return {
      languages: ["kaz"],
      whitelist: KAZAKH_LETTERS,
      pageSegMode: "single_char",
      minConfidence: 50,
      locale: target.locale
    };
  }

  if (target.locale === "ru") {
    return {
      languages: ["rus"],
      whitelist: RUSSIAN_LETTERS,
      pageSegMode: "single_char",
      minConfidence: 50,
      locale: target.locale
    };
  }

  return {
    languages: ["eng"],
    whitelist: ENGLISH_LETTERS,
    pageSegMode: "single_char",
    minConfidence: 50,
    locale: target.locale
  };
}

export function normalizeOcrText(text: string, config: TraceOcrConfig) {
  const uppercaseText = text.normalize("NFC").toLocaleUpperCase(config.locale ?? "en");
  const allowedCharacters = new Set(Array.from(config.whitelist));

  return Array.from(uppercaseText)
    .filter((character) => allowedCharacters.has(character))
    .join("");
}

export function evaluateOcrTrace(
  expectedValue: string,
  recognizedText: string,
  confidence: number,
  config: TraceOcrConfig,
  minConfidence = config.minConfidence
): OcrTraceScore {
  const normalizedExpected = normalizeOcrText(expectedValue, config);
  const normalizedRecognized = normalizeOcrText(recognizedText, config);

  return {
    passed: normalizedExpected.length > 0 && normalizedRecognized === normalizedExpected && confidence >= minConfidence,
    recognizedText: normalizedRecognized,
    confidence
  };
}

export async function warmUpOcrWorker(config: TraceOcrConfig) {
  const key = getConfigKey(config);
  const existingWorker = workerPromises.get(key);

  if (existingWorker) {
    return existingWorker;
  }

  const workerPromise = loadTesseractRuntime().then(async (runtime) => {
    if (!runtime) {
      throw new Error("Tesseract.js runtime did not load.");
    }

    const worker = await runtime.createWorker(config.languages);

    await worker.setParameters({
      tessedit_char_whitelist: config.whitelist,
      tessedit_pageseg_mode: runtime.PSM[getPageSegModeName(config)],
      user_defined_dpi: "300"
    });

    return worker;
  });

  workerPromises.set(key, workerPromise);
  return workerPromise;
}

function createNormalizedTraceCanvas(canvas: HTMLCanvasElement, padding = 20, scale = 4) {
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 40) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = Math.max(1, cropWidth * scale);
  outputCanvas.height = Math.max(1, cropHeight * scale);

  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    return null;
  }

  outputContext.fillStyle = "white";
  outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputContext.imageSmoothingEnabled = true;
  outputContext.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, outputCanvas.width, outputCanvas.height);

  const normalizedData = outputContext.getImageData(0, 0, outputCanvas.width, outputCanvas.height);

  for (let index = 0; index < normalizedData.data.length; index += 4) {
    const red = normalizedData.data[index];
    const green = normalizedData.data[index + 1];
    const blue = normalizedData.data[index + 2];
    const alpha = normalizedData.data[index + 3];
    const isInk = alpha > 30 && (red < 245 || green < 245 || blue < 245);
    const value = isInk ? 0 : 255;

    normalizedData.data[index] = value;
    normalizedData.data[index + 1] = value;
    normalizedData.data[index + 2] = value;
    normalizedData.data[index + 3] = 255;
  }

  outputContext.putImageData(normalizedData, 0, 0);

  return outputCanvas;
}

export async function scoreTraceByOCR(drawingCanvas: HTMLCanvasElement, expectedValue: string, config: TraceOcrConfig) {
  const processedCanvas = createNormalizedTraceCanvas(drawingCanvas);

  if (!processedCanvas) {
    return {
      passed: false,
      recognizedText: "",
      confidence: 0
    };
  }

  const worker = await warmUpOcrWorker(config);
  const { data } = await worker.recognize(processedCanvas);

  return evaluateOcrTrace(expectedValue, data.text, data.confidence, config);
}

export async function terminateOcrWorkers() {
  const workers = Array.from(workerPromises.values());
  workerPromises.clear();
  await Promise.all(workers.map(async (workerPromise) => (await workerPromise).terminate()));
}
