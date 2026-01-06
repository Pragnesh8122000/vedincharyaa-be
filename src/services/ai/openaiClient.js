import OpenAI from "openai";

/**
 * Singleton OpenAI Client instance.
 */
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
