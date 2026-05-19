import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { fetchSpecialtyRankings, fetchPostsBySpecialty } from '@/services/api'
import type { SpecialtyRanking, Post } from '@/types'

const CITIES = ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu', 'Wuhan', 'Hangzhou', "Xi'an", 'Changsha']

export default function SpecialtyRankingPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<SpecialtyRanking | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cityFilter = searchParams.get('city') || ''

  useEffect(() => {
    if (!id) return
    setLoading(true)
    const numId = Number(id)
    Promise.all([
      fetchSpecialtyRankings(numId, cityFilter || undefined),
      fetchPostsBySpecialty(numId, 0, 5),
    ])
      .then(([rankData, postsPage]) => {
        setData(rankData)
        setRelatedPosts(postsPage.content)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, cityFilter])

  function handleCityChange(city: string) {
    if (city) {
      setSearchParams({ city })
    } else {
      setSearchParams({})
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading rankings...</div>
  }

  if (error || !data) {
    return <div className="text-center py-12 text-red-600">Failed to load rankings</div>
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; Back to Specialties
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {data.specialty.icon} {data.specialty.name} Rankings
        </h1>
        <p className="text-gray-500 mt-1">
          Top hospitals for {data.specialty.name} ({data.specialty.nameCn}) in China - {data.year}
        </p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mr-2">Filter by city:</label>
        <select
          value={cityFilter}
          onChange={(e) => handleCityChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {data.rankings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hospitals found for this filter.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hospital</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Int'l Dept</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rankings.map((entry) => (
                <tr key={entry.rankPosition} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      entry.rankPosition <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.rankPosition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/hospitals/${entry.hospital.id}`}
                      className="text-blue-700 hover:text-blue-900 font-medium no-underline"
                    >
                      {entry.hospital.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{entry.hospital.nameCn}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{entry.hospital.city}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {entry.hospital.hasInternational ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">患者经验</h3>
          <div className="space-y-3">
            {relatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/community/posts/${post.id}`}
                className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 no-underline"
              >
                <h4 className="text-sm font-medium text-gray-800">{post.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{post.authorNickname}</span>
                  <span>👍 {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
