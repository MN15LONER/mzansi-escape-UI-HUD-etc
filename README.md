# Mzansi Escape

## Run during development

```bash
npm install
npm run dev
```

## Create and run a release (Windows)

Run `npm run release` to build the production game into the `release` folder. After that, double-click **release/Run Mzansi Escape.bat** to open the game in your browser. Keep the launcher window open while playing; close it to stop the local game server.

The release runs on Node.js and uses Firebase for online sign-in and saved progress, so Node.js and an internet connection are required. You do not need to open the project in an IDE.

## Web hosting

With the Firebase CLI already logged in, deploy the browser build:

```bash
npm run deploy:web
```

That runs `npm run build`, then `firebase deploy --only hosting`. Hosting is the only target, so Firestore rules are not deployed. After it finishes, open https://mzantsiescape.web.app in a desktop or phone browser.

The free Firebase plan has a limited daily data transfer. A first load is about 100 MB, so a handful of new visitors can use up that allowance quickly.
