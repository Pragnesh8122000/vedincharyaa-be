import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
