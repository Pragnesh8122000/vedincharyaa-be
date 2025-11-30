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

const AUDIO_BASE_URL = process.env.AUDIO_BASE_URL || 'https://everyday-gita-audio.b-cdn.net';

const addAudioUrl = (shlok: Shlok): Shlok => {
    return {
        ...shlok,
        audioUrl: `${AUDIO_BASE_URL}/chapter-${shlok.chapterNumber}-verse-${shlok.verseNumber}.mp3`
    };
};

export const getShloks = (req: Request, res: Response) => {
    try {
        let results = shloksCache;
        const { chapterNumber, chapterNumbers, tags, search, page = 1, limit = 20 } = req.query;

        // Apply filters first
        if (chapterNumber) {
            results = results.filter(s => s.chapterNumber === Number(chapterNumber));
        }

        if (chapterNumbers) {
            const chapters = String(chapterNumbers).split(',').map(Number);
            results = results.filter(s => chapters.includes(s.chapterNumber));
        }

        if (tags) {
            const tagList = String(tags).split(',').map(t => t.trim().toLowerCase());
            results = results.filter(s => 
                s.tags && s.tags.some(t => tagList.includes(t.toLowerCase()))
            );
        }

        if (search) {
            const query = String(search).toLowerCase();
            results = results.filter(s => 
                s.sanskritText.toLowerCase().includes(query) ||
                s.translationEnglish.toLowerCase().includes(query) ||
                s.translationHindi.toLowerCase().includes(query) ||
                s.transliteration.toLowerCase().includes(query) ||
                (s.tags && s.tags.some(t => t.toLowerCase().includes(query)))
            );
        }

        // Pagination Logic
        const pageNum = Math.max(1, Number(page));
        const limitNum = Number(limit);
        const total = results.length;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        
        // Add audioUrl to paginated results
        const paginatedResults = results.slice(startIndex, endIndex).map(addAudioUrl);
        const hasMore = endIndex < total;
        const nextPage = hasMore ? pageNum + 1 : null;

        res.json({
            data: {
                items: paginatedResults,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    hasMore,
                    nextPage
                }
            },
            error: null
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
        
        res.json(addAudioUrl(shlok));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shlok', error });
    }
};
