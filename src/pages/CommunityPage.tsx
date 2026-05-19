import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts } from '@/services/api'
import type { Post, Page } from '@/types'

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
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">交流板块</h1>
        <Link
          to="/community/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium no-underline"
        >
          发帖
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleSortChange('latest')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            sort === 'latest'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          最新
        </button>
        <button
          onClick={() => handleSortChange('hot')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            sort === 'hot'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          最热
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无帖子</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/posts/${post.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow no-underline"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.contentPreview}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <img
                    src={post.authorAvatarUrl}
                    alt={post.authorNickname}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{post.authorNickname}</span>
                </div>
                <span>👍 {post.likeCount}</span>
                <span>💬 {post.commentCount}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
