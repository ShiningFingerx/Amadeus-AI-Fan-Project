
import { Conversation, PersonalitySettings, TtsSettings, MusicSettings, SynthesizedMemory } from '../types';

export interface UserBrain {
    username: string;
    conversations: Conversation[];
    personality: PersonalitySettings;
    tts: TtsSettings;
    music: MusicSettings;
    memories: SynthesizedMemory[];
    apiKey: string;
    lastSeen: number;
}

const DB_NAME = 'AmadeusCognitiveRegistry';
const DB_VERSION = 1;
const STORE_NAME = 'user_brains';

class DatabaseService {
    private db: IDBDatabase | null = null;

    async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject("Database failed to open");
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'username' });
                }
            };
        });
    }

    async saveBrain(brain: UserBrain): Promise<void> {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(brain);

            request.onsuccess = () => resolve();
            request.onerror = () => reject("Failed to save brain data");
        });
    }

    async loadBrain(username: string): Promise<UserBrain | null> {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(username);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject("Failed to load brain data");
        });
    }

    async deleteBrain(username: string): Promise<void> {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(username);

            request.onsuccess = () => resolve();
            request.onerror = () => reject("Failed to delete brain data");
        });
    }
}

export const dbService = new DatabaseService();
