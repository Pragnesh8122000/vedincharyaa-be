import { Request, Response } from "express";
import { MemorizationProgress } from "../models/MemorizationProgress";
import { HTTP_CODES } from "../common/httpCodes";
import { findShlokResiliently } from "../utils/shlokLoader";

// Helper for Leitner System intervals (in days)
const BOX_INTERVALS: { [key: number]: number } = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export const getDueShloks = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Find progress records where nextReviewDate is <= now
    const dueProgress = await MemorizationProgress.find({
      userId: userId,
      nextReviewDate: { $lte: now },
    });

    // Fetch the actual Shlok details from DB/Online
    const dueShlokPromises = dueProgress.map(async (p: any) => {
      const shlok = await findShlokResiliently(p.chapterNumber, p.verseNumber);
      if (!shlok) return null;
      return {
        ...(shlok.toObject ? shlok.toObject() : shlok),
        progress: p,
      };
    });

    const dueShloks = (await Promise.all(dueShlokPromises)).filter(
      (item) => item !== null
    );

    res.sendResponse(
      true,
      HTTP_CODES.OK,
      "MEMORIZATION_DUE_FETCHED",
      dueShloks
    );
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "MEMORIZATION_DUE_ERROR",
      error
    );
  }
};

export const getAllProgress = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const progress = await MemorizationProgress.find({ userId });
    res.sendResponse(
      true,
      HTTP_CODES.OK,
      "MEMORIZATION_PROGRESS_FETCHED",
      progress
    );
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "MEMORIZATION_PROGRESS_ERROR",
      error
    );
  }
};

export const updateProgress = async (req: any, res: Response) => {
  try {
    const { chapterNumber, verseNumber, isCorrect } = req.body;
    const userId = req.user.id;
    const shlokId = `${chapterNumber}-${verseNumber}`;

    let progress = await MemorizationProgress.findOne({
      userId,
      shlokId,
    });

    if (!progress) {
      // New interaction
      progress = new MemorizationProgress({
        userId,
        shlokId,
        chapterNumber,
        verseNumber,
        box: 1,
        lastReviewed: new Date(),
        nextReviewDate: new Date(), // Will be updated below
      });
    }

    if (isCorrect) {
      // Move to next box
      progress.box = Math.min(progress.box + 1, 5);
    } else {
      // Reset to box 1
      progress.box = 1;
    }

    const daysToAdd = BOX_INTERVALS[progress.box] || 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    progress.lastReviewed = new Date();
    progress.nextReviewDate = nextDate;

    await progress.save();

    res.sendResponse(true, HTTP_CODES.OK, "MEMORIZATION_UPDATED", { progress });
  } catch (error) {
    console.error(error);
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "MEMORIZATION_UPDATE_ERROR",
      error
    );
  }
};

export const initializeProgress = async (req: any, res: Response) => {
  try {
    const { chapterNumber, verseNumber } = req.body;
    const userId = req.user.id;
    const shlokId = `${chapterNumber}-${verseNumber}`;

    // Check if exists
    const exists = await MemorizationProgress.findOne({ userId, shlokId });
    if (exists) {
      return res.sendResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        "MEMORIZATION_EXISTS"
      );
    }

    const progress = new MemorizationProgress({
      userId,
      shlokId,
      chapterNumber,
      verseNumber,
      box: 1,
      nextReviewDate: new Date(), // Due immediately
      lastReviewed: new Date(),
    });

    await progress.save();
    res.sendResponse(
      true,
      HTTP_CODES.CREATED,
      "MEMORIZATION_INITIALIZED",
      progress
    );
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "MEMORIZATION_INIT_ERROR",
      error
    );
  }
};

export const removeProgress = async (req: any, res: Response) => {
  try {
    const { chapterNumber, verseNumber } = req.body;
    const userId = req.user.id;
    const shlokId = `${chapterNumber}-${verseNumber}`;

    await MemorizationProgress.findOneAndDelete({ userId, shlokId });
    res.sendResponse(true, HTTP_CODES.OK, "MEMORIZATION_REMOVED");
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "MEMORIZATION_REMOVE_ERROR",
      error
    );
  }
};
