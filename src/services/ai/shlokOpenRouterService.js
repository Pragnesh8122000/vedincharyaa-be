import openrouter from './openrouterClient.js';
import { getSystemPrompt, buildShlokPrompt } from './shlokPromptBuilder.js';

/**
 * Calls OpenRouter to get an explanation or answer a question about a shlok.
 * @param {Object} shlok - The shlok data.
 * @param {string} [question] - Optional user question.
 * @returns {Promise<string>} Plain text response from AI (may include reasoning).
 */
export const getAiShlokResponse = async (shlok, question = null) => {
    try {
        const systemPrompt = getSystemPrompt();
        const userPrompt = buildShlokPrompt(shlok, question);

        // API call with reasoning enabled for OpenRouter
        const response = await openrouter.chat.completions.create({
            model: 'openai/gpt-oss-120b:free', // Using the model specified in the user request
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            // @ts-ignore - 'reasoning' is a specific OpenRouter feature not yet in standard OpenAI types
            reasoning: { enabled: true }
        });

        const choice = response.choices[0];
        let content = choice.message.content.trim();

        // If reasoning details are available, we can log them or process them if needed.
        // For now, we return the main content as requested.
        const reasoning = choice.message.reasoning_details;
        if (reasoning) {
            console.log("OpenRouter Reasoning Details:", reasoning);
            // Optionally prepend or append reasoning to content if the user wants it visible
            // content = `(AI REASONING: ${JSON.stringify(reasoning)})\n\n${content}`;
        }

        return content;
    } catch (error) {
        console.error("OpenRouter API Error:", error.message);
        throw new Error("AI_SERVICE_UNAVAILABLE");
    }
};
