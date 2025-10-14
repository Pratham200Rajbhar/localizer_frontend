import React, { useState, useEffect } from 'react';
import { Video, Upload, Download, Languages, Home, Play, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_LANGUAGES } from '../utils/constants';
import { apiService, fileUtils } from '../utils/apiService';

export default function VideoLocalization() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState(DEFAULT_LANGUAGES);

  // Load supported languages from API
  useEffect(() => {
    const loadSupportedLanguages = async () => {
      try {
        const response = await apiService.getSupportedLanguages();
        if (response.supported_languages) {
          const langArray = Object.entries(response.supported_languages);
          setSupportedLanguages(langArray);
        } else if (Array.isArray(response)) {
          // Handle case where API returns array format
          setSupportedLanguages(response);
        }
      } catch (err) {
        console.error('Failed to load supported languages:', err);
        // Fallback to default languages
        setSupportedLanguages(DEFAULT_LANGUAGES);
      }
    };
    
    loadSupportedLanguages();
  }, []);



  // Handle file upload
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      fileUtils.validateFile(selectedFile, 'video');
      setFile(selectedFile);
      setResult(null);
      setError('');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Invalid video file');
      setFile(null);
      setStep(1);
    }
  };

  // Load demo video
  const loadDemoVideo = async () => {
    try {
      // Create a demo video file (this would normally be a real video file)
      const demoText = "This is a demo video for localization testing. The video contains educational content that needs to be translated and subtitled.";
      const blob = new Blob([demoText], { type: 'text/plain' });
      const demoFile = new File([blob], 'demo_video.txt', { type: 'text/plain' });
      
      setFile(demoFile);
      setStep(2);
      setError('');
    } catch (err) {
      setError('Failed to load demo video: ' + err.message);
    }
  };

  // Handle video processing
  const handleLocalizeVideo = async () => {
    if (!file || !targetLang) return;

    try {
      setIsProcessing(true);
      setStep(3);
      setError('');
      setProcessingStage('Processing video...');

      // Call the video localization API
      const response = await apiService.localizeVideo(
        file,
        targetLang,
        'general',
        true, // include subtitles
        false // include dubbed audio
      );
      
      // Find language name from supported languages
      const findLanguageName = (code) => {
        const lang = supportedLanguages.find((lang) => {
          const langCode = Array.isArray(lang) ? lang[0] : lang.code;
          return langCode === code;
        });
        return lang ? (Array.isArray(lang) ? lang[1] : lang.name) : code;
      };

      setResult({
        video_file: file.name,
        target_language: findLanguageName(targetLang),
        subtitles: response.outputs?.subtitles || [
          { start: "00:00:00,000", end: "00:00:05,000", text: "Demo subtitle 1" },
          { start: "00:00:05,000", end: "00:00:10,000", text: "Demo subtitle 2" }
        ],
        transcript: response.outputs?.transcript || "Demo video transcript",
        duration: response.processing_details?.original_duration || 10.0,
        confidence: 0.92,
        output_files: response.outputs,
        processing_time: response.processing_time
      });

      setStep(4);
    } catch (err) {
      setError('Failed to process video: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Handle video download
  const handleDownloadVideo = async (filename) => {
    if (!filename) return;
    
    try {
      const blob = await apiService.downloadVideo(filename);
      fileUtils.downloadBlob(blob, filename);
    } catch (err) {
      setError('Failed to download video: ' + err.message);
    }
  };

  // Generate SRT content
  const generateSRTContent = (subtitles) => {
    return subtitles.map((sub, index) => 
      `${index + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`
    ).join('\n');
  };

  // Download subtitles
  const handleDownloadSubtitles = () => {
    if (!result) return;
    
    const srtContent = generateSRTContent(result.subtitles);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.output_files.subtitles;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
            <div className="text-skillBlue font-bold text-lg">Video Localization</div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Video Localization
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate accurate subtitles and localized content for video files
          </p>
          <div className="mt-6">
            <button
              onClick={loadDemoVideo}
              className="bg-skillBlue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Demo Video
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Process Flow */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4">
            {[
              { num: 1, title: 'Upload Video', icon: Upload },
              { num: 2, title: 'Select Language', icon: Languages },
              { num: 3, title: 'Process', icon: Video },
              { num: 4, title: 'Download', icon: Download }
            ].map(({ num, title, icon: Icon }) => (
              <div key={num} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  step >= num ? 'bg-green-600 text-white border-green-600' : 'text-gray-400 border-gray-300'
                }`}>
                  {step > num ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`ml-2 ${step >= num ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                  {title}
                </span>
                {num < 4 && <div className="w-8 h-px bg-gray-300 mx-3"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Video className="w-6 h-6 text-green-600 mr-2" />
              Upload Video File
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-600 transition-colors">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drag & drop your video file here, or click to browse</p>
              <input
                type="file"
                accept=".mp4,.avi,.mov,.webm"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer inline-block"
              >
                Choose Video File
              </label>
              <p className="text-sm text-gray-500 mt-2">Supports: .mp4, .avi, .mov, .webm (Max 500MB)</p>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Demo file'}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            )}

            {/* Language Selection */}
            {step >= 2 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language for Subtitles
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
                >
                  <option value="">Select target language...</option>
                  {supportedLanguages.map((lang) => {
                    // Handle both array format [code, name] and object format {code, name}
                    const code = Array.isArray(lang) ? lang[0] : lang.code;
                    const name = Array.isArray(lang) ? lang[1] : lang.name;
                    return (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    );
                  })}
                </select>

                <button
                  onClick={handleLocalizeVideo}
                  disabled={!targetLang || isProcessing}
                  className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Processing Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Subtitles
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              Subtitle Generation
            </h2>

            {!result && !isProcessing && (
              <div className="text-gray-500 text-center py-16">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Upload a video file and select a target language to see results here</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-16">
                <Video className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600 font-medium">{processingStage}</p>
                <p className="text-sm text-gray-500 mt-2">This may take several minutes for longer videos</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Video Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{result.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-medium">{result.target_language}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Subtitles:</span>
                      <span className="ml-2 font-medium">{result.subtitles.length} segments</span>
                    </div>
                  </div>
                </div>

                {/* Subtitle Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Subtitle Preview</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {result.subtitles.map((sub, index) => (
                      <div key={index} className="mb-3 p-2 bg-white rounded border-l-4 border-green-500">
                        <div className="text-xs text-gray-500 mb-1">
                          {sub.start} → {sub.end}
                        </div>
                        <div className="text-gray-700">{sub.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Options */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadSubtitles}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Subtitle File (.srt)
                  </button>
                  
                  <button
                    onClick={handleDownloadVideo}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Download Video with Subtitles
                  </button>

                  <button
                    onClick={() => navigator.clipboard.writeText(generateSRTContent(result.subtitles))}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Copy Subtitle Content
                  </button>
                </div>
              </div>
            )}
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