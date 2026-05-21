import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchHospitalDetail, fetchPostsByHospital } from '@/services/api'
import type { HospitalDetail, Post } from '@/types'
import { ArrowLeft, MapPin, Phone, ExternalLink, Globe, Award, ThumbsUp, MessageCircle, Send } from 'lucide-react'
import InquiryFormModal from '../components/InquiryFormModal'

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [hospital, setHospital] = useState<HospitalDetail | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    fetchHospitalDetail(numId)
      .then((data) => {
        setHospital(data)
        return fetchPostsByHospital(numId, 0, 5)
      })
      .then((page) => setRelatedPosts(page.content))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  // Auto-open inquiry modal from URL param
  useEffect(() => {
    if (searchParams.get('inquiry') === 'open' && hospital) {
      setInquiryOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [hospital, searchParams, setSearchParams])

  if (loading) {
    return <div className="text-center py-20 text-text-muted">Loading hospital details...</div>
  }

  if (error || !hospital) {
    return <div className="text-center py-20 text-danger">Hospital not found</div>
  }

  return (
    <div>
      <Helmet>
        <title>{hospital.name} | ChinaMedGuide</title>
        <meta name="description" content={`${hospital.name} in ${hospital.city} — international department, specialties, and patient inquiries.`} />
        <meta property="og:title" content={`${hospital.name} | ChinaMedGuide`} />
        <meta property="og:description" content={`Find details about ${hospital.name} in ${hospital.city}.`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Hospital",
          "name": hospital.name,
          "address": { "@type": "PostalAddress", "streetAddress": hospital.address, "addressLocality": hospital.city, "addressRegion": hospital.province },
          ...(hospital.phone ? { "telephone": hospital.phone } : {})
        })}</script>
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Specialties
      </Link>

      <div className="bg-surface rounded-2xl shadow-card p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">{hospital.name}</h1>
            <p className="text-text-muted">{hospital.nameCn}</p>
          </div>
          {hospital.hasInternational && (
            <span className="mt-3 md:mt-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary-light text-primary">
              <Globe className="w-4 h-4" />
              International Department
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </h3>
            <p className="text-text-primary font-medium">{hospital.city}, {hospital.province}</p>
            <p className="text-text-secondary text-sm">{hospital.address}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact
            </h3>
            {hospital.phone && <p className="text-text-primary font-medium">{hospital.phone}</p>}
            {hospital.website && (
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm font-medium no-underline transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </a>
            )}
            <button
              onClick={() => setInquiryOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Inquiry
            </button>
          </div>
        </div>

        {/* About */}
        {hospital.description && (
          <div className="mb-10">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">About</h3>
            <p className="text-text-secondary leading-relaxed">{hospital.description}</p>
          </div>
        )}

        {/* Top Specialties */}
        {hospital.topSpecialties.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Top Ranked Specialties
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hospital.topSpecialties.map((spec) => (
                <div key={spec.specialtyName} className="flex items-center gap-3 p-4 bg-background rounded-xl">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-light text-accent text-sm font-bold">
                    #{spec.rankPosition}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{spec.specialtyName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border-light">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Patient Experiences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/community/posts/${post.id}`}
                  className="block p-5 bg-background rounded-xl hover:bg-primary-light/30 transition-colors no-underline"
                >
                  <h4 className="text-sm font-medium text-text-primary mb-2">{post.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.commentCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {hospital && (
        <InquiryFormModal
          hospitalId={hospital.id}
          hospitalName={hospital.name}
          isOpen={inquiryOpen}
          onClose={() => setInquiryOpen(false)}
        />
      )}
    </div>
  )
}
