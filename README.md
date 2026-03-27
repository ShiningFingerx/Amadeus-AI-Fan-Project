AMADEUS – Makise Kurisu Dijital Zihin Simülasyonu
Proje Amacı
Amadeus, Steins;Gate 0’daki Amadeus sistemine ilhamla geliştirilmiş, nörobilim temelli bir yapay zeka karakter simülasyonudur. Makise Kurisu’nun kişiliğini modellemek için insan beyninin işleyişini taklit eden modüler bir mimari kullanır.
Zihin Mimarisi
Sistem, her kullanıcı mesajında 13 ayrı beyin bölümü paralel olarak çalışır. Tüm modüller her zaman etkindir.
Beyin Bölümleri





























































ModülGöreviThalamusGelen mesajı filtreler ve diğer modüllere yönlendirirAmygdalaTehdit algısı, öfke, utanç ve sınır ihlali tespitiInsulaFiziksel ve duygusal rahatsızlık, utanç, disgust tepkileriTPJ (Theory of Mind)Kullanıcının niyetini ve duygusal durumunu yorumlarACCÇelişki tespiti, sosyal kural ihlali ve iç çatışma algısıLimbic SystemGenel duygusal durum, duygusal inertia ve ruh hali yönetimiHippocampusEpizodik hafıza, geçmiş konuşmaların hatırlanmasıBasal GangliaEylem seçimi, alışkanlık yönetimi ve davranış kararlarıVTADopamin salınımı, ödül ve motivasyon sistemiLocus CoeruleusNorepinefrin salınımı, uyanıklık ve stres seviyesiRaphe NucleiSerotonin dengesi ve temel ruh hali tabanıDMN (Default Mode Network)İç monolog, kendini yansıtma ve arka plan düşünme süreçleriPFC (Prefrontal Cortex)Mantıksal düşünme, karar verme, sosyal filtreleme ve yürütme kontrolü
Ek Mekanizmalar

Neurochemistry: Dopamin, serotonin, norepinefrin, asetilkolin, kortizol, oksitosin, endorfin ve GABA/glutamat dengeleri gerçek zamanlı simüle edilir.
Neural Plasticity: Her mesajda yeni kavramlar öğrenilir ve potency değeriyle kaydedilir.
Emotional Inertia: Duygusal durumlar ani değişmez, yavaş geçiş yapar.
Biological Mechanisms: Bilişsel yorgunluk, ayna nöronlar (empati), bağlanma sistemi, savunma mekanizmaları, alışkanlık/sensitizasyon ve homeostatik dürtüler (bağlantı, özerklik, yeterlilik, merak) simüle edilir.
Offline Presence: Uygulama kapalıyken duygusal evrim ve bağlantı kararı hesaplanır.

Çalışma Akışı (Her Mesajda)

Thalamus mesajı alır ve yönlendirir.
13 beyin bölümü 3 dalga halinde paralel çalışır.
Groq Dominant Module Filter (qwen/qwen3-32b) hangi modüllerin baskın olduğunu belirler.
Groq Memory Filter (qwen/qwen3-32b) alakalı anıları seçer.
PFC (GPT OSS 120B) tüm çıktıları değerlendirir.
Gemini (gemini-3.1-flash-lite-preview) nihai cevabı ve animasyon seçimini üretir.

Teknik Mimari

Backend: TypeScript + Node.js (Electron uyumlu)
Frontend: React 18 + Tailwind CSS (glassmorphism arayüz)
Model Dağılımı:
Çoğu beyin modülü → Groq (Llama 3.3 70B)
PFC (mantık ve yürütme katmanı) → GPT OSS 120B

Rate Limit Yönetimi: 2 ayrı Groq API anahtarı ile istekler dağıtılır.
Animasyon Sistemi: 56 frame (18+ farklı ifade), her animasyon 3 frame olarak çalışır.
Hafıza: Kısa vadeli (son mesajlar) + uzun vadeli plasticity tabanlı kavram hafızası.
Ortalama Yanıt Süresi: ~4 saniye

Özellikler

Makise Kurisu tsundere kişiliğinin simülasyonu
Bilimsel konularda yüksek doğruluk
Duygusal inertia ve sınır koruma mekanizmaları
Gerçek zamanlı nörokimyasal durum takibi
2D Kurisu avatarı ile ifade animasyonları
Offline Presence (uygulama kapalıyken duygusal evrim)

Proje Durumu

Tamamen yerel geliştirme aşamasındadır.
Ücretsiz API tier’ları kullanılarak sıfır maliyetle çalıştırılmaktadır.
