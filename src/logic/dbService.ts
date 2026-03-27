
import { Conversation, PersonalitySettings, TtsSettings, MusicSettings, SynthesizedMemory, LimbicAnalysis } from '../types';

export interface UserBrain {
    username: string;
    conversations: Conversation[];
    personality: PersonalitySettings;
    tts: TtsSettings;
    music: MusicSettings;
    memories: SynthesizedMemory[];
    lastLimbicState?: LimbicAnalysis | null;
    apiKey: string;
    groqKey?: string;
    groqKey2?: string;
    lastSeen: number;
}

declare global {
  interface Window {
    electronAPI: {
      saveBrain: (username: string, data: UserBrain) => Promise<{ success: boolean, path?: string, error?: string }>;
      loadBrain: (username: string) => Promise<UserBrain | null>;
      openCoreFolder: () => void;
    }
  }
}

class DatabaseService {
    async initDB(): Promise<void> {
        // AppData directory is initialized in main.js
        return Promise.resolve();
    }

    /**
     * Veriyi tamamen yerel AppData klasörüne (brain_data) kaydeder.
     */
    async saveBrain(brain: UserBrain): Promise<void> {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.saveBrain(brain.username, brain);
                if (!result.success) {
                    console.error("DATABASE_SYNC_ERROR:", result.error);
                }
            } catch (e) {
                console.error("IPC_COMMUNICATION_FAULT:", e);
            }
        } else {
            // Web/Dev Fallback - Tarayıcı üzerinde çalışırken mecburen localStorage kullanılır
            localStorage.setItem('amadeus_brain_backup_' + brain.username, JSON.stringify(brain));
        }
    }

    /**
     * AppData klasöründen kullanıcı verisini yükler.
     */
    async loadBrain(username: string): Promise<UserBrain | null> {
        if (window.electronAPI) {
            return await window.electronAPI.loadBrain(username);
        } else {
            const data = localStorage.getItem('amadeus_brain_backup_' + username);
            return data ? JSON.parse(data) : null;
        }
    }

    /**
     * Fiziksel dosya konumunu işletim sistemi gezgininde açar.
     */
    openLocalDataFolder(): void {
        if (window.electronAPI) {
            window.electronAPI.openCoreFolder();
        }
    }
}

export const dbService = new DatabaseService();
