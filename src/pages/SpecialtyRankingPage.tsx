import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchSpecialtyRankings, fetchPostsBySpecialty } from '@/services/api'
import type { SpecialtyRanking, Post } from '@/types'
import { ArrowLeft, Globe, ThumbsUp, MessageCircle, Send } from 'lucide-react'

const CITIES = ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu', 'Wuhan', 'Hangzhou', "Xi'an", 'Changsha']

export default function SpecialtyRankingPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<SpecialtyRanking | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cityFilter = searchParams.get('city') || ''

  useEffect(() => {
    if (!id) return
    setLoading(true)
    const numId = Number(id)
    Promise.all([
      fetchSpecialtyRankings(numId, cityFilter || undefined),
      fetchPostsBySpecialty(numId, 0, 5),
    ])
      .then(([rankData, postsPage]) => {
        setData(rankData)
        setRelatedPosts(postsPage.content)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, cityFilter])

  function handleCityChange(city: string) {
    if (city) {
      setSearchParams({ city })
    } else {
      setSearchParams({})
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-text-muted">Loading rankings...</div>
  }

  if (error || !data) {
    return <div className="text-center py-20 text-danger">Failed to load rankings</div>
  }

  return (
    <div>
      <Helmet>
        <title>Top {data.specialty.name} Hospitals in China | ChinaMedGuide</title>
        <meta name="description" content={`Compare the best ${data.specialty.name} hospitals in China. View rankings, international departments, and submit inquiries.`} />
        <meta property="og:title" content={`Top ${data.specialty.name} Hospitals | ChinaMedGuide`} />
        <meta property="og:description" content={`Find top-ranked ${data.specialty.name} hospitals in China.`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalSpecialty",
          "name": data.specialty.name
        })}</script>
      </Helmet>
      {/* Back navigation */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Specialties
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {data.specialty.icon} {data.specialty.name} Rankings
        </h1>
        <p className="text-text-secondary">
          Top hospitals for {data.specialty.name} ({data.specialty.nameCn}) in China — {data.year}
        </p>
      </div>

      {/* City filter */}
      <div className="mb-8">
        <label className="text-sm font-medium text-text-secondary mr-3">Filter by city:</label>
        <select
          value={cityFilter}
          onChange={(e) => handleCityChange(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">All Cities</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Rankings table */}
      {data.rankings.length === 0 ? (
        <div className="text-center py-12 text-text-muted bg-surface rounded-2xl shadow-card">
          No hospitals found for this filter.
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-background/60">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Rank</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Hospital</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">City</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Int'l Dept</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {data.rankings.map((entry) => (
                <tr key={entry.rankPosition} className="hover:bg-primary-light/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      entry.rankPosition <= 3 ? 'bg-accent-light text-accent' : 'bg-background text-text-secondary'
                    }`}>
                      {entry.rankPosition}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/hospitals/${entry.hospital.id}`}
                      className="text-primary hover:text-primary-hover font-medium no-underline transition-colors"
                    >
                      {entry.hospital.name}
                    </Link>
                    <p className="text-xs text-text-muted mt-0.5">{entry.hospital.nameCn}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary hidden md:table-cell">{entry.hospital.city}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {entry.hospital.hasInternational ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                        <Globe className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-background text-text-muted">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/hospitals/${entry.hospital.id}?inquiry=open`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors no-underline"
                    >
                      <Send className="w-3 h-3" />
                      Inquire
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Patient Experiences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/community/posts/${post.id}`}
                className="block p-5 bg-surface rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 no-underline"
              >
                <h4 className="text-sm font-medium text-text-primary mb-2">{post.title}</h4>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{post.authorNickname}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likeCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.commentCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
