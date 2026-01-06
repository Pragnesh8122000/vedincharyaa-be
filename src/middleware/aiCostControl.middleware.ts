import { Request, Response, NextFunction } from "express";
import { HTTP_CODES } from "../common/httpCodes";
import { findShlokResiliently } from "../utils/shlokLoader";

/**
 * Middleware to check if AI responses are allowed.
 * If disabled via env, returns the shlok's meaning directly from DB/JSON.
 */
export const aiCostControlMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.ALLOW_AI_RESPONSE === "YES") {
    return next();
  }

  try {
    const { shlokId } = req.body;
    if (!shlokId) {
      // Let the controller handle missing shlokId validation if we don't want to duplicate it here,
      // but since we are bypassing the controller, we should validate or call next.
      // However, the goal is to return meaning if disabled.
      return next();
    }

    const [chapterStr, verseStr] = shlokId.split("-");
    const chapterNumber = parseInt(chapterStr);
    const verseNumber = parseInt(verseStr);

    if (isNaN(chapterNumber) || isNaN(verseNumber)) {
      return next(); // Invalid ID will be handled by controller if ALLOW_AI_RESPONSE becomes YES
    }

    const shlok = await findShlokResiliently(chapterNumber, verseNumber);
    if (!shlok) {
      return res.sendResponse(false, HTTP_CODES.NOT_FOUND, "SHLOK_NOT_FOUND");
    }

    console.log(
      `AI Response disabled (ALLOW_AI_RESPONSE != YES). Returning DB translation via Middleware.`
    );

    // Return the response immediately, bypassing the controller
    const response =
      shlok.translationEnglish ||
      shlok.meaningEnglish ||
      "No explanation available at the moment.";

    // We determine the success message based on the route
    const messageCode = req.path.includes("/explain")
      ? "SHLOK_EXPLAINED"
      : "SHLOK_QUESTION_ANSWERED";

    return res.sendResponse(true, HTTP_CODES.OK, messageCode, { response });
  } catch (error) {
    console.error("AI Cost Control Middleware Error:", error);
    next(); // Fallback to controller if anything goes wrong
  }
};
