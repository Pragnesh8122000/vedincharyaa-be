import mongoose, { Document, Schema } from "mongoose";

export interface IChapter extends Document {
  chapterNumber: number;
  chapterName: string;
  translation: string;
  nameMeaning: {
    en: string;
    hi: string;
  };
  summary: {
    en: string;
    hi: string;
  };
  verseCount: number;
}

const chapterSchema: Schema = new Schema(
  {
    chapterNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    chapterName: {
      type: String,
      required: true,
    },
    translation: {
      type: String,
      required: true,
    },
    nameMeaning: {
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    summary: {
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    verseCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ChapterModel = mongoose.model<IChapter>("Chapter", chapterSchema);
export default ChapterModel;
