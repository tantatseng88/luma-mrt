# Luma to MRT

A Progressive Web App that lists upcoming public Luma events in Singapore on a calendar. Pick an event and a starting MRT station to get the lines, interchanges, the stop to alight at, walking time, and map links (including food and drinks within about 300 m of the station).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: page, styles, MRT network, station coordinates, and a snapshot of Luma Singapore events |
| `manifest.webmanifest` | App name, icons and colours used when installing |
| `sw.js` | Service worker. Caches the app so it opens offline |
| `icons/` | App icons (192, 512, Apple touch) |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Run locally

```bash
python -m http.server 8765
```

Then open http://localhost:8765. Service workers only run on `localhost` or `https`.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. `.github/workflows/deploy.yml` deploys on every push to `main`, every 3 hours, and when you press **Run workflow** on the Actions tab.
4. The app is served at `https://<username>.github.io/<repo>/`. Open it on your phone and choose **Add to Home Screen** (iOS Safari) or **Install app** (Android Chrome).

## How event refresh works

Luma's feed doesn't allow requests from other websites, so the app can't call Luma directly. Instead:

1. Every 3 hours the workflow runs `scripts/fetch-events.mjs`, which fetches the Singapore list and writes `events.json` into the deployed site. If Luma returns nothing or an error, the run fails and the previous list stays live.
2. The app loads `events.json` when it opens and when you tap **Refresh events**. Offline, it uses the last list it saved, or the list built into `index.html`.

To get a fresh list sooner than 3 hours, open the repository's **Actions** tab, choose the workflow and press **Run workflow**.

GitHub pauses scheduled workflows in public repositories after 60 days without commits. If the list stops updating, re-enable the workflow on the Actions tab.

## Updating the app

After any change to `index.html`, bump `VERSION` in `sw.js` so installed copies pick up the new version.

## Data sources

- Events: public Luma discover feed behind luma.com/discover/singapore. Undocumented; it may change. Check Luma's terms before relying on it.
- Station coordinates: [sgraildata](https://github.com/cheeaun/sgraildata).
- MRT network: entered by hand; six MRT lines, no LRT. Travel times are estimates.
