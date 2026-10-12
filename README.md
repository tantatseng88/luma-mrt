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
2. In the repository, open **Settings → Pages**, set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The app is served at `https://<username>.github.io/<repo>/`. Open it on your phone and choose **Add to Home Screen** (iOS Safari) or **Install app** (Android Chrome).

## Updating

- The event list is a snapshot copied into `index.html`; it does not refresh by itself. Replace the `LUMA_SNAPSHOT` data to update it.
- After any change to `index.html`, bump `VERSION` in `sw.js` (for example `luma-mrt-v2`) so installed copies pick up the new version.

## Data sources

- Events: public Luma discover feed behind luma.com/discover/singapore. Undocumented; it may change. Check Luma's terms before relying on it.
- Station coordinates: [sgraildata](https://github.com/cheeaun/sgraildata).
- MRT network: entered by hand; six MRT lines, no LRT. Travel times are estimates.
