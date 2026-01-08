import { Request, Response } from "express";
import ShlokModel from "../models/shlokModel";
import { HTTP_CODES } from "../common/httpCodes";
import { findShlokResiliently } from "../utils/shlokLoader";

const AUDIO_BASE_URL =
  process.env.AUDIO_BASE_URL || "https://everyday-gita-audio.b-cdn.net";

const addAudioUrl = (shlok: any) => {
  const s = shlok.toObject ? shlok.toObject() : shlok;
  return {
    ...s,
    audioUrl: `${AUDIO_BASE_URL}/chapter-${s.chapterNumber}-verse-${s.verseNumber}.mp3`,
  };
};

export const getShloks = async (req: Request, res: Response) => {
  try {
    const {
      chapterNumber,
      chapterNumbers,
      tags,
      search,
      page = 1,
      limit = 20,
    } = req.query;
    const query: any = {};

    if (chapterNumber) {
      query.chapterNumber = Number(chapterNumber);
    }

    if (chapterNumbers) {
      const chapters = String(chapterNumbers).split(",").map(Number);
      query.chapterNumber = { $in: chapters };
    }

    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((t) => t.trim().toLowerCase());
      query.tags = { $in: tagList };
    }

    if (search) {
      const searchQuery = String(search).toLowerCase();
      query.$or = [
        { sanskritText: { $regex: searchQuery, $options: "i" } },
        { translationEnglish: { $regex: searchQuery, $options: "i" } },
        { translationHindi: { $regex: searchQuery, $options: "i" } },
        { transliteration: { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [results, total] = await Promise.all([
      ShlokModel.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ chapterNumber: 1, verseNumber: 1 }),
      ShlokModel.countDocuments(query),
    ]);

    const paginatedResults = results.map(addAudioUrl);
    const hasMore = skip + results.length < total;
    const nextPage = hasMore ? pageNum + 1 : null;

    res.sendResponse(true, HTTP_CODES.OK, "SHLOKS_FETCHED", {
      items: paginatedResults,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        hasMore,
        nextPage,
      },
    });
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "SHLOKS_FETCHED_ERROR",
      error
    );
  }
};

export const getShlokById = async (req: Request, res: Response) => {
  try {
    const { chapter, verse } = req.params;
    const shlok = await findShlokResiliently(Number(chapter), Number(verse));

    if (!shlok) {
      return res.sendResponse(false, HTTP_CODES.NOT_FOUND, "SHLOK_NOT_FOUND");
    }

    res.sendResponse(true, HTTP_CODES.OK, "SHLOK_FETCHED", addAudioUrl(shlok));
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "SHLOK_FETCHED_ERROR",
      error
    );
  }
};
