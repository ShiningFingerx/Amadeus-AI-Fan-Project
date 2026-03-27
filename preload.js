
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleFullScreen: () => ipcRenderer.send('toggle-fullscreen'),
  setFullScreen: (flag) => ipcRenderer.send('set-fullscreen', flag),
  
  // Neural Core API
  saveBrain: (username, data) => ipcRenderer.invoke('save-brain-data', { username, data }),
  loadBrain: (username) => ipcRenderer.invoke('load-brain-data', username),
  openCoreFolder: () => ipcRenderer.send('open-core-folder'),
  
  onForceIncomingCall: (callback) => ipcRenderer.on('force-incoming-call', (_event, data) => callback(data)),

  // API Bridge — bypasses renderer CORS restrictions
  // All external HTTP calls go through Node.js in main process
  apiFetch: (url, options) => ipcRenderer.invoke('api-fetch', { url, options })
});
