import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, Upload, Play, Download, Languages, Home, Volume2, AudioWaveform } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, DEFAULT_LANGUAGES } from '../utils/constants';

export default function AudioLocalization() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('');
  const [languages, setLanguages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(API_ENDPOINTS.supportedLanguages)
      .then(res => {
        if (res.data && res.data.supported_languages) {
          setLanguages(Object.entries(res.data.supported_languages));
        }
      })
      .catch(err => {
        console.error('Error fetching languages:', err);
        // Fallback to default languages when API is not available
        setLanguages(DEFAULT_LANGUAGES);
        setError('Using default languages - API unavailable');
      });
  }, []);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleTranslateAudio = async () => {
    if (!file || !targetLang) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_language', targetLang);
      formData.append('domain', 'general');
      const res = await axios.post(API_ENDPOINTS.speechTranslate, formData);
      if (res.data) {
        setResult(res.data);
      } else {
        setError('Audio translation failed - no response data');
      }
    } catch (err) {
      setError('Audio translation failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-skillBlue transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Audio Localization</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Audio Localization</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform speech across languages with our AI-powered audio translation pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <Upload className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Upload Audio</h3>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-500 transition-colors mb-6">
                <AudioWaveform className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input 
                  type="file" 
                  accept=".mp3,.wav" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="audioUpload"
                />
                <label htmlFor="audioUpload" className="cursor-pointer">
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : "Choose your audio file"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Supports MP3, WAV formats
                  </div>
                </label>
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50 rounded-2xl border border-red-200 mb-6">
                  <span className="text-red-700">{error}</span>
                </div>
              )}
            </div>

            {/* Language Settings */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <Languages className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Translation Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Target Language</label>
                  <select 
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 text-gray-800 focus:border-purple-500 focus:outline-none bg-white/50"
                    value={targetLang} 
                    onChange={e => setTargetLang(e.target.value)}
                  >
                    <option value="">Select target language...</option>
                    {languages.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  onClick={handleTranslateAudio} 
                  disabled={loading || !file || !targetLang}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Volume2 className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Processing Audio...' : 'Translate Audio'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {result ? (
              <div className="space-y-6">
                {/* Transcription Results */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <Mic className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Speech Recognition</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <div className="text-sm text-blue-600 font-medium mb-2">Original Transcription</div>
                      <div className="text-gray-800 font-medium">{result.source.transcribed_text}</div>
                      <div className="text-xs text-blue-600 mt-2">
                        Detected: {result.source.detected_language} • Duration: {result.source.duration_seconds}s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Translation Results */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Languages className="w-6 h-6 text-green-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Translation</h3>
                    </div>
                    {result.translation.confidence_score && (
                      <span className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
                        {Math.round(result.translation.confidence_score*100)}% accuracy
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-green-50 rounded-2xl p-6 mb-6">
                    <div className="text-sm text-green-600 font-medium mb-2">Translated Text</div>
                    <div className="text-gray-800 font-medium">{result.translation.translated_text}</div>
                  </div>
                </div>

                {/* Audio Output */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Volume2 className="w-6 h-6 text-purple-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Generated Audio</h3>
                    </div>
                    <a 
                      href={`${process.env.REACT_APP_API_URL}${result.output_path}`} 
                      download 
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                  
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <audio 
                      controls 
                      src={`${process.env.REACT_APP_API_URL}${result.output_path}`} 
                      className="w-full"
                    />
                    <div className="flex items-center justify-between mt-4 text-sm text-purple-600">
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-2" />
                        <span>Click to play translated audio</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 border-2 border-dashed border-gray-300 text-center h-full flex items-center justify-center">
                <div>
                  <AudioWaveform className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload audio to get started</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Upload an audio file and select a target language to begin the translation process
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}