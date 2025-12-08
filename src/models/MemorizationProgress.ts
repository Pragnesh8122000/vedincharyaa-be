import mongoose, { Document, Schema } from 'mongoose';

export interface IMemorizationProgress extends Document {
    userId: mongoose.Types.ObjectId;
    shlokId: string; // chapter-verse
    chapterNumber: number;
    verseNumber: number;
    box: number; // 1-5 (Leitner system)
    lastReviewed: Date;
    nextReviewDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const memorizationProgressSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shlokId: {
        type: String, // Combined chapter-verse key for easy lookups
        required: true,
    },
    chapterNumber: {
        type: Number,
        required: true,
    },
    verseNumber: {
        type: Number,
        required: true,
    },
    box: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
    },
    lastReviewed: {
        type: Date,
        default: Date.now,
    },
    nextReviewDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

// Ensure a user tracks a shlok only once
memorizationProgressSchema.index({ userId: 1, shlokId: 1 }, { unique: true });
// Index for querying due reviews efficiently
memorizationProgressSchema.index({ userId: 1, nextReviewDate: 1 });

export const MemorizationProgress = mongoose.model<IMemorizationProgress>('MemorizationProgress', memorizationProgressSchema);
