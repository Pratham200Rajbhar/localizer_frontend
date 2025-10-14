import React, { useState, useEffect } from 'react';
import { FileText, Upload, Languages, Download, Home, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../utils/apiService';
import { DEFAULT_LANGUAGES } from '../utils/constants';
import { validateFile } from '../utils/fileUtils';

function DocumentTranslation() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(0);
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

  // Handle file upload and language detection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    
    // Validate file
    const validation = validateFile(file, ['txt', 'pdf', 'docx', 'doc', 'rtf'], 100);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setSelectedFile(file);
    setDetectedLanguage('');
    setOriginalText('');
    setTranslatedText('');
    setConfidence(0);

    // Upload file and detect language
    await handleUploadAndDetect(file);
  };

  // Upload file to backend and detect language
  const handleUploadAndDetect = async (file) => {
    setIsDetecting(true);
    setError('');

    try {
      let textContent = '';
      
      // For text files, read content directly for faster processing
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        try {
          textContent = await file.text();
        } catch (textError) {
          console.warn('Failed to read text file directly, using backend:', textError);
          // Fallback to backend processing
          const uploadResponse = await apiService.uploadContent(file);
          textContent = uploadResponse.content || uploadResponse.text || '';
        }
      } else {
        // For PDF, DOCX, and other files, always use backend processing
        const uploadResponse = await apiService.uploadContent(file);
        textContent = uploadResponse.content || uploadResponse.text || '';
      }
      
      if (!textContent || textContent.trim() === '') {
        throw new Error('Could not extract text content from file. Please ensure the file contains readable text.');
      }
      
      // Detect language
      const detectionResponse = await apiService.detectLanguage({ text: textContent });
      
      setDetectedLanguage(detectionResponse.detected_language);
      setOriginalText(textContent);
      setConfidence(detectionResponse.confidence * 100);
    } catch (err) {
      setError('Failed to upload or detect language: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!originalText || !targetLanguage) {
      setError('Please select a file and target language');
      return;
    }

    setIsTranslating(true);
    setError('');
    setTranslatedText('');

    try {
      const result = await apiService.translateText({
        text: originalText,
        source_language: detectedLanguage,
        target_languages: [targetLanguage],
        domain: 'general',
        apply_localization: true
      });

      // Get the translated text from the first result
      if (result.results && result.results.length > 0) {
        setTranslatedText(result.results[0].translated_text);
      } else {
        setTranslatedText(result.translated_text || 'Translation completed');
      }
    } catch (err) {
      setError('Failed to translate: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!translatedText) {
      setError('No translated text to download');
      return;
    }

    try {
      const blob = new Blob([translatedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translated_${selectedFile.name.split('.')[0]}_${targetLanguage}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file: ' + err.message);
    }
  };

  // Load demo file
  const loadDemoFile = async () => {
    try {
      // Create a demo text file
      const demoText = 'Welcome to the AI-powered multilingual content localization engine. This system can translate documents across 22 Indian languages with high accuracy. Our advanced AI models ensure context-aware translations that preserve the original meaning and tone.';
      const blob = new Blob([demoText], { type: 'text/plain' });
      const demoFile = new File([blob], 'demo_document.txt', { type: 'text/plain' });
      
      setSelectedFile(demoFile);
      setError('');
      
      // Upload and detect language for demo file
      await handleUploadAndDetect(demoFile);
    } catch (err) {
      setError('Failed to load demo file: ' + err.message);
    }
  };

  // Load test file (simulating PDF)
  const loadTestFile = async () => {
    try {
      // Fetch the test document from public folder
      const response = await fetch('/demo-assets/test_document.txt');
      const testText = await response.text();
      
      // Create a file object that simulates a PDF
      const blob = new Blob([testText], { type: 'application/pdf' });
      const testFile = new File([blob], 'test_document.pdf', { type: 'application/pdf' });
      
      setSelectedFile(testFile);
      setError('');
      
      // Upload and detect language for test file
      await handleUploadAndDetect(testFile);
    } catch (err) {
      setError('Failed to load test file: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Document Translation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload documents and get accurate translations in multiple Indian languages
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={loadDemoFile}
              className="bg-skillBlue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Demo Document
            </button>
            <button
              onClick={loadTestFile}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Load Test PDF
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
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-skillBlue text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-3 text-gray-700 font-medium">Upload Document</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 ${detectedLanguage ? 'bg-skillBlue text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center font-bold`}>
                2
              </div>
              <span className="ml-3 text-gray-700 font-medium">Detect Language</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 ${translatedText ? 'bg-skillBlue text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center font-bold`}>
                3
              </div>
              <span className="ml-3 text-gray-700 font-medium">Translate</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Upload className="mr-3 text-skillBlue" />
              Upload Document
            </h2>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-skillBlue transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx,.doc,.rtf"
                className="hidden"
                id="file-upload"
                disabled={isDetecting}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 mb-2">
                  Supports: TXT, PDF, DOCX, DOC, RTF (Max 100MB)
                </p>
                <div className="text-sm text-gray-400">
                  <p>• PDF files: Full text extraction and translation</p>
                  <p>• Word documents: Complete document processing</p>
                  <p>• Text files: Direct processing for faster results</p>
                </div>
              </label>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      Type: {selectedFile.type || 'Unknown'} | Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {detectedLanguage && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            Detected: {detectedLanguage} ({confidence.toFixed(1)}% confidence)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {isDetecting && (
                    <div className="flex items-center">
                      <Loader className="w-5 h-5 text-skillBlue animate-spin mr-2" />
                      <span className="text-sm text-gray-600">
                        {selectedFile.type === 'text/plain' ? 'Reading file...' : 'Processing with backend...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language Selection */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-skillBlue focus:border-transparent"
                disabled={isTranslating}
              >
                {supportedLanguages.map((lang) => {
                  // Handle both array format [code, name] and object format {code, name}
                  const code = Array.isArray(lang) ? lang[0] : lang.code;
                  const name = Array.isArray(lang) ? lang[1] : lang.name;
                  return (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={!originalText || !targetLanguage || isTranslating}
              className="w-full mt-6 bg-skillBlue text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isTranslating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5 mr-2" />
                  Translate Document
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Translation Results
            </h2>

            {/* Original Text */}
            {originalText && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Original Text ({detectedLanguage})
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">{originalText}</p>
                </div>
              </div>
            )}

            {/* Translated Text */}
            {translatedText && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Translated Text ({targetLanguage})
                </h3>
                <div className="bg-green-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">{translatedText}</p>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Translation
                </button>
              </div>
            )}

            {/* Loading State */}
            {isTranslating && (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 text-skillBlue animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Translating your document...</p>
              </div>
            )}

            {/* Empty State */}
            {!originalText && !isTranslating && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Upload a document to see translation results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DocumentTranslation;
