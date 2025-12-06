import { Router } from 'express';
import chapterRoutes from './chapter.routes';
import shlokRoutes from './shlok.routes';
import favoritesRoutes from './favorites.routes';
import historyRoutes from './history.routes';
import memorizationRoutes from './memorization.routes';

const router = Router();

router.use('/chapters', chapterRoutes);
router.use('/shloks', shlokRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/history', historyRoutes);
router.use('/memorization', memorizationRoutes);

export default router;
