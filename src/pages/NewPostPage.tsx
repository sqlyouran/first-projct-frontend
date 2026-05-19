import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchMockUsers, fetchHospitals, fetchSpecialties, createPost } from '@/services/api'
import type { MockUser, HospitalSummary, Specialty } from '@/types'

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
      setError('标题和内容不能为空')
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
      setError('发帖失败，请重试')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/community" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; 返回交流板块
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">发布新帖</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">发布身份</label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.nickname}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入帖子标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的就医经验..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">关联医院（可选）</label>
            <div className="flex flex-wrap gap-2">
              {hospitals.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHospital(h.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedHospitals.includes(h.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {h.nameCn || h.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">关联专科（可选）</label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSpecialty(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedSpecialties.includes(s.id)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s.nameCn || s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {submitting ? '发布中...' : '发布帖子'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
