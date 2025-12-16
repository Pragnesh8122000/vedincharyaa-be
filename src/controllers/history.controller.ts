import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Shlok } from '../models/Shlok';
import { HTTP_CODES } from '../common/httpCodes';

const HISTORY_FILE = path.join(__dirname, '../data/history.json');
const SHLOKS_FILE = path.join(__dirname, '../data/gita-shloks.json');

let history: { shlokId: string, viewedAt: string }[] = [];
let shloksCache: Shlok[] = [];

if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
}
if (fs.existsSync(SHLOKS_FILE)) {
    shloksCache = JSON.parse(fs.readFileSync(SHLOKS_FILE, 'utf-8'));
}

const saveData = () => {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

export const getHistory = (req: Request, res: Response) => {
    const historyShloks = history.map(item => {
        const [chapter, verse] = item.shlokId.split('-');
        const shlok = shloksCache.find(s => s.chapterNumber === Number(chapter) && s.verseNumber === Number(verse));
        return shlok ? { ...shlok, viewedAt: item.viewedAt } : null;
    }).filter(s => s !== null).slice(0, 20); // Limit to last 20
    
    res.sendResponse(true, HTTP_CODES.OK, 'HISTORY_FETCHED', historyShloks);
};

export const addHistory = (req: Request, res: Response) => {
    const { shlokId } = req.body;
    // Remove if exists to move to top
    history = history.filter(h => h.shlokId !== shlokId);
    // Add to beginning
    history.unshift({ shlokId, viewedAt: new Date().toISOString() });
    // Limit history size
    if (history.length > 50) history = history.slice(0, 50);
    
    saveData();
    res.sendResponse(true, HTTP_CODES.OK, 'HISTORY_ADDED');
};
