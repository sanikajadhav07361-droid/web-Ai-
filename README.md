# Signal

Signal is a responsive editorial website about AI and emerging technology, built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Express.

## Run locally

Requirements: Node.js 20.6+ and npm.

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Express API runs on port `3001` and is proxied by Vite. `.env` is optional; without a key, the site intentionally displays labeled sample stories rather than claiming they are live news.

For a production build and preview:

```bash
npm run build
npm start
```

The production server listens on port `3001` by default. Set `PORT` to change it.

## Optional live headlines

Create a free API key at [NewsAPI.org](https://newsapi.org/) and add it to `.env`:

```dotenv
NEWS_API_KEY=your_key_here
PORT=3001
```

The key is only read by the Express server. The `/api/news` route returns recent external headlines and their source links. API availability and plan limits depend on NewsAPI.org. External reports are labeled separately from the starter AI-generated illustrative stories; sample article pages are not breaking or verified reporting.

## Features

- Routes for Home, Latest, Editor's Picks, topic index and topic pages, article details, search, saved articles, About, Contact, and a not-found page.
- Search and pagination, related stories, share actions, and accessible save controls.
- Bookmarks and light/dark preference persist in local storage.
- Responsive layouts, reduced-motion support, loading skeletons, empty states, and route-level page transitions.
- Newsletter and contact forms validate input and show demo-only responses. They do not store addresses or deliver messages; connect a mailing-list or form provider before production use.
- SEO title and description metadata, semantic landmarks, focus-visible controls, and image alt text.

## Checks

```bash
npm run lint
npm run build
```