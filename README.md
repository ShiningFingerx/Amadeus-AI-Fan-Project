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
Recent Additions

Contextual Memory System
Amadeus now fully remembers the last 10 messages in a conversation. For older messages, it extracts and stores keywords and topics instead of raw content.

Cross-Chat Memory Synthesis
A new memory synthesis system has been added to connect different chats.
When you click the lightbulb icon next to a conversation in the chat menu, an API call is sent to Amadeus requesting a summary of the chat along with the emotions it experienced. After a successful response, a sound is played and the generated memory is saved into the memory archive.

Emotion Cores Activated
The emotion core system is now fully functional. Amadeus can analyze the emotional tone of messages and adjust its responses accordingly.

Time-Aware Responses
Amadeus is now aware of the time for every message. For example, if you write late at night, it can mention this and respond in a way that matches its personality.

New “Normal Ending”
A new Normal Ending has been added, separate from the red and blue endings.
This ending is triggered only during a natural, friendly goodbye, representing a warm and gentle farewell rather than a dramatic conclusion.
