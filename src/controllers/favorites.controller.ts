import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Shlok } from '../models/Shlok';

const FAVORITES_FILE = path.join(__dirname, '../data/favorites.json');
const SHLOKS_FILE = path.join(__dirname, '../data/gita-shloks.json');

let favorites: { shlokId: string, addedAt: string }[] = [];
let shloksCache: Shlok[] = [];

// Load data
if (fs.existsSync(FAVORITES_FILE)) {
    favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
}
if (fs.existsSync(SHLOKS_FILE)) {
    shloksCache = JSON.parse(fs.readFileSync(SHLOKS_FILE, 'utf-8'));
}

const saveData = () => {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
};

export const getFavorites = (req: Request, res: Response) => {
    const favoriteShloks = favorites.map(fav => {
        const [chapter, verse] = fav.shlokId.split('-');
        const shlok = shloksCache.find(s => s.chapterNumber === Number(chapter) && s.verseNumber === Number(verse));
        return shlok ? { ...shlok, addedAt: fav.addedAt } : null;
    }).filter(s => s !== null);
    
    res.json(favoriteShloks);
};

export const addFavorite = (req: Request, res: Response) => {
    const { shlokId } = req.body; // Format: "1-1" (chapter-verse)
    if (!favorites.some(f => f.shlokId === shlokId)) {
        favorites.push({ shlokId, addedAt: new Date().toISOString() });
        saveData();
    }
    res.json({ message: 'Added to favorites' });
};

export const removeFavorite = (req: Request, res: Response) => {
    const { shlokId } = req.params;
    favorites = favorites.filter(f => f.shlokId !== shlokId);
    saveData();
    res.json({ message: 'Removed from favorites' });
};

export const clearFavorites = (req: Request, res: Response) => {
    favorites = [];
    saveData();
    res.json({ message: 'All favorites cleared' });
};
