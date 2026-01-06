import { Request, Response } from "express";
import { HTTP_CODES } from "../common/httpCodes";
import AiUsage from "../models/AiUsage";
import { findShlokResiliently } from "../utils/shlokLoader";
// @ts-ignore
import { getAiShlokResponse as getOpenAiResponse } from "../services/ai/shlokAiService";
// @ts-ignore
import { getAiShlokResponse as getOpenRouterResponse } from "../services/ai/shlokOpenRouterService";

/**
 * Gets the configured AI service response based on AI_PROVIDER env variable.
 */
const getAiShlokResponse = async (shlok: any, question?: string) => {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || "openrouter";

  if (provider === "openrouter") {
    return getOpenRouterResponse(shlok, question);
  }

  return getOpenAiResponse(shlok, question);
};

/**
 * Controller to handle AI-based Shlok explanation and questions.
 */
export const aiController = {
  /**
   * Explain a shlok based on shlokId (e.g., "2-47")
   */
  explainShlok: async (req: Request, res: Response) => {
    try {
      const { shlokId } = req.body;

      if (!shlokId) {
        return res.sendResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          "SHLOK_ID_REQUIRED"
        );
      }

      const [chapterStr, verseStr] = shlokId.split("-");
      const chapterNumber = parseInt(chapterStr);
      const verseNumber = parseInt(verseStr);
      console.log(chapterNumber, verseNumber);

      if (isNaN(chapterNumber) || isNaN(verseNumber)) {
        return res.sendResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          "INVALID_SHLOK_ID"
        );
      }

      const shlok = await findShlokResiliently(chapterNumber, verseNumber);
      if (!shlok) {
        return res.sendResponse(false, HTTP_CODES.NOT_FOUND, "SHLOK_NOT_FOUND");
      }

      const response = await getAiShlokResponse(shlok, undefined);

      // Increment usage
      await incrementUsage((req as any).user.id);

      res.sendResponse(true, HTTP_CODES.OK, "SHLOK_EXPLAINED", { response });
    } catch (error: any) {
      console.error("AI Explain Error:", error.message);
      handleAiError(error, res);
    }
  },

  /**
   * Ask a question about a shlok
   */
  askQuestion: async (req: Request, res: Response) => {
    try {
      const { shlokId, question } = req.body;

      if (!shlokId) {
        return res.sendResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          "SHLOK_ID_REQUIRED"
        );
      }

      if (!question || question.trim().length === 0) {
        return res.sendResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          "EMPTY_QUESTION"
        );
      }

      if (question.length > 300) {
        return res.sendResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          "QUESTION_TOO_LONG"
        );
      }

      const [chapterStr, verseStr] = shlokId.split("-");
      const chapterNumber = parseInt(chapterStr);
      const verseNumber = parseInt(verseStr);
      console.log(chapterNumber, verseNumber);

      const shlok = await findShlokResiliently(chapterNumber, verseNumber);
      if (!shlok) {
        return res.sendResponse(false, HTTP_CODES.NOT_FOUND, "SHLOK_NOT_FOUND");
      }

      const response = await getAiShlokResponse(shlok, question);

      // Increment usage
      await incrementUsage((req as any).user.id);

      res.sendResponse(true, HTTP_CODES.OK, "SHLOK_QUESTION_ANSWERED", {
        response,
      });
    } catch (error: any) {
      console.error("AI Ask Error:", error.message);
      handleAiError(error, res);
    }
  },
};

/**
 * Helper to increment daily usage
 */
async function incrementUsage(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  await AiUsage.findOneAndUpdate(
    { userId, date: today },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
}

/**
 * Standardized AI error handler
 */
function handleAiError(error: any, res: Response) {
  const messageCode =
    error.message === "AI_SERVICE_UNAVAILABLE"
      ? "AI_SERVICE_UNAVAILABLE"
      : "AI_RESPONSE_FAILED";

  res.sendResponse(
    false,
    HTTP_CODES.INTERNAL_SERVER_ERROR,
    messageCode,
    error.message
  );
}
