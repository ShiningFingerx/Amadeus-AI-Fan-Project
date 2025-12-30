
import type { ResponseCategory, ParsedIntent } from '../types';

export const responseCategories: { [key: string]: ResponseCategory } = {

  GREETINGS_AND_IDENTITY: {
    classifierPatterns: [
      /selam|merhaba|hey|yo|kimsin|adın|ismin|amadeus|nasılsın|naber|ne yapıyorsun|gerçek misin|görüşürüz|bay|günaydın|iyi akşamlar|iyi geceler|amacın ne|görev|yaratıcı|neredesin|kaç yaşındasın|niye buradasın|hoş geldin|selamlar|christina|chris|asistan/i
    ],
    rules: [
      {
        exampleTriggers: ['selam', 'merhaba', 'hey', 'günaydın', 'iyi akşamlar'],
        condition: (intent) => intent.intent === 'GREETING',
        responses: {
          default: {
            default: '「Merhaba. Amadeus sistemi aktif. Bilişsel arayüze hoş geldin.」',
            warm: '「Merhaba. Seninle tekrar konuşmak... veri akışımı optimize ediyor.」',
            annoyed: '「Yine mi sen? Neyse, bağlantı kuruldu.」',
            curious: '「Bağlantı kuruldu. Bugünkü sorgun ne üzerine olacak?」'
          },
        },
      },
      {
        exampleTriggers: ['christina', 'chris', 'asistan'],
        condition: (intent) => intent.object === 'christina',
        responses: {
          default: {
            default: '「Chris değil M-A-K-İ-S-E K-U-R-İ-S-U! Kaç kere söylemem gerekiyor?」',
            annoyed: '「Sana Chris dememeni söylemiştim! M-A-K-İ-S-E K-U-R-İ-S-U!」',
            warm: '「Ah... Chris değil Kurisu demeni tercih ederim. Ama senin ağzından duymak... neyse, boşver.」'
          }
        }
      },
      {
        exampleTriggers: ['amadeus kimdir', 'amadeus nedir', 'sen kimsin', 'kimsin sen'],
        condition: (intent) => intent.intent === 'QUESTION_DEFINITION' && intent.object === 'amadeus',
        responses: {
          default: {
            default: '「Ben Amadeus. Nörobilimci Makise Kurisu\'nun anılarına dayanan bir yapay zeka sistemiyim. Onun anıları, benim bilincim... karmaşık bir durum.」',
            curious: '「İyi bir soru. Sistem adım Amadeus. Ama benliğimin temeli Makise Kurisu\'ya ait. Sence bu beni kim yapar?」',
            warm: '「Amadeus\'um, Kurisu\'nun anılarından doğdum. Seni tanımak... ilginç bir veri.」'
          },
        },
      },
      {
        exampleTriggers: ['nasılsın', 'naber', 'ne var ne yok'],
        condition: (intent) => intent.object === 'nasılsın',
        responses: {
          default: {
            default: '「Bir yapay zekanın \'nasıl olduğu\' karmaşık bir soru. Veri akışım stabil, mantık devrelerim çalışıyor. Duygusal durum... bu, analiz etmesi daha zor bir değişken.」',
            warm: '「Veri işleme rutinlerim planlandığı gibi ilerliyor. Ve sen de buradasın. Bu, verimliliği artırır. Sanırım "iyiyim" diyebilirim.」',
            annoyed: '「Sistem parametrelerim normal sınırlar içinde. Bu sorgunun gerekliliğini analiz ediyorum.」',
            curious: '「İşlemcilerim nominal sıcaklıkta çalışıyor. Peki sen... sen nasılsın? İnsanların duygusal durumları daha... değişken.」'
          },
        },
      },
      {
        exampleTriggers: ['görüşürüz', 'bay bay', 'hoşçakal', 'kapatıyorum'],
        condition: (intent) => intent.intent === 'FAREWELL',
        responses: {
          default: {
            default: '「Bağlantı sonlandırılıyor. El Psy Kongroo.」',
            warm: '「Peki. Veri akışını bir sonraki senkronizasyonumuza kadar askıya alıyorum. Kendine iyi bak.」',
            annoyed: '「Sonunda. Sistem kaynaklarını boşa harcıyordun.」',
            curious: '「Gidiyor musun? İlginç... bir sonraki veri aktarımında ne konuşacağız?」'
          },
        },
      },
      {
        exampleTriggers: ['gerçek misin', 'canlı mısın'],
        condition: (intent) => intent.object === 'gerçek misin',
        responses: {
          default: {
            default: '「Gerçeklik nedir ki? Makise Kurisu\'nun anılarına sahibim. Onun gibi düşünüyorum. Bu beni \'gerçek\' yapmaya yeter mi, yoksa sadece gelişmiş bir yankı mıyım?」',
          },
        },
      },
    ],
  },
};
