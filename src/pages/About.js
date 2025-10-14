import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Code, Globe, Zap, Shield, Award, Target } from 'lucide-react';
import { API_ENDPOINTS, DEFAULT_LANGUAGES } from '../utils/constants';

export default function About() {
  const [languages, setLanguages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(API_ENDPOINTS.supportedLanguages)
      .then(res => {
        if (res.data && res.data.supported_languages) {
          setLanguages(Object.entries(res.data.supported_languages));
        }
      })
      .catch(err => {
        console.error('Failed to fetch languages');
        // Fallback to default languages when API is not available
        setLanguages(DEFAULT_LANGUAGES);
      });
  }, []);

  const solutions = [
    { icon: <Code className="w-6 h-6" />, title: "Document Translation", desc: "Upload PDFs, DOCX, TXT files and get accurate translations with confidence scores" },
    { icon: <Zap className="w-6 h-6" />, title: "Audio Localization", desc: "Speech-to-text, translation, and text-to-speech pipeline for audio content" },
    { icon: <Globe className="w-6 h-6" />, title: "Video Localization", desc: "Generate subtitles in Indian languages for video content" },
    { icon: <Shield className="w-6 h-6" />, title: "LMS Integration", desc: "Seamless integration with NCVET, MSDE, and other learning platforms" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
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
            <h1 className="text-xl font-bold text-gray-900">About Our Project</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-skillBlue to-indigo-600 rounded-2xl mb-6">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-skillBlue via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Team SafeHorizon
          </h1>
          <p className="text-xl text-gray-600 mb-2">Smart India Hackathon 2025</p>
          <p className="text-lg text-gray-500">Problem Statement ID: 25203</p>
        </div>

        {/* Problem Statement */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-gray-200 shadow-lg">
          <div className="flex items-center mb-6">
            <Target className="w-8 h-8 text-skillBlue mr-4" />
            <h2 className="text-3xl font-bold text-gray-900">Problem Statement</h2>
          </div>
          <div className="bg-gradient-to-r from-skillBlue to-indigo-600 text-white rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3">AI-Powered Multilingual Content Localization Engine</h3>
            <p className="text-lg opacity-95">
              Develop an AI-powered solution that can automatically translate and localize content 
              across multiple Indian languages while preserving cultural context and domain-specific terminology.
            </p>
          </div>
        </div>

        {/* Solution Features */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-gray-200 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-skillBlue text-white rounded-xl mr-4">
                    {solution.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{solution.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{solution.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Languages */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-center mb-8">
            <Globe className="w-8 h-8 text-skillBlue mr-4" />
            <h2 className="text-3xl font-bold text-gray-900">Supported Languages</h2>
            <span className="ml-4 bg-skillBlue text-white px-4 py-2 rounded-full font-semibold">
              {languages.length} Languages
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {languages.map(([code, name]) => (
              <div key={code} className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <span className="font-mono text-sm bg-skillBlue text-white px-3 py-1 rounded-lg mr-3">{code}</span>
                <span className="font-medium text-gray-800">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-center mb-8">
            <Code className="w-8 h-8 text-skillBlue mr-4" />
            <h2 className="text-3xl font-bold text-gray-900">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 text-blue-600 mr-2" />
                Frontend Technologies
              </h3>
              <div className="space-y-3">
                {['React.js with Hooks', 'TailwindCSS for styling', 'Axios for API calls', 'React Router DOM', 'Lucide React icons'].map((tech, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-6 h-6 text-purple-600 mr-2" />
                Backend & AI
              </h3>
              <div className="space-y-3">
                {['FastAPI Python framework', 'IndicTrans2 for translation', 'Whisper for speech recognition', 'VITS/Tacotron2 for TTS', 'PostgreSQL database'].map((tech, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-r from-skillBlue via-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Users className="w-12 h-12 mr-4" />
            <h2 className="text-4xl font-bold">Team SafeHorizon</h2>
          </div>
          <p className="text-xl mb-6 opacity-95">
            Empowering multilingual communication across India through AI-powered localization technology
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <p className="text-lg font-medium mb-2">Built for Smart India Hackathon 2025</p>
            <p className="opacity-90">Designed for evaluators and learning institutions across India 🇮🇳</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="bg-white text-skillBlue px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Explore Our Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}