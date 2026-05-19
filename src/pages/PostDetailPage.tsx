import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPostDetail, fetchComments, createComment, toggleLikePost, toggleFavoritePost, toggleLikeComment } from '@/services/api'
import type { PostDetail, Comment as CommentType } from '@/types'

const MOCK_USER_ID = 1 // Default mock user for interactions

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<CommentType[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    const postId = Number(id)
    Promise.all([fetchPostDetail(postId), fetchComments(postId)])
      .then(([postData, commentsData]) => {
        setPost(postData)
        setComments(commentsData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleLikePost() {
    if (!post) return
    const result = await toggleLikePost(post.id, MOCK_USER_ID)
    setPost({ ...post, likeCount: result.likeCount ?? post.likeCount })
  }

  async function handleFavoritePost() {
    if (!post) return
    const result = await toggleFavoritePost(post.id, MOCK_USER_ID)
    setPost({ ...post, favoriteCount: result.favoriteCount ?? post.favoriteCount })
  }

  async function handleLikeComment(commentId: number) {
    await toggleLikeComment(commentId, MOCK_USER_ID)
    // Refresh comments
    if (id) {
      const updated = await fetchComments(Number(id))
      setComments(updated)
    }
  }

  async function handleSubmitComment() {
    if (!id || !commentText.trim()) return
    setSubmitting(true)
    try {
      await createComment(Number(id), {
        content: commentText.trim(),
        userId: MOCK_USER_ID,
        parentId: replyTo?.id ?? null,
      })
      setCommentText('')
      setReplyTo(null)
      // Refresh comments and post
      const [updatedPost, updatedComments] = await Promise.all([
        fetchPostDetail(Number(id)),
        fetchComments(Number(id)),
      ])
      setPost(updatedPost)
      setComments(updatedComments)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) return <div className="text-center py-12 text-gray-500">加载中...</div>
  if (!post) return <div className="text-center py-12 text-red-600">帖子不存在</div>

  return (
    <div>
      <Link to="/community" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; 返回交流板块
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
          <img src={post.authorAvatarUrl} alt={post.authorNickname} className="w-8 h-8 rounded-full" />
          <span className="font-medium text-gray-700">{post.authorNickname}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {(post.hospitals.length > 0 || post.specialties.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hospitals.map((h) => (
              <Link key={`h-${h.id}`} to={`/hospitals/${h.id}`}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium no-underline hover:bg-blue-100">
                🏥 {h.name}
              </Link>
            ))}
            {post.specialties.map((s) => (
              <span key={`s-${s.id}`} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                🏷️ {s.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

        <div className="flex gap-4 border-t border-gray-100 pt-4">
          <button onClick={handleLikePost} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
            👍 {post.likeCount}
          </button>
          <button onClick={handleFavoritePost} className="flex items-center gap-1 text-sm text-gray-500 hover:text-yellow-600">
            ⭐ {post.favoriteCount}
          </button>
          <span className="text-sm text-gray-500">💬 {post.commentCount}</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">评论 ({post.commentCount})</h2>

        {/* Comment Input */}
        <div className="mb-6">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
              <span>回复 {replyTo.nickname}</span>
              <button onClick={() => setReplyTo(null)} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? `回复 ${replyTo.nickname}...` : '写下你的评论...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !commentText.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <img src={comment.authorAvatarUrl} alt={comment.authorNickname} className="w-8 h-8 rounded-full mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{comment.authorNickname}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <button onClick={() => handleLikeComment(comment.id)} className="hover:text-blue-600">👍 {comment.likeCount}</button>
                    <button onClick={() => setReplyTo({ id: comment.id, nickname: comment.authorNickname })} className="hover:text-blue-600">回复</button>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 ml-4 space-y-3 border-l-2 border-gray-100 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <img src={reply.authorAvatarUrl} alt={reply.authorNickname} className="w-6 h-6 rounded-full mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-gray-700">{reply.authorNickname}</span>
                              <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600">{reply.content}</p>
                            <button onClick={() => handleLikeComment(reply.id)} className="text-xs text-gray-400 hover:text-blue-600 mt-1">👍 {reply.likeCount}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">暂无评论，来发表第一条评论吧</div>
          )}
        </div>
      </div>
    </div>
  )
}
