import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TVSeries } from './pages/TVSeries';
import { Discover } from './pages/Discover';
import { Search } from './pages/Search';
import { Watchlist } from './pages/Watchlist';
import { Profile } from './pages/Profile';
import { MovieDetails } from './pages/MovieDetails';
import { VideoPlayer } from './pages/VideoPlayer';
import { LoginRegister } from './pages/LoginRegister';
import { AdminPanel } from './pages/AdminPanel';
import { BrandGuidelines } from './pages/BrandGuidelines';
import { RequestMedia } from './pages/RequestMedia';
import { SplashScreen } from './components/SplashScreen';
import AiAssistant from './components/AiAssistant';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          
          <MainLayout>
            <Routes>
              {/* Primary Landing Page */}
              <Route path="/" element={<Home />} />


              {/* Movies Directories */}
              <Route path="/movies" element={<Movies />} />

              {/* TV Series Directories */}
              <Route path="/tv-series" element={<TVSeries />} />

              {/* Modern Interactive Discover Arena */}
              <Route path="/discover" element={<Discover />} />

              {/* Global Search index */}
              <Route path="/search" element={<Search />} />

              {/* Watchlist management */}
              <Route path="/watchlist" element={<Watchlist />} />

              {/* Account Profile details */}
              <Route path="/profile" element={<Profile />} />

              {/* Details page */}
              <Route path="/details/:type/:id" element={<MovieDetails />} />

              {/* Cinematic immersive Video Player */}
              <Route path="/watch/:type/:id" element={<VideoPlayer />} />

              {/* Access Control Authorization */}
              <Route path="/login" element={<LoginRegister />} />

              {/* Platform Settings Administrative panel */}
              <Route path="/admin" element={<AdminPanel />} />

              {/* Premium Arabic Brand Guidelines */}
              <Route path="/brand" element={<BrandGuidelines />} />

              {/* User Movies & Tv requests submission */}
              <Route path="/request" element={<RequestMedia />} />

              {/* Catchall return redirect route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Ambient Gemini-powered cinema Chatbot companion */}
            <AiAssistant />
          </MainLayout>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
