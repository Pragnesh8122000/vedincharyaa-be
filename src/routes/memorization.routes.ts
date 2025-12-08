import { Router } from 'express';
import { getDueShloks, updateProgress, initializeProgress, getAllProgress, removeProgress } from '../controllers/memorization.controller';

const router = Router();

router.get('/', getAllProgress);
router.get('/due', getDueShloks);
router.post('/progress', updateProgress);
router.post('/start', initializeProgress);
router.post('/remove', removeProgress); // Using POST for simplicity with body payload, or could be DELETE with params

export default router;
