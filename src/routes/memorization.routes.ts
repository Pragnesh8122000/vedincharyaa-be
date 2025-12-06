import { Router } from 'express';
import { getDueShloks, updateProgress, initializeProgress } from '../controllers/memorization.controller';

const router = Router();

router.get('/due', getDueShloks);
router.post('/progress', updateProgress);
router.post('/start', initializeProgress); // To explicitly start learning a card

export default router;
