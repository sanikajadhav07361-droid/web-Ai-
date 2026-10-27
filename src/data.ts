export type Category = 'AI & Society' | 'Machine Learning' | 'The Interface' | 'Future Systems' | 'Research'

export interface Article {
  id: string
  title: string
  excerpt: string
  category: Category
  author: string
  date: string
  readTime: string
  image: string
  imageAlt: string
  featured?: boolean
  isLive?: boolean
  body: string[]
  sourceUrl?: string
  sourceName?: string
}

const images = {
  neural: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85',
  chip: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=82',
  robot: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=82',
  network: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=82',
  desk: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=82',
  circuit: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=82',
}

const sampleArticle = (article: Article): Article => article

export const articles: Article[] = [
  sampleArticle({
    id: 'models-that-meet-the-world',
    title: 'The next generation of AI won’t just answer. It will act.',
    excerpt: 'A new class of capable, tool-using models is moving from chat windows into the systems we rely on every day.',
    category: 'Future Systems',
    author: 'Mara Voss',
    date: 'Oct 24, 2026',
    readTime: '8 min read',
    image: images.neural,
    imageAlt: 'Abstract luminous neural network visualization',
    featured: true,
    body: [
      'For years, the conversation around artificial intelligence has centered on what a model can say. The more consequential question now is what it can do, and how carefully it does it.',
      'A growing wave of systems can plan across several steps, call software tools, and check their own work. They are less like a search box and more like a new layer between people and the digital services they already use.',
      'That shift changes the design problem. A useful assistant needs clear permissions, a reliable way to show its reasoning, and an easy handoff when the stakes are too high for automation. Capability without those guardrails is just a faster way to make old mistakes.',
      'The most interesting future may not belong to the most autonomous model. It may belong to the one that knows when to pause, ask, and leave the final call to a person.',
    ],
  }),
  sampleArticle({
    id: 'who-owns-the-machine-room',
    title: 'Who owns the machine room?',
    excerpt: 'The infrastructure behind AI is becoming a question of energy, geography, and public choice.',
    category: 'AI & Society',
    author: 'Jonah Reed',
    date: 'Oct 22, 2026',
    readTime: '6 min read',
    image: images.chip,
    imageAlt: 'Close view of a circuit board and electronic components',
    body: [
      'AI is often described as weightless software. Its reality is physical: chips, cooling systems, power contracts, land, and the people who keep all of it running.',
      'As demand grows, communities are being asked to make decisions about facilities that can shape local grids and water use for years. These are not purely technical choices, and they deserve to be treated as public infrastructure.',
      'Transparency about energy use and meaningful local input are a starting point. The broader question is whether the benefits and the costs of computing capacity will be shared fairly.',
    ],
  }),
  sampleArticle({
    id: 'the-small-model-revolution',
    title: 'The small-model revolution is happening at the edge',
    excerpt: 'Why lean, specialized systems are finding a home on the devices already in our pockets.',
    category: 'Machine Learning',
    author: 'Priya Nair',
    date: 'Oct 20, 2026',
    readTime: '5 min read',
    image: images.robot,
    imageAlt: 'A friendly white robot facing the camera',
    body: [
      'The biggest models get the headlines, but smaller systems are quietly becoming more practical. Focused training and efficient hardware make it possible to run useful AI without sending every request to a distant data center.',
      'On-device models can reduce latency, preserve more data locally, and keep working when a connection drops. They also bring hard constraints: limited memory, battery budgets, and the need to be exceptionally clear about what a system can and cannot do.',
      'The design challenge is not simply to shrink a general model. It is to decide which tasks benefit from local intelligence and build an experience that remains honest about the tradeoffs.',
    ],
  }),
  sampleArticle({
    id: 'interfaces-for-uncertainty',
    title: 'Designing interfaces for a machine that can be wrong',
    excerpt: 'The best AI product design makes uncertainty visible without making the experience feel fragile.',
    category: 'The Interface',
    author: 'Elise Chen',
    date: 'Oct 18, 2026',
    readTime: '7 min read',
    image: images.desk,
    imageAlt: 'A clean workstation with a laptop and warm desk lighting',
    body: [
      'A confident sentence can hide a shaky answer. When generative systems are woven into everyday products, visual design becomes part of how people judge whether to trust them.',
      'Good interfaces make the origin of an answer easy to inspect. They separate a suggestion from a confirmed action, show sources when available, and give people a direct way to correct a misunderstanding.',
      'Uncertainty does not need to be a warning banner on every screen. It can be a set of small, consistent cues that help people stay oriented and in control.',
    ],
  }),
  sampleArticle({
    id: 'the-data-we-never-meant-to-share',
    title: 'The data we never meant to share',
    excerpt: 'Training data debates are moving beyond copyright toward the quieter question of consent.',
    category: 'Research',
    author: 'Samira Okafor',
    date: 'Oct 16, 2026',
    readTime: '9 min read',
    image: images.network,
    imageAlt: 'A glowing view of Earth seen through a digital network',
    body: [
      'Publicly accessible does not always mean freely offered. As datasets become foundational to new products, researchers are taking a closer look at the assumptions that turn collected information into training material.',
      'Consent is not a single checkbox. It involves context, expectations, the sensitivity of the material, and whether a person can meaningfully change their mind after data has been absorbed into a system.',
      'There are no universal answers yet. But clearer documentation and better ways for people to express their preferences can make the debate more concrete and less abstract.',
    ],
  }),
  sampleArticle({
    id: 'inside-the-open-lab',
    title: 'Inside the open lab building tools for everyone',
    excerpt: 'A look at the collaborative research culture reshaping how practical AI gets made.',
    category: 'Research',
    author: 'Theo Park',
    date: 'Oct 14, 2026',
    readTime: '4 min read',
    image: images.circuit,
    imageAlt: 'Researchers collaborating around computers in a bright studio',
    body: [
      'Open research is more than publishing model weights. It is a habit of sharing methods, limitations, and the context that allows other teams to reproduce a result.',
      'Small teams are using that openness to build specialized tools that fit the needs of educators, local-language communities, and independent developers.',
      'Access alone does not solve every problem, but a more legible research process gives more people a chance to participate in what comes next.',
    ],
  }),
]

export const categories: Category[] = ['AI & Society', 'Machine Learning', 'The Interface', 'Future Systems', 'Research']

export const categoryDescriptions: Record<Category, string> = {
  'AI & Society': 'People, policy, and the world around the machine.',
  'Machine Learning': 'The methods and models changing what software can do.',
  'The Interface': 'How thoughtful design makes new intelligence usable.',
  'Future Systems': 'A field guide to what comes after the current wave.',
  Research: 'Ideas, evidence, and work worth reading closely.',
}