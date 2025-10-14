import React, { useState } from 'react';
import axios from 'axios';
import { Building2, Upload, Download, Code, CheckCircle, Home, Terminal, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';

export default function Integration() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('NCVET');
  const [targetLang, setTargetLang] = useState('hi');
  const [uploadResult, setUploadResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);
  const [downloadResult, setDownloadResult] = useState(null);
  const [jobId, setJobId] = useState('');
  const [filename, setFilename] = useState('demo_book_hindi.pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Upload to platform
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_languages', targetLang);
      formData.append('content_type', 'document'); // Based on file type
      formData.append('domain', 'general');
      formData.append('partner_id', platform);
      formData.append('priority', 'normal');
      
      const res = await axios.post(`${API_BASE_URL}/integration/upload`, formData);
      if (res.data) {
        setUploadResult(res.data);
        setJobId(res.data.job_id || 'NCVET_1234');
      } else {
        setError('Upload failed - no response data');
      }
    } catch (err) {
      console.error('Integration upload error:', err);
      setError(`Upload failed: ${err.response?.data?.detail || err.message}`);
    }
    setLoading(false);
  };

  // Check status
  const handleCheckStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/integration/status`);
      setStatusResult(res.data);
    } catch (err) {
      setError('Status check failed');
    }
    setLoading(false);
  };

  // Download result
  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_BASE_URL}/integration/download/${jobId}/${targetLang}/${filename}`;
      setDownloadResult({ url });
    } catch (err) {
      setError('Download failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
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
            <h1 className="text-xl font-bold text-gray-900">Enterprise Integration</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">LMS / NCVET / MSDE Integration</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seamless API integration with learning management systems and educational platforms
          </p>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center mb-6">
              <Upload className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">A. Upload to Platform</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-orange-500 transition-colors">
                  <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.mp3,.mp4" 
                    onChange={e => setFile(e.target.files[0])} 
                    className="hidden" 
                    id="integrationUpload"
                  />
                  <label htmlFor="integrationUpload" className="cursor-pointer">
                    <div className="text-md font-medium text-gray-900 mb-1">
                      {file ? file.name : "Choose content file"}
                    </div>
                    <div className="text-sm text-gray-600">
                      PDF, DOCX, MP3, MP4 supported
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                    <select 
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-orange-500 focus:outline-none bg-white/50"
                      value={platform} 
                      onChange={e => setPlatform(e.target.value)}
                    >
                      <option value="LMS">LMS</option>
                      <option value="NCVET">NCVET</option>
                      <option value="MSDE">MSDE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Language</label>
                    <input 
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-orange-500 focus:outline-none bg-white/50" 
                      value={targetLang} 
                      onChange={e => setTargetLang(e.target.value)} 
                      placeholder="e.g., hi"
                    />
                  </div>
                </div>

                <button 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  onClick={handleUpload} 
                  disabled={loading || !file}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Uploading...' : 'Upload to Platform'}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {uploadResult && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-700">Upload Successful</span>
                    </div>
                    <pre className="text-xs text-green-700 bg-green-100 rounded p-2 overflow-x-auto">
                      {JSON.stringify(uploadResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Terminal className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-mono text-sm">CURL Command</span>
                </div>
                <pre className="text-green-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
{`curl -X POST https://api.safehorizon.in/integration/upload \\
  -F "file=@demo_book_hindi.pdf" \\
  -F "target_language=hi" \\
  -F "partner=NCVET"`}
                </pre>
              </div>
            </div>
          </div>

          {/* Status Check Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Database className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">B. Check Status</h3>
              </div>
              <button 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50"
                onClick={handleCheckStatus} 
                disabled={loading}
              >
                Check Status
              </button>
            </div>

            {statusResult && (
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Database className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-700">Live System Status</span>
                </div>
                <pre className="text-sm text-blue-800 bg-blue-100 rounded-xl p-4 overflow-x-auto">
                  {JSON.stringify(statusResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Download Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center mb-6">
              <Download className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">C. Download Result</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filename</label>
                  <input 
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-green-500 focus:outline-none bg-white/50" 
                    value={filename} 
                    onChange={e => setFilename(e.target.value)} 
                    placeholder="demo_book_hindi.pdf"
                  />
                </div>

                <button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                  onClick={handleDownload} 
                  disabled={loading || !jobId || !filename}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Result
                </button>

                {downloadResult && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-700">Download Ready</span>
                    </div>
                    <a 
                      href={downloadResult.url} 
                      className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
                      download
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Click to download
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Terminal className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-mono text-sm">Download Command</span>
                </div>
                <pre className="text-green-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
{`curl -X GET https://api.safehorizon.in/integration/download/${jobId || '{job_id}'}/${targetLang}/${filename}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}