# Amadeus AI Desktop

Steins;Gate serisindeki **Amadeus** yapay zekasının interaktif masaüstü simülasyonu.  
Google Gemini API ile güçlendirilmiştir.

## Proje Yapısı

```
amadeus-ai-desktop/
├── main.js                  ← Electron ana süreç
├── preload.js               ← Electron preload (IPC köprüsü)
├── package.json
├── tsconfig.json
├── .eslintrc.json
│
├── public/
│   ├── index.html           ← CRA HTML şablonu
│   ├── manifest.json        ← PWA manifest
│   └── images/
│       └── kurisu_*.png     ← Tüm karakter görselleri (90+)
│
├── scripts/
│   └── generate-lore-data.js ← Ses kütüphanesi oluşturucu
│
└── src/
    ├── index.tsx            ← React giriş noktası
    ├── App.tsx              ← Ana uygulama bileşeni
    ├── types.ts             ← Global TypeScript tipleri
    │
    ├── components/          ← UI bileşenleri (18 adet)
    │   ├── AboutPanel.tsx
    │   ├── AmadeusAvatar.tsx
    │   ├── AuthScreen.tsx
    │   ├── AvatarView.tsx
    │   ├── ChatWindow.tsx
    │   ├── CognitiveLogPanel.tsx
    │   ├── DivergenceMeter.tsx
    │   ├── EmotionCores.tsx
    │   ├── HistoryPanel.tsx
    │   ├── IncomingCallOverlay.tsx
    │   ├── IntroScreen.tsx
    │   ├── KurisuProfilePanel.tsx
    │   ├── MemoryArchivePanel.tsx
    │   ├── MobileMenu.tsx
    │   ├── PurposeCoresDisplay.tsx
    │   ├── SettingsPanel.tsx
    │   ├── TerminationScreen.tsx
    │   └── TopBar.tsx
    │
    ├── logic/               ← Yapay sinir ağı & servisler (18 adet)
    │   ├── neuralNetwork.ts       ← Ana sinir ağı motoru
    │   ├── cognitionService.ts    ← Tam biliş döngüsü
    │   ├── amygdalaSystem.ts      ← Duygu analizi
    │   ├── pfcSystem.ts           ← Prefrontal korteks (karar)
    │   ├── hippocampusSystem.ts   ← Bellek kodlama
    │   ├── thalamusSystem.ts      ← Uyaran filtreleme
    │   ├── insulaSystem.ts        ← İçgüdü/empati
    │   ├── tpjSystem.ts           ← Sosyal biliş
    │   ├── ofcSystem.ts           ← Ödül değerlendirme
    │   ├── accSystem.ts           ← Hata izleme
    │   ├── limbicSystem.ts        ← Limbik sistem bütünleştirici
    │   ├── limbicController.ts    ← Limbik kontrolcü
    │   ├── neuralController.ts    ← Sinir ağı kontrolcüsü
    │   ├── cognitiveDissonance.ts ← Bilişsel çelişki
    │   ├── cannedResponseLogic.ts ← Hazır yanıt mantığı
    │   ├── memoryService.ts       ← Bellek sentezi
    │   ├── dbService.ts           ← Veri kaydı (Electron IPC)
    │   └── authService.ts         ← Kimlik doğrulama
    │
    ├── assets/              ← Statik veri dosyaları (8 adet)
    │   ├── sounds.ts              ← Ses efektleri
    │   ├── background_music.ts    ← Arkaplan müziği
    │   ├── kurisu_image.ts        ← Karakter görselleri (base64)
    │   ├── kurisu_expressions.ts  ← İfade haritası
    │   ├── base_avatar.ts         ← Temel avatar verisi
    │   ├── cannedResponses.ts     ← Hazır yanıtlar
    │   ├── lexicon.ts             ← Sözcük hazinesi
    │   └── loreAudio.ts           ← Lore ses veritabanı
    │
    └── hooks/               ← React custom hooks (2 adet)
        ├── useTTS.ts              ← Text-to-Speech hook
        └── useSpeechRecognition.ts← Ses tanıma hook
```

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
# Geliştirme modu (React + Electron birlikte)
npm run dev

# Sadece React
npm start

# Sadece Electron (React çalışıyorken)
npm run electron:start
```

## Derleme (Windows Portable .exe)

```bash
npm run electron:build
```
Çıktı: `dist/` klasöründe portable `.exe`

## Lore Ses Kütüphanesi

1. `.ogg` dosyalarını → `public/sounds/lore/` klasörüne koy
2. `.txt` dosyalarını → `public/texts/lore/` klasörüne koy  
   *(Dosya isimleri birebir aynı olmalı, ör: `sg001.ogg` ↔ `sg001.txt`)*
3. Çalıştır:
   ```bash
   npm run generate-lore
   ```
