export type TracePoint = {
  x: number;
  y: number;
};

export type TraceStroke = TracePoint[];

export type NumberTraceScore = {
  passed: boolean;
  averageDigitCoverage: number;
  digitCoverages: number[];
  digitMistakeCoverages: number[];
  sampledPointCount: number;
};

type ZoneKey = "top" | "middle" | "bottom" | "upperLeft" | "upperRight" | "lowerLeft" | "lowerRight" | "centerUpper" | "centerMiddle" | "centerLower";

const digitZones: Record<string, ZoneKey[]> = {
  "0": ["top", "upperLeft", "upperRight", "lowerLeft", "lowerRight", "bottom"],
  "1": ["centerUpper", "centerMiddle", "centerLower"],
  "2": ["top", "upperRight", "middle", "lowerLeft", "bottom"],
  "3": ["top", "upperRight", "middle", "lowerRight", "bottom"],
  "4": ["upperLeft", "upperRight", "middle", "lowerRight"],
  "5": ["top", "upperLeft", "middle", "lowerRight", "bottom"],
  "6": ["top", "upperLeft", "middle", "lowerLeft", "lowerRight", "bottom"],
  "7": ["top", "upperRight", "centerMiddle", "lowerRight"],
  "8": ["top", "upperLeft", "upperRight", "middle", "lowerLeft", "lowerRight", "bottom"],
  "9": ["top", "upperLeft", "upperRight", "middle", "lowerRight", "bottom"]
};

const digitForbiddenZones: Record<string, ZoneKey[]> = {
  "0": ["middle"],
  "1": ["upperLeft", "lowerLeft"],
  "2": ["upperLeft", "lowerRight"],
  "3": ["upperLeft", "lowerLeft"],
  "4": ["top", "bottom", "lowerLeft"],
  "5": ["upperRight", "lowerLeft"],
  "6": ["upperRight"],
  "7": ["upperLeft", "middle", "lowerLeft", "bottom"],
  "8": [],
  "9": ["lowerLeft"]
};

const zonePositions: Record<ZoneKey, { x: number; y: number }> = {
  top: { x: 0.5, y: 0.12 },
  middle: { x: 0.5, y: 0.5 },
  bottom: { x: 0.5, y: 0.88 },
  upperLeft: { x: 0.22, y: 0.3 },
  upperRight: { x: 0.78, y: 0.3 },
  lowerLeft: { x: 0.22, y: 0.7 },
  lowerRight: { x: 0.78, y: 0.7 },
  centerUpper: { x: 0.62, y: 0.2 },
  centerMiddle: { x: 0.62, y: 0.5 },
  centerLower: { x: 0.62, y: 0.8 }
};

function sampleStroke(stroke: TraceStroke) {
  if (stroke.length === 0) {
    return [];
  }

  const samples: TracePoint[] = [stroke[0]];

  for (let index = 1; index < stroke.length; index += 1) {
    const previous = stroke[index - 1];
    const current = stroke[index];
    const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
    const stepCount = Math.max(1, Math.ceil(distance / 10));

    for (let step = 1; step <= stepCount; step += 1) {
      const progress = step / stepCount;
      samples.push({
        x: previous.x + (current.x - previous.x) * progress,
        y: previous.y + (current.y - previous.y) * progress
      });
    }
  }

  return samples;
}

function getDigitBox(index: number, count: number, canvasWidth: number, canvasHeight: number) {
  const digitHeight = canvasHeight * 0.72;
  const digitWidth = Math.min(canvasHeight * 0.55, (canvasWidth * 0.78) / count);
  const totalWidth = digitWidth * count;
  const left = (canvasWidth - totalWidth) / 2 + digitWidth * index;
  const top = (canvasHeight - digitHeight) / 2;

  return {
    left,
    top,
    width: digitWidth,
    height: digitHeight
  };
}

function getZonePoint(zone: ZoneKey, box: ReturnType<typeof getDigitBox>) {
  const position = zonePositions[zone];

  return {
    x: box.left + box.width * position.x,
    y: box.top + box.height * position.y
  };
}

function isZoneCovered(zonePoint: TracePoint, samples: TracePoint[], radius: number) {
  return samples.some((point) => Math.hypot(point.x - zonePoint.x, point.y - zonePoint.y) <= radius);
}

function getZoneCoveredPointCount(zonePoint: TracePoint, samples: TracePoint[], radius: number) {
  return samples.filter((point) => Math.hypot(point.x - zonePoint.x, point.y - zonePoint.y) <= radius).length;
}

function getDigitSamples(samples: TracePoint[], box: ReturnType<typeof getDigitBox>) {
  const horizontalMargin = box.width * 0.18;
  const verticalMargin = box.height * 0.12;

  return samples.filter(
    (point) =>
      point.x >= box.left - horizontalMargin &&
      point.x <= box.left + box.width + horizontalMargin &&
      point.y >= box.top - verticalMargin &&
      point.y <= box.top + box.height + verticalMargin
  );
}

export function scoreNumberTrace(value: number | string, strokes: TraceStroke[], canvasWidth: number, canvasHeight: number): NumberTraceScore {
  const digits = String(value).split("");
  const samples = strokes.flatMap(sampleStroke);

  if (samples.length === 0 || digits.length === 0) {
    return {
      passed: false,
      averageDigitCoverage: 0,
      digitCoverages: digits.map(() => 0),
      digitMistakeCoverages: digits.map(() => 0),
      sampledPointCount: samples.length
    };
  }

  const digitScores = digits.map((digit, index) => {
    const zones = digitZones[digit] ?? [];
    const forbiddenZones = digitForbiddenZones[digit] ?? [];
    const box = getDigitBox(index, digits.length, canvasWidth, canvasHeight);
    const radius = Math.min(box.width, box.height) * 0.23;
    const digitSamples = getDigitSamples(samples, box);
    const coveredZones = zones.filter((zone) => isZoneCovered(getZonePoint(zone, box), digitSamples, radius));
    const forbiddenPointCount = forbiddenZones.reduce(
      (total, zone) => total + getZoneCoveredPointCount(getZonePoint(zone, box), digitSamples, radius * 0.85),
      0
    );

    return {
      coverage: zones.length === 0 ? 0 : coveredZones.length / zones.length,
      mistakeCoverage: digitSamples.length === 0 ? 0 : forbiddenPointCount / digitSamples.length
    };
  });

  const digitCoverages = digitScores.map((score) => score.coverage);
  const digitMistakeCoverages = digitScores.map((score) => score.mistakeCoverage);
  const averageDigitCoverage = digitCoverages.reduce((sum, coverage) => sum + coverage, 0) / digitCoverages.length;
  const passed =
    samples.length >= 8 &&
    digitCoverages.every((coverage) => coverage >= 0.58) &&
    digitMistakeCoverages.every((coverage) => coverage <= 0.1) &&
    averageDigitCoverage >= 0.65;

  return {
    passed,
    averageDigitCoverage,
    digitCoverages,
    digitMistakeCoverages,
    sampledPointCount: samples.length
  };
}
