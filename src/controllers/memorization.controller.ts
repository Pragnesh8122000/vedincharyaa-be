import { Request, Response } from 'express';
import MemorizationProgress from '../models/memorizationModel';
import ShlokModel from '../models/shlokModel';

// Helper for Leitner System intervals (in days)
const BOX_INTERVALS: { [key: number]: number } = {
    1: 1,
    2: 3,
    3: 7,
    4: 14,
    5: 30,
};

export const getDueShloks = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId || 'dummy_user_id'; // In real app, get from auth middleware

        const now = new Date();
        
        // Find progress records where nextReviewDate is <= now
        const dueProgress = await MemorizationProgress.find({
            userId: userId,
            nextReviewDate: { $lte: now }
        });

        // Also, fetch some new shloks if we don't have many due? 
        // For now, let's just return what is due.
        
        // Fetch the actual Shlok details
        const dueShloks = await Promise.all(dueProgress.map(async (p) => {
            const shlok = await ShlokModel.findOne({ 
                chapterNumber: p.chapterNumber, 
                verseNumber: p.verseNumber 
            });
            return {
                ...shlok?.toObject(),
                progress: p
            };
        }));

        res.json(dueShloks.filter(s => s.chapterNumber)); // Filter out any nulls
    } catch (error) {
        res.status(500).json({ message: 'Error fetching due shloks', error });
    }
};

export const updateProgress = async (req: Request, res: Response) => {
    try {
        const { userId = 'dummy_user_id', chapterNumber, verseNumber, isCorrect } = req.body;

        let progress = await MemorizationProgress.findOne({
            userId,
            chapterNumber,
            verseNumber
        });

        if (!progress) {
            // New interaction
            progress = new MemorizationProgress({
                userId,
                chapterNumber,
                verseNumber,
                box: 1,
                lastReviewed: new Date(),
                nextReviewDate: new Date() // Will be updated below
            });
        }

        if (isCorrect) {
            // Move to next box
            progress.box = Math.min(progress.box + 1, 5);
        } else {
            // Reset to box 1
            progress.box = 1;
        }

        const daysToAdd = BOX_INTERVALS[progress.box];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        
        progress.lastReviewed = new Date();
        progress.nextReviewDate = nextDate;

        await progress.save();

        res.json({ message: 'Progress updated', progress });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error });
    }
};

export const initializeProgress = async (req: Request, res: Response) => {
    try {
        const { userId = 'dummy_user_id', chapterNumber, verseNumber } = req.body;
        
        // Check if exists
        const exists = await MemorizationProgress.findOne({ userId, chapterNumber, verseNumber });
        if (exists) {
            return res.status(400).json({ message: 'Already tracking this shlok' });
        }

        const progress = new MemorizationProgress({
            userId,
            chapterNumber,
            verseNumber,
            box: 1,
            nextReviewDate: new Date(), // Due immediately
            lastReviewed: new Date()
        });

        await progress.save();
        res.status(201).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error initializing progress', error });
    }
};
