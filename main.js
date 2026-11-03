/* ============================================================
   Zascord — Electron-обёртка (Этап 25, пункт 11)
   v3: автообновления через GitHub Releases (electron-updater).
   Грузит веб-версию с Firebase Hosting в нативное окно.
   Безопасность: nodeIntegration выключен, sandbox включён,
   внешние ссылки — в системный браузер.
   ============================================================ */
const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// Замените на свой боевой домен (после привязки custom domain — на zascord.app)
const APP_URL = "https://zak-messenger.web.app";

// иконка окна и таскбара в рантайме (рядом с package.json)
const WIN_ICON = path.join(__dirname, "zascord.ico");
const GENERIC_ICON = path.join(__dirname, "zascord.png");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    title: "Zascord",
    icon: process.platform === "win32" ? WIN_ICON : GENERIC_ICON,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadURL(APP_URL);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F12") win.webContents.toggleDevTools();
  });
}

// ---------- автообновления (GitHub Releases, публичный репозиторий) ----------
// Канал настраивается в package.json → build.publish (owner/repo).
// Работает только в упакованном виде (npm start в dev-режиме обновления не качает).
function setupAutoUpdate() {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = true;          // качать сразу тихо
  autoUpdater.autoInstallOnAppQuit = true;   // если пользователь проигнорировал диалог
  autoUpdater.on("error", e => console.warn("update error:", e && e.message));
  autoUpdater.on("update-downloaded", info => {
    dialog.showMessageBox({
      type: "info",
      title: "Zascord — обновление",
      message: "Обновление до v" + (info.version || "?") + " загружено.",
      detail: "Перезапустить приложение сейчас и установить обновление?",
      buttons: ["Перезапустить", "Позже"]
    }).then(r => {
      if (r.response === 0) autoUpdater.quitAndInstall();
    });
  });
  setTimeout(() => { autoUpdater.checkForUpdatesAndNotify().catch(() => {}); }, 5000);
  setInterval(() => { autoUpdater.checkForUpdatesAndNotify().catch(() => {}); }, 4 * 3600 * 1000);
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdate();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
