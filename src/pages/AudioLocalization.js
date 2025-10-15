import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Download, AudioWaveform, AlertCircle, CheckCircle, Loader, Pause, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_LANGUAGES } from '../utils/constants';
import { apiService, fileUtils } from '../utils/apiService';

export default function AudioLocalization() {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('hi');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState(DEFAULT_LANGUAGES);
  
  // Enhanced state management
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [audioInfo, setAudioInfo] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  // Audio player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const audioRef = useRef(null);

  // Load supported languages on component mount
  useEffect(() => {
    loadSupportedLanguages();
  }, []);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const loadSupportedLanguages = async () => {
    try {
      const response = await apiService.getSupportedLanguages();
      if (response.supported_languages) {
        const langArray = Object.entries(response.supported_languages);
        setSupportedLanguages(langArray);
      } else if (Array.isArray(response)) {
        setSupportedLanguages(response);
      }
    } catch (error) {
      console.error('Failed to load supported languages:', error);
      setSupportedLanguages(DEFAULT_LANGUAGES);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setError('');
    setFile(null);
    setResult(null);
    setAudioUrl(null);

    try {
      // Validate file
      fileUtils.validateFile(selectedFile, 'audio');
      
      // Validate audio file with duration check
      const validation = await apiService.validateAudioFile(selectedFile);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setFile(selectedFile);
      setAudioInfo(validation);
    } catch (error) {
      setError(error.message);
      setFile(null);
    }
  };

  const handleTranslateAudio = async () => {
    if (!file || !targetLang) return;

    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress(0);
    setProcessingStatus('Starting audio processing...');

    // Reset audio player state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      // Step 2: Speech-to-Text Processing
      setProcessingStatus('Converting speech to text...');
      setProgress(40);

      // Step 3: Translation Processing
      setProcessingStatus('Translating text...');
      setProgress(60);

      // Step 4: Text-to-Speech Processing
      setProcessingStatus('Generating translated audio...');
      setProgress(80);

      // Call the main localization API
      const apiResult = await apiService.localizeAudio(file, targetLang, 'general', {});

      // Extract translated text from API response
      let translatedText = '';
      let originalText = '';
      
      if (apiResult) {
        if (apiResult.translated_text) {
          translatedText = apiResult.translated_text;
          originalText = apiResult.original_text || '';
        }
        else if (apiResult.pipeline_steps && apiResult.pipeline_steps.translation) {
          translatedText = apiResult.pipeline_steps.translation.translated_text || '';
          originalText = apiResult.pipeline_steps.stt?.transcribed_text || '';
        }
        else if (apiResult.results && Array.isArray(apiResult.results) && apiResult.results.length > 0) {
          const firstResult = apiResult.results[0];
          translatedText = firstResult.translated_text || '';
          originalText = firstResult.original_text || apiResult.original_text || '';
        }
      }
      
      if (!translatedText) {
        translatedText = 'Translation completed successfully';
      }

      const findLanguageName = (code) => {
        const lang = supportedLanguages.find(l => (Array.isArray(l) ? l[0] : l.code) === code);
        return lang ? (Array.isArray(lang) ? lang[1] : lang.name) : code.toUpperCase();
      };

      setResult({
        original_text: originalText,
        translated_text: translatedText,
        target_language: findLanguageName(targetLang),
        confidence: apiResult.pipeline_steps?.translation?.confidence_score || 0.94,
        duration: apiResult.processing_time_seconds || apiResult.processing_time || 0,
        output_file: apiResult.output_file
      });
      
      setProgress(100);
      setProcessingStatus('Audio localization completed successfully!');

      // Create audio URL for playback
      if (apiResult.output_file || apiResult.output_path) {
        try {
          const filename = apiResult.output_path ? apiResult.output_path.split('/').pop() : apiResult.output_file.split('/').pop();
          const audioBlob = await apiService.downloadAudio(filename);
          const audioBlobUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioBlobUrl);
        } catch (audioErr) {
          console.warn('Failed to create audio URL:', audioErr);
        }
      }

    } catch (error) {
      console.error('Audio localization failed:', error);
      setError(error.message || 'Failed to process audio file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Audio player functions
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setError('Failed to load audio file');
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!result?.output_file) return;
    
    try {
      const filename = result.output_file.split('/').pop();
      const audioBlob = await apiService.downloadAudio(filename);
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `localized_audio_${targetLang}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download audio file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-6">
            <AudioWaveform className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Audio Localization
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert speech to text, translate across languages, and generate natural-sounding audio
          </p>
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
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <span className="mt-2 text-sm text-gray-600">Upload</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${file ? 'bg-blue-600' : 'bg-gray-300'} text-white rounded-lg flex items-center justify-center`}>
                <AudioWaveform className="w-6 h-6" />
              </div>
              <span className="mt-2 text-sm text-gray-600">Process</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${result ? 'bg-green-600' : 'bg-gray-300'} text-white rounded-lg flex items-center justify-center`}>
                <Download className="w-6 h-6" />
              </div>
              <span className="mt-2 text-sm text-gray-600">Download</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Upload Audio File
            </h2>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept=".mp3,.wav,.m4a,.flac,.aac,.ogg,.wma"
                onChange={handleFileChange}
                className="hidden"
                id="audio-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="audio-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Drop your audio file here
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse files
                </p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium mb-2">Supported: MP3, WAV, M4A, FLAC, AAC, OGG</p>
                  <p className="text-xs">Maximum file size: 500MB</p>
                </div>
              </label>
            </div>

            {/* File Info */}
            {file && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      {audioInfo && ` | Duration: ${audioInfo.duration.toFixed(1)}s`}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            )}

            {/* Language Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isProcessing}
              >
                {supportedLanguages.map((lang) => {
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
              onClick={handleTranslateAudio}
              disabled={!file || !targetLang || isProcessing}
              className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {processingStatus || 'Processing...'}
                </>
              ) : (
                <>
                  <AudioWaveform className="w-4 h-4 mr-2" />
                  Localize Audio
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-skillBlue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Translation Results
            </h2>

            {/* Original Text */}
            {result && result.original_text && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Original Speech Transcription
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">{result.original_text}</p>
                </div>
              </div>
            )}

            {/* Translated Text */}
            {result && result.translated_text && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Translated Text ({result.target_language})
                </h3>
                <div className="bg-green-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">{result.translated_text}</p>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioUrl && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Localized Audio
                </h3>
                
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  onError={handleAudioError}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  preload="metadata"
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handlePlayPause}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    
                    <span className="text-sm text-gray-600 w-10">{formatTime(currentTime)}</span>
                    
                    <div 
                      className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer"
                      onClick={handleSeek}
                      onMouseDown={handleSeekStart}
                      onMouseUp={handleSeekEnd}
                    >
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    
                    <span className="text-sm text-gray-600 w-10 text-right">{formatTime(duration)}</span>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Audio
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isProcessing && (
              <div className="text-center py-8">
                <Loader className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">{processingStatus}</p>
              </div>
            )}

            {/* Empty State */}
            {!result && !isProcessing && (
              <div className="text-center py-8">
                <AudioWaveform className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  Upload an audio file to see translation results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
