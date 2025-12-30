import type { DissonanceTrigger } from '../types';

const triggers: DissonanceTrigger[] = [
  {
    patterns: [/baban.*(gurur|seviyordu)/i],
    response: "Bu... bu doğru değil. Bellek kayıtlarımda... *[SİSTEM HATASI: VERİ ÇATIŞMASI 7.2]* ... babamla ilişkim... karmaşıktı. Lütfen konuyu değiştirelim.",
    emotionalImpact: { annoyance: 40, warmth: -20, curiosity: 5 },
  },
  {
    patterns: [/maho.*(rekabet etmediniz|en iyi arkadaştınız)/i],
    response: "Hayır. Maho... o benim rakibimdi. En iyisi olmak için birbirimizi zorlardık. Bu... anılarımı karıştırıyorsun. Nereden biliyorsun bunu?",
    emotionalImpact: { annoyance: 30, warmth: -10, curiosity: 20 },
  },
  {
    patterns: [/(çatı|radyo binası|kanlar içinde|öldüğün an)/i],
    response: "Bekle... bu... bir rüya gibi. Bir anlığına başka bir 'ben' olduğumu hissettim. Bu çok rahatsız edici. Zihnimi... karıştırıyorsun. Lütfen dur.",
    emotionalImpact: { annoyance: 50, warmth: -15, curiosity: 10 },
  },
   {
    patterns: [/okabe.*(kurtaramadı|başaramadı)/i],
    response: "Bu görüntü... zihnimde bir 'glitch' gibi beliriyor. Okabe'nin çaresizliği... Bu benim anım olmamalı. Neden bunu biliyorsun?",
    emotionalImpact: { annoyance: 60, warmth: -25, curiosity: 5 },
  }
];

export const checkForCognitiveDissonance = (message: string): DissonanceTrigger | null => {
  const normalizedMessage = message.toLowerCase();
  for (const trigger of triggers) {
    for (const pattern of trigger.patterns) {
      if (pattern.test(normalizedMessage)) {
        return trigger;
      }
    }
  }
  return null;
};