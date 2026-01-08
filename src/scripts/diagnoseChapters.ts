import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const ChapterModel = mongoose.model(
  "Chapter",
  new mongoose.Schema({
    chapterNumber: Number,
    chapterName: String,
    translation: String,
    nameMeaning: { en: String, hi: String },
    summary: { en: String, hi: String },
    verseCount: Number,
  })
);

async function diagnose() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected.");

    console.log("Fetching from Vedic API...");
    const res = await axios.get("https://vedicscriptures.github.io/chapters");
    console.log(`API Status: ${res.status}`);
    console.log(`Data Type: ${typeof res.data}`);

    if (Array.isArray(res.data)) {
      console.log(`Found ${res.data.length} chapters.`);
      const mapped = res.data.map((c: any) => ({
        chapterNumber: c.chapter_number,
        chapterName: c.name,
        translation: c.translation,
        nameMeaning: { en: c.meaning?.en || "", hi: c.meaning?.hi || "" },
        summary: { en: c.summary?.en || "", hi: c.summary?.hi || "" },
        verseCount: c.verses_count,
      }));

      console.log(
        "Sample of first chapter:",
        JSON.stringify(mapped[0], null, 2)
      );

      for (const chapter of mapped) {
        await ChapterModel.findOneAndUpdate(
          { chapterNumber: chapter.chapterNumber },
          { $set: chapter },
          { upsert: true }
        );
      }
      console.log("Done syncing.");
    } else {
      console.error("Data is not an array:", res.data);
    }
  } catch (err: any) {
    console.error("Diagnosis failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

diagnose();
