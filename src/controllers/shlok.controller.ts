import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Shlok } from '../models/Shlok';

const SHLOKS_FILE = path.join(__dirname, '../data/gita-shloks.json');
let shloksCache: Shlok[] = [];

// Load data on startup
if (fs.existsSync(SHLOKS_FILE)) {
    shloksCache = JSON.parse(fs.readFileSync(SHLOKS_FILE, 'utf-8'));
}

export const getShloks = (req: Request, res: Response) => {
    try {
        let results = shloksCache;
        const { chapterNumber, search, page = 1, limit = 20 } = req.query;

        if (chapterNumber) {
            results = results.filter(s => s.chapterNumber === Number(chapterNumber));
        }

        if (search) {
            const query = String(search).toLowerCase();
            results = results.filter(s => 
                s.sanskritText.toLowerCase().includes(query) ||
                s.translationEnglish.toLowerCase().includes(query) ||
                s.translationHindi.toLowerCase().includes(query) ||
                s.transliteration.toLowerCase().includes(query)
            );
        }

        // Pagination
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedResults = results.slice(startIndex, endIndex);

        res.json({
            items: paginatedResults,
            total: results.length,
            page: pageNum,
            limit: limitNum
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shloks', error });
    }
};

export const getShlokById = (req: Request, res: Response) => {
    try {
        const { chapter, verse } = req.params;
        const shlok = shloksCache.find(s => s.chapterNumber === Number(chapter) && s.verseNumber === Number(verse));
        
        if (!shlok) {
            return res.status(404).json({ message: 'Shlok not found' });
        }
        
        res.json(shlok);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shlok', error });
    }
};
