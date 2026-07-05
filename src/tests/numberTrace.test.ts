import { describe, expect, it } from "vitest";
import { scoreNumberTrace, type TraceStroke } from "../lib/numberTrace";

describe("scoreNumberTrace", () => {
  it("passes when each digit in a multi-digit number is traced", () => {
    const strokes: TraceStroke[] = [
      [
        { x: 150, y: 60 },
        { x: 225, y: 60 },
        { x: 230, y: 100 },
        { x: 190, y: 130 },
        { x: 150, y: 200 },
        { x: 225, y: 205 }
      ],
      [
        { x: 350, y: 60 },
        { x: 350, y: 205 }
      ]
    ];

    expect(scoreNumberTrace(21, strokes, 520, 260).passed).toBe(true);
  });

  it("fails when only one digit in a multi-digit number is traced", () => {
    const strokes: TraceStroke[] = [
      [
        { x: 350, y: 60 },
        { x: 350, y: 205 }
      ]
    ];

    expect(scoreNumberTrace(21, strokes, 520, 260).passed).toBe(false);
  });

  it("fails when the drawing is away from the expected digit shape", () => {
    const strokes: TraceStroke[] = [
      [
        { x: 20, y: 20 },
        { x: 45, y: 40 },
        { x: 70, y: 25 }
      ]
    ];

    expect(scoreNumberTrace(7, strokes, 520, 260).passed).toBe(false);
  });

  it("fails when the traced shape is a different number with shared zones", () => {
    const strokes: TraceStroke[] = [
      [
        { x: 188, y: 60 },
        { x: 150, y: 92 },
        { x: 150, y: 130 },
        { x: 150, y: 168 },
        { x: 188, y: 205 },
        { x: 228, y: 168 }
      ],
      [
        { x: 332, y: 60 },
        { x: 372, y: 92 },
        { x: 332, y: 130 },
        { x: 292, y: 168 },
        { x: 332, y: 205 }
      ]
    ];

    expect(scoreNumberTrace(51, strokes, 520, 260).passed).toBe(false);
  });

  it("passes when the expected 51 shape is traced", () => {
    const strokes: TraceStroke[] = [
      [
        { x: 188, y: 60 },
        { x: 150, y: 92 },
        { x: 188, y: 130 },
        { x: 228, y: 168 },
        { x: 188, y: 205 }
      ],
      [
        { x: 350, y: 60 },
        { x: 350, y: 205 }
      ]
    ];

    expect(scoreNumberTrace(51, strokes, 520, 260).passed).toBe(true);
  });

  it("passes when the expected shape has a small accidental mark under the ten percent tolerance", () => {
    const strokes: TraceStroke[] = [
      [
        { x: 188, y: 60 },
        { x: 150, y: 92 },
        { x: 188, y: 130 },
        { x: 228, y: 168 },
        { x: 188, y: 205 }
      ],
      [
        { x: 350, y: 60 },
        { x: 350, y: 205 }
      ],
      [
        { x: 148, y: 168 },
        { x: 150, y: 170 }
      ]
    ];

    expect(scoreNumberTrace(51, strokes, 520, 260).passed).toBe(true);
  });
});
