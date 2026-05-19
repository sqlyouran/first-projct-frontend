import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'

export default function Layout() {
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/community', label: '交流' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg shadow-header border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-primary tracking-tight no-underline">
                ChinaMedGuide
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                      isActive(link.path)
                        ? 'text-primary bg-primary-light'
                        : 'text-text-secondary hover:text-primary hover:bg-primary-light/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="hidden sm:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search hospitals..."
                    className="pl-9 pr-4 py-2 w-56 lg:w-72 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </form>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-background"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-light bg-surface px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium no-underline ${
                  isActive(link.path)
                    ? 'text-primary bg-primary-light'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hospitals..."
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-3">ChinaMedGuide</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Helping international residents find quality healthcare in China. 
                Browse hospital rankings, read patient experiences, and connect with the community.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">Navigate</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-text-secondary hover:text-primary no-underline transition-colors">Hospital Rankings</Link></li>
                <li><Link to="/community" className="text-sm text-text-secondary hover:text-primary no-underline transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">About</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Rankings based on Fudan Hospital Management Institute annual assessments. 
                Community content is user-generated.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border-light text-center">
            <p className="text-xs text-text-muted">
              &copy; 2024 ChinaMedGuide. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
