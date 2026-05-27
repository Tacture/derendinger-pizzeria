# Derendinger Pizzeria

Website for Derendinger Pizzeria, Hauptstrasse 58, 4552 Derendingen.

## Tech Stack

- **React 19** single-page app (one component: `DerendingerPizzeria.jsx`)
- **Vite** for dev server and production build
- **lucide-react** for icons
- **Vercel** for hosting (auto-deploys from `main`/`master` on push)

## Project Structure

```
DerendingerPizzeria.jsx   # Full app — single self-contained React component with inline CSS
index.html                # Vite entry HTML
src/main.jsx              # React root mount
vite.config.js            # Vite config (React plugin only)
package.json              # Dependencies and scripts
```

## Commands

```sh
npm run dev       # Start local dev server (http://localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

## Deployment

Hosted on Vercel. Pushes to the `master` branch on `github.com/Tacture/derendinger-pizzeria` trigger automatic deploys.

To deploy manually: `vercel` (or `vercel --prod` for production).

## Notes

- The entire UI lives in `DerendingerPizzeria.jsx` — component, styles (CSS-in-JS via `<style>` tag), data, and logic are all in one file.
- Opening hours, menu highlights, and restaurant info are hardcoded constants at the top of the file.
- Online ordering links to just-eat.ch.
- The site is in German (Swiss German locale).
