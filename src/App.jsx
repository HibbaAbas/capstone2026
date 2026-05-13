import { Navigate, Route, Routes } from 'react-router-dom'
import FilterPage from './filter'
import ExplorePage from './explore'
import HomePage from './home'
import VenuePage from './venue'
import FullReviewPage from './fullreview'
import ProfilePage from './profile'
import SignInPage from './signin'
import SignUpPage from './signup'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/explore/filter" element={<FilterPage />} />
      <Route path="/venues/:venueId" element={<VenuePage />} />
      <Route path="/venues/:venueId/review" element={<VenuePage isReviewOpen />} />
      <Route path="/venues/:venueId/reviews/:reviewId" element={<FullReviewPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
