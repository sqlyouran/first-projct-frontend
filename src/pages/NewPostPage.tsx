import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchMockUsers, fetchHospitals, fetchSpecialties, createPost } from '@/services/api'
import type { MockUser, HospitalSummary, Specialty } from '@/types'
import { ArrowLeft, Send } from 'lucide-react'

export default function NewPostPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState<number>(0)
  const [selectedHospitals, setSelectedHospitals] = useState<number[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([])
  const [mockUsers, setMockUsers] = useState<MockUser[]>([])
  const [hospitals, setHospitals] = useState<HospitalSummary[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchMockUsers(),
      fetchHospitals(undefined, undefined, undefined, 0, 100),
      fetchSpecialties(),
    ]).then(([users, hospitalPage, specs]) => {
      setMockUsers(users)
      if (users.length > 0) setUserId(users[0].id)
      setHospitals(hospitalPage.content)
      setSpecialties(specs)
    })
  }, [])

  function toggleHospital(id: number) {
    setSelectedHospitals((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    )
  }

  function toggleSpecialty(id: number) {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        userId,
        hospitalIds: selectedHospitals.length > 0 ? selectedHospitals : undefined,
        specialtyIds: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
      })
      navigate(`/community/posts/${result.id}`)
    } catch (err) {
      setError('Failed to create post. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <div className="bg-surface rounded-2xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Create New Post</h1>

        {error && (
          <div className="mb-6 p-4 bg-danger/5 border border-danger/20 text-danger rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Post as</label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.nickname}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a clear title..."
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience, ask a question, or start a discussion..."
              rows={8}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y transition-all"
            />
          </div>

          {/* Hospital tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Related Hospitals (optional)</label>
            <div className="flex flex-wrap gap-2">
              {hospitals.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHospital(h.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedHospitals.includes(h.id)
                      ? 'bg-primary-light border-primary/30 text-primary'
                      : 'bg-background border-border text-text-secondary hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {h.nameCn || h.name}
                </button>
              ))}
            </div>
          </div>

          {/* Specialty tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Related Specialties (optional)</label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSpecialty(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedSpecialties.includes(s.id)
                      ? 'bg-accent-light border-accent/30 text-accent'
                      : 'bg-background border-border text-text-secondary hover:border-accent/30 hover:text-accent'
                  }`}
                >
                  {s.nameCn || s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
