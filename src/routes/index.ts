import { Router } from 'express';
import chapterRoutes from './chapter.routes';
import shlokRoutes from './shlok.routes';
import favoritesRoutes from './favorites.routes';
import historyRoutes from './history.routes';

const router = Router();

router.use('/chapters', chapterRoutes);
router.use('/shloks', shlokRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/history', historyRoutes);

export default router;
