import mongoose, { Document, Schema } from "mongoose";

export interface IHistory extends Document {
  userId: mongoose.Types.ObjectId;
  shlokId: string; // e.g., "2-47"
  viewedAt: Date;
}

const historySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shlokId: {
    type: String,
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for performance and to allow unique checking if we want to update existing entry
historySchema.index({ userId: 1, shlokId: 1 });
historySchema.index({ userId: 1, viewedAt: -1 });

const HistoryModel = mongoose.model<IHistory>("History", historySchema);
export default HistoryModel;
