import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
    userId: mongoose.Types.ObjectId;
    shlokId: string;
    createdAt: Date;
}

const favoriteSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shlokId: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Ensure a user can only favorite a shlok once
favoriteSchema.index({ userId: 1, shlokId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
