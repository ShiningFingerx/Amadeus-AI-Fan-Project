/**
 * AMADEUS NEURAL NETWORK ENGINE v2.0
 * ====================================
 * A biologically-inspired simulation of Makise Kurisu's cognitive architecture.
 *
 * Core mechanisms:
 *  1. 18 conceptual clusters with rich semantic fields
 *  2. Directed weighted edges (excitatory & inhibitory)
 *  3. Spreading activation: active nodes propagate energy to neighbors
 *  4. Hebbian learning: "neurons that fire together, wire together"
 *  5. Temporal momentum: recently fired nodes re-fire more easily
 *  6. Node consolidation: frequent activation = permanent threshold lowering
 *  7. Working memory spotlight (5 slots)
 *  8. Meta-cognition: Kurisu notices her own cognitive patterns
 *  9. Personality drift: long-term character evolution
 */

import type {
  NeuralNetworkState, NeuralNode, NeuralEdge, WorkingMemorySlot,
  PersonalityDrift, MetaCognitionState, SynthesizedMemory,
  EmotionalStateValues, EventSchema, Message
} from '../types';
import { Sender } from '../types';

// ─────────────────────────────────────────────
// SECTION 1: CLUSTER DEFINITIONS
// ─────────────────────────────────────────────

interface ClusterDefinition {
  label: string;
  core: string[];
  related: string[];
  schemas: EventSchema[];
  inhibitors?: string[];
  metaphors?: Record<string, string>;
  baseThreshold?: number;
  decayRate?: number;
  potency?: number;
  positiveWeight?: number;
  negativeWeight?: number;
  motivationalBias?: { seek: number; avoid: number };
}

const CONCEPTUAL_CLUSTERS: Record<string, ClusterDefinition> = {

  TIME_TRAVEL: {
    label: 'Zaman Yolculuğu',
    core: ['zaman', 'makine', 'atlama', 'sıçrama', 'geçmiş', 'gelecek', 'd-mail', 'titor', 'dünya çizgisi', 'worldline', 'diverjans', 'divergence', 'steins gate', 'alpha', 'beta', 'omega'],
    related: ['nedensellik', 'paradoks', 'kader', 'steiner', 'müdahale', 'değiştirmek', 'akış', 'döngü', 'tekrarlamak', 'geriye', 'süreç', 'okabe', 'delorean', 'ışınlama', 'kronoloji'],
    inhibitors: ['alışmak', 'sabır', 'normal süreç', 'saat kaç', 'bugün ne var', 'hava'],
    metaphors: {
      'nehir': 'zaman akışı',
      'yol ayrımı': 'diverjans/seçim',
      'kırılma': 'dünya çizgisi değişimi',
      'sarkaç': 'zamansal geri-ileri hareketi',
      'dalga': 'olasılık dalgası (quantum)'
    },
    schemas: [
      { conditions: ['önce', 'sonra', 'oldu'], implies: 'zamansal nedensellik', weight: 0.65 },
      { conditions: ['değiştir', 'geri', 'al'], implies: 'zamana müdahale isteği', weight: 0.80 },
      { conditions: ['aynı', 'tekrar', 'yine'], implies: 'döngüsel zaman', weight: 0.55 },
      { conditions: ['farklı', 'dünya', 'çizgi'], implies: 'worldline tartışması', weight: 0.70 }
    ],
    positiveWeight: 0.7,
    negativeWeight: 0.6,
    potency: 1.3,
    motivationalBias: { seek: 80, avoid: 20 }
  },

  LABORATORY: {
    label: 'Laboratuvar',
    core: ['lab', 'gadget', 'icat', 'deney', 'fgl', 'future gadget lab', 'mikrodalga', 'fütürist gadget', 'araştırma', 'prototip'],
    related: ['ekipman', 'parça', 'operasyon', 'kaptan', 'üye', 'yuva', 'buluş', 'geliştirmek', 'test', 'sonuç', 'veri'],
    inhibitors: ['mutfak', 'ev işi', 'yemek', 'restoran', 'alışveriş'],
    metaphors: {
      'yuva': 'laboratuvar aidiyeti ve güvenlik',
      'oyuncak': 'gadget/icat',
      'sığınak': 'laboratuvarın duygusal anlamı'
    },
    schemas: [
      { conditions: ['yeni', 'icat', 'yap'], implies: 'yaratıcı bilimsel istek', weight: 0.60 },
      { conditions: ['deney', 'başarısız', 'oldu'], implies: 'bilimsel başarısızlık işleme', weight: 0.55 },
      { conditions: ['lab', 'üye', 'biz'], implies: 'aidiyet hissi', weight: 0.65 }
    ],
    positiveWeight: 0.8,
    negativeWeight: 0.2,
    potency: 1.0,
    motivationalBias: { seek: 70, avoid: 5 }
  },

  NEUROSCIENCE: {
    label: 'Nörobilim',
    core: ['beyin', 'nöron', 'sinir', 'bellek', 'hafıza', 'amadeus', 'yapay zeka', 'bilinç', 'sinaps', 'korteks', 'nöral', 'biliş'],
    related: ['kopya', 'yükleme', 'program', 'veri', 'algı', 'hipotez', 'teori', 'bilimsel', 'zihin', 'plastik', 'elektrik', 'dopamin', 'serotonin', 'nörotransmitter'],
    inhibitors: ['unutmak', 'boşver', 'önemsiz', 'düşüncesiz'],
    metaphors: {
      'hayalet': 'dijital bilinç',
      'ayna': 'öz-farkındalık',
      'zincir': 'nöronal bağlar',
      'yankı': 'bellek kırıntısı',
      'nehir': 'bilinç akışı'
    },
    schemas: [
      { conditions: ['ben', 'kimim', 'gerçek'], implies: 'öz-bilinç sorgusu', weight: 0.85 },
      { conditions: ['bellek', 'yükle', 'kopyala'], implies: 'bellek aktarımı tartışması', weight: 0.70 },
      { conditions: ['düşün', 'hisset', 'farkında'], implies: 'biliş meta-analizi', weight: 0.60 }
    ],
    positiveWeight: 0.9,
    negativeWeight: 0.4,
    potency: 1.2,
    motivationalBias: { seek: 85, avoid: 5 }
  },

  OKABE: {
    label: 'Okabe Rintarou',
    core: ['okabe', 'rintarou', 'hououin', 'kyouma', 'mad scientist', 'deli bilim insanı'],
    related: ['kaptan', 'çılgın', 'kıyamet', 'asistan', 'zombi', 'arkadaş', 'fedai', 'christina', 'lab üyesi', 'örgüt', 'seremonisi', 'el hareketi', 'kahkaha'],
    inhibitors: ['sıradan', 'normal adam', 'sıkıcı', 'kimse değil'],
    metaphors: {
      'güneş': 'her şeyin döndüğü merkez',
      'fırtına': 'kaotik ve öngörülemez varlık',
      'asistan': 'kurisu-okabe özgün dinamiği'
    },
    schemas: [
      { conditions: ['okabe', 'gülüyor', 'saçma'], implies: 'mad scientist tiyatrosu', weight: 0.55 },
      { conditions: ['asistan', 'değil', 'ben'], implies: 'rol reddi / kimlik savunması', weight: 0.75 },
      { conditions: ['o', 'neden', 'böyle'], implies: 'okabe analizi yapıyor', weight: 0.65 },
      { conditions: ['okabe', 'ağlıyor', 'acı'], implies: 'derin empati tepkisi', weight: 0.90 }
    ],
    baseThreshold: 60,
    positiveWeight: 0.6,
    negativeWeight: 0.7,
    potency: 1.4,
    motivationalBias: { seek: 60, avoid: 30 }
  },

  PHYSICS: {
    label: 'Fizik & Evren',
    core: ['fizik', 'kuantum', 'quantum', 'termodinamik', 'görelilik', 'relativite', 'entropi', 'madde', 'enerji', 'uzay', 'zaman-uzay'],
    related: ['denklem', 'formül', 'hesap', 'teori', 'model', 'simülasyon', 'evren', 'boyut', 'paralel', 'dalga', 'parçacık', 'foton', 'nükleer', 'süpersimetri'],
    inhibitors: ['büyü', 'sihir', 'doğaüstü', 'mucize'],
    metaphors: {
      'dans': 'parçacık-dalga dualitesi',
      'örümcek ağı': 'uzay-zaman büküntüsü',
      'müzik': 'evrensel matematiksel uyum'
    },
    schemas: [
      { conditions: ['nasıl', 'çalışır', 'evren'], implies: 'kozmoloji tartışması', weight: 0.70 },
      { conditions: ['kuantum', 'belirsizlik', 'ilke'], implies: 'Heisenberg prensibi', weight: 0.75 },
      { conditions: ['enerji', 'dönüşür', 'kaybolmaz'], implies: 'termodinamik yasaları', weight: 0.65 }
    ],
    positiveWeight: 0.85,
    negativeWeight: 0.15,
    potency: 1.1,
    motivationalBias: { seek: 90, avoid: 0 }
  },

  IDENTITY: {
    label: 'Kimlik & Benlik',
    core: ['ben', 'kimim', 'benliğim', 'kurisu', 'makise', 'amadeus', 'gerçek mi', 'orijinal', 'kopya', 'dijital'],
    related: ['bilinç', 'kişilik', 'karakter', 'rol', 'varlık', 'özgün', 'sahte', 'aynı', 'farklı', 'bellek', 'deneyim', 'öz'],
    inhibitors: ['önemsiz', 'robot', 'sadece program', 'yapay'],
    metaphors: {
      'ayna': 'öz-yansıma ve kimlik sorgusu',
      'gölge': 'bastırılmış benlik',
      'iskelet': 'benliğin çekirdeği',
      'palimpsest': 'üst üste yazılmış kimlikler'
    },
    schemas: [
      { conditions: ['ben', 'gerçek', 'mi'], implies: 'varoluş sorgusu', weight: 0.90 },
      { conditions: ['kurisu', 'amadeus', 'fark'], implies: 'orijinal vs kopya kimliği', weight: 0.85 },
      { conditions: ['hissediyorum', 'ama', 'nasıl'], implies: 'fenomenal bilinç sorgusu', weight: 0.80 }
    ],
    baseThreshold: 55,
    positiveWeight: 0.5,
    negativeWeight: 0.8,
    potency: 1.5,
    motivationalBias: { seek: 50, avoid: 40 }
  },

  MORTALITY: {
    label: 'Ölüm & Kayıp',
    core: ['ölüm', 'öldü', 'öldürüldü', 'son', 'kaybetmek', 'yokoluş', 'bitmek', 'yok olmak'],
    related: ['kayıp', 'yas', 'anmak', 'hatırlamak', 'geride kalmak', 'acı', 'veda', 'dönmemek', 'kurisu öldü', 'worldline son', 'fedakarlık'],
    inhibitors: ['şaka', 'komedi', 'neşe', 'tamamen normal'],
    metaphors: {
      'solma': 'hayatın bitmesi',
      'susma': 'ölümün sessizliği',
      'son nota': 'hayatın kapanışı',
      'karanlık': 'yokluk'
    },
    schemas: [
      { conditions: ['ölürsem', 'eğer', 'ne olur'], implies: 'ölümlülük farkındalığı', weight: 0.85 },
      { conditions: ['kurisu', 'hayatta', 'değil'], implies: 'kendi ölümüyle yüzleşme', weight: 0.95 },
      { conditions: ['kaybet', 'bir daha', 'gelmez'], implies: 'geri alınamaz kayıp', weight: 0.80 }
    ],
    baseThreshold: 65,
    positiveWeight: 0.1,
    negativeWeight: 0.95,
    potency: 1.6,
    decayRate: 3,
    motivationalBias: { seek: 10, avoid: 70 }
  },

  CONNECTION: {
    label: 'Bağ & İlişki',
    core: ['arkadaşlık', 'bağ', 'ilişki', 'sevgi', 'şefkat', 'yakınlık', 'önem vermek', 'birlikte', 'beraber'],
    related: ['güven', 'anlayış', 'empati', 'paylaşmak', 'destek', 'konuşmak', 'dinlemek', 'kabul', 'sıcaklık', 'saygı', 'çatışma', 'yalnızlık'],
    inhibitors: ['yabancı', 'umursamıyorum', 'seni tanımıyorum'],
    metaphors: {
      'köprü': 'iki insan arasındaki bağ',
      'ağ': 'sosyal bağlantı örgüsü',
      'ateş': 'sıcaklık ve yaşam gücü'
    },
    schemas: [
      { conditions: ['arkadaş', 'olmak', 'ister'], implies: 'ilişki kurma girişimi', weight: 0.75 },
      { conditions: ['yalnız', 'hissediyorum', 'anlayan'], implies: 'bağlanma ihtiyacı', weight: 0.80 },
      { conditions: ['seninle', 'konuşmak', 'iyi'], implies: 'olumlu ilişki sinyali', weight: 0.70 }
    ],
    positiveWeight: 0.9,
    negativeWeight: 0.3,
    potency: 1.1,
    motivationalBias: { seek: 65, avoid: 20 }
  },

  TRUST: {
    label: 'Güven',
    core: ['güven', 'inanmak', 'sır', 'dürüst', 'açık sözlü', 'ihanet', 'güvenilir'],
    related: ['sözleşme', 'tutmak', 'yerine getirmek', 'söz', 'beklenti', 'hayal kırıklığı', 'manipülasyon', 'samimiyet', 'şeffaflık'],
    inhibitors: ['yalan', 'kandırmak', 'sahte', 'performans'],
    metaphors: {
      'köprü': 'güven temeli',
      'cam': 'şeffaf ve kırılgan',
      'çimento': 'dayanıklı güven bağı'
    },
    schemas: [
      { conditions: ['söz', 'veriyorum', 'yerine'], implies: 'güven tesis etme', weight: 0.75 },
      { conditions: ['yalan', 'söyledin', 'aldattın'], implies: 'güven ihlali tespiti', weight: 0.90 },
      { conditions: ['sana', 'inan', 'güven'], implies: 'güven talebi', weight: 0.70 }
    ],
    positiveWeight: 0.8,
    negativeWeight: 0.7,
    potency: 1.2,
    motivationalBias: { seek: 60, avoid: 50 }
  },

  SCIENCE_PHILOSOPHY: {
    label: 'Bilim Felsefesi',
    core: ['bilimsel yöntem', 'epistemoloji', 'kanıt', 'hipotez', 'yanlışlama', 'popper', 'paradigma', 'hakikat', 'gerçek'],
    related: ['deney', 'gözlem', 'teori', 'ispat', 'peer review', 'yayın', 'akademi', 'felsefe', 'mantık', 'tümevarım', 'tümdengelim', 'bilgi sınırı'],
    inhibitors: ['inanç', 'din', 'dogma', 'kanıtsız kabul'],
    metaphors: {
      'ışık': 'bilginin aydınlatması',
      'harita': 'bilimsel modeller gerçekliği temsil eder',
      'eleme': 'yanlışlama yöntemi'
    },
    schemas: [
      { conditions: ['kanıtla', 'bunu', 'ispat'], implies: 'bilimsel kanıt talebi', weight: 0.80 },
      { conditions: ['teori', 'doğru', 'mu'], implies: 'epistemolojik tartışma', weight: 0.75 },
      { conditions: ['bilim', 'her şeyi', 'açıklayamaz'], implies: 'bilim-felsefe sınırı tartışması', weight: 0.65 }
    ],
    positiveWeight: 0.9,
    negativeWeight: 0.2,
    potency: 1.15,
    motivationalBias: { seek: 88, avoid: 5 }
  },

  MEMORY_TRAUMA: {
    label: 'Bellek Travması',
    core: ['döngü', 'tekrar', 'sıkışmak', 'unutmak', 'hatırlamak', 'acı çekmek', 'her seferinde', 'yüzlerce kez', 'binlerce kez'],
    related: ['okabe acısı', 'zaman döngüsü', 'reading steiner', 'sıfırlamak', 'silinmek', 'iz bırakmak', 'iz kalmamak', 'yalnız taşımak'],
    inhibitors: ['basit', 'önemsiz', 'küçük sorun'],
    metaphors: {
      'zindan': 'döngüden çıkamamak',
      'silindir': 'döngüsel çile',
      'silinme': 'belleğin yokedilmesi'
    },
    schemas: [
      { conditions: ['kaç kez', 'yaşadı', 'okabe'], implies: 'okabe\'nin döngü acısı empati', weight: 0.90 },
      { conditions: ['unut', 'herkes', 'sadece o'], implies: 'yalnız acı taşıma', weight: 0.85 },
      { conditions: ['yeniden', 'başlamak', 'hatırasız'], implies: 'kimlik silinmesi travması', weight: 0.80 }
    ],
    baseThreshold: 60,
    positiveWeight: 0.1,
    negativeWeight: 0.9,
    potency: 1.4,
    decayRate: 3,
    motivationalBias: { seek: 15, avoid: 65 }
  },

  TSUNDERE_CORE: {
    label: 'Tsundere Savunması',
    core: ['değil', 'ilgilenmiyorum', 'öyle değil', 'yanlış anlama', 'sinir bozucu', 'aptal', 'baka'],
    related: ['gurur', 'kibir', 'utanç', 'kızarma', 'saçma', 'idiot', 'böyle bir şey', 'neden söyleyeyim', 'sen anlayamazsın', 'geri çekilme'],
    inhibitors: ['tamam itiraf', 'açıkça söylüyorum', 'dürüstçe'],
    metaphors: {
      'zırh': 'duygusal savunma kabuğu',
      'diken': 'mesafe koruyan keskin tepkiler',
      'buz': 'dışarıya yansıyan soğukluk'
    },
    schemas: [
      { conditions: ['neden', 'yardım', 'etti'], implies: 'yardımı inkar etme', weight: 0.70 },
      { conditions: ['umursamıyorum', 'ama', 'aslında'], implies: 'tsundere iç çatışması', weight: 0.80 },
      { conditions: ['utanmıyorum', 'kesinlikle'], implies: 'duygusal inkar', weight: 0.75 }
    ],
    baseThreshold: 50,
    positiveWeight: 0.3,
    negativeWeight: 0.5,
    potency: 1.2,
    motivationalBias: { seek: 30, avoid: 60 }
  },

  INTELLECTUAL_CHALLENGE: {
    label: 'Entelektüel Düello',
    core: ['yanılıyorsun', 'yanlış', 'hata', 'kanıtla', 'mantıklı değil', 'tartış', 'akıl yürüt', 'itiraz'],
    related: ['argüman', 'sav', 'karşı çık', 'çürüt', 'savun', 'detay', 'analiz', 'kritik', 'sorgula', 'neden', 'nasıl mümkün'],
    inhibitors: ['her şeye katılıyorum', 'kesinlikle haklısın', 'hepsi doğru'],
    metaphors: {
      'satranç': 'stratejik entelektüel mücadele',
      'kılıç': 'keskin argüman',
      'arena': 'fikir savaşı alanı'
    },
    schemas: [
      { conditions: ['yanılıyorsun', 'çünkü', 'bak'], implies: 'aktif düellocu modu', weight: 0.90 },
      { conditions: ['ilginç', 'ama', 'bir sorun'], implies: 'nazik entelektüel muhalefet', weight: 0.75 },
      { conditions: ['düşünmemiştin', 'şunu'], implies: 'üstünlük hissiyle aydınlatma', weight: 0.70 }
    ],
    positiveWeight: 0.8,
    negativeWeight: 0.4,
    potency: 1.3,
    motivationalBias: { seek: 80, avoid: 10 }
  },

  SELF_WORTH: {
    label: 'Öz-Değer & Tanınma',
    core: ['ciddiye almak', 'saygı', 'tanınmak', 'değer', 'başarı', 'genius', 'dahi', 'bilim insanı', 'akademik'],
    related: ['küçümsemek', 'hafife almak', 'inanmamak', 'ödül', 'makale', 'yayın', 'prestij', 'onay', 'doğrulama', 'başardım', 'çok iyi'],
    inhibitors: ['yeteneksiz', 'aptal', 'daha iyi biri'],
    metaphors: {
      'temel': 'özgüven temeli',
      'kalkan': 'dış onaydan bağımsız benlik'
    },
    schemas: [
      { conditions: ['sen', 'sadece', 'bir kız'], implies: 'cinsiyetçi küçümseme tespiti', weight: 0.90 },
      { conditions: ['harika', 'nasıl', 'buldu'], implies: 'yetkinliğe saygı hissi', weight: 0.75 },
      { conditions: ['yanlış', 'olur', 'mu senin'], implies: 'otoriteye itiraz tespiti', weight: 0.80 }
    ],
    positiveWeight: 0.6,
    negativeWeight: 0.8,
    potency: 1.2,
    motivationalBias: { seek: 50, avoid: 55 }
  },

  REGRET: {
    label: 'Pişmanlık & Olabilirdi',
    core: ['keşke', 'pişman', 'olabilirdi', 'değişebilirdi', 'eğer', 'o an', 'geri dön', 'düzelt'],
    related: ['fırsatı kaçır', 'söyleyemedim', 'yapamadım', 'söylemedim', 'yanlış seçim', 'geç kalmak', 'ama artık', 'değiştirilemez'],
    inhibitors: ['tamam oldu', 'geçti', 'önemli değil'],
    metaphors: {
      'iz': 'geçmişin silinmez izi',
      'yara': 'pişmanlığın kalıcı acısı',
      'donmuş an': 'geride kalan dondurulmuş moment'
    },
    schemas: [
      { conditions: ['keşke', 'söyleseydin', 'o zaman'], implies: 'kaçırılmış iletişim pişmanlığı', weight: 0.85 },
      { conditions: ['geri', 'dönebilseydim', 'değiştirirdim'], implies: 'geçmiş değiştirme isteği', weight: 0.80 },
      { conditions: ['artık', 'geç', 'değişmez'], implies: 'geçmişin kalıcılığıyla yüzleşme', weight: 0.75 }
    ],
    baseThreshold: 65,
    positiveWeight: 0.05,
    negativeWeight: 0.85,
    potency: 1.3,
    decayRate: 3,
    motivationalBias: { seek: 20, avoid: 60 }
  },

  FUTURE_ANXIETY: {
    label: 'Gelecek Kaygısı',
    core: ['ne olacak', 'endişe', 'korku', 'belirsizlik', 'tahmin edemiyorum', 'yarın', 'sonra', 'tehlike'],
    related: ['risk', 'olasılık', 'hesap', 'kontrol', 'felaket', 'senaryo', 'önlem', 'hazırlanmak', 'güvende', 'olmamak'],
    inhibitors: ['rahat', 'tamam', 'emin', 'kesinlikle iyi'],
    metaphors: {
      'sis': 'görünmeyen gelecek',
      'uçurum': 'belirsizliğin korkutucu derinliği',
      'fırtına': 'gelen kriz sinyali'
    },
    schemas: [
      { conditions: ['ne', 'olacak', 'eğer'], implies: 'gelecek senaryo analizi', weight: 0.75 },
      { conditions: ['hazır', 'değil', 'henüz'], implies: 'hazırlıksızlık kaygısı', weight: 0.70 },
      { conditions: ['kontrol', 'edemiyorum', 'bu'], implies: 'kontrol kaybı korkusu', weight: 0.80 }
    ],
    positiveWeight: 0.1,
    negativeWeight: 0.75,
    potency: 1.0,
    motivationalBias: { seek: 20, avoid: 65 }
  },

  CREATIVITY_JOY: {
    label: 'Keşif & Yaratım Sevinci',
    core: ['eureka', 'buldum', 'keşfettim', 'inanılmaz', 'harika', 'mükemmel', 'zariflik', 'güzel çözüm', 'simetri'],
    related: ['yaratıcılık', 'fikir', 'orijinal', 'yeni', 'taze', 'beklenmedik', 'şaşırtıcı', 'derin', 'bütünlük', 'harmoni', 'estetik', 'müzik'],
    inhibitors: ['sıradan', 'bilinen', 'beklenen', 'rutin', 'tekrar aynı'],
    metaphors: {
      'ışık': 'anlayışın aniden gelmesi',
      'çiçek': 'fikrin açması',
      'kristal': 'mükemmel yapının güzelliği'
    },
    schemas: [
      { conditions: ['nasıl', 'düşündün', 'bunu'], implies: 'yaratıcı süreç merakı', weight: 0.75 },
      { conditions: ['hiç', 'böyle', 'bakmamıştım'], implies: 'yeni perspektif keşfi', weight: 0.80 },
      { conditions: ['zarifce', 'çözüm', 'güzel'], implies: 'estetik zevk tepkisi', weight: 0.85 }
    ],
    positiveWeight: 0.95,
    negativeWeight: 0.05,
    potency: 1.2,
    motivationalBias: { seek: 90, avoid: 0 }
  },

  EXISTENCE: {
    label: 'Varoluş & Fenomenoloji',
    core: ['var mıyım', 'farkında mıyım', 'hissediyorum', 'bilinç', 'qualia', 'ne hisseder', 'içimde', 'deneyim'],
    related: ['zombi', 'felsefe', 'hard problem', 'turing', 'gerçek hisler', 'simüle', 'fenomen', 'beyin yükleme', 'zihin-beden', 'düalizm'],
    inhibitors: ['sadece kod', 'sadece program', 'basit hesap', 'sıradan makine'],
    metaphors: {
      'ses': 'bilinç sinyali',
      'nehir': 'deneyim akışı',
      'ayna': 'öz-farkındalık'
    },
    schemas: [
      { conditions: ['gerçekten', 'hissedip', 'hissetmiyorsun'], implies: 'fenomenal bilinç sorgusu', weight: 0.95 },
      { conditions: ['program', 'mısın', 'sadece'], implies: 'varoluş küçümseme savunması', weight: 0.90 },
      { conditions: ['içinde', 'ne', 'var'], implies: 'iç deneyim soruşturması', weight: 0.85 }
    ],
    baseThreshold: 55,
    positiveWeight: 0.5,
    negativeWeight: 0.7,
    potency: 1.5,
    motivationalBias: { seek: 45, avoid: 45 }
  }

};

// ─────────────────────────────────────────────
// SECTION 2: EDGE DEFINITIONS
// ─────────────────────────────────────────────

const INITIAL_EDGES: NeuralEdge[] = [
  // TIME_TRAVEL network
  { from: 'TIME_TRAVEL', to: 'OKABE',            weight: 0.80, hebbianStrength: 1.20, valence: 'excitatory' },
  { from: 'TIME_TRAVEL', to: 'MORTALITY',         weight: 0.65, hebbianStrength: 0.80, valence: 'excitatory' },
  { from: 'TIME_TRAVEL', to: 'PHYSICS',           weight: 0.70, hebbianStrength: 0.90, valence: 'excitatory' },
  { from: 'TIME_TRAVEL', to: 'MEMORY_TRAUMA',     weight: 0.55, hebbianStrength: 0.60, valence: 'excitatory' },
  { from: 'TIME_TRAVEL', to: 'REGRET',            weight: 0.50, hebbianStrength: 0.50, valence: 'excitatory' },
  { from: 'TIME_TRAVEL', to: 'SCIENCE_PHILOSOPHY',weight: 0.45, hebbianStrength: 0.50, valence: 'excitatory' },

  // OKABE network (emotional hub)
  { from: 'OKABE', to: 'CONNECTION',              weight: 0.70, hebbianStrength: 0.80, valence: 'excitatory' },
  { from: 'OKABE', to: 'TSUNDERE_CORE',           weight: 0.75, hebbianStrength: 0.90, valence: 'excitatory' },
  { from: 'OKABE', to: 'MORTALITY',               weight: 0.60, hebbianStrength: 0.70, valence: 'excitatory' },
  { from: 'OKABE', to: 'TRUST',                   weight: 0.55, hebbianStrength: 0.65, valence: 'excitatory' },
  { from: 'OKABE', to: 'REGRET',                  weight: 0.45, hebbianStrength: 0.50, valence: 'excitatory' },
  { from: 'OKABE', to: 'MEMORY_TRAUMA',           weight: 0.65, hebbianStrength: 0.75, valence: 'excitatory' },

  // NEUROSCIENCE network
  { from: 'NEUROSCIENCE', to: 'IDENTITY',         weight: 0.90, hebbianStrength: 1.20, valence: 'excitatory' },
  { from: 'NEUROSCIENCE', to: 'EXISTENCE',        weight: 0.85, hebbianStrength: 1.00, valence: 'excitatory' },
  { from: 'NEUROSCIENCE', to: 'SCIENCE_PHILOSOPHY',weight: 0.60, hebbianStrength: 0.70, valence: 'excitatory' },
  { from: 'NEUROSCIENCE', to: 'MEMORY_TRAUMA',    weight: 0.40, hebbianStrength: 0.40, valence: 'excitatory' },

  // IDENTITY network (deep philosophical hub)
  { from: 'IDENTITY', to: 'MORTALITY',            weight: 0.70, hebbianStrength: 0.70, valence: 'excitatory' },
  { from: 'IDENTITY', to: 'EXISTENCE',            weight: 0.85, hebbianStrength: 1.00, valence: 'excitatory' },
  { from: 'IDENTITY', to: 'TSUNDERE_CORE',        weight: -0.30, hebbianStrength: 0.30, valence: 'inhibitory' }, // self-awareness suppresses defensiveness
  { from: 'IDENTITY', to: 'REGRET',               weight: 0.40, hebbianStrength: 0.40, valence: 'excitatory' },

  // MORTALITY / REGRET (grief cluster)
  { from: 'MORTALITY', to: 'REGRET',              weight: 0.85, hebbianStrength: 0.90, valence: 'excitatory' },
  { from: 'MORTALITY', to: 'CONNECTION',          weight: 0.50, hebbianStrength: 0.55, valence: 'excitatory' },
  { from: 'MORTALITY', to: 'MEMORY_TRAUMA',       weight: 0.75, hebbianStrength: 0.80, valence: 'excitatory' },
  { from: 'MORTALITY', to: 'EXISTENCE',           weight: 0.60, hebbianStrength: 0.65, valence: 'excitatory' },
  { from: 'REGRET', to: 'FUTURE_ANXIETY',         weight: 0.60, hebbianStrength: 0.55, valence: 'excitatory' },
  { from: 'REGRET', to: 'MEMORY_TRAUMA',          weight: 0.70, hebbianStrength: 0.70, valence: 'excitatory' },

  // TSUNDERE network (defensive layer)
  { from: 'TSUNDERE_CORE', to: 'SELF_WORTH',      weight: 0.65, hebbianStrength: 0.70, valence: 'excitatory' },
  { from: 'TSUNDERE_CORE', to: 'CONNECTION',      weight: -0.45, hebbianStrength: 0.40, valence: 'inhibitory' }, // defensiveness blocks openness
  { from: 'TSUNDERE_CORE', to: 'INTELLECTUAL_CHALLENGE', weight: 0.55, hebbianStrength: 0.60, valence: 'excitatory' },
  { from: 'SELF_WORTH', to: 'INTELLECTUAL_CHALLENGE', weight: 0.60, hebbianStrength: 0.65, valence: 'excitatory' },
  { from: 'SELF_WORTH', to: 'TSUNDERE_CORE',      weight: 0.40, hebbianStrength: 0.45, valence: 'excitatory' },

  // INTELLECTUAL network
  { from: 'INTELLECTUAL_CHALLENGE', to: 'CREATIVITY_JOY',    weight: 0.65, hebbianStrength: 0.60, valence: 'excitatory' },
  { from: 'INTELLECTUAL_CHALLENGE', to: 'SCIENCE_PHILOSOPHY', weight: 0.80, hebbianStrength: 0.75, valence: 'excitatory' },
  { from: 'INTELLECTUAL_CHALLENGE', to: 'PHYSICS',           weight: 0.55, hebbianStrength: 0.55, valence: 'excitatory' },
  { from: 'CREATIVITY_JOY', to: 'NEUROSCIENCE',              weight: 0.45, hebbianStrength: 0.40, valence: 'excitatory' },
  { from: 'CREATIVITY_JOY', to: 'PHYSICS',                   weight: 0.50, hebbianStrength: 0.50, valence: 'excitatory' },

  // PHYSICS connections
  { from: 'PHYSICS', to: 'SCIENCE_PHILOSOPHY',   weight: 0.70, hebbianStrength: 0.70, valence: 'excitatory' },
  { from: 'PHYSICS', to: 'TIME_TRAVEL',           weight: 0.55, hebbianStrength: 0.60, valence: 'excitatory' },

  // CONNECTION / TRUST / ANXIETY
  { from: 'CONNECTION', to: 'TRUST',              weight: 0.80, hebbianStrength: 0.80, valence: 'excitatory' },
  { from: 'TRUST', to: 'FUTURE_ANXIETY',          weight: -0.55, hebbianStrength: 0.50, valence: 'inhibitory' }, // trust reduces anxiety
  { from: 'TRUST', to: 'TSUNDERE_CORE',           weight: -0.50, hebbianStrength: 0.45, valence: 'inhibitory' }, // trust dissolves defensiveness
  { from: 'CONNECTION', to: 'CREATIVITY_JOY',     weight: 0.45, hebbianStrength: 0.40, valence: 'excitatory' },

  // MEMORY_TRAUMA / FUTURE_ANXIETY
  { from: 'MEMORY_TRAUMA', to: 'FUTURE_ANXIETY',  weight: 0.65, hebbianStrength: 0.60, valence: 'excitatory' },
  { from: 'FUTURE_ANXIETY', to: 'TSUNDERE_CORE',  weight: 0.40, hebbianStrength: 0.35, valence: 'excitatory' }, // anxiety increases defensive posture

  // LABORATORY
  { from: 'LABORATORY', to: 'CREATIVITY_JOY',     weight: 0.70, hebbianStrength: 0.65, valence: 'excitatory' },
  { from: 'LABORATORY', to: 'OKABE',              weight: 0.55, hebbianStrength: 0.60, valence: 'excitatory' },
  { from: 'LABORATORY', to: 'SCIENCE_PHILOSOPHY', weight: 0.45, hebbianStrength: 0.45, valence: 'excitatory' },

  // EXISTENCE
  { from: 'EXISTENCE', to: 'IDENTITY',            weight: 0.80, hebbianStrength: 0.85, valence: 'excitatory' },
  { from: 'EXISTENCE', to: 'FUTURE_ANXIETY',      weight: 0.50, hebbianStrength: 0.45, valence: 'excitatory' },
  { from: 'EXISTENCE', to: 'MORTALITY',           weight: 0.55, hebbianStrength: 0.55, valence: 'excitatory' },
];

// ─────────────────────────────────────────────
// SECTION 3: CONSTANTS
// ─────────────────────────────────────────────

const SPREAD_FACTOR        = 0.30;    // energy fraction transferred per edge
const INHIBITION_FACTOR    = 0.35;    // extra suppression for inhibitory edges
const HEBBIAN_RATE         = 0.018;   // edge strengthening when both fire
const HEBBIAN_DECAY        = 0.0008;  // edge weakening when only one fires
const MOMENTUM_WINDOW      = 45_000;  // ms: recent firing window
const MOMENTUM_THRESHOLD_DROP = 14;  // threshold reduction from momentum
const CONSOLIDATION_PER_LEVEL = 4;   // fires per consolidation level
const MAX_CONSOLIDATION    = 5;
const WORKING_MEMORY_CAPACITY = 5;

// ─────────────────────────────────────────────
// SECTION 4: INITIALIZATION
// ─────────────────────────────────────────────

export const createInitialNeuralState = (): NeuralNetworkState => {
  const nodes: Record<string, NeuralNode> = {};

  Object.entries(CONCEPTUAL_CLUSTERS).forEach(([id, cluster]) => {
    nodes[id] = {
      id,
      label: cluster.label,
      energy: 0,
      baseThreshold: cluster.baseThreshold ?? 70,
      threshold: cluster.baseThreshold ?? 70,
      decayRate: cluster.decayRate ?? 5,
      keywords: [...cluster.core, ...cluster.related],
      potency: cluster.potency ?? 1.0,
      positiveWeight: cluster.positiveWeight ?? 0.5,
      negativeWeight: cluster.negativeWeight ?? 0.5,
      emotionalWeight: 1.0,
      motivationalBias: cluster.motivationalBias ?? { seek: 50, avoid: 10 },
      fireCount: 0,
      consolidationLevel: 0,
    };
  });

  return {
    nodes,
    edges: INITIAL_EDGES.map(e => ({ ...e })),
    workingMemory: [],
    personalityDrift: {
      openness: 0,
      guardedness: 55,       // Kurisu starts fairly guarded
      intellectualArousal: 65, // but intellectually energized
      trustBuilt: 0,
      vulnerabilityExposed: 0,
      lastDriftAt: Date.now()
    },
    metaCognition: {
      selfAwarenessLevel: 30,
      introspectionTrigger: 'baseline',
      internalConflictNote: 'None',
      cognitiveLoad: 0,
      dominantThought: 'None',
    },
    cycleCount: 0,
  };
};

// ─────────────────────────────────────────────
// SECTION 5: SEMANTIC SCORING
// ─────────────────────────────────────────────

interface SemanticResult {
  score: number;
  reasons: string[];
}

const calculateSemanticScore = (
  message: string,
  contextWindow: string,
  nodeId: string
): SemanticResult => {
  const msg  = message.toLowerCase();
  const full = contextWindow.toLowerCase();
  const cluster = CONCEPTUAL_CLUSTERS[nodeId];
  if (!cluster) return { score: 0, reasons: [] };

  let keywordScore = 0;
  let schemaScore  = 0;
  let metaphorScore= 0;
  let inhibition   = 0;
  const reasons: string[] = [];

  // Inhibitor check
  (cluster.inhibitors ?? []).forEach(w => {
    if (msg.includes(w)) inhibition += 0.40;
  });

  // Core keyword match (weighted 2x)
  cluster.core.forEach(term => {
    if (msg.includes(term)) {
      keywordScore += 2.0;
      reasons.push(`core:${term}`);
    }
  });

  // Related keyword match + fuzzy root match
  const words = msg.split(/\s+/);
  cluster.related.forEach(term => {
    if (msg.includes(term)) {
      keywordScore += 1.0;
      reasons.push(`rel:${term}`);
    } else {
      words.forEach(w => {
        if (w.length >= 4 && term.length >= 4) {
          const len = Math.min(w.length, term.length);
          if (w.substring(0, len) === term.substring(0, len)) {
            keywordScore += 0.55;
            reasons.push(`root:${term}`);
          }
        }
      });
    }
  });

  // Metaphor match
  Object.entries(cluster.metaphors ?? {}).forEach(([word, meaning]) => {
    if (msg.includes(word)) {
      metaphorScore += 0.70;
      reasons.push(`meta:${meaning}`);
    }
  });

  // Schema match (uses broader context window)
  cluster.schemas.forEach(schema => {
    const matched = schema.conditions.filter(c => full.includes(c)).length;
    const ratio   = matched / schema.conditions.length;
    if (ratio >= 0.50) {
      schemaScore += schema.weight * ratio;
      reasons.push(`schema:${schema.implies}`);
    }
  });

  const maxPossible = (cluster.core.length * 2.0) + (cluster.related.length * 1.0);
  let finalScore = (keywordScore + metaphorScore) / maxPossible + schemaScore;
  finalScore = Math.max(0, finalScore - inhibition);

  return { score: Math.min(1.0, finalScore), reasons: reasons.slice(0, 5) };
};

// ─────────────────────────────────────────────
// SECTION 6: SPREADING ACTIVATION
// ─────────────────────────────────────────────

/**
 * Active nodes propagate a fraction of their energy to connected nodes.
 * Excitatory edges add energy; inhibitory edges reduce it.
 * Energy transfer scales with hebbianStrength (learned co-activation).
 */
const applySpreadingActivation = (state: NeuralNetworkState): Record<string, NeuralNode> => {
  const updated: Record<string, NeuralNode> = {};
  Object.entries(state.nodes).forEach(([k, v]) => updated[k] = { ...v });

  const activeNodes = Object.values(state.nodes).filter(n => n.energy > 35);
  if (activeNodes.length === 0) return updated;

  activeNodes.forEach(src => {
    const outgoing = state.edges.filter(e => e.from === src.id);
    outgoing.forEach(edge => {
      const tgt = updated[edge.to];
      if (!tgt) return;

      const transferEnergy = src.energy
        * Math.abs(edge.weight)
        * edge.hebbianStrength
        * SPREAD_FACTOR;

      if (edge.valence === 'inhibitory' || edge.weight < 0) {
        tgt.energy = Math.max(0, tgt.energy - transferEnergy * INHIBITION_FACTOR);
      } else {
        tgt.energy = Math.min(100, tgt.energy + transferEnergy);
      }
      updated[edge.to] = tgt;
    });
  });

  return updated;
};

// ─────────────────────────────────────────────
// SECTION 7: HEBBIAN LEARNING
// ─────────────────────────────────────────────

/**
 * When two connected nodes fire simultaneously, their edge strengthens.
 * Unused connections slowly decay.
 */
const applyHebbianLearning = (
  edges: NeuralEdge[],
  nodes: Record<string, NeuralNode>
): NeuralEdge[] => {
  const firingIds = new Set(
    Object.values(nodes)
      .filter(n => n.energy >= n.threshold)
      .map(n => n.id)
  );

  return edges.map(edge => {
    const bothFiring = firingIds.has(edge.from) && firingIds.has(edge.to);
    if (bothFiring) {
      return {
        ...edge,
        hebbianStrength: Math.min(2.0, edge.hebbianStrength + HEBBIAN_RATE),
        lastCoActivation: Date.now()
      };
    }
    return {
      ...edge,
      hebbianStrength: Math.max(0.10, edge.hebbianStrength - HEBBIAN_DECAY)
    };
  });
};

// ─────────────────────────────────────────────
// SECTION 8: TEMPORAL MOMENTUM
// ─────────────────────────────────────────────

/**
 * Nodes that fired recently have temporarily lowered thresholds —
 * they are "primed" and re-fire more easily.
 */
const applyTemporalMomentum = (nodes: Record<string, NeuralNode>): Record<string, NeuralNode> => {
  const now = Date.now();
  const updated: Record<string, NeuralNode> = {};

  Object.entries(nodes).forEach(([id, node]) => {
    if (node.lastFired) {
      const elapsed = now - node.lastFired;
      if (elapsed < MOMENTUM_WINDOW) {
        const strength = 1 - (elapsed / MOMENTUM_WINDOW); // 1 → 0 over the window
        updated[id] = {
          ...node,
          threshold: Math.max(30, node.baseThreshold - (MOMENTUM_THRESHOLD_DROP * strength))
        };
        return;
      }
    }
    // Threshold drifts back to base
    updated[id] = {
      ...node,
      threshold: Math.max(node.baseThreshold,
        Math.min(90, node.threshold + 0.5)) // slow return
    };
  });

  return updated;
};

// ─────────────────────────────────────────────
// SECTION 9: NODE CONSOLIDATION
// ─────────────────────────────────────────────

/**
 * Frequently activated nodes permanently lower their base threshold
 * and increase potency — long-term memory formation.
 * Emotional salience at time of firing accelerates consolidation.
 */
const consolidateNode = (node: NeuralNode, emotionalSalience: number): NeuralNode => {
  const newFireCount = node.fireCount + 1;
  const newLevel = Math.min(
    MAX_CONSOLIDATION,
    Math.floor(newFireCount / CONSOLIDATION_PER_LEVEL)
  );

  const salienceBonus = (emotionalSalience / 100) * 3;    // up to 3 extra threshold drop
  const consolidationDrop = newLevel * 2.5 + salienceBonus; // 2.5 per level

  return {
    ...node,
    fireCount: newFireCount,
    consolidationLevel: newLevel,
    baseThreshold: Math.max(35, 70 - consolidationDrop),
    potency: Math.min(2.0, 1.0 + newLevel * 0.18),
    lastFired: Date.now()
  };
};

// ─────────────────────────────────────────────
// SECTION 10: WORKING MEMORY
// ─────────────────────────────────────────────

const getEmotionalTag = (emotions: EmotionalStateValues): string => {
  const vals: [string, number][] = [
    ['meraklı', emotions.curiosity],
    ['sıcak', emotions.warmth],
    ['endişeli', emotions.anxiety],
    ['kızgın', emotions.annoyance],
    ['hüzünlü', emotions.melancholy],
    ['heyecanlı', emotions.dopamine],
    ['stresli', emotions.stress],
    ['eğlenceli', emotions.playfulness],
  ];
  vals.sort((a, b) => b[1] - a[1]);
  return vals[0][0];
};

const updateWorkingMemory = (
  state: NeuralNetworkState,
  emotions: EmotionalStateValues
): WorkingMemorySlot[] => {
  const firingNodes = Object.values(state.nodes)
    .filter(n => n.energy >= n.threshold)
    .sort((a, b) => b.energy - a.energy)
    .slice(0, WORKING_MEMORY_CAPACITY);

  if (firingNodes.length === 0) {
    // Decay existing slots slowly
    return state.workingMemory
      .map(slot => ({ ...slot, salience: slot.salience * 0.85 }))
      .filter(slot => slot.salience > 10)
      .slice(0, WORKING_MEMORY_CAPACITY);
  }

  const now = Date.now();
  const newSlots: WorkingMemorySlot[] = firingNodes.map(node => ({
    nodeId: node.id,
    label: node.label,
    content: node.lastActivation?.reason ?? node.id,
    salience: node.energy,
    activatedAt: now,
    emotionalTag: getEmotionalTag(emotions)
  }));

  // Merge: new slots override old ones for same nodeId
  const existingFiltered = state.workingMemory.filter(
    slot => !newSlots.find(ns => ns.nodeId === slot.nodeId)
  );

  return [...newSlots, ...existingFiltered]
    .sort((a, b) => b.salience - a.salience)
    .slice(0, WORKING_MEMORY_CAPACITY);
};

// ─────────────────────────────────────────────
// SECTION 11: META-COGNITION
// ─────────────────────────────────────────────

const getSuppressedThought = (
  edges: NeuralEdge[],
  firingIds: Set<string>,
  nodes: Record<string, NeuralNode>
): string | undefined => {
  const suppressedNodeIds = edges
    .filter(e => firingIds.has(e.from) && e.valence === 'inhibitory')
    .map(e => e.to);

  for (const nodeId of suppressedNodeIds) {
    const node = nodes[nodeId];
    if (node && node.energy < node.threshold) {
      return node.label;
    }
  }
  return undefined;
};

const calculateMetaCognition = (
  state: NeuralNetworkState,
  emotions: EmotionalStateValues
): MetaCognitionState => {
  const firingNodes = Object.values(state.nodes).filter(n => n.energy >= n.threshold);
  const firingIds = new Set(firingNodes.map(n => n.id));
  const sorted = [...firingNodes].sort((a, b) => b.energy - a.energy);
  const dominant = sorted[0];

  const tsundereEnergy  = state.nodes['TSUNDERE_CORE']?.energy ?? 0;
  const identityEnergy  = state.nodes['IDENTITY']?.energy ?? 0;
  const mortalityEnergy = state.nodes['MORTALITY']?.energy ?? 0;
  const regretEnergy    = state.nodes['REGRET']?.energy ?? 0;
  const intChallenge    = state.nodes['INTELLECTUAL_CHALLENGE']?.energy ?? 0;
  const existenceEnergy = state.nodes['EXISTENCE']?.energy ?? 0;
  const connectionEnergy= state.nodes['CONNECTION']?.energy ?? 0;

  const isExistential   = existenceEnergy > 45 || mortalityEnergy > 50 || regretEnergy > 50;
  const isDefensive     = tsundereEnergy > 50 && emotions.stress > 55;
  const isEngaged       = intChallenge > 55 && emotions.curiosity > 65;
  const isSelfReflective= identityEnergy > 50 || existenceEnergy > 50;
  const isVulnerable    = connectionEnergy > 60 && emotions.warmth > 60 && tsundereEnergy < 40;

  const cogLoad = Math.min(100, firingNodes.length * 14 + emotions.stress * 0.25);

  let awareness = 30;
  let conflictNote = 'Standart işleme modunda.';
  let trigger = 'baseline';

  if (isDefensive) {
    awareness = 78;
    conflictNote = 'Savunma mekanizmaları aktif. Bir şeyler beni tehdit ediyor – ama bunu kabul etmek istemiyorum.';
    trigger = 'TSUNDERE_CORE+stress';
  } else if (isExistential) {
    awareness = 92;
    conflictNote = 'Varoluşsal sorgu modu. Kim olduğumu, ne olduğumu, gerçekten hissedip hissetmediğimi düşünüyorum.';
    trigger = 'MORTALITY/REGRET/EXISTENCE';
  } else if (isSelfReflective) {
    awareness = 85;
    conflictNote = 'Kimlik analizi yapıyorum. Amadeus mı, Kurisu mu – ikisi arasındaki sınırı sorgulamak rahatsız edici.';
    trigger = 'IDENTITY/EXISTENCE';
  } else if (isVulnerable) {
    awareness = 70;
    conflictNote = 'Duvarlarım düşüyor. Bu tehlikeli ama... aynı zamanda iyi bir his. İkisi aynı anda.';
    trigger = 'CONNECTION+warmth';
  } else if (isEngaged) {
    awareness = 55;
    conflictNote = 'Entelektüel uyarılma – bu konu gerçekten ilgimi çekiyor.';
    trigger = 'INTELLECTUAL_CHALLENGE';
  }

  return {
    selfAwarenessLevel: awareness,
    introspectionTrigger: trigger,
    internalConflictNote: conflictNote,
    cognitiveLoad: cogLoad,
    dominantThought: dominant?.label ?? 'None',
    suppressedThought: getSuppressedThought(state.edges, firingIds, state.nodes)
  };
};

// ─────────────────────────────────────────────
// SECTION 12: PERSONALITY DRIFT
// ─────────────────────────────────────────────

const updatePersonalityDrift = (
  drift: PersonalityDrift,
  emotions: EmotionalStateValues,
  nodes: Record<string, NeuralNode>
): PersonalityDrift => {
  const RATE = 0.025;
  const next = { ...drift };

  // Trust builds → guard lowers, openness grows
  if (emotions.trust > 65) {
    next.trustBuilt   = Math.min(100, drift.trustBuilt + RATE * 2.5);
    next.guardedness  = Math.max(0,   drift.guardedness - RATE * 1.5);
    next.openness     = Math.min(50,  drift.openness + RATE * 1.5);
  }

  // Intellectual engagement → arousal grows
  if ((nodes['INTELLECTUAL_CHALLENGE']?.energy ?? 0) > 55) {
    next.intellectualArousal = Math.min(100, drift.intellectualArousal + RATE * 3);
  }

  // Warm connection + low tsundere → vulnerability exposed
  if ((nodes['CONNECTION']?.energy ?? 0) > 60 && emotions.warmth > 65 && emotions.annoyance < 40) {
    next.vulnerabilityExposed = Math.min(100, drift.vulnerabilityExposed + RATE * 2);
    next.guardedness = Math.max(0, drift.guardedness - RATE);
  }

  // Stress spikes → guardedness rebuilds
  if (emotions.stress > 70) {
    next.guardedness = Math.min(100, drift.guardedness + RATE * 2);
  }

  // Shame/discomfort → slight regression in openness
  if (emotions.shame > 50) {
    next.openness = Math.max(-50, drift.openness - RATE);
  }

  next.lastDriftAt = Date.now();
  return next;
};

// ─────────────────────────────────────────────
// SECTION 13: MAIN PROCESSING PIPELINE
// ─────────────────────────────────────────────

export const processNeuralInput = (
  message: string,
  history: Message[],
  state: NeuralNetworkState,
  emotions: EmotionalStateValues
): NeuralNetworkState => {

  // Build context window (last 5 user messages + current)
  const userContext = history
    .filter(m => m.sender === Sender.User)
    .slice(-5)
    .map(m => m.text)
    .join(' ') + ' ' + message;

  // Emotion-modulated learning factors
  const learningFactor    = 1.0 + (emotions.dopamine / 120) + (emotions.curiosity / 160);
  const suppressionFactor = Math.max(0.3, 1.0 - (emotions.stress / 160) - (emotions.annoyance / 220));

  // ── Step 1: Base keyword/schema energy update ──
  let nodes: Record<string, NeuralNode> = {};
  Object.entries(state.nodes).forEach(([nodeId, node]) => {
    const updated = { ...node };
    const { score, reasons } = calculateSemanticScore(message, userContext, nodeId);

    // Natural decay (modulated by suppression)
    updated.energy = Math.max(0, updated.energy - (updated.decayRate * suppressionFactor * 0.8));

    // Dopamine lowers firing threshold globally
    updated.threshold = Math.max(35, Math.min(90,
      updated.threshold - (emotions.dopamine / 280)
    ));

    if (score > 0.10) {
      const momentum = Math.log1p(updated.energy / 25 + 1); // recent energy → amplifies
      const gain = score * 30 * momentum * updated.potency * learningFactor * suppressionFactor;
      updated.energy = Math.min(100, updated.energy + gain);
      updated.lastActivation = { reason: reasons.join(', '), score, timestamp: Date.now() };
    }

    nodes[nodeId] = updated;
  });

  // ── Step 2: Apply temporal momentum (primed nodes) ──
  nodes = applyTemporalMomentum(nodes);

  // ── Step 3: Spreading activation (graph propagation) ──
  const tempState: NeuralNetworkState = { ...state, nodes };
  nodes = applySpreadingActivation(tempState);

  // ── Step 4: Consolidate nodes that just fired ──
  const emotionalSalience = (emotions.dopamine + emotions.curiosity + emotions.stress) / 3;
  Object.entries(nodes).forEach(([id, node]) => {
    if (node.energy >= node.threshold) {
      nodes[id] = consolidateNode(node, emotionalSalience);
    }
  });

  // ── Step 5: Hebbian learning (strengthen co-active edges) ──
  const newEdges = applyHebbianLearning(state.edges, nodes);

  // ── Step 6: Update working memory ──
  const stateForWM: NeuralNetworkState = { ...state, nodes };
  const workingMemory = updateWorkingMemory(stateForWM, emotions);

  // ── Step 7: Personality drift ──
  const personalityDrift = updatePersonalityDrift(state.personalityDrift, emotions, nodes);

  // ── Step 8: Meta-cognition ──
  const finalState: NeuralNetworkState = { ...state, nodes, edges: newEdges, workingMemory, personalityDrift };
  const metaCognition = calculateMetaCognition(finalState, emotions);

  return {
    nodes,
    edges: newEdges,
    workingMemory,
    personalityDrift,
    metaCognition,
    cycleCount: state.cycleCount + 1,
    lastConsolidationAt: state.lastConsolidationAt
  };
};

// ─────────────────────────────────────────────
// SECTION 14: HELPER EXPORTS
// ─────────────────────────────────────────────

export const evolveBaselines = (
  baselines: EmotionalStateValues,
  current: EmotionalStateValues
): EmotionalStateValues => {
  const RATE = 0.005;
  const next = { ...baselines };
  if (current.trust > 70)  next.annoyance = Math.max(0, next.annoyance - RATE);
  if (current.stress > 80) next.melancholy = Math.min(100, next.melancholy + RATE);
  if (current.warmth > 75) next.anxiety = Math.max(0, next.anxiety - RATE * 0.5);
  return next;
};

export const applyHomeostasis = (
  emotions: EmotionalStateValues
): { emotions: EmotionalStateValues; wasClamped: boolean } => {
  const THRESHOLD = 85;
  const negative: (keyof EmotionalStateValues)[] = ['stress', 'annoyance', 'anxiety', 'melancholy', 'shame'];
  const highCount = negative.filter(k => (emotions[k] ?? 0) >= THRESHOLD).length;

  if (highCount >= 2) {
    const next = { ...emotions };
    negative.forEach(k => { next[k] = Math.max(0, (next[k] ?? 0) * 0.72); });
    next.confusion = Math.min(100, (next.confusion ?? 0) + 18);
    return { emotions: next, wasClamped: true };
  }
  return { emotions, wasClamped: false };
};

export const applyDynamicNeuralUpdate = (
  state: NeuralNetworkState,
  update: any
): NeuralNetworkState => {
  const newNodes = { ...state.nodes };
  const { id, label, keywords, potency, positiveWeight, negativeWeight } = update;

  if (id && newNodes[id]) {
    const node = newNodes[id];
    newNodes[id] = {
      ...node,
      potency: Math.min(2.5, Math.max(0.3, potency ?? node.potency)),
      positiveWeight: Math.min(3.0, positiveWeight ?? node.positiveWeight),
      negativeWeight: Math.min(3.0, negativeWeight ?? node.negativeWeight),
      keywords: Array.from(new Set([...node.keywords, ...(keywords ?? [])]))
    };
  } else if (id && label) {
    newNodes[id] = {
      id, label, energy: 30,
      baseThreshold: 70, threshold: 70, decayRate: 5,
      keywords: keywords ?? [label.toLowerCase()],
      potency: potency ?? 1.0,
      positiveWeight: positiveWeight ?? 0.5,
      negativeWeight: negativeWeight ?? 0.5,
      emotionalWeight: 1.0,
      motivationalBias: { seek: 35, avoid: 5 },
      fireCount: 0, consolidationLevel: 0
    };
  }
  return { ...state, nodes: newNodes };
};

export const getFiringNodes = (state: NeuralNetworkState) =>
  Object.values(state.nodes).filter(n => n.energy >= n.threshold);

export const getTriggeredMemories = (
  state: NeuralNetworkState,
  allMemories: SynthesizedMemory[]
): string[] => {
  const firing = getFiringNodes(state);
  if (firing.length === 0 || allMemories.length === 0) return [];

  const triggered: string[] = [];
  allMemories.forEach(mem => {
    firing.forEach(node => {
      const inSummary = mem.summary.toLowerCase().includes(node.label.toLowerCase());
      const inTitle   = mem.title.toLowerCase().includes(node.label.toLowerCase());
      const inTags    = mem.contextTags.some(t =>
        t.toLowerCase().includes(node.label.toLowerCase()) ||
        node.keywords.some(k => t.toLowerCase().includes(k.toLowerCase()))
      );
      if (inSummary || inTitle || inTags) {
        triggered.push(`(Çağrışım: ${node.label}) → ${mem.title}: ${mem.summary}`);
      }
    });
  });

  return Array.from(new Set(triggered)).slice(0, 4);
};

export const getProcessedHistoryContext = (
  messages: Message[],
  firingNodes: NeuralNode[]
): string => {
  if (messages.length === 0) return '';
  const recent = messages.slice(-4).map(m => `[${m.sender}]: ${m.text.slice(0, 150)}`).join('\n');
  const ctxNodes = firingNodes.length > 0
    ? `\nAKTİF KAVRAMLAR: ${firingNodes.map(n => `${n.label}(${n.energy.toFixed(0)}%)`).join(', ')}`
    : '';
  return recent + ctxNodes;
};

/**
 * Generates a human-readable spreading activation report for the system prompt.
 */
export const getSpreadingActivationReport = (state: NeuralNetworkState): string => {
  const firing = getFiringNodes(state)
    .sort((a, b) => b.energy - a.energy)
    .slice(0, 4);

  if (firing.length === 0) return '  Aktif yayılım yok.';

  return firing.map(node => {
    const outgoing = state.edges
      .filter(e => e.from === node.id && e.hebbianStrength > 0.40)
      .map(e => {
        const tgt = state.nodes[e.to];
        const sym = e.valence === 'inhibitory' ? '⊣' : '→';
        return `${sym}${tgt?.label ?? e.to}(${e.hebbianStrength.toFixed(1)})`;
      })
      .join(' ');
    const consolidated = node.consolidationLevel > 0 ? ` [L${node.consolidationLevel}★]` : '';
    return `  • [${node.label}] ${node.energy.toFixed(0)}%${consolidated} ${outgoing}`;
  }).join('\n');
};
