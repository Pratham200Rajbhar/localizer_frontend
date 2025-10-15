import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Volume2, 
  Video, 
  Globe, 
  BookOpen,
  Zap,
  Shield,
  Users,
  Award,
  ChevronRight,
  Mic,
  Languages,
  ArrowRight,
  CheckCircle,
  Star,
  Eye,
  Download,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Search,
  Filter,
  Calendar,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  MoreVertical,
  Copy,
  Share,
  Edit,
  AlertCircle,
  Loader
} from 'lucide-react';
import { apiService } from '../utils/apiService';
import { DEFAULT_LANGUAGES } from '../utils/constants';

const Home = () => {
  // Document Management State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('hi');

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listFiles(0, 50);
      // Handle different response formats
      let documents = [];
      if (Array.isArray(response)) {
        documents = response;
      } else if (response.files && Array.isArray(response.files)) {
        documents = response.files;
      } else if (response.value && Array.isArray(response.value)) {
        documents = response.value;
      }
      setDocuments(documents);
      console.log('Loaded documents:', documents);
      console.log('Book files found:', documents.filter(doc => isBookFile(doc.filename)));
    } catch (err) {
      setError('Failed to load documents: ' + err.message);
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-6 h-6" />;
      case 'mp3':
      case 'wav':
      case 'm4a':
      case 'flac':
        return <FileAudio className="w-6 h-6" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return <FileVideo className="w-6 h-6" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'epub', 'mobi'].includes(extension)) return 'document';
    if (['mp3', 'wav', 'm4a', 'flac'].includes(extension)) return 'audio';
    if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    return 'other';
  };

  const isBookFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    // Include txt files as potential books for testing
    return ['pdf', 'epub', 'mobi', 'docx', 'txt'].includes(extension);
  };

  const getBookIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'epub':
      case 'mobi':
        return <BookOpen className="w-6 h-6" />;
      case 'docx':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDocument = async (document) => {
    try {
      setSelectedDocument(document);
      setShowDocumentViewer(true);
    } catch (err) {
      setError('Failed to load document: ' + err.message);
    }
  };

  const handleTranslateDocument = async (document) => {
    try {
      setIsTranslating(true);
      setError(null);
      
      const result = await apiService.translateFile(
        document.id,
        document.source_language || 'en',
        targetLanguage,
        document.domain || 'general'
      );
      
      setTranslationResult(result);
    } catch (err) {
      setError('Translation failed: ' + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTextToSpeech = async (document) => {
    try {
      if (document.type === 'document') {
        // For documents, we need to extract text first
        setError('Text-to-speech for documents requires text extraction. Please use the document viewer first.');
        return;
      }
      
      // For audio files, we can play them directly
      if (document.type === 'audio') {
        const audioBlob = await apiService.downloadAudio(document.filename);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
        }
        
        setCurrentAudio(audio);
        audio.play();
        setIsPlaying(true);
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
      }
    } catch (err) {
      setError('Text-to-speech failed: ' + err.message);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await apiService.deleteFile(documentId);
        setDocuments(documents.filter(doc => doc.id !== documentId));
      } catch (err) {
        setError('Failed to delete document: ' + err.message);
      }
    }
  };

  const handleBookRead = async (document) => {
    try {
      setSelectedDocument(document);
      setShowDocumentViewer(true);
      // For books, we can show the extracted text content
      if (document.extracted_text) {
        // Text is already available from upload
        console.log('Book text available:', document.extracted_text);
      } else {
        // Fetch file details to get extracted text
        const details = await apiService.getFileDetails(document.id);
        if (details.extracted_text) {
          setSelectedDocument({...document, extracted_text: details.extracted_text});
        }
      }
    } catch (err) {
      setError('Failed to load book content: ' + err.message);
    }
  };

  const handleBookTranslate = async (document) => {
    try {
      setIsTranslating(true);
      setError(null);
      
      // For books, we can translate the extracted text
      const textToTranslate = document.extracted_text || 'Book content not extracted yet.';
      
      const result = await apiService.translateText({
        text: textToTranslate,
        source_language: document.source_language || 'en',
        target_language: targetLanguage,
        domain: document.domain || 'education'
      });
      
      setTranslationResult(result);
    } catch (err) {
      setError('Book translation failed: ' + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBookToSpeech = async (document) => {
    try {
      if (!document.extracted_text) {
        setError('Book text not available for text-to-speech. Please view the book first to extract text.');
        return;
      }

      // Use the extracted text for TTS
      const result = await apiService.textToSpeech(
        document.extracted_text.substring(0, 1000), // Limit to first 1000 chars for demo
        targetLanguage,
        1.0,
        'mp3'
      );

      if (result.output_file) {
        // Download and play the generated audio
        const audioBlob = await apiService.downloadAudio(result.output_file.split('/').pop());
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
        }
        
        setCurrentAudio(audio);
        audio.play();
        setIsPlaying(true);
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
      }
    } catch (err) {
      setError('Book text-to-speech failed: ' + err.message);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || getFileType(doc.filename) === filterType;
    return matchesSearch && matchesFilter;
  });

  const features = [
    {
      icon: <FileText size={24} />,
      title: "Document Translation",
      description: "Translate PDFs, Word docs, and text files with 99% accuracy",
      link: "/document-translation"
    },
    {
      icon: <Volume2 size={24} />,
      title: "Audio Localization",
      description: "Convert speech to multiple languages with natural voice",
      link: "/audio-localization"
    },
    {
      icon: <Video size={24} />,
      title: "Video Localization",
      description: "Generate subtitles and professional dubbing",
      link: "/video-localization"
    },
    {
      icon: <Globe size={24} />,
      title: "Platform Integration",
      description: "Seamless LMS, NCVET, and MSDE connectivity",
      link: "/integration"
    }
  ];

  const stats = [
    { number: "22+", label: "Languages Supported", description: "Including all major Indian languages" },
    { number: "99.2%", label: "Translation Accuracy", description: "Industry-leading precision" },
    { number: "< 5s", label: "Processing Time", description: "Lightning-fast results" },
    { number: "3", label: "Content Types", description: "Text, Audio, and Video" }
  ];

  const benefits = [
    {
      icon: <Zap style={{color: '#FF9933'}} size={24} />,
      title: "Lightning Fast",
      description: "Process content in seconds, not hours"
    },
    {
      icon: <Shield style={{color: '#138808'}} size={24} />,
      title: "Enterprise Security",
      description: "Bank-grade encryption and data protection"
    },
    {
      icon: <CheckCircle style={{color: '#000080'}} size={24} />,
      title: "Guaranteed Quality",
      description: "AI-verified translations with human-level accuracy"
    },
    {
      icon: <Star style={{color: '#FF9933'}} size={24} />,
      title: "24/7 Support",
      description: "Round-the-clock technical assistance"
    }
  ];

  const integrations = [
    {
      name: "Learning Management Systems",
      logo: <BookOpen style={{color: '#000080'}} size={32} />,
      description: "Seamless integration with popular LMS platforms"
    },
    {
      name: "NCVET Platform",
      logo: <Award style={{color: '#138808'}} size={32} />,
      description: "Direct connectivity to National Council for Vocational Education"
    },
    {
      name: "MSDE Systems",
      logo: <Users style={{color: '#FF9933'}} size={32} />,
      description: "Ministry of Skill Development and Entrepreneurship alignment"
    }
  ];

  return (
    <div className="min-h-screen" style={{backgroundColor: '#fff7ed'}}>
      {/* Hero Section */}
      <div className="bg-white py-16 border-b-4" style={{borderColor: '#FF9933'}}>
        <div className="container">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" 
                 style={{backgroundColor: '#fff7ed', border: '2px solid #FF9933', color: '#000080'}}>
              <Award size={16} className="text-orange-500" />
              <span className="font-bold">Smart India Hackathon 2025</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto" style={{color: '#000080'}}>
              AI-Powered Multilingual
              <span className="block mt-2" style={{color: '#FF9933'}}>
                Content Localization Engine
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{color: '#4b5563'}}>
              Transform educational content across 22+ languages with AI. 
              Translate documents, localize audio, generate video subtitles, and integrate 
              with LMS, NCVET, and MSDE platforms.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/document-translation" className="btn-primary inline-flex items-center gap-2">
                <FileText size={20} />
                Start Translating
                <ArrowRight size={20} />
              </Link>
              
              <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
                <Video size={20} />
                View Demo
                <ChevronRight size={20} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg" 
                     style={{backgroundColor: '#fff7ed', border: '1px solid #FFB366'}}>
                  <div className="text-3xl font-bold mb-2" style={{color: '#FF9933'}}>{stat.number}</div>
                  <div className="font-semibold mb-1" style={{color: '#000080'}}>{stat.label}</div>
                  <div className="text-sm" style={{color: '#4b5563'}}>{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Management Section */}
      <div className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#000080'}}>Your Document Library</h2>
            <p className="text-lg max-w-3xl mx-auto" style={{color: '#4b5563'}}>
              Manage, view, translate, and process all your uploaded content in one place
            </p>
            
            {/* Book Features Highlight */}
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">📚 Book Management Features</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Automatic text extraction from PDFs, EPUB, MOBI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Full book translation to 22+ languages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Text-to-speech for audio book creation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="document">Documents</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="image">Images</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={loadDocuments}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Refresh
              </button>
              <button
                onClick={() => {
                  console.log('Current documents:', documents);
                  console.log('Book files:', documents.filter(doc => isBookFile(doc.filename)));
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Debug Books
              </button>
            </div>
          </div>

          {/* Documents Summary */}
          {!loading && documents.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Total Files: {documents.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Books: {documents.filter(doc => isBookFile(doc.filename)).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Audio: {documents.filter(doc => getFileType(doc.filename) === 'audio').length}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* Documents Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading documents...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first document to get started'
                }
              </p>
              <Link to="/document-translation" className="btn-primary">
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="card hover:shadow-lg transition-shadow">
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                           style={{backgroundColor: '#fff7ed', color: '#FF9933'}}>
                        {isBookFile(doc.filename) ? getBookIcon(doc.filename) : getFileIcon(doc.filename)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate" title={doc.filename}>
                            {doc.filename}
                          </h3>
                          {isBookFile(doc.filename) && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Book
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size || 0)} • {getFileType(doc.filename)}
                          {doc.text_metadata && (
                            <span className="ml-2 text-xs text-blue-600">
                              • {doc.text_metadata.word_count} words
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(doc.uploaded_at || doc.created_at)}
                    </div>
                    {doc.domain && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        {doc.domain}
                      </div>
                    )}
                    {doc.source_language && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Languages className="w-4 h-4 mr-2" />
                        {doc.source_language}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isBookFile(doc.filename) ? (
                    // Book-specific actions
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBookRead(doc)}
                          className="btn-primary text-sm flex items-center justify-center gap-1"
                        >
                          <BookOpen className="w-4 h-4" />
                          Read Book
                        </button>
                        <button
                          onClick={() => handleBookTranslate(doc)}
                          disabled={isTranslating}
                          className="btn-secondary text-sm flex items-center justify-center gap-1"
                        >
                          {isTranslating ? <Loader className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                          Translate
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBookToSpeech(doc)}
                          className="btn-secondary text-sm flex items-center justify-center gap-1"
                        >
                          {isPlaying && currentAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          Audio Book
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="btn-danger text-sm flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Regular document actions
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="btn-secondary text-sm flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleTranslateDocument(doc)}
                          disabled={isTranslating}
                          className="btn-primary text-sm flex items-center justify-center gap-1"
                        >
                          {isTranslating ? <Loader className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                          Translate
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleTextToSpeech(doc)}
                          className="btn-secondary text-sm flex items-center justify-center gap-1"
                        >
                          {isPlaying && currentAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {getFileType(doc.filename) === 'audio' ? 'Play' : 'TTS'}
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="btn-danger text-sm flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Translation Result Display */}
          {translationResult && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Translation Complete
              </h3>
              <div className="bg-white p-4 rounded-lg">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(translationResult, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => setTranslationResult(null)}
                className="mt-4 btn-secondary"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                     style={{backgroundColor: '#fff7ed', color: '#FF9933'}}>
                  {getFileIcon(selectedDocument.filename)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.filename}</h2>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedDocument.size || 0)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isBookFile(selectedDocument.filename) ? (
                // Book Viewer
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-orange-600" />
                      Book Content
                    </h3>
                    {selectedDocument.text_metadata && (
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span>📄 {selectedDocument.text_metadata.pages || 1} pages</span>
                        <span>📝 {selectedDocument.text_metadata.word_count || 0} words</span>
                        <span>🔤 {selectedDocument.text_metadata.char_count || 0} characters</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedDocument.extracted_text ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {selectedDocument.extracted_text}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">Book content not extracted yet</p>
                      <button
                        onClick={() => handleBookRead(selectedDocument)}
                        className="btn-primary"
                      >
                        Extract Book Content
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleBookTranslate(selectedDocument)}
                      disabled={isTranslating || !selectedDocument.extracted_text}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isTranslating ? <Loader className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                      Translate Book
                    </button>
                    <button
                      onClick={() => handleBookToSpeech(selectedDocument)}
                      disabled={!selectedDocument.extracted_text}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Audio Book
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                // Regular Document Viewer
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Document Viewer</h3>
                  <p className="text-gray-500 mb-6">
                    Document preview functionality will be implemented here
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleTranslateDocument(selectedDocument)}
                      disabled={isTranslating}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isTranslating ? <Loader className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                      Translate Document
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#000080'}}>Complete Localization Solution</h2>
            <p className="text-lg max-w-3xl mx-auto" style={{color: '#4b5563'}}>
              Everything you need to make your content accessible across languages and platforms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="card text-center hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{borderColor: '#FFB366', backgroundColor: '#fff'}}
              >
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" 
                     style={{backgroundColor: '#fff7ed', color: '#FF9933'}}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: '#000080'}}>
                  {feature.title}
                </h3>
                <p className="mb-4" style={{color: '#4b5563'}}>
                  {feature.description}
                </p>
                <div className="inline-flex items-center font-medium text-sm" style={{color: '#FF9933'}}>
                  <span>Try Now</span>
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16" style={{backgroundColor: '#fff7ed'}}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#000080'}}>Why Choose Our Platform</h2>
            <p className="text-lg max-w-3xl mx-auto" style={{color: '#4b5563'}}>
              Built with cutting-edge AI technology and designed for enterprise-level performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="card text-center" style={{borderColor: '#FFB366', backgroundColor: '#fff'}}>
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg" 
                     style={{backgroundColor: '#fff7ed'}}>
                  {benefit.icon}
                </div>
                <h3 className="font-bold mb-2" style={{color: '#000080'}}>{benefit.title}</h3>
                <p className="text-sm" style={{color: '#4b5563'}}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Section */}
      <div className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#000080'}}>Platform Integration</h2>
            <p className="text-lg max-w-3xl mx-auto" style={{color: '#4b5563'}}>
              Connect seamlessly with India's leading educational and skill development platforms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow" 
                   style={{borderColor: '#FFB366', backgroundColor: '#fff'}}>
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" 
                     style={{backgroundColor: '#fff7ed'}}>
                  {integration.logo}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: '#000080'}}>{integration.name}</h3>
                <p style={{color: '#4b5563'}}>{integration.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/integration" className="btn-primary inline-flex items-center gap-2">
              <FileText size={20} />
              View API Documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-16 text-white" style={{backgroundColor: '#FF9933'}}>
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Content?</h2>
            <p className="text-lg mb-8" style={{color: '#fff7ed'}}>
              Join thousands of educators and organizations already using our AI localization platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/document-translation" 
                className="bg-white hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                style={{color: '#000080'}}
              >
                <FileText size={20} />
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              
              <Link 
                to="/about" 
                className="border-2 border-white text-white hover:bg-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                style={{'--hover-color': '#000080'}}
                onMouseEnter={(e) => e.target.style.color = '#000080'}
                onMouseLeave={(e) => e.target.style.color = 'white'}
              >
                <BookOpen size={20} />
                Learn More
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <div className="py-12 text-white" style={{backgroundColor: '#000080'}}>
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award style={{color: '#FF9933'}} size={28} />
              <h3 className="text-2xl font-bold text-white">Team SafeHorizon</h3>
            </div>
            <p className="text-lg mb-2" style={{color: '#FFB366'}}>Smart India Hackathon 2025</p>
            <p className="text-sm" style={{color: '#fff7ed'}}>
              Problem Statement ID: 25203 • AI-Powered Multilingual Content Localization Engine
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-6 h-4" style={{backgroundColor: '#FF9933'}}></div>
              <div className="w-6 h-4 bg-white"></div>
              <div className="w-6 h-4" style={{backgroundColor: '#138808'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
