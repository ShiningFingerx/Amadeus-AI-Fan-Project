/**
 * API BRIDGE v1.0
 * ================
 * Electron renderer process'te fetch çağrıları CORS kısıtına takılır.
 * Bu modül:
 *   - Electron'da: window.electronAPI.apiFetch (IPC → main.js → Node.js https)
 *   - Tarayıcıda:  native fetch (dev mode, CORS serbest)
 *
 * Kullanım: apiBridge yerine fetch() gibi kullanılır.
 * Groq ve Gemini SDK'ların dışında kalan tüm fetch çağrıları buradan geçer.
 */

const isElectron = (): boolean =>
  typeof window !== 'undefined' &&
  typeof (window as any).electronAPI?.apiFetch === 'function';

export interface BridgeResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<BridgeResponse> => {

  if (isElectron()) {
    // Route through IPC → main.js → Node.js https (no CORS)
    const result = await (window as any).electronAPI.apiFetch(url, {
      method:  options.method  || 'GET',
      headers: options.headers || {},
      body:    options.body    || undefined,
    });

    const bodyText = result.body ?? '';
    return {
      ok:         result.ok,
      status:     result.status,
      statusText: result.statusText,
      json:       () => Promise.resolve(JSON.parse(bodyText)),
      text:       () => Promise.resolve(bodyText),
    };
  }

  // Browser / dev mode: native fetch
  return fetch(url, options);
};
