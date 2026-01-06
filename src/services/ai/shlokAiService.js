import openai from './openaiClient.js';
import { getSystemPrompt, buildShlokPrompt } from './shlokPromptBuilder.js';

/**
 * Calls OpenAI to get an explanation or answer a question about a shlok.
 * @param {Object} shlok - The shlok data.
 * @param {string} [question] - Optional user question.
 * @returns {Promise<string>} Plain text response from AI.
 */
export const getAiShlokResponse = async (shlok, question = null) => {
    try {
        const systemPrompt = getSystemPrompt();
        const userPrompt = buildShlokPrompt(shlok, question);

        const response = await openai.chat.completions.create({
            model: "gpt-5-nano", // or gpt-4o-mini
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.4,
            max_tokens: 300,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI API Error:", error.message);
        throw new Error("AI_SERVICE_UNAVAILABLE");
    }
};
