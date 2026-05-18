// ── Web shim for window.electron ──────────────────────────────────────────────
// Replaces Electron IPC with fetch calls to the Express backend.
// Stubs out desktop-only features (downloads, OS notifications, file pickers).

const API = "";

const _noop = () => {};
const _noopOff = (h) => {};

// Event emitter shim for m3u8/subtitle capture
// (not needed in web mode - player is an iframe/page, no intercept)
const _emptyHandler = (cb) => { const h = () => {}; return h; };

window.electron = {
  // ── AllManga resolve (via backend) ─────────────────────────────────────────
  resolveAllManga: async (args) => {
    const res = await fetch(`${API}/api/resolve-allmanga`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return res.json();
  },

  setPlayerVideo: async (args) => {
    const res = await fetch(`${API}/api/set-player-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return res.json();
  },

  // ── App info ───────────────────────────────────────────────────────────────
  getAppVersion: async () => "web",
  getPlatform: async () => "web",

  // ── Secure storage (localStorage fallback) ────────────────────────────────
  secureGet: async (key) => localStorage.getItem(`sec_${key}`),
  secureSet: async (key, value) => {
    if (!value) localStorage.removeItem(`sec_${key}`);
    else localStorage.setItem(`sec_${key}`, value);
  },

  // ── Window controls (no-op on web) ────────────────────────────────────────
  windowMinimize: _noop,
  windowToggleMaximize: _noop,
  windowClose: _noop,
  windowIsMaximized: async () => false,
  quitApp: _noop,

  // ── External links ─────────────────────────────────────────────────────────
  openExternal: (url) => window.open(url, "_blank", "noopener"),
  openPath: _noop,
  openPathAtTime: _noop,

  // ── M3u8/subtitle capture (stubs — not needed in iframe mode) ─────────────
  onM3u8Found: _emptyHandler,
  offM3u8Found: _noopOff,
  onSubtitleFound: _emptyHandler,
  offSubtitleFound: _noopOff,

  // ── Downloads (disabled in web mode) ──────────────────────────────────────
  checkDownloader: async () => ({ ok: false }),
  runDownload: async () => ({ ok: false, error: "Downloads not supported in web mode" }),
  getDownloads: async () => [],
  deleteDownload: async () => {},
  deleteAllDownloads: async () => {},
  showInFolder: _noop,
  fileExists: async () => false,
  scanDirectory: async () => [],
  pickFolder: async () => null,
  getInstallPath: async () => "",
  getDownloadsSize: async () => 0,
  getCacheSize: async () => 0,
  clearAppCache: async () => {},
  clearWatchData: async () => {},
  resetApp: async () => { localStorage.clear(); location.reload(); },
  getVideoDuration: async () => ({ ok: false }),
  pruneSubtitlePaths: async () => {},
  deleteSubtitleFile: async () => {},

  // ── Subtitles (disabled in web mode) ──────────────────────────────────────
  searchSubtitles: async () => ({ ok: false, results: [] }),
  getSubtitleUrl: async () => ({ ok: false }),
  downloadSubtitlesForFile: async () => ({ ok: false }),

  // ── Notifications ─────────────────────────────────────────────────────────
  showNotification: ({ title, body }) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  },

  // ── Download progress (stubs) ──────────────────────────────────────────────
  onDownloadProgress: _emptyHandler,
  offDownloadProgress: _noopOff,

  // ── Webview fullscreen (handled by iframe in web mode) ─────────────────────
  onWebviewEnterFullscreen: _emptyHandler,
  offWebviewEnterFullscreen: _noopOff,
  onWebviewLeaveFullscreen: _emptyHandler,
  offWebviewLeaveFullscreen: _noopOff,

  // ── PiP (disabled in web mode) ────────────────────────────────────────────
  openPipWindow: _noop,
  closePipWindow: _noop,
  getPipWebContentsId: async () => null,
  onPipOpened: _emptyHandler,
  offPipOpened: _noopOff,
  onPipClosed: _emptyHandler,
  offPipClosed: _noopOff,

  // ── Block stats (stubs) ───────────────────────────────────────────────────
  getBlockStats: async () => ({ session: {}, alltime: {} }),
  onBlockedUpdate: _emptyHandler,
  offBlockedUpdate: _noopOff,

  // ── Window maximize events (stubs) ────────────────────────────────────────
  onWindowMaximize: _emptyHandler,
  offWindowMaximize: _noopOff,

  // ── Video progress (web mode: query iframe directly) ──────────────────────
  queryVideoProgress: async () => null,

  // ── Auto-updater (disabled in web mode) ────────────────────────────────────
  detectUpdateFormat: async () => null,
  downloadAndInstallUpdate: async () => ({ ok: false }),
  cancelUpdate: _noop,
  onUpdateProgress: _emptyHandler,
  offUpdateProgress: _noopOff,

  // ── Player signals (stubs) ────────────────────────────────────────────────
  playerStopped: _noop,
  setZoomFactor: _noop,
  debugAllManga: async () => ({}),

  // ── Scheduled backups (stubs) ─────────────────────────────────────────────
  getScheduledBackupSettings: async () => ({ enabled: false }),
  setScheduledBackupSettings: async () => {},
  performScheduledBackup: async () => ({ ok: false }),
  onScheduledBackupRequested: _emptyHandler,
  offScheduledBackupRequested: _noopOff,

  // ── Wyzie API key ─────────────────────────────────────────────────────────
  wyzieOpenRedeem: _noop,
  wyzieValidateKey: async () => ({ ok: false }),
};

// ── iframe shim: stub Electron webview methods on HTMLIFrameElement ─────────
// This prevents crashes from webview-specific API calls (executeJavaScript, etc.)
if (typeof HTMLIFrameElement !== "undefined") {
  HTMLIFrameElement.prototype.executeJavaScript = async () => null;
  HTMLIFrameElement.prototype.getWebContentsId = () => null;
  HTMLIFrameElement.prototype.getURL = () => "";
  HTMLIFrameElement.prototype.loadURL = async (url) => { /* noop */ };
}
