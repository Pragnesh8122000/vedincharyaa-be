import { Request, Response } from "express";
import HistoryModel from "../models/History";
import { HTTP_CODES } from "../common/httpCodes";
import { findShlokResiliently } from "../utils/shlokLoader";

export const getHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    // Get last 20 history items
    const historyItems = await HistoryModel.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(20);

    const historyShlokPromises = historyItems.map(async (item) => {
      const [chapter, verse] = item.shlokId.split("-");
      const shlok = await findShlokResiliently(Number(chapter), Number(verse));
      if (!shlok) return null;

      return {
        ...(shlok.toObject ? shlok.toObject() : shlok),
        viewedAt: item.viewedAt,
      };
    });

    const historyShloks = (await Promise.all(historyShlokPromises)).filter(
      (s) => s !== null
    );

    res.sendResponse(true, HTTP_CODES.OK, "HISTORY_FETCHED", historyShloks);
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "HISTORY_FETCH_ERROR",
      error
    );
  }
};

export const addHistory = async (req: any, res: Response) => {
  try {
    const { shlokId } = req.body;
    const userId = req.user.id;

    if (!shlokId) {
      return res.sendResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        "SHLOK_ID_REQUIRED"
      );
    }

    // Update or create history entry
    await HistoryModel.findOneAndUpdate(
      { userId, shlokId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.sendResponse(true, HTTP_CODES.OK, "HISTORY_ADDED");
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "HISTORY_ADD_ERROR",
      error
    );
  }
};
