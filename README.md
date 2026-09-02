# Sang Hoon Sung — Portfolio

Personal professional portfolio site for [woojooin.github.io](https://woojooin.github.io).

Built with plain HTML5, CSS3, and vanilla JavaScript for GitHub Pages. No frameworks or build step.

## Structure

```
/
├── index.html              # Homepage
├── css/style.css           # Global styles
├── js/main.js              # Navigation & interactions
├── images/                 # Screenshots and assets (to be added)
├── projects/               # Individual project pages
│   ├── office-ai-agent.html
│   ├── ai-mail-gateway.html
│   ├── treesize.html
│   ├── zcommander.html
│   ├── zgallery.html
│   ├── 1clipboard.html
│   └── cloud-player.html
└── README.md
```

## Local preview

From the repository root:

```bash
# Option 1 — Python
python3 -m http.server 8000

# Option 2 — Node (if installed)
npx serve .
```

Then open [http://localhost:8000](http://localhost:8000).

You can also open `index.html` directly in a browser; relative links work either way.

## Deploy to GitHub Pages

This repository is a user site (`username.github.io`), so content on the `main` branch is served at the site root.

1. Commit and push changes to `main`:

   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. In GitHub: **Settings → Pages**
   - Source: Deploy from a branch
   - Branch: `main` / root (`/`)

3. After a short delay, the site is live at:
   [https://woojooin.github.io](https://woojooin.github.io)

## Content status

Homepage structure and project page shells are in place. Biography, career history, skills, project details, screenshots, and links are placeholders until verified content is provided.

## Notes

- Confirm LinkedIn and GitHub profile URLs if they differ from the placeholders used in the markup.
- Add images under `images/` and reference them from project pages when ready.
