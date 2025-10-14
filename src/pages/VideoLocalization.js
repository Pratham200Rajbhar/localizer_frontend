import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Upload, Download, Languages, Home, Play, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, DEFAULT_LANGUAGES } from '../utils/constants';

export default function VideoLocalization() {
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

  const handleLocalizeVideo = async () => {
    if (!file || !targetLang) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_language', targetLang);
      formData.append('domain', 'general');
      formData.append('include_subtitles', true);
      formData.append('include_dubbed_audio', false);
      const res = await axios.post(API_ENDPOINTS.videoLocalize, formData);
      if (res.data) {
        setResult(res.data);
      } else {
        setError('Video localization failed - no response data');
      }
    } catch (err) {
      setError('Video localization failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
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
            <h1 className="text-xl font-bold text-gray-900">Video Localization</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Video Localization</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate accurate subtitles and captions for your video content in multiple Indian languages
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <Upload className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Upload Video</h3>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-500 transition-colors mb-6">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input 
                  type="file" 
                  accept=".mp4" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="videoUpload"
                />
                <label htmlFor="videoUpload" className="cursor-pointer">
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : "Choose your video file"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Supports MP4 format (max 500MB)
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Target Language</label>
                  <select 
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 text-gray-800 focus:border-green-500 focus:outline-none bg-white/50"
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
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  onClick={handleLocalizeVideo} 
                  disabled={loading || !file || !targetLang}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <FileText className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Generating Subtitles...' : 'Generate Subtitles'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-200">
                  <span className="text-red-700">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div>
            {result ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Subtitle Results</h3>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
                    {result.status}
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-2xl p-4 text-center">
                      <Languages className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-green-600 font-medium">Target Language</div>
                      <div className="text-lg font-bold text-gray-900">{result.target_language}</div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4 text-center">
                      <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm text-blue-600 font-medium">Segments</div>
                      <div className="text-lg font-bold text-gray-900">{result.segments_count}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 font-medium">Processing Time</div>
                    <div className="text-lg font-bold text-gray-900">{result.processing_time_seconds}s</div>
                  </div>

                  {result.outputs && result.outputs[0] && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold">Subtitles Ready</div>
                          <div className="text-sm opacity-90">{result.outputs[0].filename}</div>
                        </div>
                        <FileText className="w-8 h-8" />
                      </div>
                      <a 
                        href={`${process.env.REACT_APP_API_URL}${result.outputs[0].download_path}`} 
                        download 
                        className="flex items-center justify-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Subtitles</span>
                      </a>
                    </div>
                  )}

                  <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                    <div className="flex items-center">
                      <Play className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700">
                        Use the downloaded subtitle file with your video player for synchronized captions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 border-2 border-dashed border-gray-300 text-center h-full flex items-center justify-center">
                <div>
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload a video to get started</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Choose an MP4 video file and select a target language to generate subtitles
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