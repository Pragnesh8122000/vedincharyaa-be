import fs from 'fs';
import path from 'path';
import { Shlok } from '../models/Shlok';

const DATA_DIR = path.join(__dirname, '../data');
const SHLOKS_FILE = path.join(DATA_DIR, 'gita-shloks.json');
const CHAPTERS_FILE = path.join(DATA_DIR, 'gita-chapters.json');

const BASE_URL = 'https://vedicscriptures.github.io';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const fetchChapters = async () => {
    console.log('Fetching chapters...');
    try {
        const response = await fetch(`${BASE_URL}/chapters`);
        const chapters = await response.json();
        fs.writeFileSync(CHAPTERS_FILE, JSON.stringify(chapters, null, 2));
        console.log(`Saved ${chapters.length} chapters.`);
        return chapters;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
};

const fetchShloksForChapter = async (chapterNumber: number, versesCount: number) => {
    console.log(`Fetching shloks for Chapter ${chapterNumber}...`);
    const shloks: Shlok[] = [];
    
    // Batch requests to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 1; i <= versesCount; i += BATCH_SIZE) {
        const batchPromises = [];
        for (let j = i; j < i + BATCH_SIZE && j <= versesCount; j++) {
            batchPromises.push(fetch(`${BASE_URL}/slok/${chapterNumber}/${j}`).then(res => res.json()));
        }
        
        try {
            const results = await Promise.all(batchPromises);
            results.forEach((data: any) => {
                shloks.push({
                    chapterNumber: data.chapter,
                    verseNumber: data.verse,
                    sanskritText: data.slok,
                    transliteration: data.transliteration,
                    translationEnglish: data.siva?.et || data.purohit?.et || '',
                    translationHindi: data.chinmay?.hc || '', // Using Chinmay's Hindi commentary as proxy or empty if not available direct translation
                    meaningEnglish: data.gambir?.et || '',
                    meaningHindi: data.rams?.ht || '',
                    tags: []
                });
            });
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error fetching batch for chapter ${chapterNumber}:`, error);
        }
    }
    return shloks;
};

const seedData = async () => {
    const chapters = await fetchChapters();
    let allShloks: Shlok[] = [];

    for (const chapter of chapters) {
        const shloks = await fetchShloksForChapter(chapter.chapter_number, chapter.verses_count);
        allShloks = [...allShloks, ...shloks];
    }

    fs.writeFileSync(SHLOKS_FILE, JSON.stringify(allShloks, null, 2));
    console.log(`Saved ${allShloks.length} shloks to ${SHLOKS_FILE}`);
};

seedData();
