import { Link } from 'react-router-dom'
import type { Post } from '@/types'
import { DollarSign, Clock, TrendingUp, ThumbsUp, MessageCircle } from 'lucide-react'

interface StoryCardProps {
  story: Post
}

const COST_LABELS: Record<string, string> = {
  UNDER_5K: '<$5K',
  '5K_10K': '$5K-10K',
  '10K_25K': '$10K-25K',
  '25K_50K': '$25K-50K',
  OVER_50K: '$50K+',
}

const OUTCOME_COLORS: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-700',
  GOOD: 'bg-blue-100 text-blue-700',
  FAIR: 'bg-yellow-100 text-yellow-700',
  POOR: 'bg-red-100 text-red-700',
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link
      to={`/community/posts/${story.id}`}
      className="block bg-surface rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 p-6 transition-all duration-200 no-underline"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-3 line-clamp-2">{story.title}</h3>

      {/* Metric badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {story.costRange && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <DollarSign className="w-3 h-3" />
            {COST_LABELS[story.costRange] ?? story.costRange}
          </span>
        )}
        {story.outcome && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${OUTCOME_COLORS[story.outcome] ?? 'bg-gray-100 text-gray-700'}`}>
            <TrendingUp className="w-3 h-3" />
            {story.outcome.charAt(0) + story.outcome.slice(1).toLowerCase()}
          </span>
        )}
        {story.timelineDays && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-light text-accent">
            <Clock className="w-3 h-3" />
            {story.timelineDays} days
          </span>
        )}
      </div>

      <p className="text-text-secondary text-sm mb-4 line-clamp-2">{story.contentPreview}</p>

      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {story.likeCount}</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {story.commentCount}</span>
      </div>
    </Link>
  )
}
