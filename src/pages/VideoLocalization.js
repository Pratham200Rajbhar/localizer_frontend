import React, { useState, useEffect } from 'react';
import { Video, Upload, Download, Languages, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { DEFAULT_LANGUAGES } from '../utils/constants';
import { apiService, fileUtils } from '../utils/apiService';

export default function VideoLocalization() {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState(DEFAULT_LANGUAGES);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);

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

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);



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


  // Handle video processing
  const handleLocalizeVideo = async () => {
    if (!file || !targetLang) return;

    try {
      setIsProcessing(true);
      setStep(3);
      setError('');
      setProcessingStage('Processing video...');

      // Call the video localization API with target language for subtitle translation
      const response = await apiService.localizeVideo(
        file,
        targetLang,
        'general',
        true, // include subtitles
        false, // include dubbed audio
        targetLang // target language for subtitle translation
      );
      
      // Find language name from supported languages
      const findLanguageName = (code) => {
        const lang = supportedLanguages.find((lang) => {
          const langCode = Array.isArray(lang) ? lang[0] : lang.code;
          return langCode === code;
        });
        return lang ? (Array.isArray(lang) ? lang[1] : lang.name) : code;
      };

      // Parse the response outputs array
      let subtitlesFile = null;
      let videoWithSubtitles = null;
      let transcriptFile = null;
      
      if (response.outputs && Array.isArray(response.outputs)) {
        response.outputs.forEach(output => {
          if (output.type === 'subtitles') {
            subtitlesFile = output;
          } else if (output.type === 'video_with_subtitles') {
            videoWithSubtitles = output;
          } else if (output.type === 'transcript') {
            transcriptFile = output;
          }
        });
      }

      setResult({
        video_file: file.name,
        target_language: findLanguageName(targetLang),
        subtitles_file: subtitlesFile,
        video_with_subtitles: videoWithSubtitles,
        transcript_file: transcriptFile,
        duration: response.processing_details?.original_duration || 10.0,
        confidence: response.translation_confidence || 0.92,
        output_files: response.outputs,
        processing_time: response.processing_time,
        status: response.status,
        // New fields from updated API
        detected_language: response.detected_language,
        subtitle_translated: response.translated || false,
        subtitle_content: response.subtitle_content,
        segment_count: response.processing_details?.segments_translated || 0
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

  // Load video for playback
  const loadVideoForPlayback = async (filename) => {
    if (!filename) return;
    
    setIsVideoLoading(true);
    try {
      const blob = await apiService.downloadVideo(filename);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err) {
      setError('Failed to load video: ' + err.message);
    } finally {
      setIsVideoLoading(false);
    }
  };

  // Enhanced subtitle loading with direct content support
  const loadSubtitles = async (filename, subtitleContent = null) => {
    try {
      let srtText;
      
      if (subtitleContent) {
        // Use direct subtitle content if available (more efficient)
        console.log('Using direct subtitle content from API response');
        srtText = subtitleContent;
      } else {
        // Fallback to downloading the file
        console.log('Downloading subtitle file:', filename);
        const blob = await apiService.downloadVideo(filename);
        srtText = await blob.text();
      }
      
      const parsed = parseSRT(srtText);
      setSubtitles(parsed);
      console.log('Subtitles loaded successfully:', parsed.length);
    } catch (err) {
      console.error('Failed to load subtitles:', err);
    }
  };

  // Fixed SRT parser for Windows CRLF format
  const parseSRT = (srtText) => {
    const subtitles = [];
    
    // Handle Windows CRLF line endings
    const normalizedText = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split by double newlines to get subtitle blocks
    const blocks = normalizedText.trim().split('\n\n');
    
    console.log('Parsing SRT:', blocks.length, 'blocks found');
    
    blocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      console.log(`Block ${index + 1}:`, lines.length, 'lines');
      
      // Each subtitle block should have: index, time, text, (optional empty line)
      if (lines.length >= 3) {
        const subtitleIndex = lines[0].trim();
        const timeRange = lines[1].trim();
        const textLines = lines.slice(2).filter(line => line.trim() !== ''); // Remove empty lines
        const text = textLines.join('\n').trim();
        
        // Parse time range
        if (timeRange.includes(' --> ')) {
          const [start, end] = timeRange.split(' --> ');
          
          // Remove [TRANSLATED] prefix if present
          const cleanText = text.replace(/^\[TRANSLATED\]\s*/, '');
          
          subtitles.push({
            index: parseInt(subtitleIndex),
            start: start.trim(),
            end: end.trim(),
            text: cleanText,
            startTime: timeToSeconds(start.trim()),
            endTime: timeToSeconds(end.trim())
          });
          
          console.log(`Added subtitle ${subtitleIndex}:`, cleanText.substring(0, 50) + '...');
        } else {
          console.warn('Invalid time range format:', timeRange);
        }
      } else {
        console.warn(`Block ${index + 1} has only ${lines.length} lines, skipping`);
      }
    });
    
    console.log('Total subtitles parsed:', subtitles.length);
    return subtitles;
  };

  // Convert time to seconds (handles HH:MM:SS,mmm format)
  const timeToSeconds = (timeStr) => {
    try {
      // Handle format: HH:MM:SS,mmm
      const [time, ms] = timeStr.split(',');
      const [h, m, s] = time.split(':').map(Number);
      const milliseconds = ms ? parseInt(ms) / 1000 : 0;
      return h * 3600 + m * 60 + s + milliseconds;
    } catch (error) {
      console.error('Error converting time:', timeStr, error);
      return 0;
    }
  };

  // Handle video time update
  const handleTimeUpdate = (event) => {
    const currentTime = event.target.currentTime;
    const active = subtitles.find(sub => 
      currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    setCurrentSubtitle(active || null);
  };

  // Generate SRT content
  const generateSRTContent = (subtitles) => {
    return subtitles.map((sub, index) => 
      `${index + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`
    ).join('\n');
  };




  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-lg mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Video Localization
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate accurate subtitles and localized content for video files
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
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-6">
            {[
              { num: 1, title: 'Upload', icon: Upload },
              { num: 2, title: 'Language', icon: Languages },
              { num: 3, title: 'Process', icon: Video },
              { num: 4, title: 'Download', icon: Download }
            ].map(({ num, title, icon: Icon }, index) => (
              <div key={num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                    step >= num ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-1 ${step >= num ? 'text-green-600' : 'text-gray-500'}`}>
                    {title}
                  </span>
                </div>
                {index < 3 && <div className="w-6 h-0.5 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upload Video File
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-600 transition-colors">
              <Play className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">Drop your video file here or click to browse</p>
              <input
                type="file"
                accept=".mp4,.avi,.mov,.webm"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer inline-block"
              >
                Choose Video File
              </label>
              <p className="text-sm text-gray-500 mt-2">Supports: MP4, AVI, MOV, WEBM (Max 500MB)</p>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            )}

            {/* Language Selection */}
            {step >= 2 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language for Subtitles
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Subtitles
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Subtitle Generation
            </h2>

            {!result && !isProcessing && (
              <div className="text-gray-500 text-center py-8">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Upload a video file and select a target language to see results</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <Video className="w-8 h-8 text-green-600 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-600">{processingStage}</p>
                <p className="text-sm text-gray-500 mt-1">This may take several minutes</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Video Info */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Video Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{result.duration}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Language:</span>
                      <span className="ml-2 font-medium">{result.target_language}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-green-600">{result.status}</span>
                    </div>
                  </div>
                </div>

                {/* Video Player Section */}
                {result.video_with_subtitles && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Video Player</h3>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      {!videoUrl && !isVideoLoading && (
                        <div className="aspect-video bg-gray-800 flex items-center justify-center">
                          <button
                            onClick={() => loadVideoForPlayback(result.video_with_subtitles.filename)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Load Video
                          </button>
                        </div>
                      )}
                      
                      {isVideoLoading && (
                        <div className="aspect-video bg-gray-800 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" />
                            <p>Loading video...</p>
                          </div>
                        </div>
                      )}
                      
                      {videoUrl && (
                        <div className="relative">
                          <video
                            className="w-full aspect-video"
                            controls
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedData={() => {
                              if (result.subtitle_content) {
                                loadSubtitles(null, result.subtitle_content);
                              } else if (result.subtitles_file) {
                                loadSubtitles(result.subtitles_file.filename);
                              }
                            }}
                          >
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          
                          {/* Current Subtitle Display */}
                          {currentSubtitle && (
                            <div className="absolute bottom-12 left-0 right-0 px-4">
                              <div className="bg-black bg-opacity-75 text-white p-2 rounded-lg text-center">
                                <p className="text-sm">{currentSubtitle.text}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subtitle Display */}
                {subtitles.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Subtitles</h3>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                      {subtitles.map((subtitle, index) => (
                        <div 
                          key={index} 
                          className={`mb-2 p-2 rounded border-l-2 ${
                            currentSubtitle && currentSubtitle.index === subtitle.index
                              ? 'bg-green-100 border-green-500'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500">
                              {subtitle.start} → {subtitle.end}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{subtitle.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download Files */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Download Files</h3>
                  <div className="space-y-2">
                    {result.subtitles_file && (
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Subtitle File</p>
                          <p className="text-sm text-gray-500">{result.subtitles_file.filename}</p>
                        </div>
                        <button
                          onClick={() => handleDownloadVideo(result.subtitles_file.filename)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </div>
                    )}
                    
                    {result.video_with_subtitles && (
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Video with Subtitles</p>
                          <p className="text-sm text-gray-500">{result.video_with_subtitles.filename}</p>
                        </div>
                        <button
                          onClick={() => handleDownloadVideo(result.video_with_subtitles.filename)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}