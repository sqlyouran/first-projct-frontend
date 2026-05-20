import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createStory } from '@/services/api'
import { ArrowLeft } from 'lucide-react'

const COST_OPTIONS = [
  { value: '', label: 'Select cost range (optional)' },
  { value: 'UNDER_5K', label: 'Under $5,000' },
  { value: '5K_10K', label: '$5,000 - $10,000' },
  { value: '10K_25K', label: '$10,000 - $25,000' },
  { value: '25K_50K', label: '$25,000 - $50,000' },
  { value: 'OVER_50K', label: 'Over $50,000' },
]

const OUTCOME_OPTIONS = [
  { value: '', label: 'Select outcome (optional)' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

export default function NewStoryPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    conditionName: '',
    treatmentType: '',
    costRange: '',
    timelineDays: '',
    outcome: '',
    nationality: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await createStory({
        title: form.title.trim(),
        content: form.content.trim(),
        conditionName: form.conditionName.trim() || undefined,
        treatmentType: form.treatmentType.trim() || undefined,
        costRange: form.costRange || undefined,
        timelineDays: form.timelineDays ? Number(form.timelineDays) : undefined,
        outcome: form.outcome || undefined,
        nationality: form.nationality.trim() || undefined,
      })
      navigate(`/community/posts/${result.id}`)
    } catch (err) {
      setError('Failed to create story. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
  const labelClass = "block text-sm font-medium text-text-secondary mb-1.5"

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <div className="bg-surface rounded-2xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Share Your Patient Story</h1>
        <p className="text-sm text-text-muted mb-8">Help others by sharing your medical experience in China. All fields marked with * are required.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., My Knee Surgery Experience at Peking University Third Hospital" className={inputClass} />
          </div>

          {/* Structured fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Medical Condition</label>
              <input name="conditionName" value={form.conditionName} onChange={handleChange} placeholder="e.g., ACL Tear, Thyroid Cancer" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Treatment Type</label>
              <input name="treatmentType" value={form.treatmentType} onChange={handleChange} placeholder="e.g., Surgery, Chemotherapy" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cost Range (USD)</label>
              <select name="costRange" value={form.costRange} onChange={handleChange} className={inputClass}>
                {COST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Treatment Outcome</label>
              <select name="outcome" value={form.outcome} onChange={handleChange} className={inputClass}>
                {OUTCOME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Timeline (days)</label>
              <input name="timelineDays" type="number" min="1" value={form.timelineDays} onChange={handleChange} placeholder="e.g., 30" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Your Nationality</label>
              <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g., American, British" className={inputClass} />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className={labelClass}>Your Story *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Tell others about your experience: How did you find the hospital? What was the process like? How was the recovery? Any tips for others?"
              rows={8}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Publishing...' : 'Publish Story'}
          </button>
        </form>
      </div>
    </div>
  )
}
