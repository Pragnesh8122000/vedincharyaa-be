import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { aiUserLimitMiddleware } from "../middleware/aiUserLimit.middleware";
import { aiCostControlMiddleware } from "../middleware/aiCostControl.middleware";

const router = Router();

// Apply authentication to all AI routes
router.use(authenticateToken);

// Apply daily usage limit to AI routes
router.use(aiUserLimitMiddleware);

// Apply cost control (env toggle) to AI routes
router.use(aiCostControlMiddleware);

/**
 * @route POST /api/v1/ai/explain
 * @desc Get an AI-generated explanation for a shlok
 */
router.post("/explain", aiController.explainShlok);

/**
 * @route POST /api/v1/ai/ask
 * @desc Ask a contextual question about a shlok
 */
router.post("/ask", aiController.askQuestion);

export default router;
