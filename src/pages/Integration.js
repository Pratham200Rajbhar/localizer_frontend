import React, { useState } from 'react';
import { Building2, Upload, Download, Code, CheckCircle, Home, Terminal, Database, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEMO_PLATFORMS } from '../utils/constants';
import { apiService } from '../utils/apiService';

export default function Integration() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('NCVET');
  const [targetLang, setTargetLang] = useState('hi');
  const [uploadResult, setUploadResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);
  const [downloadResult, setDownloadResult] = useState(null);
  const [filename] = useState('demo_book_hindi.pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  // Load demo file
  const loadDemoFile = async () => {
    try {
      // Create a demo file
      const demoText = "This is a demo document for LMS integration testing. The content will be translated and processed through the integration pipeline.";
      const blob = new Blob([demoText], { type: 'text/plain' });
      const demoFile = new File([blob], 'demo_book.txt', { type: 'text/plain' });
      
      setFile(demoFile);
      setError('');
    } catch (err) {
      setError('Failed to load demo file: ' + err.message);
    }
  };

  // Handle file upload for integration
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError('');
    }
  };

  // Real API upload to integration endpoint
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const response = await apiService.integrationUpload(
        file,
        [targetLang],
        'document',
        'general',
        `${platform.toLowerCase()}_partner_123`,
        'normal'
      );
      
      setUploadResult(response);
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Check integration status
  const handleCheckStatus = async () => {
    if (!uploadResult?.job_id) {
      setError('No job ID available. Please upload a file first.');
      return;
    }

    setIsCheckingStatus(true);
    setError('');

    try {
      const response = await apiService.getIntegrationResults(uploadResult.job_id);
      setStatusResult(response);
    } catch (err) {
      setError('Status check failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Download integration results
  const handleDownload = async () => {
    if (!uploadResult?.job_id) {
      setError('No job ID available for download');
      return;
    }

    setIsDownloading(true);
    setError('');

    try {
      const downloadFilename = `${uploadResult.job_id}_${targetLang}.txt`;
      const partnerId = `${platform.toLowerCase()}_partner_123`;
      
      const response = await apiService.downloadIntegrationOutput(uploadResult.job_id, targetLang, downloadFilename);
      
      // Create and download the file
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadResult({
        job_id: uploadResult.job_id,
        status: 'Downloaded',
        download_url: downloadFilename,
        completion_time: new Date().toISOString()
      });
    } catch (err) {
      setError('Download failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate CURL command
  const generateCurlCommand = (action) => {
    const baseUrl = "http://localhost:8000";
    
    switch (action) {
      case 'upload':
        return `curl -X POST ${baseUrl}/integration/upload \\
  -F "file=@demo_book_hindi.pdf" \\
  -F "target_language=hi" \\
  -F "partner=NCVET"`;
      
      case 'status':
        return `curl -X GET ${baseUrl}/integration/status \\
  -H "Content-Type: application/json"`;
      
      case 'download':
        return `curl -X GET "${baseUrl}/integration/download/NCVET_1234/hi/demo_book_hindi.pdf" \\
  -H "Accept: application/octet-stream" \\
  --output demo_book_hindi.pdf`;
      
      default:
        return '';
    }
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
            <div className="text-skillBlue font-bold text-lg">Enterprise Integration</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LMS / NCVET / MSDE Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Seamless API integration with enterprise platforms for automated content localization
          </p>
          <div className="mt-6">
            <button
              onClick={loadDemoFile}
              className="bg-skillBlue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Demo File
            </button>
          </div>
        </div>

        {/* Platform Selection & File Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-6 h-6 text-orange-600 mr-2" />
              Platform Configuration
            </h2>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-600"
              >
                {DEMO_PLATFORMS.map(platform => (
                  <option key={platform.id} value={platform.id.toUpperCase()}>
                    {platform.name} - {platform.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-600"
              >
                <option value="hi">Hindi (hi)</option>
                <option value="bn">Bengali (bn)</option>
                <option value="ta">Tamil (ta)</option>
                <option value="te">Telugu (te)</option>
                <option value="gu">Gujarati (gu)</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-600 transition-colors">
              <Database className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">Upload content for platform integration</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="integration-upload"
              />
              <label
                htmlFor="integration-upload"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer inline-block"
              >
                Choose File
              </label>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* API Demonstration */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Terminal className="w-6 h-6 text-orange-600 mr-2" />
              API Integration Demo
            </h2>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Upload Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload to Platform</h3>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono mb-3 overflow-x-auto">
                  {generateCurlCommand('upload')}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Execute Upload'
                  )}
                </button>
              </div>

              {/* Status Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Check Status</h3>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono mb-3 overflow-x-auto">
                  {generateCurlCommand('status')}
                </div>
                <button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </button>
              </div>

              {/* Download Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download Result</h3>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono mb-3 overflow-x-auto">
                  {generateCurlCommand('download')}
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  {isDownloading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    'Download File'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Response Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Response */}
          {uploadResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 text-orange-600 mr-2" />
                Upload Response
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Status Response */}
          {statusResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 text-blue-600 mr-2" />
                Status Response
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(statusResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Download Response */}
          {downloadResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Download className="w-5 h-5 text-green-600 mr-2" />
                Download Response
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(downloadResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Integration Flow Explanation */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload Content</h3>
              <p className="text-gray-600">
                Send educational content to the platform with localization requirements
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Terminal className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Monitor Progress</h3>
              <p className="text-gray-600">
                Track processing status and receive real-time updates on localization progress
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Retrieve Results</h3>
              <p className="text-gray-600">
                Download localized content ready for deployment on target platforms
              </p>
            </div>
          </div>
        </div>

        {/* Backend Integration Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800">
              <strong>Live Backend Integration:</strong> This page connects to the FastAPI backend at{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:8000</code>. 
              Make sure your backend server is running for full functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}