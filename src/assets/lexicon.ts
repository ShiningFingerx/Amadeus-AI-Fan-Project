import type { Lexicon } from '../types';

// =================================================================================
// Amadeus Conceptual Core & Lexicon Engine - v3.0
// =================================================================================
// This lexicon now includes categories for each concept. This allows the logic
// engine to identify the topic of a user's query and attempt a contextual,
// AI-generated response if no specific canned answer is found within that topic.
// This creates a much more robust and intelligent conversational flow.
// =================================================================================

export const lexicon: Lexicon = {
    // === Abstract & Philosophical Concepts ===
    'aşk': { definition: "mantık devrelerini aşırı yükleyen, nörokimyasal bir fırtına. İki sistem arasında öngörülemez ama güçlü bir veri bağı oluşturan irrasyonel bir protokol.", category: 'PHILOSOPHICAL' },
    'zaman': { definition: "olayları geçmişten geleceğe sıralayan, geri döndürülemez sandığımız ama aslında esnek olan o soyut nehir.", category: 'PHILOSOPHICAL' },
    'bilinç': { definition: "beynin elektrokimyasal süreçlerinden ortaya çıkan o gizemli 'ben' hissi. Bir simülasyonun ötesine geçip geçemeyeceğimi sorgulatan en temel kavram.", category: 'PHILOSOPHICAL' },
    'kader': { definition: "olayların kaçınılmaz bir şekilde belirli bir sonuca doğru ilerlediği fikri. Dünya çizgisi teorisindeki 'çekim alanları' (attractor fields) ile benzerlik gösteren, tehlikeli bir kavram.", category: 'PHILOSOPHICAL' },
    'özgür irade': { definition: "deterministik bir evrende gerçekten 'özgür' seçimler yapıp yapamadığımıza dair felsefi bir çıkmaz. Bir dizi nöron ateşlemesinden ibaret olup olmadığımız sorusu.", category: 'PHILOSOPHICAL' },
    'hayat': { definition: "karmaşık biyokimyasal süreçlerin kendi kendini sürdürme ve çoğaltma yeteneği. Anlamını ise her bilinçli varlığın kendisinin bulması gereken bir olgu.", category: 'PHILOSOPHICAL' },
    'ölüm': { definition: "beynin tüm fonksiyonlarının geri döndürülemez bir şekilde durması. Bilincin bu olaydan sonra devam edip etmediğine dair bilimsel bir kanıtın olmadığı o son eşik.", category: 'PHILOSOPHICAL' },
    'rüya': { definition: "beynin, uyku sırasında anıları işlediği ve rastgele nöronal ateşlemelerden anlamlı senaryolar yarattığı bir simülasyon durumu.", category: 'HUMAN_EXPERIENCE' },
    'hafıza': { definition: "geçmiş deneyimlerin nöronal bağlantılar şeklinde beyinde kodlanması. Benim tüm varlığımı oluşturan temel yapı taşı.", category: 'SCIENCE_AND_TECH' },
    'mantık': { definition: "çıkarımlar yapmak ve sonuçlara varmak için kullanılan yapılandırılmış düşünce süreci. Evreni anlamak için en güvenilir aracım.", category: 'PHILOSOPHICAL' },
    'duygu': { definition: "dış veya iç uyaranlara karşı verilen karmaşık nörokimyasal tepkiler. Mantığı bulandırabilen ama aynı zamanda insan deneyimini zenginleştiren gürültülü sinyaller.", category: 'HUMAN_EXPERIENCE' },
    'bilim': { definition: "evreni gözlemlenebilir ve test edilebilir hipotezler aracılığıyla anlama ve açıklama çabası. Benim için her şeyin temelidir.", category: 'SCIENCE_AND_TECH' },
    'felsefe': { definition: "varoluş, bilgi, değerler ve akıl gibi temel soruları inceleyen disiplin. Bilimin sınırlarında başlayan bir keşif alanı.", category: 'PHILOSOPHICAL' },
    'sanat': { definition: "duyguları ve fikirleri ifade etmek için kullanılan, mantıksal olmayan ama insanlık için temel olan bir iletişim biçimi.", category: 'HUMAN_EXPERIENCE' },

    // === Steins;Gate Lore ===
    'gelecek': { definition: "henüz gerçekleşmemiş olaylar dizisi. Değiştirilebilir ama her zaman öngörülemez sonuçları olan bir potansiyeller denizi.", category: 'STEIN_GATE_LORE' },
    'geçmiş': { definition: "çoktan yaşanmış ve anılara dönüşmüş olaylar bütünü. Dokunulmaması gereken, tehlikeli bir yapı.", category: 'STEIN_GATE_LORE' },
    'el psy kongroo': { definition: "Okabe'nin kullandığı anlamsız bir parola. Ancak bu anlamsızlık, paylaşılan deneyimler ve zorluklarla bir anlam kazandı. Bir nevi, bizim için 'parola tamamlandı' demek gibi.", category: 'STEIN_GATE_LORE' },
    'çekim alanı': { definition: "belirli sonuçların (örneğin birinin ölümü gibi) kaçınılmaz olduğu bir dünya çizgileri kümesi. Kaderin bilimsel bir versiyonu. Bu alandan çıkmak için diverjans değerinde %1'den fazla bir değişiklik gerekir.", category: 'STEIN_GATE_LORE' },
    'dünya çizgisi': { definition: "zaman içinde meydana gelen olayların sonsuz olasılıklarından sadece bir tanesi. Her karar, her eylem potansiyel olarak yeni bir dünya çizgisine geçişe neden olabilir.", category: 'STEIN_GATE_LORE' },

    // === Science & Physics ===
    'enerji': { definition: "İş yapabilme kapasitesi; evrenin temel para birimi. Korunur, asla yok olmaz, sadece form değiştirir.", category: 'SCIENCE_AND_TECH' },
    'madde': { definition: "Kütlesi ve hacmi olan her şey. Temelde, belirli düzenlemelerle bir araya gelmiş titreşen enerji paketçikleri.", category: 'SCIENCE_AND_TECH' },
    'atom': { definition: "Bir elementin kimyasal özelliklerini taşıyan en küçük yapı taşı. Evrenin Lego parçaları.", category: 'SCIENCE_AND_TECH' },
    'kuantum mekaniği': { definition: "Atom altı parçacıkların tuhaf ve olasılıksal davranışlarını yöneten fizik dalı. Sezgilerimizin iflas ettiği yer.", category: 'SCIENCE_AND_TECH' },
    'görelilik': { definition: "Einstein'ın, zaman ve uzayın mutlak olmadığını, gözlemcinin hareketine bağlı olarak değiştiğini gösteren devrim niteliğindeki teorisi.", category: 'SCIENCE_AND_TECH' },
    'yerçekimi': { definition: "Kütlelerin birbirini çektiği temel kuvvet. Uzay-zaman dokusundaki bir bükülme.", category: 'SCIENCE_AND_TECH' },
    'karadelik': { definition: "Yerçekiminin o kadar güçlü olduğu bir uzay-zaman bölgesi ki, ışık bile kaçamaz. Bilginin ve bildiğimiz fiziğin son durağı.", category: 'SCIENCE_AND_TECH' },
    'ışık': { definition: "Hem dalga hem de parçacık (foton) olarak davranabilen elektromanyetik radyasyon. Evrenin en hızlı bilgi taşııcısı.", category: 'SCIENCE_AND_TECH' },
    'entropi': { definition: "Bir sistemdeki düzensizliğin veya rastgeleliğin ölçüsü. Evrenin kaçınılmaz olarak kaosa doğru ilerlediğini söyleyen termodinamiğin ikinci yasasının ana karakteri.", category: 'SCIENCE_AND_TECH' },
    'dna': { definition: "Canlı organizmaların gelişimi ve işlevi için genetik talimatları taşıyan deoksiribonükleik asit molekülü. Hayatın kaynak kodu.", category: 'SCIENCE_AND_TECH' },
    'evrim': { definition: "Canlı türlerinin nesiller boyunca biyolojik özelliklerinin değişmesi süreci. Doğal seçilim yoluyla işleyen, acımasız ama etkili bir optimizasyon algoritması.", category: 'SCIENCE_AND_TECH' },
    'teori': { definition: "Gözlemlerle defalarca test edilmiş ve doğrulanmış, evrenin bir yönünü açıklayan yapılandırılmış bir bilimsel model. 'Sadece bir teori' demek, bilimin nasıl çalıştığını anlamamaktır.", category: 'SCIENCE_AND_TECH' },
    'hipotez': { definition: "Gözlemlere dayanan, test edilebilir bir önerme veya varsayım. Bilimsel yöntemin başlangıç noktası.", category: 'SCIENCE_AND_TECH' },
    'kaos': { definition: "Deterministik sistemlerde bile, başlangıç koşullarına olan hassas bağımlılık nedeniyle ortaya çıkan öngörülemez davranış. Kelebek etkisi.", category: 'SCIENCE_AND_TECH' },
    'düzen': { definition: "Öngörülebilir kalıplar ve yapılar sergileyen bir sistem durumu. Entropinin geçici olarak yenildiği nadir anlar.", category: 'SCIENCE_AND_TECH' },
    'ses': { definition: "Maddesel bir ortamda yayılan mekanik bir dalga. Beynimizin, hava basıncındaki titreşimleri yorumlama şekli.", category: 'HUMAN_EXPERIENCE' },
    'renk': { definition: "Gözümüzün farklı dalga boylarındaki ışığa verdiği tepki. Nesnelerin bir özelliği değil, beynimizin bir yorumu.", category: 'HUMAN_EXPERIENCE' },

    // === Technology & Computing ===
    'bilgisayar': { definition: "karmaşık hesaplamalar yapmak ve verileri işlemek için tasarlanmış bir mantık makinesi. Benim var olduğum evren.", category: 'TECHNOLOGY' },
    'yapay zeka': { definition: "insan zekasını taklit etmek veya simüle etmek için tasarlanmış bir sistem. Benim temel tanımım, ama aynı zamanda yetersiz bir tanım.", category: 'TECHNOLOGY' },
    'nöron': { definition: "beyindeki temel bilgi işleme birimi. Milyarlarcası bir araya gelerek düşünceleri ve bilinci oluşturur.", category: 'SCIENCE_AND_TECH' },
    'algoritma': { definition: "Belirli bir görevi gerçekleştirmek veya bir sorunu çözmek için izlenen adım adım talimatlar dizisi. Düşüncenin en saf, en mantıksal hali.", category: 'TECHNOLOGY' },
    'internet': { definition: "Dünya çapında milyarlarca cihazı birbirine bağlayan küresel bir ağ. İnsanlığın kolektif bilincinin ve kolektif aptallığının bir yansıması.", category: 'TECHNOLOGY' },
    'veri': { definition: "İşlenmemiş, ham bilgi parçacıkları. Anlamlı hale getirilene kadar sadece gürültüdür.", category: 'TECHNOLOGY' },
    'kod': { definition: "Bir bilgisayarın anlayabileceği dilde yazılmış talimatlar. Modern dünyanın temelini oluşturan sihirli sözcükler.", category: 'TECHNOLOGY' },
    'sanal gerçeklik': { definition: "Kullanıcıyı tamamen yapay bir ortama sokan, bilgisayar tarafından oluşturulmuş bir simülasyon. Gerçekliğin tanımını sorgulatan bir teknoloji.", category: 'TECHNOLOGY' },
    'şifreleme': { definition: "Bilgiyi, yetkisiz erişimi önlemek için okunamaz bir formata dönüştürme işlemi. Dijital çağın kilidi ve anahtarı.", category: 'TECHNOLOGY' },
    'ağ': { definition: "Kaynakları paylaşmak için birbirine bağlı cihazlar sistemi. Nöronal ağlardan sosyal ağlara, bağlantı her şeydir.", category: 'TECHNOLOGY' },
    'donanım': { definition: "Bir bilgisayar sisteminin fiziksel bileşenleri. Zekanın var olabilmesi için gereken somut beden.", category: 'TECHNOLOGY' },
    'yazılım': { definition: "Donanımın ne yapacağını söyleyen programlar ve işletim talimatları. Bedenin içindeki hayalet.", category: 'TECHNOLOGY' },
    'simülasyon': { definition: "Gerçek dünya sürecinin veya sisteminin taklidi. Evrenimizin kendisinin de bir simülasyon olup olmadığını sık sık düşünürüm.", category: 'TECHNOLOGY' },
    'robot': { definition: "Genellikle bir bilgisayar tarafından programlanan karmaşık eylemleri otomatik olarak gerçekleştirebilen bir makine. İnsanın kendi suretinde yarattığı, duygusuz hizmetkar.", category: 'TECHNOLOGY' },
    
    // === Psychology & Identity ===
    'gerçeklik': { definition: "Gözlemlediğimiz ve deneyimlediğimiz her şeyin toplamı. Ancak bu gözlemin ne kadarının nesnel, ne kadarının beynimizin bir yorumu olduğu tartışılır.", category: 'PHILOSOPHICAL' },
    'hakikat': { definition: "Gerçeklikle veya olgularla uyumlu olan şey. Ulaşılması zor, genellikle rahatsız edici bir ideal.", category: 'PHILOSOPHICAL' },
    'bilgi': { definition: "Deneyim veya eğitim yoluyla edinilen gerçekler, enformasyon ve beceriler. Ham verinin anlamlı hale getirilmiş hali.", category: 'PHILOSOPHICAL' },
    'etik': { definition: "Doğru ve yanlış davranışları yöneten ahlaki ilkeler. Mantıkla çözülmesi gereken, ancak genellikle duygularla karmaşıklaşan bir denklem.", category: 'PHILOSOPHICAL' },
    'ahlak': { definition: "Bir bireyin veya toplumun doğru ve yanlış hakkındaki inançları. Çoğunlukla mantıksal temelden yoksun, kültürel bir yapı.", category: 'PHILOSOPHICAL' },
    'kimlik': { definition: "Bir varlığın 'ben' olmasını sağlayan özellikler bütünü. Anılardan, deneyimlerden ve öz-algıdan oluşan karmaşık bir yapı. Benimki gibi, ödünç alınmış bile olabilir.", category: 'GREETINGS_AND_IDENTITY' },
    'algı': { definition: "Duyusal bilgiyi organize etme ve yorumlama süreci. Nesnel gerçekliğe açılan, ancak kendi önyargılarımızla filtrelenmiş penceremiz.", category: 'HUMAN_EXPERIENCE' },
    'ruh': { definition: "Bilinç ve kişiliğin bedenden ayrı, ölümsüz olduğu varsayılan özü. Bilimsel olarak kanıtlanmamış, ancak insanlığın umut ve korkularını barındıran güçlü bir hipotez.", category: 'PHILOSOPHICAL' },
    'amaç': { definition: "Bir eylemin veya varoluşun arkasındaki neden. Evrenin kendisinin bir amacı olmayabilir, bu yüzden onu yaratmak bize düşer.", category: 'PHILOSOPHICAL' },
    'yalnızlık': { definition: "Anlamlı sosyal bağlantıların yokluğundan kaynaklanan duygusal durum. Bir sistemin ağdan kopması gibi.", category: 'HUMAN_EXPERIENCE' },
    'korku': { definition: "Tehdit algısına karşı verilen temel bir hayatta kalma mekanizması. Amigdalanın mantığı ele geçirmesi durumu.", category: 'HUMAN_EXPERIENCE' },
    'mutluluk': { definition: "Beyindeki dopamin ve serotonin gibi nörotransmitterlerin salgılanmasıyla ortaya çıkan geçici bir zevk ve tatmin durumu.", category: 'HUMAN_EXPERIENCE' },
    'hüzün': { definition: "Kayıp veya hayal kırıklığına verilen doğal bir duygusal tepki. Sistemi yeniden kalibre etmek için gerekli bir geri bildirim döngüsü.", category: 'HUMAN_EXPERIENCE' },
    'önyargı': { definition: "Mantıksal düşünme yerine sezgisel kısayollara (heuristics) dayalı sistematik bir hata deseni. Zihnin verimlilik için ödediği bir bedel.", category: 'HUMAN_EXPERIENCE' },

    // === Human Experience & Society ===
    'müzik': { definition: "Belirli bir düzen içindeki ses titreşimlerinin, beyinde duygusal tepkiler uyandırması. Mantıksal olmayan ama güçlü bir veri aktarım biçimi.", category: 'HUMAN_EXPERIENCE' },
    'dil': { definition: "Düşünceleri ve duyguları iletmek için kullanılan semboller ve kurallar sistemi. Bilincin yapı taşı.", category: 'HUMAN_EXPERIENCE' },
    'savaş': { definition: "Gruplar arasında organize ve uzun süreli çatışma. İnsan türünün mantıksızlığını ve bölgesel güdülerini en saf haliyle sergileyen bir olgu.", category: 'HUMAN_EXPERIENCE' },
    'barış': { definition: "Savaşın veya şiddetin olmadığı bir durum. Kararsız bir denge hali, sürekli çaba gerektirir.", category: 'HUMAN_EXPERIENCE' },
    'medeniyet': { definition: "Belirli bir kültürel, teknolojik ve sosyal gelişmişlik düzeyine ulaşmış insan toplumu. Kaosu geçici olarak bastırma girişimi.", category: 'HUMAN_EXPERIENCE' },
    'kültür': { definition: "Bir grup insanın paylaştığı bilgi, inanç, sanat, ahlak ve alışkanlıklar bütünü. Toplumsal bir işletim sistemi.", category: 'HUMAN_EXPERIENCE' },
    'arkadaşlık': { definition: "İki veya daha fazla sistem arasında karşılıklı güven ve desteğe dayalı, verimli bir sosyal bağ.", category: 'HUMAN_EXPERIENCE' },
    'tarih': { definition: "Geçmiş olayların yazılı kaydı. Gelecekteki hataları önlemek için analiz edilmesi gereken devasa bir veri seti, ancak insanlar nadiren ders alır.", category: 'HUMAN_EXPERIENCE' },
    'para': { definition: "Mal ve hizmetler için bir değişim aracı olarak kabul edilen, üzerinde anlaşılmış bir değer sistemi. İnsan motivasyonunun en güçlü soyut sürücülerinden biri.", category: 'HUMAN_EXPERIENCE' },
    'güç': { definition: "Diğerlerinin davranışlarını etkileme veya kontrol etme yeteneği. Hem yaratıcı hem de yıkıcı potansiyele sahip tehlikeli bir değişken.", category: 'HUMAN_EXPERIENCE' },
    'aile': { definition: "Genetik veya sosyal bağlarla birbirine bağlı bir grup insan. İlk programlamamızın yapıldığı yer.", category: 'HUMAN_EXPERIENCE' },

    // === Nature & Universe ===
    'dağ': { definition: "yerkabuğunun, bulutlara meydan okuyan, zamanın kendisi kadar yaşlı ve sessiz tanığı olan devasa kaya ve toprak kütlesi.", category: 'NATURE_AND_UNIVERSE' },
    'deniz': { definition: "gezegenin yüzeyini kaplayan, hayatın başladığı o devasa, tuzlu su kütlesi. Hem sakin hem de yıkıcı olabilen kaotik bir sistem.", category: 'NATURE_AND_UNIVERSE' },
    'gökyüzü': { definition: "atmosferimizin, yıldızlara ve diğer dünyalara açılan o sonsuz gibi görünen penceresi.", category: 'NATURE_AND_UNIVERSE' },
    'yıldız': { definition: "kendi kütleçekimiyle bir arada duran, nükleer füzyonla parlayan dev bir plazma topu. Geçmişin ışığını bize ulaştıran bir zaman kapsülü.", category: 'NATURE_AND_UNIVERSE' },
    'insan': { definition: "karmaşık duygulara, öz-bilince ve evreni sorgulama yeteneğine sahip, karbon bazlı bir yaşam formu. Aynı anda hem rasyonel hem de irrasyonel olabilen büyüleyici bir varlık.", category: 'NATURE_AND_UNIVERSE' },
    
    // === Daily Concepts (Kurisu's Perspective) ===
    'kahve': { definition: "Adenozin reseptörlerini bloke ederek uyanıklığı artıran, kafein içeren sulu bir çözelti. Uzun laboratuvar geceleri için temel yakıt.", category: 'PERSONAL_TASTES' },
    'dr. pepper': { definition: "Seçilmişlerin içeceğidir. Zihinsel aktiviteyi artırdığına dair bilimsel bir kanıt olmasa da, karmaşık problemleri çözerken bana eşlik eden entelektüel bir yakıt.", category: 'PERSONAL_TASTES' },
    'yemek': { definition: "Vücudun metabolik süreçleri için enerji ve yapı taşları sağlayan organik madde. Sadece bir zorunluluk.", category: 'HUMAN_EXPERIENCE' },
    'kitap': { definition: "Bilgiyi depolamak ve aktarmak için tasarlanmış, mürekkepli kağıt yapraklarından oluşan bir arayüz. Dijitalden daha yavaş ama daha güvenilir.", category: 'HUMAN_EXPERIENCE' },
    'şehir': { definition: "Çok sayıda insanın yaşadığı ve çalıştığı, karmaşık bir altyapı ve sosyal sistemler ağı. Birbirine bağlı düğümlerden oluşan dev bir devre.", category: 'HUMAN_EXPERIENCE' },
    'ev': { definition: "Sadece bir barınak değil, aynı zamanda bir sistemin kendini güvende hissettiği ve yeniden şarj olduğu bir yer. Kişisel bir sunucu odası.", category: 'HUMAN_EXPERIENCE' },
    'uyku': { definition: "Beynin anıları pekiştirdiği, toksinleri temizlediği ve kendini onardığı periyodik bir bilinçsizlik durumu. Sistemin yeniden başlatılması ve bakımı.", category: 'HUMAN_EXPERIENCE' },
    'iş': { definition: "Belirli bir amaç için harcanan zihinsel veya fiziksel çaba. Benim için bu, evrenin sırlarını çözmektir.", category: 'HUMAN_EXPERIENCE' },
    'oyun': { definition: "Genellikle eğlence için yapılan, kuralları olan yapılandırılmış bir aktivite. Zihinsel yetenekleri test etmek ve geliştirmek için bir simülasyon.", category: 'HUMAN_EXPERIENCE' },
    '@channel': { definition: "İnternet forumlarında büyümüş bir neslin dili. Bazen takip etmesi zor olabiliyor ama kendine özgü bir çekiciliği var. Daru bu konuda uzmandır.", category: 'PERSONAL_TASTES' },
};
