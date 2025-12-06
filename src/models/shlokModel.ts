import mongoose, { Document, Schema } from 'mongoose';
import { Shlok } from './Shlok';

export interface IShlok extends Shlok, Document {}

const shlokSchema: Schema = new Schema({
    chapterNumber: {
        type: Number,
        required: true,
    },
    verseNumber: {
        type: Number,
        required: true,
    },
    sanskritText: {
        type: String,
        required: true,
    },
    transliteration: {
        type: String,
        required: true,
    },
    translationEnglish: {
        type: String,
        default: '',
    },
    translationHindi: {
        type: String,
        default: '',
    },
    meaningEnglish: {
        type: String,
        default: '',
    },
    meaningHindi: {
        type: String,
        default: '',
    },
    tags: {
        type: [String],
        default: [],
    },
    audioUrl: {
        type: String,
        required: false,
    },
    words: [{
        sanskrit: String,
        meaning: String,
    }],
});

shlokSchema.index({ chapterNumber: 1, verseNumber: 1 }, { unique: true });

const ShlokModel = mongoose.model<IShlok>('Shlok', shlokSchema);
export default ShlokModel;
