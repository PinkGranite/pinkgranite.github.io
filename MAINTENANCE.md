# Yuwei Yan — personal homepage

Static personal research homepage, hosted at https://pinkgranite.github.io/ through free GitHub Pages.

## Maintain

- `src/content.ts`: publication metadata, author roles, project summaries and public links.
- `src/figures.json`: figure image paths, source URLs, figure/page/version attribution.
- `scripts/build.mjs`: page structure and build-time rendering.
- `public/concept.css`: typography, colors, responsive layout.
- `public/photo-sequence.js` and `public/figures.js`: photo composition controls and enlarged figures.
- `public/assets`: optimized photographs, original source figure crops, and self-hosted fonts.

Use Node 24 or newer. Run `npm ci`, `npm run check`, then `npm run build`. Serve `dist/` through any static HTTP server. All scholarly content and the initial photograph remain readable without JavaScript; reduced motion and manual photo selection are supported.

## Deploy

The GitHub Actions workflow builds and deploys `dist/` on a push to `master` or a manual run. In repository Settings → Pages, use GitHub Actions as the publishing source. No server, API keys, tracking, or runtime dependencies are used.

## Images and fonts

Figure source links and versions are retained in `src/figures.json` and the enlarged image dialog. Ten publication figures are available. Embodied World Models, DIDS, and MobiSim-Bench retain their source links with a pending image state. AgentSociety and OpenCity project images are paper figures; IntelliWorld is a published interface screenshot; EasyPaper is SDK documentation.

The three personal photographs are supplied and approved by Yuwei Yan. Original photographs and metadata are not included. Paper figures and third-party project images retain their respective owners’ rights. DM Sans and Instrument Serif are self-hosted; their SIL Open Font License files are under `public/licenses/`.
