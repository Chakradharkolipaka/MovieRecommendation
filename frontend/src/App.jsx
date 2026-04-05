import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Spinner from './components/common/Spinner';

const Home = lazy(() => import('./pages/Home'));
const Recommend = lazy(() => import('./pages/Recommend'));
const Explore = lazy(() => import('./pages/Explore'));
const Analytics = lazy(() => import('./pages/Analytics'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="container-fluid px-3 px-md-4 pb-5">
          <Suspense fallback={<Spinner label="Loading cinematic experience..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recommend" element={<Recommend />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
