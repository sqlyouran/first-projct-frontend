import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SpecialtyRankingPage from './pages/SpecialtyRankingPage'
import HospitalDetailPage from './pages/HospitalDetailPage'
import SearchPage from './pages/SearchPage'
import CommunityPage from './pages/CommunityPage'
import PostDetailPage from './pages/PostDetailPage'
import NewPostPage from './pages/NewPostPage'
import NewStoryPage from './pages/NewStoryPage'
import ProfilePage from './pages/ProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import MyPostsPage from './pages/MyPostsPage'
import MyFavoritesPage from './pages/MyFavoritesPage'
import MyInquiriesPage from './pages/MyInquiriesPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/specialties/:id" element={<SpecialtyRankingPage />} />
            <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/posts/:id" element={<PostDetailPage />} />
            <Route path="/community/new" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
            <Route path="/community/new-story" element={<ProtectedRoute><NewStoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
            <Route path="/my-posts" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
            <Route path="/my-favorites" element={<ProtectedRoute><MyFavoritesPage /></ProtectedRoute>} />
            <Route path="/my-inquiries" element={<ProtectedRoute><MyInquiriesPage /></ProtectedRoute>} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
