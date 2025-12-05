import mongoose, { Document, Schema } from 'mongoose';

export interface IUserOtp extends Document {
    userId: mongoose.Types.ObjectId;
    otp: string;
    createdAt: Date;
}

const userOtpSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes
    },
});

const UserOtp = mongoose.model<IUserOtp>('UserOtp', userOtpSchema);
export default UserOtp;
