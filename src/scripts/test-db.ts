import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel';
import ShlokModel from '../models/shlokModel';

dotenv.config();

const testDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');

        // Create User
        const user = await User.create({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
        });
        console.log('User Created:', user.email);

        // Create Shlok
        const shlok = await ShlokModel.create({
            chapterNumber: 999,
            verseNumber: 999,
            sanskritText: 'Test Sanskrit',
            transliteration: 'Test Transliteration',
        });
        console.log('Shlok Created:', shlok.chapterNumber, shlok.verseNumber);

        // Cleanup
        await User.findByIdAndDelete(user._id);
        await ShlokModel.findByIdAndDelete(shlok._id);
        console.log('Cleanup Done');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testDB();
