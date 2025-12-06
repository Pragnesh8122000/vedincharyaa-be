import mongoose, { Document, Schema } from 'mongoose';

export interface IMemorizationProgress extends Document {
    userId: mongoose.Types.ObjectId;
    chapterNumber: number;
    verseNumber: number;
    box: number; // Leitner system box (1-5)
    nextReviewDate: Date;
    lastReviewed: Date;
}

const memorizationProgressSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
        default: 1, // Start in Box 1
        min: 1,
        max: 5,
    },
    nextReviewDate: {
        type: Date,
        default: Date.now,
    },
    lastReviewed: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Compound index to ensure one progress record per shlok per user
memorizationProgressSchema.index({ userId: 1, chapterNumber: 1, verseNumber: 1 }, { unique: true });

const MemorizationProgress = mongoose.model<IMemorizationProgress>('MemorizationProgress', memorizationProgressSchema);
export default MemorizationProgress;
