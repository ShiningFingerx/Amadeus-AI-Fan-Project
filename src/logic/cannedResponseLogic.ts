
import { responseCategories } from '../assets/cannedResponses';
import { lexicon } from '../assets/lexicon';
import type { AmadeusState, EmotionalState, ParsedIntent } from '../types';

const normalizeMessageForFuzzyMatching = (message: string): string => {
    let normalized = message.toLowerCase().trim();

    normalized = normalized
        .replace(/\b(dteins|stins)\s+gate\b/g, 'steins gate')
        .replace(/\b(okabe\s+rintarou?|hououin\s+kyouma)\b/g, 'okabe')
        .replace(/\b(hashida\s+itaru|super haker)\b/g, 'daru')
        .replace(/\b(mayuri\s+shiina|mayushii)\b/g, 'mayuri')
        .replace(/\b(makise\s+kurisu|kurisutina|zombie)\b/g, 'kurisu')
        .replace(/\b(christina|asistan|chris)\b/g, 'christina')
        .replace(/\b(shiina\s+kagari)\b/g, 'kagari')
        .replace(/\b(aman?e\s+suzuha)\b/g, 'suzuha')
        .replace(/\b(kiryuu?\s+moeka)\b/g, 'moeka')
        .replace(/\b(feris\s+nyannyan|akiha\s+rumiho)\b/g, 'feris')
        .replace(/\b(urushibara\s+ruka)\b/g, 'ruka')
        .replace(/\b(h?iyajou\s+maho)\b/g, 'maho')
        .replace(/\b(gelecek\s+gadget\s+laboratuvarı|future\s+gadget\s+lab)\b/g, 'fgl')
        .replace(/\b(ginaydın|gunaydin)\b/g, 'günaydın')
        .replace(/\bmeraba\b/g, 'merhaba')
        .replace(/\bslm\b/g, 'selam')
        .replace(/\bnbr\b/g, 'naber')
        .replace(/\btsk|teşekkür\sederim\b/g, 'teşekkürler')
        .replace(/\b(dr\s*\.?\s*pepper|doktor\s*pepper)\b/g, 'dr. pepper')
        .replace(/\bdiverjens\b/g, 'diverjans')
        .replace(/\bd-mail|dmail\b/g, 'd-mail')
        .replace(/\byaratıcın|seni kim yaptı\b/g, 'yaratıcı')
        .replace(/\b(gerçek\s+misin|gerçek misin)\b/g, 'gerçek misin');

    return normalized;
};


const getPrimaryEmotion = (state: AmadeusState): EmotionalState => {
    const { annoyance, warmth, curiosity, melancholy, anxiety } = state.emotionalState;
    if (anxiety > 70) return 'anxious';
    if (annoyance > 60) return 'annoyed';
    if (melancholy > 60) return 'melancholy';
    if (warmth > 50) return 'warm';
    if (curiosity > 50) return 'curious';
    return 'default';
};

/**
 * A powerful offline parser that uses RegEx to simulate basic NLU.
 */
const clientSideParse = (message: string): ParsedIntent => {
    const normalized = normalizeMessageForFuzzyMatching(message);
    const intent: ParsedIntent = {};

    const ALL_ENTITIES = [
        'okabe', 'daru', 'mayuri', 'kurisu', 'suzuha', 'moeka', 'feris', 'ruka', 'maho', 'kagari',
        'steins gate', 'sern', 'd-mail', 'zaman makinesi', 'reading steiner', 'diverjans', 'dünya hattı',
        'attractor field', 'fgl', 'dr. pepper', '@channel', 'bilim', 'nörobilim', 'zaman yolculuğu',
        'yapay zeka', 'aşk', 'zaman', 'bilinç', 'kader', 'hayat', 'ölüm', 'hafıza', 'duygu', 'rüya',
        'amadeus', 'yaratıcı', 'christina', 'asistan', 'zombie', 'chris'
    ].join('|');

    const patterns = [
        {
            regex: new RegExp(`(?:kimdir|nedir|ne demek|anlat)\\s*(${ALL_ENTITIES})`),
            map: (m: RegExpMatchArray) => ({ intent: 'QUESTION_DEFINITION', object: m[1].trim() })
        },
        {
            regex: new RegExp(`(${ALL_ENTITIES})\\s*(?:hakkında ne düşünüyorsun)`),
            map: (m: RegExpMatchArray) => ({ intent: 'QUESTION', subject: 'amadeus', action: 'düşünmek', object: m[1].trim() })
        },
         {
            regex: new RegExp(`(${ALL_ENTITIES})\\s*(?:'?(?:y?i)?\\s*seviyor musun)`),
            map: (m: RegExpMatchArray) => ({ intent: 'QUESTION', subject: 'amadeus', action: 'sevmek', object: m[1].trim() })
        },
        {
            regex: /(seni|sana)\s*(seviyorum|aşığım)/,
            map: () => ({ subject: 'user', object: 'amadeus', action: 'sevmek', sentiment: 'POSITIVE' })
        },
        {
            regex: new RegExp(`(?:sen|senin|amadeus|kurisu)\\s*(çok\\s*)?(aptalsın|salaksın|zekisin|harikasın|güzelsin)`),
            map: (m: RegExpMatchArray) => ({ object: 'amadeus', trait: m[2].replace('sın','').replace('sin','') })
        },
        {
            regex: /iltifat\s*(?:et|söyle)/,
            map: () => ({ intent: 'REQUEST_COMPLIMENT' })
        },
        {
            regex: /(son haberler|dünyada ne oluyor)/,
            map: () => ({ intent: 'REQUEST_NEWS' })
        },
        {
            regex: /(popüler olan ne|trend nedir)/,
            map: () => ({ intent: 'REQUEST_TREND' })
        },
        {
            regex: /(spor öner|hangi spor)/,
            map: () => ({ intent: 'REQUEST_SPORT' })
        },
        {
            regex: /(iş bulma|kariyer planı)/,
            map: () => ({ intent: 'REQUEST_CAREER_ADVICE' })
        },
        {
            regex: /(seyahat önerisi|nereye gideyim)/,
            map: () => ({ intent: 'REQUEST_TRAVEL' })
        },
        {
            regex: /(yemek tarifi|ne pişireyim)/,
            map: () => ({ intent: 'REQUEST_RECIPE' })
        },
        {
            regex: /(oyun öner|ne oynayalım)/,
            map: () => ({ intent: 'REQUEST_GAME' })
        },
         {
            regex: /(teşekkürler)/,
            map: () => ({ object: 'teşekkürler' })
        },
        {
            regex: /^(hoş geldin|selamlar)$/,
            map: () => ({ intent: 'WELCOME' })
        },
        {
            regex: /^(selam|merhaba|hey|yo|günaydın|iyi akşamlar|iyi günler)$/,
            map: (m: RegExpMatchArray) => ({ intent: 'GREETING', object: m[1].trim() })
        },
        {
            regex: /^(nasılsın|naber|ne var ne yok|n'aber)$/,
            map: (m: RegExpMatchArray) => ({ intent: 'QUESTION', object: 'nasılsın' })
        },
        {
            regex: /^(görüşürüz|bay bay|hoşçakal)$/,
            map: (m: RegExpMatchArray) => ({ intent: 'FAREWELL', object: m[1].trim() })
        },
        {
            regex: new RegExp(`^(${ALL_ENTITIES})$`),
            map: (m: RegExpMatchArray) => ({ intent: 'QUESTION_DEFINITION', object: m[1].trim() })
        }
    ];

    for (const p of patterns) {
        const match = normalized.match(p.regex);
        if (match) {
            Object.assign(intent, p.map(match));
            break; 
        }
    }
    
    if (Object.keys(intent).length === 0) {
       const entityList = ALL_ENTITIES.split('|');
       for (const entity of entityList) {
           if (new RegExp(`\\b${entity}\\b`).test(normalized)) {
               intent.object = entity;
               if (normalized.includes('?')) {
                   intent.intent = 'QUESTION';
               }
               break;
           }
       }
    }

    if (/\b(değil|sanmıyorum|sevmiyorum|istemiyorum)\b/.test(normalized)) {
        intent.sentiment = 'NEGATIVE';
    }

    return intent;
};

export const findCannedResponse = (
    message: string, 
    state: AmadeusState
): string | null => {
    
    const parsedIntent = clientSideParse(message);
    const currentEmotion = getPrimaryEmotion(state);
    const normalizedMessage = normalizeMessageForFuzzyMatching(message);
    
    const mentionedConcepts = Object.keys(lexicon).filter(key => 
        new RegExp(`\\b${key.replace('.', '\\.')}\\b`, 'i').test(normalizedMessage)
    );
    
    if (mentionedConcepts.length === 0) {
        return null;
    }

    const primaryConcept = mentionedConcepts[0];
    const categoryKey = lexicon[primaryConcept].category;
    const category = responseCategories[categoryKey as keyof typeof responseCategories];

    if (!category) {
        return null; 
    }

    for (const rule of category.rules) {
        if (rule.condition(parsedIntent)) {
            const responseSet = rule.responses.default;
            return responseSet[currentEmotion] || responseSet.default;
        }
    }

    let bestMatch = { score: 0, response: null as string | null };

    for (const rule of category.rules) {
        let currentScore = 0;
        for (const trigger of rule.exampleTriggers) {
            if (normalizedMessage.includes(trigger)) {
                currentScore += trigger.split(' ').length;
            }
        }

        if (currentScore > bestMatch.score) {
            const responseSet = rule.responses.default;
            bestMatch = {
                score: currentScore,
                response: responseSet[currentEmotion] || responseSet.default
            };
        }
    }

    if (bestMatch.score > 0) {
        return bestMatch.response;
    }

    return null; 
};
