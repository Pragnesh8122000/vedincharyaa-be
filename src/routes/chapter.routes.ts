import { Router } from 'express';
import { getChapters, getChapterVerses } from '../controllers/chapter.controller';

const router = Router();

router.get('/', getChapters);
router.get('/:chapterNumber/verses', getChapterVerses);

export default router;
