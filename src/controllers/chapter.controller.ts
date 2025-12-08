import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const CHAPTERS_FILE = path.join(__dirname, '../data/gita-chapters.json');

export const getChapters = (req: Request, res: Response) => {
    try {
        if (!fs.existsSync(CHAPTERS_FILE)) {
            return res.sendResponse(false, 500, 'CHAPTERS_DATA_NOT_FOUND');
        }
        const chapters = JSON.parse(fs.readFileSync(CHAPTERS_FILE, 'utf-8'));
        
        // Map to simpler structure if needed, or return as is
        const mappedChapters = chapters.map((c: any) => ({
            chapterNumber: c.chapter_number,
            nameSanskrit: c.name,
            nameTranslation: c.translation,
            nameMeaning: c.meaning,
            summaryEnglish: c.summary?.en || '',
            summaryHindi: c.summary?.hi || '',
            verseCount: c.verses_count
        }));

        res.sendResponse(true, 200, 'CHAPTERS_FETCHED', mappedChapters);
    } catch (error) {
        res.sendResponse(false, 500, 'CHAPTERS_FETCH_ERROR', error);
    }
};

export const getChapterVerses = (req: Request, res: Response) => {
    // This can be implemented by filtering shloks, or if we want just verse numbers
    res.sendResponse(false, 501, 'NOT_IMPLEMENTED');
};
