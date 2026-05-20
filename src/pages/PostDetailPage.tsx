import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchPostDetail, fetchComments, createComment, toggleLikePost, toggleFavoritePost, toggleLikeComment } from '@/services/api'
import type { PostDetail, Comment as CommentType } from '@/types'
import { ArrowLeft, ThumbsUp, Star, MessageCircle, Send, Hospital } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
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
    if (!isAuthenticated) { navigate('/login'); return }
    const result = await toggleLikePost(post.id)
    setPost({ ...post, likeCount: result.likeCount ?? post.likeCount })
  }

  async function handleFavoritePost() {
    if (!post) return
    if (!isAuthenticated) { navigate('/login'); return }
    const result = await toggleFavoritePost(post.id)
    setPost({ ...post, favoriteCount: result.favoriteCount ?? post.favoriteCount })
  }

  async function handleLikeComment(commentId: number) {
    if (!isAuthenticated) { navigate('/login'); return }
    await toggleLikeComment(commentId)
    if (id) {
      const updated = await fetchComments(Number(id))
      setComments(updated)
    }
  }

  async function handleSubmitComment() {
    if (!id || !commentText.trim()) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setSubmitting(true)
    try {
      await createComment(Number(id), {
        content: commentText.trim(),
        parentId: replyTo?.id ?? null,
      })
      setCommentText('')
      setReplyTo(null)
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
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) return <div className="text-center py-20 text-text-muted">Loading...</div>
  if (!post) return <div className="text-center py-20 text-danger">Post not found</div>

  return (
    <div>
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      {/* Post content card */}
      <div className="bg-surface rounded-2xl shadow-card p-8 mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 mb-5 text-sm text-text-muted">
          <img src={post.authorAvatarUrl} alt={post.authorNickname} className="w-9 h-9 rounded-full" />
          <span className="font-medium text-text-secondary">{post.authorNickname}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {/* Tags */}
        {(post.hospitals.length > 0 || post.specialties.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.hospitals.map((h) => (
              <Link key={`h-${h.id}`} to={`/hospitals/${h.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary rounded-full text-xs font-medium no-underline hover:bg-primary/10 transition-colors">
                <Hospital className="w-3 h-3" /> {h.name}
              </Link>
            ))}
            {post.specialties.map((s) => (
              <span key={`s-${s.id}`} className="px-3 py-1.5 bg-accent-light text-accent rounded-full text-xs font-medium">
                {s.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap mb-8">{post.content}</p>

        {/* Actions */}
        <div className="flex gap-4 border-t border-border-light pt-5">
          <button onClick={handleLikePost} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">
            <ThumbsUp className="w-4 h-4" /> {post.likeCount}
          </button>
          <button onClick={handleFavoritePost} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-accent-light hover:text-accent transition-colors">
            <Star className="w-4 h-4" /> {post.favoriteCount}
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-muted">
            <MessageCircle className="w-4 h-4" /> {post.commentCount}
          </span>
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-surface rounded-2xl shadow-card p-8">
        <h2 className="text-lg font-semibold text-text-primary mb-6">Comments ({post.commentCount})</h2>

        {/* Comment input */}
        <div className="mb-8">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-sm">
              <Link to="/login" className="font-medium underline hover:text-teal-800">Sign in</Link> to leave a comment.
            </div>
          )}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
              <span>Replying to {replyTo.nickname}</span>
              <button onClick={() => setReplyTo(null)} className="text-danger hover:text-danger/80 font-medium">Cancel</button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo.nickname}...` : 'Write a comment...'}
              className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !commentText.trim()}
              className="px-5 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comment list */}
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-border-light pb-5 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <img src={comment.authorAvatarUrl} alt={comment.authorNickname} className="w-9 h-9 rounded-full mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-text-primary">{comment.authorNickname}</span>
                    <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{comment.content}</p>
                  <div className="flex gap-3 text-xs text-text-muted">
                    <button onClick={() => handleLikeComment(comment.id)} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                      <ThumbsUp className="w-3 h-3" /> {comment.likeCount}
                    </button>
                    <button onClick={() => setReplyTo({ id: comment.id, nickname: comment.authorNickname })} className="hover:text-primary transition-colors">
                      Reply
                    </button>
                  </div>

                  {/* Nested replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-4 border-l-2 border-border-light pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <img src={reply.authorAvatarUrl} alt={reply.authorNickname} className="w-7 h-7 rounded-full mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-text-primary">{reply.authorNickname}</span>
                              <span className="text-xs text-text-muted">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-text-secondary">{reply.content}</p>
                            <button onClick={() => handleLikeComment(reply.id)} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary mt-1 transition-colors">
                              <ThumbsUp className="w-3 h-3" /> {reply.likeCount}
                            </button>
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
            <div className="text-center py-10 text-text-muted text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
