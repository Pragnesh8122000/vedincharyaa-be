import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import ShlokModel from "../models/shlokModel";

dotenv.config();

const SHLOKS_FILE = path.join(__dirname, "../data/gita-shloks.json");

const syncShloks = async () => {
  try {
    if (!fs.existsSync(SHLOKS_FILE)) {
      console.error("Error: gita-shloks.json not found in src/data/");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB Connected");

    console.log("Reading shloks from JSON...");
    const shloks = JSON.parse(fs.readFileSync(SHLOKS_FILE, "utf-8"));
    console.log(`Found ${shloks.length} shloks in JSON.`);

    console.log("Syncing shloks to DB (this may take a moment)...");

    let syncedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < shloks.length; i += batchSize) {
      const batch = shloks.slice(i, i + batchSize);

      const operations = batch.map((s: any) => ({
        updateOne: {
          filter: {
            chapterNumber: s.chapterNumber,
            verseNumber: s.verseNumber,
          },
          update: { $set: s },
          upsert: true,
        },
      }));

      await ShlokModel.bulkWrite(operations);
      syncedCount += batch.length;
      console.log(`Synced ${syncedCount}/${shloks.length} shloks...`);
    }

    console.log("SUCCESS: All shloks synced to Database.");
    process.exit(0);
  } catch (error) {
    console.error("Sync Error:", error);
    process.exit(1);
  }
};

syncShloks();
