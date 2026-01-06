import OpenAI from "openai";

/**
 * Singleton OpenRouter Client instance.
 */
const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export default openrouter;
