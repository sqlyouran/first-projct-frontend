import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { createInquiry } from '@/services/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface InquiryFormModalProps {
  hospitalId: number
  hospitalName: string
  isOpen: boolean
  onClose: () => void
}

export default function InquiryFormModal({ hospitalId, hospitalName, isOpen, onClose }: InquiryFormModalProps) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.nickname ?? '',
    email: user?.email ?? '',
    conditionSummary: '',
    preferredDate: '',
  })

  if (!isOpen) return null

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.conditionSummary.trim()) {
      setError('Name, email, and condition summary are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        conditionSummary: form.conditionSummary.trim(),
        preferredDate: form.preferredDate || undefined,
        hospitalId,
      })
      setSuccess(true)
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Inquiry Sent!</h2>
            <p className="text-sm text-text-secondary mb-6">
              We typically respond within 2 business days. You can track your inquiry status in "My Inquiries".
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-1">Send Inquiry</h2>
            <p className="text-sm text-text-muted mb-6">to {hospitalName}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Your Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Condition Summary *</label>
                <textarea
                  name="conditionSummary"
                  value={form.conditionSummary}
                  onChange={handleChange}
                  placeholder="Briefly describe your medical condition and what you're looking for..."
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Preferred Date (optional)</label>
                <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
