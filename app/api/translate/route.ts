import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const text = typeof body?.text === 'string' ? body.text.trim() : '';
        const targetLang = typeof body?.targetLang === 'string' ? body.targetLang.trim().toLowerCase() : 'en';

        if (!text) {
            return NextResponse.json({ translatedText: '', detectedSourceLang: targetLang });
        }

        // 1. Primary fast translation via Google GTX endpoint
        try {
            const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
            const res = await fetch(gtxUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                },
                cache: 'force-cache',
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && Array.isArray(data[0])) {
                    const translatedText = data[0]
                        .map((segment: any) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
                        .join('')
                        .trim();
                    const detectedSourceLang = typeof data[2] === 'string' ? data[2].toLowerCase().split('-')[0] : 'auto';
                    if (translatedText) {
                        return NextResponse.json({ translatedText, detectedSourceLang });
                    }
                }
            }
        } catch {
            // Fallback below
        }

        // 2. Fallback via OpenRouter if configured
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (apiKey) {
            const langNames: Record<string, string> = {
                es: 'Spanish',
                en: 'English',
                fr: 'French',
                de: 'German',
                it: 'Italian',
                pt: 'Portuguese',
            };
            const targetLanguageName = langNames[targetLang] || targetLang;
            const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash-lite',
                    messages: [
                        {
                            role: 'system',
                            content: `Translate the user's social fashion post caption naturally into ${targetLanguageName}. Return ONLY the translated text without quotes or explanations.`,
                        },
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 300,
                }),
            });

            if (aiRes.ok) {
                const aiData = await aiRes.json();
                const translated = aiData?.choices?.[0]?.message?.content?.trim();
                if (translated) {
                    return NextResponse.json({
                        translatedText: translated,
                        detectedSourceLang: 'auto',
                    });
                }
            }
        }

        return NextResponse.json({ translatedText: text, detectedSourceLang: targetLang });
    } catch (error) {
        console.error('[API Translate] Error:', error);
        return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }
}
