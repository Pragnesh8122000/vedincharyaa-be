import { Router } from 'express';
import { getHistory, addHistory } from '../controllers/history.controller';

const router = Router();

router.get('/', getHistory);
router.post('/', addHistory);

export default router;
