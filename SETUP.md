# Carl Summer Plan Refined — Android App Setup

Your training tracker as an installable Android app (PWA). All data stays on your phone. No accounts, no servers, no tracking.

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The full app — plan, tracker, export |
| `manifest.json` | Tells Android how to install it as an app |
| `sw.js` | Service worker — makes it work fully offline |
| `icon-192.png` / `icon-512.png` | Home screen icons |

## Setup (one-time, ~5 minutes)

The app needs to be served over HTTPS for Android's "install as app" feature to work. Easiest free option — GitHub Pages:

1. Create a free GitHub account if you don't have one (github.com)
2. Create a new repository — call it anything, e.g. `summer-plan`. Set it to **Public** (required for free Pages) — note the page contains only the plan template, never your logged data
3. Upload all 5 files from this folder to the repository
4. Go to the repo's **Settings → Pages**, set Source to "Deploy from a branch", select `main` branch, root folder, and save
5. After a minute, your app will be live at `https://<your-username>.github.io/summer-plan/`

## Install on your phone

1. Open that URL in **Chrome on your Android phone**
2. Chrome will show an "Add Summer Plan to Home screen" prompt — tap it
   (or tap the ⋮ menu → "Add to Home screen" → "Install")
3. The app now appears on your home screen with its own icon, opens full-screen
   without browser chrome, and works completely offline

## Security & privacy notes

- **All your data (ticks, sleep, energy, notes) is stored on your phone only** — in the app's local storage. Nothing is ever sent anywhere.
- The GitHub Pages site is just the empty plan template. Anyone who found the URL would see a blank tracker — never your data.
- No permissions are requested. No camera, location, contacts — nothing.
- Works in airplane mode after the first load.

## Important caveats

- **Data lives in the app's browser storage.** If you clear Chrome's site data or uninstall the app, your logged data is deleted. Use the 📋 Export button weekly (which you're doing for check-ins anyway) as your backup.
- **Data does not sync between devices.** Phone and laptop each keep their own copy.
- If you update the plan later (new HTML from Claude), replace `index.html` in the GitHub repo and bump the cache version in `sw.js` (change `summer-plan-v1` to `-v2`) so phones pick up the new version.

## Alternative: no hosting at all

If you'd rather not host anything, you can simply open `index.html` in Chrome on your phone (copy it to the phone, open via Files → open with Chrome) and use ⋮ → "Add to Home screen". You get an icon and the full tracker — the only feature you lose is the offline service worker caching, which barely matters since the file is already local.
