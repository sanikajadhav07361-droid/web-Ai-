import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT || 3001)
const here = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: '20kb' }))

app.get('/api/news', async (_request, response) => {
  if (!process.env.NEWS_API_KEY) {
    response.json({ configured: false, articles: [] })
    return
  }

  try {
    const url = new URL('https://newsapi.org/v2/everything')
    url.searchParams.set('q', 'artificial intelligence OR generative AI')
    url.searchParams.set('language', 'en')
    url.searchParams.set('sortBy', 'publishedAt')
    url.searchParams.set('pageSize', '12')
    const result = await fetch(url, { headers: { 'X-Api-Key': process.env.NEWS_API_KEY } })
    const payload = await result.json()

    if (!result.ok || payload.status !== 'ok') {
      response.status(502).json({ configured: true, error: 'The news provider could not return articles.' })
      return
    }

    response.json({
      configured: true,
      articles: payload.articles.map((item) => ({
        id: `live-${Buffer.from(item.url).toString('base64url').slice(0, 24)}`,
        title: item.title,
        excerpt: item.description || 'Open the original report for the full story.',
        category: 'Research',
        author: item.author || item.source?.name || 'External newsroom',
        date: item.publishedAt,
        readTime: 'External report',
        image: item.urlToImage || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=82',
        imageAlt: item.title,
        isLive: true,
        body: [item.description || 'This story is hosted by its original publisher. Visit the source for full coverage.'],
        sourceUrl: item.url,
        sourceName: item.source?.name || 'Original source',
      })),
    })
  } catch {
    response.status(502).json({ configured: true, error: 'The news provider is temporarily unavailable.' })
  }
})

app.post('/api/newsletter', (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ message: 'Enter a valid email address.' })
    return
  }
  response.json({ message: 'You are on the list for this demo.' })
})

app.post('/api/contact', (request, response) => {
  const { name, email, message } = request.body || {}
  if (![name, email, message].every((value) => typeof value === 'string' && value.trim())) {
    response.status(400).json({ message: 'Please complete every field.' })
    return
  }
  response.json({ message: 'Your message was received for this demo.' })
})

const dist = path.resolve(here, '../dist')
app.use(express.static(dist))
app.get('*', (_request, response) => response.sendFile(path.join(dist, 'index.html'), (error) => {
  if (error) response.status(404).send('Build the app first with npm run build.')
}))

app.listen(port, () => console.log(`Signal API listening on http://localhost:${port}`))