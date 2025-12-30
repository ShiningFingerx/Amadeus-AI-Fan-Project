# Amadeus AI Projesi

Bu proje, Steins;Gate serisindeki Amadeus yapay zekasının interaktif bir simülasyonudur. Google Gemini API tarafından desteklenmektedir.

## Kurulum ve Başlatma

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Uygulamayı Geliştirme Modunda Başlatın:**
    Bu komut hem React geliştirme sunucusunu hem de Electron uygulamasını aynı anda başlatır.
    ```bash
    npm run dev
    ```

## Yeni Lore Ses Kütüphanesini Entegre Etme

Amadeus'a Makise Kurisu'nun orijinal ses dosyalarını eklemek için aşağıdaki adımları izleyin. Sistem, binlerce ses dosyasını otomatik olarak işlemek üzere tasarlanmıştır.

### Adım 1: Dosyaları Doğru Klasörlere Yerleştirin

1.  **Ses Dosyaları (`.ogg`):**
    *   Tüm `.ogg` uzantılı ses dosyalarınızı projenin içindeki `public/sounds/lore/` klasörüne kopyalayın.
    *   Eğer `lore` klasörü mevcut değilse, oluşturun.

2.  **Metin Dosyaları (`.txt`):**
    *   Her ses dosyasının içeriğini barındıran `.txt` uzantılı metin dosyalarınızı `public/texts/lore/` klasörüne kopyalayın.
    *   **ÇOK ÖNEMLİ:** Her `.txt` dosyasının adı, karşılık geldiği `.ogg` dosyasının adıyla birebir aynı olmalıdır (uzantılar hariç).
    *   **Örnek:**
        *   `public/sounds/lore/sg001.ogg`
        *   `public/texts/lore/sg001.txt`

### Adım 2: Veri Oluşturma Script'ini Çalıştırın

Dosyaları yerleştirdikten sonra, bu verileri uygulamanın anlayacağı bir formata dönüştürmek için bir script çalıştırmanız gerekir.

1.  Projenin ana dizininde bir terminal veya komut istemcisi açın.
2.  Aşağıdaki komutu çalıştırın:
    ```bash
    npm run generate-lore
    ```
    *   Bu komut, `scripts/generate-lore-data.js` dosyasını çalıştıracaktır.
    *   Script, `public/sounds/lore` ve `public/texts/lore` klasörlerindeki tüm dosyaları tarayacak ve `src/data/loreAudio.ts` adında tek bir veri dosyası oluşturacaktır.
    *   Bu işlem birkaç saniye sürebilir. Terminalde "Lore data generated successfully!" mesajını gördüğünüzde işlem tamamlanmıştır.

### Adım 3: Uygulamayı Başlatın

Veri dosyası oluşturulduktan sonra, uygulamayı normal şekilde başlatabilirsiniz.

```bash
npm run dev
```

Amadeus artık yeni ve genişletilmiş ses kütüphanesini Gemini'ye sunarak daha dinamik ve karaktere uygun sesli yanıtlar verecektir.
