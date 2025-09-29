import * as cheerio from "cheerio";
import { createHash } from "crypto";

export const getHtml = async (url: string) => {
  const response = await fetch(url);
  return cheerio.load(await response.text());
};

export const sha256Hex = (input: string): string => {
  return createHash("sha256").update(input, "utf8").digest("hex");
};

// simple base62 encoder for a Uint8Array (keeps full entropy)
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const toBase62 = (buffer: Buffer): string => {
  // convert buffer to BigInt then base62 encode (preserves full bits)
  let n = BigInt("0x" + buffer.toString("hex"));
  if (n === 0n) return "0";
  let s = "";
  while (n > 0n) {
    const rem = Number(n % 62n);
    s = BASE62[rem] + s;
    n = n / 62n;
  }
  return s;
};

export const sha256Base62 = (input: string): string => {
  const hash = createHash("sha256").update(input, "utf8").digest(); // Buffer
  return toBase62(hash);
};

// remove extra spaces and newlines
export const cleanText = (text: string): string => {
  return text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
};

// idle wait
export const waitFor = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};
