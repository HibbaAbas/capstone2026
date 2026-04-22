import { Navigate, Route, Routes } from 'react-router-dom'
import FilterPage from './filter'
import ExplorePage from './explore'
import HomePage from './home'
import VenuePage from './venue'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/explore/filter" element={<FilterPage />} />
      <Route path="/venues/:venueId" element={<VenuePage />} />
      <Route path="/venues/:venueId/review" element={<VenuePage isReviewOpen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
