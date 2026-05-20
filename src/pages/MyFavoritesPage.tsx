import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, MessageCircle, Star } from 'lucide-react'
import { fetchMyFavorites } from '../services/api'
import type { Post } from '../types'

export default function MyFavoritesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyFavorites()
      .then(setPosts)
      .catch(() => setError('Failed to load favorites'))
      .finally(() => setLoading(false))
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">My Favorites</h1>
        <Star className="w-6 h-6 text-teal-600" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl shadow-card">
          <Star className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-base mb-2">No favorites yet.</p>
          <p className="text-text-secondary text-sm mb-6">Explore posts to save!</p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors no-underline"
          >
            Browse Community
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/posts/${post.id}`}
              className="block bg-surface rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 p-6 transition-all duration-200 no-underline"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-2">{post.title}</h2>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">{post.contentPreview}</p>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorAvatarUrl}
                    alt={post.authorNickname}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="font-medium">{post.authorNickname}</span>
                </div>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.commentCount}</span>
                <span className="ml-auto">{formatDate(post.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
