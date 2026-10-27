import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  Menu,
  Moon,
  Search,
  Share2,
  Sun,
  X,
} from 'lucide-react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Article, articles as sampleArticles, categories, categoryDescriptions, Category } from './data'

type Theme = 'light' | 'dark'

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => readStored<Theme>('signal-theme', 'light'))
  const [bookmarks, setBookmarks] = useState<string[]>(() => readStored('signal-bookmarks', []))
  const [liveArticles, setLiveArticles] = useState<Article[]>([])
  const [newsState, setNewsState] = useState<'loading' | 'demo' | 'live' | 'error'>('loading')
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('signal-theme', JSON.stringify(theme))
  }, [theme])

  useEffect(() => {
    localStorage.setItem('signal-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    let active = true
    fetch('/api/news')
      .then(async (response) => {
        if (!response.ok) throw new Error('News unavailable')
        return (await response.json()) as { configured: boolean; articles?: Article[]; error?: string }
      })
      .then((result) => {
        if (!active) return
        setLiveArticles(result.articles || [])
        setNewsState(result.configured && result.articles?.length ? 'live' : 'demo')
      })
      .catch(() => {
        if (active) setNewsState('error')
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, location.search])

  const allArticles = useMemo(() => [...liveArticles, ...sampleArticles], [liveArticles])
  const toggleBookmark = (id: string) => {
    setBookmarks((current) => current.includes(id) ? current.filter((saved) => saved !== id) : [id, ...current])
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="topline"><span>Independent perspective on intelligent systems</span><span className="topline-date">VOL. 04&nbsp; / &nbsp;OCTOBER 2026</span></div>
        <div className="nav-wrap">
          <Link className="wordmark" to="/" aria-label="Signal home"><span className="wordmark-mark">s.</span><span>signal<span className="wordmark-period">/</span></span></Link>
          <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/latest">Latest</NavLink>
            <NavLink to="/trending">Editor's picks</NavLink>
            <div className="nav-dropdown">
              <NavLink to="/categories" className="categories-link">Topics <ChevronDown size={13} aria-hidden="true" /></NavLink>
              <div className="dropdown-menu">{categories.map((category) => <Link key={category} to={`/category/${slugify(category)}`}>{category}</Link>)}</div>
            </div>
            <NavLink to="/about">About</NavLink>
          </nav>
          <div className="nav-actions">
            <SearchBox compact />
            <Link to="/saved" className="icon-button saved-nav" aria-label={`Saved articles, ${bookmarks.length} saved`} title="Saved articles"><Bookmark size={18} /><span>{bookmarks.length}</span></Link>
            <button className="icon-button theme-toggle" type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle color theme">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button className="icon-button menu-toggle" type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        <div className="nav-rule" />
      </header>

      <main id="main-content">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname + location.search} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}>
            <Routes>
              <Route path="/" element={<HomePage articles={allArticles} newsState={newsState} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/latest" element={<StoriesPage title="Latest stories" eyebrow="THE DAILY SIGNAL" description="Fresh thinking on artificial intelligence and the technologies changing how we live." articles={allArticles} newsState={newsState} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/trending" element={<StoriesPage title="Editor's picks" eyebrow="WORTH YOUR TIME" description="A considered reading list from the Signal desk. Curated, not ranked by clicks." articles={sampleArticles.slice(0, 4)} newsState={newsState} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:slug" element={<CategoryPage articles={allArticles} newsState={newsState} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/article/:slug" element={<ArticlePage articles={allArticles} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/search" element={<SearchPage articles={allArticles} newsState={newsState} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/saved" element={<SavedPage articles={allArticles} bookmarks={bookmarks} onBookmark={toggleBookmark} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

function SearchBox({ compact = false, initialValue = '' }: { compact?: boolean; initialValue?: string }) {
  const navigate = useNavigate()
  const [value, setValue] = useState(initialValue)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (value.trim()) navigate(`/search?q=${encodeURIComponent(value.trim())}`)
  }
  return (
    <form className={`search-box ${compact ? 'search-compact' : ''}`} role="search" onSubmit={submit}>
      <Search size={compact ? 17 : 19} aria-hidden="true" />
      <input aria-label="Search stories" placeholder={compact ? 'Search' : 'Search ideas, stories, people…'} value={value} onChange={(event) => setValue(event.target.value)} />
      {!compact && <button type="submit" className="search-submit">Search <ArrowRight size={15} /></button>}
    </form>
  )
}

function StatusNote({ state }: { state: 'loading' | 'demo' | 'live' | 'error' }) {
  const labels = {
    loading: 'Checking news source',
    demo: 'AI-generated samples · not live news',
    live: 'Live links + labeled samples',
    error: 'News source unavailable · showing samples',
  }
  return <span className={`status-note status-${state}`}><span className="status-dot" />{labels[state]}</span>
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span className="eyebrow-line" />{children}</div>
}

function HomePage({ articles, newsState, bookmarks, onBookmark }: { articles: Article[]; newsState: 'loading' | 'demo' | 'live' | 'error'; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const featured = articles[0] || sampleArticles[0]
  const latest = articles.filter((article) => article.id !== featured.id).slice(0, 3)
  return (
    <>
      <section className="home-intro page-width">
        <div className="intro-copy"><Eyebrow>INTELLIGENCE, IN CONTEXT</Eyebrow><h1>Technology is<br /><span>a human story.</span></h1><p>Clear-eyed ideas for a world being rewritten by intelligent machines.</p></div>
        <div className="intro-aside"><span className="aside-index">01 — 06</span><p>We look past the hype to explore the people, choices, and systems shaping what comes next.</p><Link to="/about" className="text-link">Our point of view <ArrowUpRight size={15} /></Link></div>
      </section>
      <section className="feature-layout page-width" aria-label="Featured story">
        <Link to={`/article/${featured.id}`} className="feature-image image-hover"><img src={featured.image} alt={featured.imageAlt} /><span className="image-index">{featured.isLive ? 'EXTERNAL REPORT' : 'AI SAMPLE STORY'} / 001</span><span className="image-arrow"><ArrowUpRight size={22} /></span></Link>
        <article className="feature-story"><div className="feature-meta"><Eyebrow>{featured.category}</Eyebrow><span className="feature-number">{featured.isLive ? 'EXTERNAL SOURCE' : 'AI-GENERATED SAMPLE'}</span></div><Link to={`/article/${featured.id}`} className="feature-title-link"><h2>{featured.title}</h2></Link><p className="feature-excerpt">{featured.excerpt}</p><div className="byline"><span>WORDS BY <strong>{featured.author}</strong></span><span>{formatDate(featured.date)}</span></div><div className="feature-bottom"><Link to={`/article/${featured.id}`} className="read-link">Read the story <ArrowRight size={17} /></Link><BookmarkButton article={featured} saved={bookmarks.includes(featured.id)} onClick={() => onBookmark(featured.id)} /></div></article>
      </section>
      <section className="latest-section page-width">
        <div className="section-heading"><div><Eyebrow>THE LATEST</Eyebrow><h2>New perspectives</h2></div><div className="section-heading-right"><StatusNote state={newsState} /><Link to="/latest" className="text-link">All stories <ArrowUpRight size={15} /></Link></div></div>
        {newsState === 'loading' && <div className="loading-grid" aria-label="Loading stories"><div /><div /><div /></div>}
        <div className="article-grid">{latest.map((article, index) => <ArticleCard key={article.id} article={article} index={index} saved={bookmarks.includes(article.id)} onBookmark={() => onBookmark(article.id)} />)}</div>
      </section>
      <section className="quote-band"><div className="quote-inner page-width"><Eyebrow light>OUR EDITORIAL PROMISE</Eyebrow><p>“A little more signal.<br />A lot less noise.”</p><span>INDEPENDENT SINCE DAY ONE</span></div></section>
      <section className="topic-strip page-width"><div><Eyebrow>FOLLOW A THREAD</Eyebrow><h2>Ideas don’t fit<br />in one category.</h2><Link to="/categories" className="read-link">Explore all topics <ArrowRight size={17} /></Link></div><div className="topic-list">{categories.slice(0, 4).map((category, index) => <Link key={category} to={`/category/${slugify(category)}`} className="topic-row"><span className="topic-index">0{index + 1}</span><span>{category}</span><ArrowUpRight size={17} /></Link>)}</div></section>
      <Newsletter />
    </>
  )
}

function ArticleCard({ article, index, saved, onBookmark }: { article: Article; index: number; saved: boolean; onBookmark: () => void }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.article className="article-card" initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -40px 0px' }} transition={{ delay: index * 0.06, duration: 0.42 }}>
      <div className="card-image-wrap"><Link to={`/article/${article.id}`} className="card-image image-hover"><img src={article.image} alt={article.imageAlt} loading="lazy" /><span className="card-image-arrow"><ArrowUpRight size={18} /></span></Link><BookmarkButton article={article} saved={saved} onClick={onBookmark} floating /></div>
      <div className="card-meta"><span className="card-category"><Link to={`/category/${slugify(article.category)}`}>{article.category}</Link><span className={`origin-tag ${article.isLive ? 'origin-live' : ''}`}>{article.isLive ? 'EXTERNAL' : 'AI SAMPLE'}</span></span><span>{article.readTime}</span></div>
      <h3><Link to={`/article/${article.id}`}>{article.title}</Link></h3>
      <p>{article.excerpt}</p>
      <div className="card-byline"><span>{article.author}</span><span>{formatDate(article.date)}</span></div>
    </motion.article>
  )
}

function BookmarkButton({ article, saved, onClick, floating = false }: { article: Article; saved: boolean; onClick: () => void; floating?: boolean }) {
  return <button type="button" className={`bookmark-button ${floating ? 'bookmark-floating' : ''} ${saved ? 'is-saved' : ''}`} aria-label={`${saved ? 'Remove' : 'Save'} ${article.title}`} aria-pressed={saved} title={saved ? 'Remove bookmark' : 'Save article'} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onClick() }}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>
}

function StoriesPage({ title, eyebrow, description, articles, newsState, bookmarks, onBookmark }: { title: string; eyebrow: string; description: string; articles: Article[]; newsState: 'loading' | 'demo' | 'live' | 'error'; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const [page, setPage] = useState(1)
  const pageSize = 4
  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize))
  const visible = articles.slice((page - 1) * pageSize, page * pageSize)
  return <section className="listing-page page-width"><div className="listing-heading"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}<span className="heading-period">.</span></h1><p>{description}</p><StatusNote state={newsState} /></div><div className="listing-toolbar"><span>{articles.length.toString().padStart(2, '0')} STORIES</span><span>CURATED WITH CURIOSITY</span></div>{newsState === 'loading' && <div className="loading-grid" aria-label="Loading stories"><div /><div /><div /></div>}{articles.length ? <div className="article-grid listing-grid">{visible.map((article, index) => <ArticleCard key={article.id} article={article} index={index} saved={bookmarks.includes(article.id)} onBookmark={() => onBookmark(article.id)} />)}</div> : <EmptyState title="No stories yet" message="Check back soon for new perspectives." />}{totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}</section>
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  return <nav className="pagination" aria-label="Pagination"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ArrowLeft size={17} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-label={`Page ${number}`} aria-current={page === number ? 'page' : undefined} className={page === number ? 'active-page' : ''} onClick={() => onChange(number)}>{number.toString().padStart(2, '0')}</button>)}<button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => onChange(page + 1)}><ArrowRight size={17} /></button></nav>
}

function CategoriesPage() {
  return <section className="listing-page page-width"><div className="listing-heading"><Eyebrow>FIND YOUR THREAD</Eyebrow><h1>Topics<span className="heading-period">.</span></h1><p>Ideas are connected. Start wherever you like.</p></div><div className="category-grid">{categories.map((category, index) => <Link key={category} to={`/category/${slugify(category)}`} className="category-tile"><span className="category-tile-index">0{index + 1} / TOPIC</span><h2>{category}</h2><p>{categoryDescriptions[category]}</p><ArrowUpRight size={20} /></Link>)}</div></section>
}

function CategoryPage({ articles, newsState, bookmarks, onBookmark }: { articles: Article[]; newsState: 'loading' | 'demo' | 'live' | 'error'; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const { slug = '' } = useParams()
  const category = categories.find((item) => slugify(item) === slug) as Category | undefined
  const filtered = category ? articles.filter((article) => article.category === category) : []
  if (!category) return <NotFound />
  return <StoriesPage title={category} eyebrow="TOPIC / SIGNAL" description={categoryDescriptions[category]} articles={filtered} newsState={newsState} bookmarks={bookmarks} onBookmark={onBookmark} />
}

function SearchPage({ articles, newsState, bookmarks, onBookmark }: { articles: Article[]; newsState: 'loading' | 'demo' | 'live' | 'error'; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() || ''
  const results = query ? articles.filter((article) => `${article.title} ${article.excerpt} ${article.category} ${article.author}`.toLowerCase().includes(query.toLowerCase())) : []
  return <section className="listing-page page-width"><div className="listing-heading"><Eyebrow>THE SIGNAL INDEX</Eyebrow><h1>Search<span className="heading-period">.</span></h1><p>Look closer. Find a new point of view.</p><div className="large-search"><SearchBox initialValue={query} /></div></div>{query && <div className="search-results-heading"><span>RESULTS FOR</span><strong>“{query}”</strong><span>{results.length} {results.length === 1 ? 'STORY' : 'STORIES'}</span></div>}{newsState === 'loading' && <div className="loading-grid" aria-label="Loading stories"><div /><div /><div /></div>}{results.length ? <div className="article-grid listing-grid">{results.map((article, index) => <ArticleCard key={article.id} article={article} index={index} saved={bookmarks.includes(article.id)} onBookmark={() => onBookmark(article.id)} />)}</div> : query ? <EmptyState title="Nothing in the index" message="Try a broader term or explore a topic instead." action={<Link className="text-link" to="/categories">Browse topics <ArrowRight size={15} /></Link>} /> : <EmptyState title="What are you curious about?" message="Search stories, topics, and contributors." />}</section>
}

function SavedPage({ articles, bookmarks, onBookmark }: { articles: Article[]; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const saved = articles.filter((article) => bookmarks.includes(article.id))
  return <section className="listing-page page-width"><div className="listing-heading"><Eyebrow>YOUR READING LIST</Eyebrow><h1>Saved<span className="heading-period">.</span></h1><p>Good ideas are worth coming back to.</p></div>{saved.length ? <div className="article-grid listing-grid">{saved.map((article, index) => <ArticleCard key={article.id} article={article} index={index} saved onBookmark={() => onBookmark(article.id)} />)}</div> : <EmptyState title="A little room for later" message="Save stories with the bookmark icon and they’ll be waiting here." action={<Link className="text-link" to="/latest">Find a story <ArrowRight size={15} /></Link>} />}</section>
}

function ArticlePage({ articles, bookmarks, onBookmark }: { articles: Article[]; bookmarks: string[]; onBookmark: (id: string) => void }) {
  const { slug } = useParams()
  const article = articles.find((item) => item.id === slug)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (article) {
      document.title = `${article.title} — Signal`
      const description = document.querySelector('meta[name="description"]')
      description?.setAttribute('content', article.excerpt)
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${article.title} — Signal`)
    }
    return () => {
      document.title = 'Signal — Intelligence, in context'
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'Signal is an independent journal exploring artificial intelligence, emerging technology, and the ideas shaping tomorrow.')
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Signal — Intelligence, in context')
    }
  }, [article])
  if (!article) return <NotFound />
  const related = articles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 2)
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.excerpt, url: window.location.href }).catch(() => undefined)
    } else {
      await navigator.clipboard?.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }
  return <article className="article-page page-width"><Link to="/latest" className="back-link"><ArrowLeft size={16} /> Back to stories</Link><header className="article-header"><Eyebrow>{article.category}</Eyebrow><h1>{article.title}</h1><p className="article-deck">{article.excerpt}</p><div className="article-byline"><div className="author-mark">{article.author.split(' ').map((part) => part[0]).join('')}</div><div><strong>{article.author}</strong><span>{article.date} <i /> {article.readTime}</span></div><div className="article-tools"><BookmarkButton article={article} saved={bookmarks.includes(article.id)} onClick={() => onBookmark(article.id)} /><button className="icon-button" type="button" aria-label="Share article" onClick={share}>{copied ? <Check size={18} /> : <Share2 size={18} />}</button></div></div></header><figure className="article-hero-image"><img src={article.image} alt={article.imageAlt} /><figcaption>{article.sourceName ? `Image and reporting via ${article.sourceName}` : 'A Signal perspective · illustrative image'}</figcaption></figure><div className="article-reading-layout"><aside className="reading-aside"><span>IN THIS STORY</span><a href="#story">The perspective</a><a href="#related">Related reading</a><span className="reading-time"><Clock3 size={14} /> {article.readTime}</span></aside><div className="article-body" id="story">{article.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{article.sourceUrl && <a className="source-link" href={article.sourceUrl} target="_blank" rel="noreferrer">Continue at {article.sourceName || 'the original source'} <ArrowUpRight size={16} /></a>}<div className="article-endmark"><span /> END OF STORY <span /></div></div></div>{related.length > 0 && <section className="related-section" id="related"><div className="section-heading"><div><Eyebrow>KEEP EXPLORING</Eyebrow><h2>Related stories</h2></div><Link to={`/category/${slugify(article.category)}`} className="text-link">More in {article.category} <ArrowUpRight size={15} /></Link></div><div className="article-grid">{related.map((item, index) => <ArticleCard key={item.id} article={item} index={index} saved={bookmarks.includes(item.id)} onBookmark={() => onBookmark(item.id)} />)}</div></section>}</article>
}

function AboutPage() {
  return <section className="about-page page-width"><div className="about-intro"><Eyebrow>WHY SIGNAL EXISTS</Eyebrow><h1>Not everything<br />that’s new is <span>progress.</span></h1><p className="about-lede">We’re an independent journal for people who want to understand the technology changing their world, without being shouted at about it.</p></div><div className="about-content"><div className="about-number">01 / OUR APPROACH</div><div><h2>Curiosity, with a point of view.</h2><p>Signal is a reader-supported editorial project about artificial intelligence and emerging technology. We make room for nuance, ask better questions, and put people back into the story.</p><p>The starter stories are AI-generated editorial illustrations, not breaking or verified reporting. Live provider headlines are labeled and link to their original publishers.</p><Link className="read-link" to="/latest">Read the journal <ArrowRight size={17} /></Link></div></div><div className="about-values">{[['01', 'Clarity', 'Make the complex feel human.'], ['02', 'Context', 'Look at systems, not just demos.'], ['03', 'Independence', 'Follow the question, not the hype.']].map(([number, title, copy]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}</div><Newsletter /></section>
}

function ContactPage() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) })
      const result = await response.json()
      setStatus(result.message || 'Something went wrong.')
      if (response.ok) formElement.reset()
    } catch { setStatus('The contact service is unavailable right now.') }
    finally { setBusy(false) }
  }
  return <section className="contact-page page-width"><div className="contact-intro"><Eyebrow>OPEN LINES</Eyebrow><h1>Let’s talk<br />about <span>what’s next.</span></h1><p>Good questions, thoughtful pitches, notes from readers. We’re listening.</p><a href="mailto:hello@signal.example" className="text-link">hello@signal.example <ArrowUpRight size={15} /></a></div><form className="contact-form" onSubmit={submit}><label>Your name<input name="name" autoComplete="name" required placeholder="Name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Your note<textarea name="message" rows={5} required placeholder="What’s on your mind?" /></label><button type="submit" className="button-dark" disabled={busy}>{busy ? 'Sending…' : 'Send your note'} <ArrowRight size={16} /></button>{status && <p className="form-status" role="status">{status}</p>}<span className="form-note">Demo form only. Messages are not stored or emailed.</span></form></section>
}

function Newsletter() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) })
      const result = await response.json()
      setStatus(result.message || 'Something went wrong.')
      if (response.ok) formElement.reset()
    } catch { setStatus('The signup service is unavailable right now.') }
    finally { setBusy(false) }
  }
  return <section className="newsletter-band"><div className="newsletter-inner page-width"><div><Eyebrow light>THE SIGNAL LETTER</Eyebrow><h2>A thoughtful note<br />for your inbox.</h2><p>Occasional ideas worth sitting with. No noise.</p></div><form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><div className="newsletter-input"><input id="newsletter-email" name="email" type="email" autoComplete="email" required placeholder="Your email address" /><button type="submit" aria-label="Subscribe to the newsletter" disabled={busy}>{busy ? '…' : <ArrowRight size={19} />}</button></div><span className="newsletter-disclaimer">Demo signup · no email is stored or sent.</span>{status && <span className="newsletter-status" role="status">{status}</span>}</form></div></section>
}

function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-mark">s.</span><h2>{title}</h2><p>{message}</p>{action}</div>
}

function NotFound() {
  return <div className="not-found page-width"><Eyebrow>404 / LOST THE THREAD</Eyebrow><h1>This page<br />isn’t here<span className="heading-period">.</span></h1><p>Maybe it moved. Maybe it never existed. Either way, there are stories to find.</p><Link to="/" className="button-dark">Back to Signal <ArrowRight size={16} /></Link></div>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-main page-width"><div className="footer-brand"><Link className="wordmark footer-wordmark" to="/"><span className="wordmark-mark">s.</span><span>signal<span className="wordmark-period">/</span></span></Link><p>Intelligence, in context.<br />An independent journal for what comes next.</p></div><div className="footer-links"><div><span>EXPLORE</span><Link to="/latest">Latest stories</Link><Link to="/trending">Editor's picks</Link><Link to="/categories">Topics</Link><Link to="/saved">Saved stories</Link></div><div><span>THE JOURNAL</span><Link to="/about">About Signal</Link><Link to="/contact">Contact</Link><a href="mailto:hello@signal.example">Email us <ArrowUpRight size={13} /></a></div></div></div><div className="footer-bottom page-width"><span>© 2026 SIGNAL JOURNAL</span><span>INDEPENDENT BY DESIGN</span><a href="#main-content">BACK TO TOP <ArrowUpRight size={12} /></a></div></footer>
}

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

export default App