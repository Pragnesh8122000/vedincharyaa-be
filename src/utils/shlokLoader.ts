import fs from "fs";
import path from "path";
import ShlokModel from "../models/shlokModel";

const SHLOKS_FILE = path.join(__dirname, "../data/gita-shloks.json");
let jsonShloksCache: any[] | null = null;

/**
 * Loads shloks from the local JSON file.
 */
function getJsonShloks() {
  if (jsonShloksCache) return jsonShloksCache;

  if (fs.existsSync(SHLOKS_FILE)) {
    jsonShloksCache = JSON.parse(fs.readFileSync(SHLOKS_FILE, "utf-8"));
    return jsonShloksCache;
  }
  return [];
}

/**
 * Finds a shlok by chapter and verse numbers.
 * Checks DB first, falls back to JSON, and syncs JSON to DB if missing.
 */
export async function findShlokResiliently(
  chapterNumber: number,
  verseNumber: number
) {
  // 1. Check MongoDB
  let shlok = await ShlokModel.findOne({ chapterNumber, verseNumber });
  if (shlok) return shlok;

  // 2. Fallback to JSON
  const jsonShloks = getJsonShloks();
  const shlokFromJson = jsonShloks?.find(
    (s: any) =>
      s.chapterNumber === chapterNumber && s.verseNumber === verseNumber
  );

  if (shlokFromJson) {
    // 3. JIT Sync: Save to DB in background so it's there next time
    try {
      shlok = await ShlokModel.create(shlokFromJson);
    } catch (e) {
      // Ignore unique constraint errors if concurrent requests happen
      shlok = await ShlokModel.findOne({ chapterNumber, verseNumber });
    }
    return shlok;
  }

  return null;
}
