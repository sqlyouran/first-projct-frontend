import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SpecialtyRankingPage from './pages/SpecialtyRankingPage'
import HospitalDetailPage from './pages/HospitalDetailPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/specialties/:id" element={<SpecialtyRankingPage />} />
          <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
