import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchSpecialties, fetchPosts } from '@/services/api'
import type { Specialty, Post } from '@/types'
import { Search, ArrowRight } from 'lucide-react'
import StoryCard from '../components/StoryCard'

export default function HomePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [featuredStories, setFeaturedStories] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heroQuery, setHeroQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      fetchSpecialties(),
      fetchPosts('hot', 0, 3, 'STORY'),
    ])
      .then(([specs, storiesPage]) => {
        setSpecialties(specs)
        setFeaturedStories(storiesPage.content)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault()
    if (heroQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroQuery.trim())}`)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-text-muted">Loading specialties...</div>
  }

  if (error) {
    return <div className="text-center py-20 text-danger">Failed to load: {error}</div>
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-10 mb-12 px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gradient-to-br from-primary-light via-background to-accent-light">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4">
            Find Top Hospitals in China
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Browse hospital rankings by medical specialty, based on Fudan Hospital Rankings 2023. Trusted by international residents.
          </p>
          <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Search by hospital name, city, or specialty..."
                className="w-full pl-12 pr-32 py-4 bg-surface border border-border rounded-2xl text-base text-text-primary placeholder:text-text-muted shadow-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Patient Stories</h2>
            <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover no-underline transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Specialties Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Medical Specialties</h2>
          <span className="text-sm text-text-muted">{specialties.length} specialties</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {specialties.map((specialty) => (
            <Link
              key={specialty.id}
              to={`/specialties/${specialty.id}`}
              className="group block p-6 bg-surface rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 no-underline"
            >
              <div className="text-3xl mb-3">{specialty.icon}</div>
              <h3 className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors">
                {specialty.name}
              </h3>
              <p className="text-xs text-text-muted mt-1">{specialty.nameCn}</p>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary mt-3 transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
