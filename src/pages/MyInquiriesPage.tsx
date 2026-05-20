import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyInquiries } from '@/services/api'
import type { Inquiry } from '@/types'
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  PENDING: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
  CONTACTED: { label: 'Contacted', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Closed', icon: XCircle, className: 'bg-gray-100 text-gray-600' },
}

export default function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyInquiries()
      .then((page) => setInquiries(page.content))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) return <div className="text-center py-20 text-text-muted">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-text-primary mb-8">My Inquiries</h1>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl shadow-card">
          <p className="text-text-muted mb-4">You haven't submitted any inquiries yet.</p>
          <Link to="/" className="text-primary hover:text-primary-hover font-medium no-underline">
            Browse hospitals to get started
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const status = STATUS_CONFIG[inquiry.status] ?? STATUS_CONFIG.PENDING
            const StatusIcon = status.icon
            return (
              <div key={inquiry.id} className="bg-surface rounded-2xl shadow-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <Link
                    to={`/hospitals/${inquiry.hospitalId}`}
                    className="text-lg font-semibold text-primary hover:text-primary-hover no-underline"
                  >
                    {inquiry.hospitalName}
                  </Link>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{inquiry.conditionSummary}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>Submitted: {formatDate(inquiry.createdAt)}</span>
                  {inquiry.preferredDate && <span>Preferred: {inquiry.preferredDate}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
