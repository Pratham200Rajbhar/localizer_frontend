import React, { useState } from 'react';
import { Building2, Upload, Download, CheckCircle, Terminal, Database, AlertCircle, Loader } from 'lucide-react';
import { SUPPORTED_PLATFORMS } from '../utils/constants';
import { apiService } from '../utils/apiService';

export default function Integration() {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('NCVET');
  const [targetLang, setTargetLang] = useState('hi');
  const [uploadResult, setUploadResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);
  const [downloadResult, setDownloadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');


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
    const baseUrl = process.env.REACT_APP_API_URL || 'https://api.safehorizon.com';
    
    switch (action) {
      case 'upload':
        return `curl -X POST ${baseUrl}/integration/upload \\
  -F "file=@document.pdf" \\
  -F "target_language=hi" \\
  -F "partner=NCVET"`;
      
      case 'status':
        return `curl -X GET ${baseUrl}/integration/status \\
  -H "Content-Type: application/json"`;
      
      case 'download':
        return `curl -X GET "${baseUrl}/integration/download/NCVET_1234/hi/document.pdf" \\
  -H "Accept: application/octet-stream" \\
  --output document.pdf`;
      
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            LMS / NCVET / MSDE Integration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            API integration with enterprise platforms for automated content localization
          </p>
        </div>

        {/* Platform Selection & File Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Platform Configuration
            </h2>

            {/* Platform Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {SUPPORTED_PLATFORMS.map(platform => (
                  <option key={platform.id} value={platform.id.toUpperCase()}>
                    {platform.name} - {platform.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="hi">Hindi (hi)</option>
                <option value="bn">Bengali (bn)</option>
                <option value="ta">Tamil (ta)</option>
                <option value="te">Telugu (te)</option>
                <option value="gu">Gujarati (gu)</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-600 transition-colors">
              <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Upload content for integration</p>
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
              <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* API Demonstration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              API Integration
            </h2>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Upload Example */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">1. Upload to Platform</h3>
                <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  {generateCurlCommand('upload')}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-orange-600 text-white py-2 px-3 rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Execute Upload'
                  )}
                </button>
              </div>

              {/* Status Example */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">2. Check Status</h3>
                <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  {generateCurlCommand('status')}
                </div>
                <button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center text-sm"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </button>
              </div>

              {/* Download Example */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">3. Download Result</h3>
                <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  {generateCurlCommand('download')}
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center text-sm"
                >
                  {isDownloading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upload Response */}
          {uploadResult && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-md font-bold text-gray-800 mb-3">
                Upload Response
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Status Response */}
          {statusResult && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-md font-bold text-gray-800 mb-3">
                Status Response
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{JSON.stringify(statusResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Download Response */}
          {downloadResult && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-md font-bold text-gray-800 mb-3">
                Download Response
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{JSON.stringify(downloadResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Integration Flow Explanation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Integration Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">1. Upload</h3>
              <p className="text-gray-600 text-sm">
                Send content to platform
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Terminal className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">2. Monitor</h3>
              <p className="text-gray-600 text-sm">
                Track processing status
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">3. Download</h3>
              <p className="text-gray-600 text-sm">
                Retrieve localized content
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}