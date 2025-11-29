import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from '../controllers/favorites.controller';

const router = Router();

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/', clearFavorites);
router.delete('/:shlokId', removeFavorite);

export default router;
