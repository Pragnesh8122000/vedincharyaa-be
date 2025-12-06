export interface Shlok {
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration: string;
    translationEnglish: string;
    translationHindi: string;
    meaningEnglish: string;
    meaningHindi: string;
    tags: string[];
    audioUrl?: string;
    words?: {
        sanskrit: string;
        meaning: string;
    }[];
}
