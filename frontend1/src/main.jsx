import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SignUp from './pages/SignUpPage.jsx'
import SignIn from './pages/SignInPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SearchingPage from './pages/SearchingPage.jsx'
import TravellerProfile from './pages/TravellerProfile.jsx'
import OwnerProfile from './pages/OwnerProfile.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<SignIn />} />
        <Route path="/search" element={<SearchingPage />} />
        <Route path="/profilet" element={<TravellerProfile/>} /> {/* Traveller Profile */}
        <Route path="/profileo" element={<OwnerProfile/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)