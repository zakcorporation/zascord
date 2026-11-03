# Zascord Desktop — настройка с нуля на новом ПК + автообновления через GitHub

Дано: пустой ПК (только VS Code), флешка с папкой `zak-messenger`, пустой репозиторий
GitHub `zascord` для desktop-версии. Цель: рабочий проект обёртки, установщик `.exe`
и система обновлений: новые версии выкладываются в GitHub Releases, установленные
копии обновляются сами.

---

## Фаза 0. Софт (один раз)

1. **Node.js LTS**: https://nodejs.org → скачать LTS → установить (галки по умолчанию).
2. **Git for Windows**: https://git-scm.com/download/win → установить (по умолчанию).
3. Проверка в терминале (Win+R → `cmd`):
   ```bash
   node -v    # v18+ / v20+
   npm -v
   git --version
   ```
   VS Code дальше можно использовать как терминал: меню Terminal → New Terminal.

## Фаза 1. Чистая папка проекта и файлы

4. Создайте папку `D:\zascord-desktop\` (или где удобно).
5. Скопируйте в неё из моей выдачи (скачайте из чата/рабочей папки):
   - `main.js`
   - `package.json`
   - `.gitignore`
6. С флешки из `zak-messenger\public\` скопируйте `zascord.ico` и `zascord.png`:
   - оба файла — в корень `zascord-desktop\` (иконка окна в dev-режиме);
   - создайте папку `zascord-desktop\build\` и положите туда копии:
     `build\icon.ico` и `build\icon.png` (иконки установщика/ярлыков).
   Итоговая структура:
   ```
   zascord-desktop\
     build\icon.ico
     build\icon.png
     .gitignore
     main.js
     package.json
     zascord.ico
     zascord.png
   ```

## Фаза 2. Привязка к GitHub и первая выкладка

7. **Важно:** откройте `package.json` и в блоке `build.publish` замените
   `"owner": "ЗАМЕНИТЕ_НА_ВАШ_GITHUB_НИК"` на ваш ник GitHub (репо уже есть: `zascord`).
8. Терминал в папке проекта (в проводнике: клик по адресной строке → `cmd` → Enter):
   ```bash
   git init
   git add .
   git commit -m "Zascord desktop v1.0.0"
   git branch -M main
   git remote add origin https://github.com/ВАШ_НИК/zascord.git
   git push -u origin main
   ```
   При первом push браузер попросит войти в GitHub (Git Credential Manager) — войдите.
   (`node_modules` и `dist` в репозиторий не попадут — их исключает `.gitignore`.)

## Фаза 3. Запуск в разработке

9. ```bash
   npm install     # поставит electron + electron-updater + builder
   npm start       # окно Zascord с вашей иконкой
   ```
   В dev-режиме автообновления не работают (и не должны) — они включаются только
   в упакованном приложении.

## Фаза 4. Сборка установщика (Windows)

10. Разрешите symlink'и (иначе сборщик упадёт на winCodeSign, как на старом ПК):
    Параметры → Система → **Для разработчиков** → включить **Режим разработчика**.
    (Или каждый раз запускать терминал от имени администратора.)
11. ```bash
    npm run dist
    ```
    Результат в `dist\`:
    - `Zascord Setup 1.0.0.exe` — установщик для пользователей;
    - `latest.yml` — **манифест обновлений** (без него автоапдейт не работает!);
    - `win-unpacked\` — портативная папка (не раздаём).

## Фаза 5. Первый Release и канал обновлений

12. GitHub → ваш репо `zascord` → **Releases → Create a new release**:
    - tag: `v1.0.0` (создать новый);
    - заголовок: `Zascord 1.0.0`;
    - вложения (перетащить из `dist\`): **`Zascord Setup 1.0.0.exe`** и **`latest.yml`**;
    - Publish release.
13. Готово: любой установленный экземпляр приложения при запуске (и далее каждые 4 часа)
    спрашивает GitHub Releases вашего репо, сравнивает версию с `latest.yml`,
    тихо скачивает новую и предлагает «Перезапустить и установить».
    Репозиторий должен оставаться **публичным** (либо настройте токен — не наш случай).

## Как выпускать НОВУЮ версию десктопа (регулярный процесс)

1. В `package.json` поднять `"version"` (например, `1.0.1`).
2. `npm run dist`.
3. GitHub → Releases → new release, tag `v1.0.1`, загрузить **новый exe + новый latest.yml**
   (оба файла обязательны, каждый раз свои).
4. У пользователей: диалог обновления при следующем запуске/проверке.
   Сайт (веб-часть) при этом обновляется сам с хостинга — пересборка нужна только
   когда менялись `main.js`, иконки, версии или зависимости обёртки.

## Чек-лист новой машины
```
[ ] Node LTS + Git установлены, node -v / git --version работают
[ ] папка zascord-desktop с main.js, package.json, .gitignore, zascord.ico/png, build/icon.*
[ ] в package.json publish.owner = ваш ник
[ ] git push в репо zascord прошёл
[ ] npm install, npm start — окно открывается
[ ] Режим разработчика включён
[ ] npm run dist — в dist/ есть exe и latest.yml
[ ] Release v1.0.0 на GitHub с exe + latest.yml опубликован
```

## Частые грабли
- **«application icon is not set»** — нет `build/icon.ico` (шаг 6).
- **«Cannot create symbolic link»** — не включён Режим разработчика / не админ (шаг 10).
- **Автоапдейт молчит** — проверьте: репо публичное; в Release загружен `latest.yml`;
  версия в Release выше установленной; приложение упаковано (не `npm start`).
- **SmartScreen ругается на exe** — неподписанный установщик: «Подробнее → Выполнить».
