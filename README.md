# Zascord Desktop (Electron) — Этап 25, пункт 11

Обёртка грузит веб-версию мессенджера в нативное окно (Windows/Linux/macOS).
Отдельный бандл приложения не нужен: код живёт на хостинге, обёртка только окно.

## Запуск
```bash
cd electron
npm install
npm start
```

## Сборка дистрибутивов
```bash
npm run dist
```
- Windows → `dist/*.exe` (NSIS-установщик)
- Linux → `dist/*.AppImage`
- macOS → `dist/*.dmg`

## Настройки
- Домен: константа `APP_URL` в `main.js` (после привязки своего домена поменяйте на `https://zascord.app`).
- Иконка установщика: положите `build/icon.ico` (Win) / `build/icon.icns` (mac) / `build/icon.png` (Linux) — electron-builder подхватит автоматически.

## Безопасность
`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` — веб-код не получает
доступа к Node/API системы; внешние ссылки открываются в системном браузере.

