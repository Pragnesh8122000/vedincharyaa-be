import axios from "axios";
import ShlokModel from "../models/shlokModel";
import ChapterModel from "../models/chapterModel";

const BASE_URL = "https://vedicscriptures.github.io";

const axiosInstance = axios.create({
  timeout: 10000,
});

/**
 * Finds a shlok by chapter and verse numbers.
 * Checks DB first, falls back to Online, and syncs to DB if found.
 */
export async function findShlokResiliently(
  chapterNumber: number,
  verseNumber: number
) {
  try {
    // 1. Check MongoDB
    let shlok = await ShlokModel.findOne({ chapterNumber, verseNumber });
    if (shlok) return shlok;

    console.log(
      `Shlok ${chapterNumber}.${verseNumber} not found in DB. Fetching from Online...`
    );

    // 2. Fallback to Online
    const response = await axiosInstance.get(
      `${BASE_URL}/slok/${chapterNumber}/${verseNumber}`
    );
    const data = response.data;

    const shlokData = {
      chapterNumber: data.chapter,
      verseNumber: data.verse,
      sanskritText: data.slok,
      transliteration: data.transliteration,
      translationEnglish: data.siva?.et || data.purohit?.et || "",
      translationHindi: data.chinmay?.hc || "",
      meaningEnglish: data.gambir?.et || "",
      meaningHindi: data.rams?.ht || "",
      tags: [],
    };

    // 3. JIT Sync: Save to DB
    try {
      shlok = await ShlokModel.create(shlokData);
      console.log(`Synced Shlok ${chapterNumber}.${verseNumber} to DB.`);
    } catch (e) {
      // In case of race condition
      shlok = await ShlokModel.findOne({ chapterNumber, verseNumber });
    }
    return shlok;
  } catch (error: any) {
    console.error(
      `Error fetching shlok ${chapterNumber}.${verseNumber}:`,
      error.message
    );
    return null;
  }
}

/**
 * Finds all chapters.
 * Checks DB first, falls back to Online, and syncs to DB if found.
 */
export async function findChaptersResiliently() {
  try {
    // 1. Check MongoDB
    let chapters = await ChapterModel.find().sort({ chapterNumber: 1 });

    // Bhagavad Gita has 18 chapters.
    if (chapters.length >= 18) {
      return chapters;
    }

    console.log(
      `Chapters found in DB: ${chapters.length}. Fetching from Online...`
    );

    // 2. Fallback to Online
    const response = await axiosInstance.get(`${BASE_URL}/chapters`);
    const data = response.data;

    if (!Array.isArray(data)) {
      console.error("Unexpected response format from chapters API:", data);
      return chapters;
    }

    const chaptersData = data.map((c: any) => ({
      chapterNumber: c.chapter_number,
      chapterName: c.name,
      translation: c.translation,
      nameMeaning: {
        en: c.meaning?.en || "",
        hi: c.meaning?.hi || "",
      },
      summary: {
        en: c.summary?.en || "",
        hi: c.summary?.hi || "",
      },
      verseCount: c.verses_count,
    }));

    // 3. JIT Sync
    console.log(`Updating ${chaptersData.length} chapters in DB...`);
    for (const chapter of chaptersData) {
      await ChapterModel.findOneAndUpdate(
        { chapterNumber: chapter.chapterNumber },
        { $set: chapter },
        { upsert: true }
      );
    }

    // Return fresh list from DB
    return await ChapterModel.find().sort({ chapterNumber: 1 });
  } catch (error: any) {
    console.error("Error in findChaptersResiliently:", error.message);
    // Return whatever we have in DB
    return await ChapterModel.find().sort({ chapterNumber: 1 });
  }
}

/**
 * Finds a single chapter by number.
 */
export async function findChapterResiliently(chapterNumber: number) {
  try {
    let chapter = await ChapterModel.findOne({ chapterNumber });
    if (chapter) return chapter;

    console.log(
      `Chapter ${chapterNumber} not found in DB. Triggering resilient fetch...`
    );
    const allChapters = await findChaptersResiliently();
    return (
      allChapters.find((c: any) => c.chapterNumber === chapterNumber) || null
    );
  } catch (error: any) {
    console.error(`Error finding chapter ${chapterNumber}:`, error.message);
    return null;
  }
}
