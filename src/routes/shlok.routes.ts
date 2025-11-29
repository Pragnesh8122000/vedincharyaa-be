import { Router } from 'express';
import { getShloks, getShlokById } from '../controllers/shlok.controller';

const router = Router();

router.get('/', getShloks);
router.get('/:chapter/:verse', getShlokById);

export default router;
