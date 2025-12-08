import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Shlok } from '../models/Shlok';
import { Favorite } from '../models/Favorite';

const SHLOKS_FILE = path.join(__dirname, '../data/gita-shloks.json');
let shloksCache: Shlok[] = [];

if (fs.existsSync(SHLOKS_FILE)) {
    shloksCache = JSON.parse(fs.readFileSync(SHLOKS_FILE, 'utf-8'));
}

export const getFavorites = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
        
        const favoriteShloks = favorites.map(fav => {
            // Support both '2-47' and '2-47' formats (though split works for both strings)
            const parts = fav.shlokId.split('-');
            const chapter = Number(parts[0]);
            const verse = Number(parts[1]);
            
            const shlok = shloksCache.find(s => s.chapterNumber === chapter && s.verseNumber === verse);
            return shlok ? { ...shlok, addedAt: fav.createdAt } : null;
        }).filter(item => item !== null);
        
        res.sendResponse(true, 200, 'FAVORITES_FETCHED', favoriteShloks);
    } catch (error) {
        res.sendResponse(false, 500, 'FAVORITES_FETCH_ERROR');
    }
};

export const addFavorite = async (req: any, res: Response) => {
    const { shlokId } = req.body;
    const userId = req.user.id;
    
    if (!shlokId) {
        return res.sendResponse(false, 400, 'SHLOK_ID_REQUIRED');
    }

    try {
        const existing = await Favorite.findOne({ userId, shlokId });
        if (existing) {
            return res.sendResponse(true, 200, 'FAVORITE_EXISTS', { shlokId });
        }

        await Favorite.create({ userId, shlokId });
        res.sendResponse(true, 200, 'FAVORITE_ADDED', { shlokId });
    } catch (error) {
        res.sendResponse(false, 500, 'FAVORITE_ADD_ERROR');
    }
};

export const removeFavorite = async (req: any, res: Response) => {
    const { shlokId } = req.params;
    const userId = req.user.id;
    
    try {
        await Favorite.findOneAndDelete({ userId, shlokId });
        res.sendResponse(true, 200, 'FAVORITE_REMOVED', { shlokId });
    } catch (error) {
        res.sendResponse(false, 500, 'FAVORITE_REMOVE_ERROR');
    }
};

export const clearFavorites = async (req: any, res: Response) => {
    const userId = req.user.id;
    try {
        await Favorite.deleteMany({ userId });
        res.sendResponse(true, 200, 'FAVORITES_CLEARED');
    } catch (error) {
        res.sendResponse(false, 500, 'FAVORITES_CLEAR_ERROR');
    }
};
