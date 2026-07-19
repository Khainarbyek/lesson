import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  defaultSocialImage,
  getCanonicalUrl,
  getLocalizedAlternates,
  siteUrl,
  socialImageHeight,
  socialImageType,
  socialImageWidth
} from "../lib/seo";

function getJpegSize(image: Buffer) {
  let offset = 2;

  while (offset < image.length) {
    if (image[offset] !== 0xff) {
      throw new Error("Invalid JPEG marker");
    }

    const marker = image[offset + 1];
    const segmentLength = image.readUInt16BE(offset + 2);
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isStartOfFrame) {
      return {
        height: image.readUInt16BE(offset + 5),
        width: image.readUInt16BE(offset + 7)
      };
    }

    offset += 2 + segmentLength;
  }

  throw new Error("Missing JPEG size marker");
}

describe("SEO helpers", () => {
  it("uses the Netlify production URL as the site origin", () => {
    expect(siteUrl).toBe("https://uyren.netlify.app");
  });

  it("builds canonical URLs from localized paths", () => {
    expect(getCanonicalUrl("/kk/")).toBe("https://uyren.netlify.app/kk/");
    expect(getCanonicalUrl("kk/lessons/alphabet")).toBe("https://uyren.netlify.app/kk/lessons/alphabet");
  });

  it("builds locale alternates for matching localized routes", () => {
    expect(getLocalizedAlternates("/lessons/alphabet")).toEqual([
      { locale: "en", href: "https://uyren.netlify.app/en/lessons/alphabet", hrefLang: "en" },
      { locale: "ru", href: "https://uyren.netlify.app/ru/lessons/alphabet", hrefLang: "ru" },
      { locale: "kk", href: "https://uyren.netlify.app/kk/lessons/alphabet", hrefLang: "kk" }
    ]);
  });

  it("uses a 1200x630 JPEG social share image", () => {
    const jpegSignature = Buffer.from([0xff, 0xd8]);
    const socialImage = readFileSync(`${process.cwd()}/public${defaultSocialImage}`);
    const imageSize = getJpegSize(socialImage);

    expect(defaultSocialImage).toBe("/media/social/uyren-og.jpg");
    expect(socialImageType).toBe("image/jpeg");
    expect(socialImageWidth).toBe(1200);
    expect(socialImageHeight).toBe(630);
    expect(socialImage.subarray(0, 2)).toEqual(jpegSignature);
    expect(imageSize.width).toBe(socialImageWidth);
    expect(imageSize.height).toBe(socialImageHeight);
  });
});
