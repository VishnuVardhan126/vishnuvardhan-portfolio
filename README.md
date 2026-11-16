# Vishnu Vardhan — Portfolio

GTM Engineer · Content Creator · Visual Designer. Built with Next.js.

Pages: `/` (Home), `/gtm` (GTM Engineer), `/video-design` (Video & Design).

## Run it on your computer
1. Install Node.js 20+ from nodejs.org
2. In this folder run:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

## Deploy to Vercel
**Option A — GitHub (recommended, auto-updates on every push)**
1. Create a new repo on github.com and upload this folder (without `node_modules` and `.next`).
2. On vercel.com → Add New → Project → import the repo → Deploy. No settings needed.

**Option B — Vercel CLI**
```
npm i -g vercel
vercel        # first time: log in + create project
vercel --prod # publish
```
To replace your old portfolio address, deploy into the same Vercel project
(`vishnuvardhan-portfolio-three`) or move the domain to the new project in Vercel → Settings → Domains.

## Editing content
- Text and sections: `content/home.html`, `content/gtm.html`, `content/video-design.html`
- Nav, cursor, video viewer: `content/chrome.html`
- Styles: `app/globals.css` · Animations: `lib/site.js`
- Videos, posters, photos: `public/media/`
- **Resume:** put your PDF at `public/resume/Vishnu-Vardhan-GTM-Engineer-Resume.pdf` (the Resume button downloads it)
- Instagram numbers (posts / followers / following) are in `content/home.html` — search for `data-count`.
- Share image for LinkedIn/WhatsApp: `public/og.jpg`

## Adding a new reel
1. Export as MP4 (720×1280 is plenty), put it in `public/media/` with a poster JPG.
2. Copy one of the `<div class="vid tall …">` blocks in `content/video-design.html` and change the file names and title.
