import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import DocumentTranslation from './pages/DocumentTranslation';
import AudioLocalization from './pages/AudioLocalization';
import VideoLocalization from './pages/VideoLocalization';
import Integration from './pages/Integration';
import About from './pages/About';
import ApiTesting from './pages/ApiTesting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/document" element={<DocumentTranslation />} />
        <Route path="/audio" element={<AudioLocalization />} />
        <Route path="/video" element={<VideoLocalization />} />
        <Route path="/integration" element={<Integration />} />
        <Route path="/about" element={<About />} />
        <Route path="/api-testing" element={<ApiTesting />} />
      </Routes>
    </Router>
  );
}

export default App;
