import mongoose, { Document, Schema } from "mongoose";

export interface IAiUsage extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  count: number;
}

const aiUsageSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient lookup
aiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

const AiUsage = mongoose.model<IAiUsage>("AiUsage", aiUsageSchema);
export default AiUsage;
