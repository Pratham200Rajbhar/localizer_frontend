import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import { trackVisitor } from './utils/telegramService';

import Home from './pages/Home';
import DocumentTranslation from './pages/DocumentTranslation';
import AudioLocalization from './pages/AudioLocalization';
import VideoLocalization from './pages/VideoLocalization';
import Integration from './pages/Integration';
import About from './pages/About';

function App() {
  // Track visitor when app loads
  useEffect(() => {
    // Small delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      trackVisitor();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/document" element={<DocumentTranslation />} />
          <Route path="/audio" element={<AudioLocalization />} />
          <Route path="/video" element={<VideoLocalization />} />
          <Route path="/integration" element={<Integration />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
