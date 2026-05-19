import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts } from '@/services/api'
import type { Post, Page } from '@/types'
import { ThumbsUp, MessageCircle, PenSquare, Flame, Clock } from 'lucide-react'

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetchPosts(sort, page, 10)
      .then((data: Page<Post>) => {
        setPosts(data.content)
        setTotalPages(data.totalPages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [sort, page])

  function handleSortChange(newSort: 'latest' | 'hot') {
    setSort(newSort)
    setPage(0)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Community</h1>
        <Link
          to="/community/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover text-sm font-medium no-underline transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => handleSortChange('latest')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            sort === 'latest'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:bg-primary-light hover:text-primary shadow-card'
          }`}
        >
          <Clock className="w-4 h-4" />
          Latest
        </button>
        <button
          onClick={() => handleSortChange('hot')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            sort === 'hot'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:bg-primary-light hover:text-primary shadow-card'
          }`}
        >
          <Flame className="w-4 h-4" />
          Hot
        </button>
      </div>

      {/* Post list */}
      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-text-muted bg-surface rounded-2xl shadow-card">
          No posts yet. Be the first to share!
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
                    className="w-6 h-6 rounded-full"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-surface border border-border text-text-secondary hover:bg-primary-light hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-surface border border-border text-text-secondary hover:bg-primary-light hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
