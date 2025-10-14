import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Languages, Download, ArrowRight, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, DEFAULT_LANGUAGES, ERROR_MESSAGES, API_BASE_URL } from '../utils/constants';

export default function DocumentTranslation() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [targetLang, setTargetLang] = useState('');
  const [languages, setLanguages] = useState([]);
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch supported languages on mount
  React.useEffect(() => {
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

  // Handle file upload
  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setOriginalText('');
    setDetectedLang('');
    setConfidence(null);
    setTranslatedText('');
    setError('');
  };

  // Upload and extract text
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('domain', 'general');
      formData.append('description', 'Document for translation');
      
      const uploadRes = await axios.post(API_ENDPOINTS.contentUpload, formData);
      if (uploadRes.data && uploadRes.data.id) {
        const fileId = uploadRes.data.id;
        // Get file details to extract text content
        const fileDetails = await axios.get(`${API_BASE_URL}/content/files/${fileId}`);
        if (fileDetails.data) {
          setOriginalText(fileDetails.data.text || fileDetails.data.content || '');
          if (!fileDetails.data.text && !fileDetails.data.content) {
            setError('Could not extract text from uploaded file');
          }
        } else {
          setError('Could not retrieve file details');
        }
      } else {
        setError('Upload failed - no file ID returned');
      }
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      setError(`Upload failed: ${err.response?.data?.detail || err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };

  // Detect language
  const handleDetectLanguage = async () => {
    if (!originalText) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(API_ENDPOINTS.detectLanguage, { text: originalText });
      if (res.data) {
        setDetectedLang(res.data.detected_language || '');
        setConfidence(res.data.confidence || 0);
      } else {
        setError('Language detection failed - no response data');
      }
    } catch (err) {
      console.error('Language detection error:', err);
      console.error('Error response:', err.response?.data);
      setError(`Language detection failed: ${err.response?.data?.detail || err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };

  // Translate
  const handleTranslate = async () => {
    if (!originalText || !targetLang) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(API_ENDPOINTS.translate, {
        text: originalText,
        source_language: detectedLang || 'en',
        target_languages: [targetLang],
        domain: 'general',
      });
      if (res.data && res.data.results && res.data.results.length > 0) {
        setTranslatedText(res.data.results[0].translated_text);
        setConfidence(res.data.results[0].confidence_score);
      } else {
        setError('Invalid translation response');
      }
    } catch (err) {
      console.error('Translation error:', err);
      console.error('Error response:', err.response?.data);
      setError(`Translation failed: ${err.response?.data?.detail || err.response?.data?.error || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
            <h1 className="text-xl font-bold text-gray-900">Document Translation</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Document Translation</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your documents and get instant translations across 22 Indian languages with AI precision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <Upload className="w-6 h-6 text-skillBlue mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
              </div>
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-skillBlue transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input 
                    type="file" 
                    accept=".txt,.pdf,.docx" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <div className="text-lg font-medium text-gray-900 mb-2">
                      {file ? file.name : "Choose your document"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Supports PDF, DOCX, TXT files
                    </div>
                  </label>
                </div>

                <button 
                  className="w-full bg-gradient-to-r from-skillBlue to-blue-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  onClick={handleUpload} 
                  disabled={loading || !file}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <ArrowRight className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Processing...' : 'Upload & Extract Text'}
                </button>

                {error && (
                  <div className="flex items-center p-4 bg-red-50 rounded-2xl border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content & Translation Section */}
          <div className="lg:col-span-2">
            {originalText ? (
              <div className="space-y-8">
                {/* Original Text */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 text-skillBlue mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Original Content</h3>
                    </div>
                    
                    {detectedLang && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Detected: <span className="font-bold text-skillBlue">{detectedLang}</span>
                          {confidence && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {Math.round(confidence*100)}% confidence
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <textarea 
                    className="w-full border-2 border-gray-200 rounded-2xl p-6 text-gray-800 focus:border-skillBlue focus:outline-none resize-none bg-white/50" 
                    rows={8} 
                    value={originalText} 
                    readOnly 
                    placeholder="Extracted text will appear here..."
                  />
                  
                  <div className="flex gap-4 mt-6">
                    <button 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                      onClick={handleDetectLanguage} 
                      disabled={loading || !originalText}
                    >
                      <Languages className="w-5 h-5 mr-2" />
                      Auto Detect Language
                    </button>
                  </div>
                </div>

                {/* Translation Controls */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-6">
                    <Languages className="w-6 h-6 text-skillBlue mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Translation Settings</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Target Language</label>
                      <select 
                        className="w-full border-2 border-gray-200 rounded-2xl p-4 text-gray-800 focus:border-skillBlue focus:outline-none bg-white/50"
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
                      onClick={handleTranslate} 
                      disabled={loading || !targetLang}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <ArrowRight className="w-5 h-5 mr-2" />
                      )}
                      {loading ? 'Translating...' : 'Translate Document'}
                    </button>
                  </div>
                </div>

                {/* Translated Text */}
                {translatedText && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Translated Content</h3>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {confidence && (
                          <span className="text-sm bg-green-100 text-green-700 px-3 py-2 rounded-full font-medium">
                            {Math.round(confidence*100)}% accuracy
                          </span>
                        )}
                        <button className="flex items-center space-x-2 bg-skillBlue text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    
                    <textarea 
                      className="w-full border-2 border-gray-200 rounded-2xl p-6 text-gray-800 focus:border-skillBlue focus:outline-none resize-none bg-white/50" 
                      rows={8} 
                      value={translatedText} 
                      readOnly 
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 border-2 border-dashed border-gray-300 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload a document to get started</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Choose a PDF, DOCX, or TXT file to extract text and begin the translation process
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}