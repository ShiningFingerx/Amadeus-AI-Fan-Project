
const { app, BrowserWindow, Menu, ipcMain, Tray, nativeImage, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const isDev = !app.isPackaged;

let mainWindow;
let tray = null;
let isQuitting = false;

const userDataPath = app.getPath('userData');
const brainDir = path.join(userDataPath, 'brain_data');

if (!fs.existsSync(brainDir)) {
    try { fs.mkdirSync(brainDir, { recursive: true }); }
    catch (err) { console.error("FATAL_CORE_ERROR:", err); }
}

// ── Node.js HTTP helper (no CORS, no restrictions) ─────────────────────────
function nodeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOptions = {
            hostname: urlObj.hostname,
            port:     urlObj.port || 443,
            path:     urlObj.pathname + urlObj.search,
            method:   options.method || 'GET',
            headers:  options.headers || {},
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    ok:     res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    text:   () => Promise.resolve(data),
                    json:   () => Promise.resolve(JSON.parse(data)),
                    headers: res.headers,
                    _body:  data,
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

// ── IPC: api-fetch handler ──────────────────────────────────────────────────
ipcMain.handle('api-fetch', async (_event, { url, options }) => {
    try {
        const resp = await nodeHttpRequest(url, options);
        return {
            ok:         resp.ok,
            status:     resp.status,
            statusText: resp.statusText,
            body:       resp._body,
            headers:    resp.headers,
        };
    } catch (err) {
        console.error('[API-FETCH] Error:', err.message);
        return { ok: false, status: 0, statusText: err.message, body: '', headers: {} };
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280, height: 800, minWidth: 800, minHeight: 600,
        backgroundColor: '#000000', show: false, frame: true,
        webPreferences: {
            preload:               path.join(__dirname, 'preload.js'),
            nodeIntegration:       false,
            contextIsolation:      true,
            webSecurity:           false,
        },
        icon: path.join(__dirname, 'build', 'icon.ico')
    });

    mainWindow.removeMenu();
    Menu.setApplicationMenu(null);

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'))
            .catch(err => console.error("LOAD ERROR:", err));
    }

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('close', (e) => { if (!isQuitting) { e.preventDefault(); mainWindow.hide(); } });

    // ── Brain data IPC ──────────────────────────────────────────────────
    ipcMain.handle('save-brain-data', async (_event, { username, data }) => {
        try {
            const fp = path.join(brainDir, `${username.toLowerCase().replace(/[^a-z0-9]/g,'_')}.json`);
            fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
            return { success: true, path: fp };
        } catch (err) { return { success: false, error: err.message }; }
    });

    ipcMain.handle('load-brain-data', async (_event, username) => {
        try {
            const fp = path.join(brainDir, `${username.toLowerCase().replace(/[^a-z0-9]/g,'_')}.json`);
            return fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
        } catch (err) { return null; }
    });

    ipcMain.on('open-core-folder', () => shell.openPath(brainDir));
    ipcMain.on('toggle-fullscreen', () => mainWindow.setFullScreen(!mainWindow.isFullScreen()));
}

function createTray() {
    try {
        const iconPath = path.join(__dirname, 'build', 'icon.ico');
        const icon = nativeImage.createFromPath(iconPath);
        tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 }));
        tray.setToolTip('Amadeus AI');
        tray.setContextMenu(Menu.buildFromTemplate([
            { label: 'Amadeus System: Online', enabled: false },
            { type: 'separator' },
            { label: 'Open Interface', click: () => mainWindow.show() },
            { label: 'Open Neural Core', click: () => shell.openPath(brainDir) },
            { type: 'separator' },
            { label: 'Terminate', click: () => { isQuitting = true; app.quit(); } }
        ]));
        tray.on('click', () => mainWindow.show());
    } catch(e) { console.warn('Tray init failed:', e.message); }
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
