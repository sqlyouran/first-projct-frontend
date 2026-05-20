import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/api'

export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  async function handleSave() {
    if (!nickname.trim()) {
      setError('Nickname cannot be empty')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateProfile(nickname.trim(), avatarUrl.trim() || undefined)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
      // Force page reload to update user in context
      window.location.reload()
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (!user) return
    setNickname(user.nickname)
    setAvatarUrl(user.avatarUrl ?? '')
    setEditing(false)
    setError(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Profile</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.nickname} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.nickname?.[0]?.toUpperCase() ?? <User className="w-8 h-8" />}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{user.nickname}</h2>
            <p className="text-text-muted text-sm">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200">
              {user.role}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <span className="text-sm font-medium text-text-muted">Member since</span>
            <span className="text-sm text-text-primary">{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <span className="text-sm font-medium text-text-muted">Email</span>
            <span className="text-sm text-text-primary">{user.email}</span>
          </div>
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Avatar URL (optional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-background border border-border text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
            <Link
              to="/change-password"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-background border border-border text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors no-underline text-text-primary"
            >
              Change Password
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
