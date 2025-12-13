import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from '../controllers/favorites.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/', clearFavorites);
router.delete('/:shlokId', removeFavorite);

export default router;
