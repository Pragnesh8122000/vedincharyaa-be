import { Router } from "express";
import aiRoutes from "./ai.routes";
import chapterRoutes from "./chapter.routes";
import shlokRoutes from "./shlok.routes";
import favoritesRoutes from "./favorites.routes";
import historyRoutes from "./history.routes";
import memorizationRoutes from "./memorization.routes";
import authRoutes from "./auth.routes";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chapters", chapterRoutes);
router.use("/shloks", shlokRoutes);
router.use("/ai", aiRoutes);

// Protected Routes
router.use("/favorites", authenticateToken, favoritesRoutes);
router.use("/history", authenticateToken, historyRoutes);
router.use("/memorization", authenticateToken, memorizationRoutes);

export default router;
