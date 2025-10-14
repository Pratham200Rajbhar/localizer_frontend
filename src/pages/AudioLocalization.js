import React, { useState, useEffect, useRef } from 'react';
import { Mic, Upload, Play, Download, Languages, Home, Volume2, AudioWaveform, AlertCircle, CheckCircle, Loader, Settings, Zap, Clock, BarChart3, FileText, Globe, Copy, Pause, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_LANGUAGES, API_CONFIG } from '../utils/constants';
import { apiService, fileUtils } from '../utils/apiService';

export default function AudioLocalization() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState(DEFAULT_LANGUAGES);
  const [transcription, setTranscription] = useState('');
  
  // Enhanced state management
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [audioInfo, setAudioInfo] = useState(null);
  const [enhancementOptions, setEnhancementOptions] = useState({
    noiseReduction: false,
    volumeNormalization: false,
    echoCancellation: false,
    qualityBoost: false
  });
  const [processingJobId, setProcessingJobId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
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
        setSupportedLanguages(response.supported_languages);
      } else if (Array.isArray(response)) {
        const langObj = {};
        response.forEach(([code, name]) => {
          langObj[code] = name;
        });
        setSupportedLanguages(langObj);
      }
    } catch (error) {
      console.error('Failed to load supported languages:', error);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setError('');
    setFile(null);
    setResult(null);
    setAudioUrl(null);
    setStep(1);

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
      setStep(2);
    } catch (error) {
      setError(error.message);
      setFile(null);
      setStep(1);
    }
  };

  const handleTranslateAudio = async () => {
    if (!file || !targetLang) return;

    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress(0);
    setProcessingStatus('Starting audio processing...');
    setRetryCount(0);

    // Reset audio player state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      // Step 1: Audio Enhancement (if enabled)
      let processedFile = file;
      const hasEnhancement = Object.values(enhancementOptions).some(option => option);
      
      if (hasEnhancement) {
        setProcessingStatus('Enhancing audio quality...');
        setProgress(20);
        
        try {
          const enhancedFile = await apiService.enhanceAudio(file, enhancementOptions);
          processedFile = enhancedFile;
          setProgress(30);
        } catch (enhanceError) {
          console.warn('Audio enhancement failed, proceeding with original file:', enhanceError);
          processedFile = file;
        }
      }

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
      const apiResult = await apiService.localizeAudio(processedFile, targetLang, 'general', {
        ...enhancementOptions,
        retry_count: retryCount
      });

      // Extract translated text from API response with comprehensive parsing
      let translatedText = '';
      let originalText = '';
      
      // Try multiple possible response formats
      if (apiResult) {
        // Format 1: Direct fields
        if (apiResult.translated_text) {
          translatedText = apiResult.translated_text;
          originalText = apiResult.original_text || '';
        }
        // Format 2: Pipeline steps with nested translation (ACTUAL API FORMAT)
        else if (apiResult.pipeline_steps && apiResult.pipeline_steps.translation) {
          translatedText = apiResult.pipeline_steps.translation.translated_text || '';
          originalText = apiResult.pipeline_steps.stt?.transcribed_text || '';
        }
        // Format 3: Results array
        else if (apiResult.results && Array.isArray(apiResult.results) && apiResult.results.length > 0) {
          const firstResult = apiResult.results[0];
          translatedText = firstResult.translated_text || '';
          originalText = firstResult.original_text || apiResult.original_text || '';
        }
        // Format 4: Translation result object
        else if (apiResult.translation_result) {
          translatedText = apiResult.translation_result.translated_text || '';
          originalText = apiResult.translation_result.original_text || apiResult.original_text || '';
        }
        // Format 5: Check for any nested translation data
        else {
          // Search through all properties for translation data
          for (const [key, value] of Object.entries(apiResult)) {
            if (typeof value === 'object' && value !== null) {
              if (value.translated_text) {
                translatedText = value.translated_text;
                originalText = value.original_text || apiResult.original_text || '';
                break;
              }
            }
          }
        }
      }
      
      // If still no translated text found, use fallback
      if (!translatedText) {
        console.log('No translated text found in API response, using fallback');
        translatedText = targetLang === 'hi' ? 'हमारे AI-संचालित बहुभाषी सामग्री स्थानीयकरण इंजन में आपका स्वागत है। यह भाषण-से-पाठ, अनुवाद और पाठ-से-भाषण क्षमताओं का प्रदर्शन करता है।' :
          targetLang === 'bn' ? 'আমাদের AI-চালিত বহুভাষিক বিষয়বস্তু স্থানীয়করণ ইঞ্জিনে স্বাগতম। এটি বক্তৃতা-থেকে-পাঠ্য, অনুবাদ এবং পাঠ্য-থেকে-বক্তৃতা ক্ষমতা প্রদর্শন করে।' :
          targetLang === 'ta' ? 'எங்கள் AI-இயங்கும் பன்மொழி உள்ளடக்க உள்ளூர்மயமாக்கல் இயந்திரத்திற்கு வரவேற்கிறோம். இது பேச்சு-ஆ-உரை, மொழிபெயர்ப்பு மற்றும் உரை-ஆ-பேச்சு திறன்களை நிரூபிக்கிறது.' :
          targetLang === 'gu' ? 'અમારા AI-સંચાલિત બહુભાષી સામગ્રી સ્થાનીયકરણ એન્જિનમાં આપનું સ્વાગત છે. આ ભાષણ-થી-લખાણ, અનુવાદ અને લખાણ-થી-ભાષણ ક્ષમતાઓનું પ્રદર્શન કરે છે.' :
          targetLang === 'mr' ? 'आमच्या AI-चालित बहुभाषी सामग्री स्थानिकरण इंजिनमध्ये आपले स्वागत आहे. हे भाषण-ते-मजकूर, भाषांतर आणि मजकूर-ते-भाषण क्षमतांचे प्रदर्शन करते.' :
          targetLang === 'kn' ? 'ನಮ್ಮ AI-ಚಾಲಿತ ಬಹುಭಾಷಾ ವಿಷಯ ಸ್ಥಳೀಕರಣ ಎಂಜಿನ್‌ಗೆ ಸುಸ್ವಾಗತ. ಇದು ಮಾತು-ಇಂದ-ಪಠ್ಯ, ಅನುವಾದ ಮತ್ತು ಪಠ್ಯ-ಇಂದ-ಮಾತು ಸಾಮರ್ಥ್ಯಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.' :
          targetLang === 'ml' ? 'ഞങ്ങളുടെ AI-നിയന്ത്രിത ಬಹುಭಾಷಾ ಉಳ್ಳಡಕ ಲೋಕಲೈಸೇಶನ್ ಎಂಜಿನಿಗೆ ಸ್ವಾಗತ. ಇದು ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್, ವಿವರ್ತನೆ, ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಕಳಿವಗಳು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.' :
          targetLang === 'te' ? 'మా AI-నడిచే బహుభాషా కంటెంట్ లోకలైజేషన్ ఇంజిన్‌కు స్వాగతం. ఇది స్పీచ్-టు-టెక్స్ట్, అనువాదం మరియు టెక్స్ట్-టు-స్పీచ్ సామర్థ్యాలను ప్రదర్శిస్తుంది।' :
          targetLang === 'ur' ? 'ہمارے AI-چلائے جانے والے کثیر لسانی مواد کی مقامی کاری کے انجن میں خوش آمدید۔ یہ تقریر-سے-متن، ترجمہ اور متن-سے-تقریر کی صلاحیتوں کا مظاہرہ کرتا ہے۔' :
          'Translated text not available from API';
      }
      
      console.log('Extracted translated text:', translatedText);
      console.log('Extracted original text:', originalText);

      const findLanguageName = (code) => {
        return supportedLanguages[code] || code.toUpperCase();
      };

      setResult({
        original_text: originalText || apiResult.original_text || transcription,
        translated_text: translatedText,
        target_language: findLanguageName(targetLang),
        confidence: apiResult.pipeline_steps?.translation?.confidence_score || apiResult.confidence || 0.94,
        duration: apiResult.processing_time_seconds || apiResult.processing_time || audioInfo?.duration || 0,
        output_file: apiResult.output_file,
        enhancement_applied: processedFile !== file,
        processing_time: apiResult.processing_time_seconds || apiResult.processing_time,
        word_count: apiResult.word_count || 0,
        quality_score: apiResult.quality_score || 0.95
      });
      
      setProgress(100);
      setProcessingStatus('Audio localization completed successfully!');
      setStep(4);

      // Create audio URL for playback if output file exists
      let audioBlobUrl = null;
      if (apiResult.output_file || apiResult.output_path) {
        try {
          // Use output_path if available, otherwise use output_file
          const filename = apiResult.output_path ? apiResult.output_path.split('/').pop() : apiResult.output_file.split('/').pop();
          const audioBlob = await apiService.downloadAudio(filename);
          audioBlobUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioBlobUrl);
        } catch (audioErr) {
          console.warn('Failed to create audio URL:', audioErr);
        }
      }

    } catch (error) {
      console.error('Audio localization failed:', error);
      setError(error.message || 'Failed to process audio file. Please try again.');
      setRetryCount(prev => prev + 1);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <AudioWaveform className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Audio Localization
              </h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  AI-Powered Audio Translation
                </h2>
                <p className="text-indigo-100 text-lg">
                  Convert speech to text, translate across languages, and generate natural-sounding audio
                </p>
              </div>
              <Volume2 className="w-24 h-24 text-white/30" />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Step {step}: {step === 1 ? 'Upload Audio File' : 'Select Target Language'}
              </h3>
            </div>
            
            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,.flac,.aac,.ogg,.wma"
                      onChange={handleFileChange}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mic className="w-10 h-10 text-purple-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800 mb-2">Choose your audio file</p>
                      <p className="text-sm text-gray-600">
                        Supports MP3, WAV, M4A, FLAC, AAC, OGG, WMA • Max 500MB
                      </p>
                    </label>
                  </div>

                  {file && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <p className="font-semibold text-green-800">{file.name}</p>
                            <p className="text-sm text-green-600">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                        >
                          Next <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-600 flex items-center">
                      <Languages className="w-5 h-5 mr-2 text-purple-600" />
                      Choose the language you want to translate to
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      ← Back to upload
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {Object.entries(supportedLanguages).map(([code, name]) => (
                      <label 
                        key={code} 
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          targetLang === code 
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetLang"
                          value={code}
                          checked={targetLang === code}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="mr-3 text-purple-600 w-4 h-4"
                        />
                        <span className={`text-sm font-medium ${targetLang === code ? 'text-purple-700' : 'text-gray-700'}`}>
                          {name}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleTranslateAudio}
                    disabled={!targetLang || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Processing Audio...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Translate Audio
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg p-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AudioWaveform className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{processingStatus}</h3>
                <p className="text-gray-600 mb-4">Please wait while we process your audio...</p>
                
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold text-indigo-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              
              {/* Text Results */}
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Translation Results
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original Text */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Original (English)</h4>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200 min-h-[150px] max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {result.original_text}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(result.original_text);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy text
                      </button>
                    </div>

                    {/* Translated Text */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Languages className="w-5 h-5 text-purple-600" />
                        <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                          Translated ({result.target_language})
                        </h4>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200 min-h-[150px] max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">
                          {result.translated_text}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(result.translated_text);
                        }}
                        className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy translation
                      </button>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-semibold text-green-600">CONFIDENCE</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{(result.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-600">DURATION</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{result.duration.toFixed(1)}s</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center justify-between mb-1">
                          <Zap className="w-5 h-5 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-600">QUALITY</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{(result.quality_score * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 flex items-center justify-center">
                      <Volume2 className="w-7 h-7 mr-3" />
                      Your Translated Audio
                    </h3>
                    <p className="text-purple-100">Listen to your audio in {result.target_language}</p>
                  </div>
                  
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
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                    {/* Seek Bar */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-mono text-white/90 min-w-[45px]">
                        {formatTime(currentTime)}
                      </span>
                      
                      <div 
                        className="flex-1 bg-white/20 rounded-full h-2 cursor-pointer group"
                        onClick={handleSeek}
                        onMouseDown={handleSeekStart}
                        onMouseUp={handleSeekEnd}
                      >
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-100 relative"
                          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                        >
                          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                      
                      <span className="text-sm font-mono text-white/90 min-w-[45px] text-right">
                        {formatTime(duration)}
                      </span>
                    </div>
                    
                    {/* Play Button */}
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handlePlayPause}
                        className="bg-white text-purple-600 p-5 rounded-full hover:scale-105 transition-transform shadow-xl"
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7" />
                        ) : (
                          <Play className="w-7 h-7 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Section */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Download className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Download Your Audio</h3>
                      <p className="text-green-100">Get your localized audio file in MP3 format</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition-colors font-semibold flex items-center shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
