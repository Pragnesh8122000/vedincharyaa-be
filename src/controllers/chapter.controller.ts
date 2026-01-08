import { Request, Response } from "express";
import { HTTP_CODES } from "../common/httpCodes";
import { findChaptersResiliently } from "../utils/shlokLoader";

export const getChapters = async (req: Request, res: Response) => {
  try {
    const mappedChapters = await findChaptersResiliently();
    res.sendResponse(true, HTTP_CODES.OK, "CHAPTERS_FETCHED", mappedChapters);
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "CHAPTERS_FETCH_ERROR",
      error
    );
  }
};

export const getChapterVerses = (req: Request, res: Response) => {
  // This can be implemented by filtering shloks, or if we want just verse numbers
  res.sendResponse(false, HTTP_CODES.NOT_FOUND, "NOT_IMPLEMENTED");
};
