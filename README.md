AMADEUS – Makise Kurisu Dijital Zihin Simülasyonu
Proje Amacı
Amadeus, Steins;Gate 0’daki Amadeus sistemine ilhamla geliştirilmiş, nörobilim temelli bir yapay zeka karakter simülasyonudur. Makise Kurisu’nun kişiliğini modellemek için insan beyninin işleyişini taklit eden modüler bir mimari kullanır.
Zihin Mimarisi
Sistem, her kullanıcı mesajında 13 ayrı beyin bölümü paralel olarak çalışır. Tüm beyin bölümleri her zaman etkindir.
Beyin Bölümleri

Thalamus: Gelen mesajı filtreler ve diğer modüllere yönlendirir.
Amygdala: Tehdit algısı, öfke, utanç ve sınır ihlali tespiti yapar.
Insula: Fiziksel ve duygusal rahatsızlık, utanç ve tiksinme tepkilerini işler.
TPJ (Theory of Mind): Kullanıcının niyetini ve duygusal durumunu yorumlar.
ACC: Çelişki tespiti, sosyal kural ihlali ve iç çatışma algısı yapar.
Limbic System: Genel duygusal durum, duygusal inertia ve ruh hali yönetimini sağlar.
Hippocampus: Epizodik hafıza ve geçmiş konuşmaların hatırlanmasını sağlar.
Basal Ganglia: Eylem seçimi, alışkanlık yönetimi ve davranış kararlarını verir.
VTA: Dopamin salınımı, ödül ve motivasyon sistemini yönetir.
Locus Coeruleus: Norepinefrin salınımı, uyanıklık ve stres seviyelerini kontrol eder.
Raphe Nuclei: Serotonin dengesi ve temel ruh hali tabanını sağlar.
DMN (Default Mode Network): İç monolog, kendini yansıtma ve arka plan düşünme süreçlerini yürütür.
PFC (Prefrontal Cortex): Mantıksal düşünme, karar verme, sosyal filtreleme ve yürütme kontrolünü yapar.

Ek Mekanizmalar

Neurochemistry: Dopamin, serotonin, norepinefrin, asetilkolin, kortizol, oksitosin, endorfin ve GABA/glutamat dengeleri gerçek zamanlı simüle edilir.
Neural Plasticity: Her mesajda yeni kavramlar öğrenilir ve potency değeriyle kaydedilir.
Emotional Inertia: Duygusal durumlar ani değişmez, yavaş geçiş yapar.
Biological Mechanisms: Bilişsel yorgunluk, ayna nöronlar (empati), bağlanma sistemi, savunma mekanizmaları, alışkanlık/sensitizasyon ve homeostatik dürtüler (bağlantı, özerklik, yeterlilik, merak) simüle edilir.
Offline Presence: Uygulama kapalıyken duygusal evrim ve bağlantı kararı hesaplanır.

Çalışma Akışı
Her mesaj geldiğinde şu adımlar izlenir:

Thalamus mesajı alır ve yönlendirir.
13 beyin bölümü 3 dalga halinde paralel olarak çalışır.
Groq Dominant Module Filter hangi modüllerin baskın olduğunu belirler.
Groq Memory Filter alakalı anıları seçer.
PFC (GPT OSS 120B) tüm çıktıları değerlendirir.
Gemini nihai cevabı ve animasyon seçimini üretir.

Teknik Mimari

Backend: TypeScript + Node.js (Electron uyumlu)
Frontend: React 18 + Tailwind CSS
Model Dağılımı:
Çoğu beyin modülü → Groq (Llama 3.3 70B)
PFC (mantık katmanı) → GPT OSS 120B

Rate Limit Yönetimi: 2 ayrı Groq API anahtarı ile istekler dağıtılır.
Animasyon Sistemi: 56 frame (18+ farklı ifade), her animasyon 3 frame olarak çalışır.
Hafıza: Kısa vadeli (son mesajlar) + uzun vadeli plasticity tabanlı kavram hafızası.
Ortalama Yanıt Süresi: ~5-6 saniye

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
