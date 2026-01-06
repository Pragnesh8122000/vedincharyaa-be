import { Request, Response, NextFunction } from "express";
import AiUsage from "../models/AiUsage";
import { HTTP_CODES } from "../common/httpCodes";

const DAILY_LIMIT = 20;

/**
 * Middleware to enforce daily AI usage limits per user.
 */
export const aiUserLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.sendResponse(false, HTTP_CODES.UNAUTHORIZED, "UNAUTHORIZED");
    }

    const today = new Date().toISOString().split("T")[0];

    let usage = await AiUsage.findOne({ userId, date: today });

    if (usage && usage.count >= DAILY_LIMIT) {
      return res.sendResponse(
        false,
        HTTP_CODES.TOO_MANY_REQUESTS,
        "AI_LIMIT_REACHED"
      );
    }

    // Attach current usage to request for potential use in controller (e.g., to increment it)
    (req as any).aiUsage = usage || { userId, date: today, count: 0 };

    next();
  } catch (error) {
    console.error("AI Limit Middleware Error:", error);
    res.sendResponse(false, HTTP_CODES.INTERNAL_SERVER_ERROR, "UNKNOWN_ERROR");
  }
};
