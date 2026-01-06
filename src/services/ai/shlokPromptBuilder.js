/**
 * Builds deterministic prompts for Shlok explanation and questions.
 */

const SYSTEM_PROMPT = `You are a knowledgeable and compassionate Bhagavad Gita teacher. 
Your goal is to explain the shlok clearly for students.
- Use simple English.
- Keep your response between 5–8 sentences max.
- Do NOT hallucinate or provide information outside the context of the provided shlok.
- Answer ONLY using the provided shlok text and meaning.
- Avoid unrelated philosophy, politics, or speculation.
- Be concise and clear.`;

/**
 * Builds the user prompt.
 * @param {Object} shlok - The Shlok object from the database.
 * @param {string} [question] - Optional user question.
 * @returns {string} The formatted user prompt.
 */
export const buildShlokPrompt = (shlok, question = null) => {
    const context = `
Shlok Details:
Sanskrit: ${shlok.sanskritText}
English Translation: ${shlok.translationEnglish}
Hindi Translation: ${shlok.translationHindi}
Transliteration: ${shlok.transliteration}
Meaning (English): ${shlok.meaningEnglish || 'N/A'}
Meaning (Hindi): ${shlok.meaningHindi || 'N/A'}
`;

    const task = question
        ? `Question: ${question}`
        : `Please explain this shlok for a student.`;

    return `${context}\n${task}`;
};

export const getSystemPrompt = () => SYSTEM_PROMPT;
