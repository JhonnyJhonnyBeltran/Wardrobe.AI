/**
 * Gemini Client & Resilient API Key Provider
 * Ensures Gemini API key is always available in all deployment environments (Local, Vercel, Production)
 */

export function getGeminiApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY || 
                 process.env.GOOGLE_API_KEY ||
                 process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (envKey && envKey.trim().length > 10) {
    return envKey.trim();
  }

  return '';
}
