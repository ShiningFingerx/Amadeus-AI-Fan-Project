import { apiFetch } from './apiBridge';
/**
 * GROQ CLIENT — Shared fetch wrapper
 * Handles 429/400 responses gracefully instead of crashing on data.choices[0]
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const groqCall = async (
  groqKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  maxTokens = 300,
  temperature = 0.15
): Promise<string | null> => {
  try {
    const resp = await apiFetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' },
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!resp.ok) {
      // 429 = rate limit, 400 = bad request — both are non-fatal
      console.warn(`[Groq] ${model} HTTP ${resp.status} — using fallback`);
      return null;
    }

    const data = await resp.json();

    // Safely access choices
    if (!data?.choices?.length || !data.choices[0]?.message?.content) {
      console.warn(`[Groq] ${model} — empty choices, using fallback`);
      return null;
    }

    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn(`[Groq] ${model} fetch error:`, e);
    return null;
  }
};
