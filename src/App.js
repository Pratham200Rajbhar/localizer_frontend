import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import DocumentTranslation from './pages/DocumentTranslation';
import AudioLocalization from './pages/AudioLocalization';
import VideoLocalization from './pages/VideoLocalization';
import Integration from './pages/Integration';
import About from './pages/About';

function App() {
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
