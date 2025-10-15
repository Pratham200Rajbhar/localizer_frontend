import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Code, Globe, Zap, Shield, Award, Target } from 'lucide-react';
import { DEFAULT_LANGUAGES } from '../utils/constants';

export default function About() {
  const navigate = useNavigate();
  
  // Use static languages data
  const languages = DEFAULT_LANGUAGES;

  const solutions = [
    { icon: <Code className="w-6 h-6" />, title: "Document Translation", desc: "Upload PDFs, DOCX, TXT files and get accurate translations with confidence scores" },
    { icon: <Zap className="w-6 h-6" />, title: "Audio Localization", desc: "Speech-to-text, translation, and text-to-speech pipeline for audio content" },
    { icon: <Globe className="w-6 h-6" />, title: "Video Localization", desc: "Generate subtitles in Indian languages for video content" },
    { icon: <Shield className="w-6 h-6" />, title: "LMS Integration", desc: "Seamless integration with NCVET, MSDE, and other learning platforms" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Team SafeHorizon
          </h1>
          <p className="text-lg text-gray-600 mb-2">Smart India Hackathon 2025</p>
          <p className="text-md text-gray-500">Problem Statement ID: 25203</p>
        </div>

        {/* Problem Statement */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Problem Statement</h2>
          </div>
          <div className="bg-blue-600 text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">AI-Powered Multilingual Content Localization Engine</h3>
            <p className="text-sm">
              Develop an AI-powered solution that can automatically translate and localize content 
              across multiple Indian languages while preserving cultural context and domain-specific terminology.
            </p>
          </div>
        </div>

        {/* Solution Features */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg mr-3">
                    {solution.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{solution.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{solution.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Languages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Supported Languages</h2>
            <span className="ml-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {languages.length}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {languages.map(([code, name]) => (
              <div key={code} className="flex items-center bg-blue-50 rounded-lg p-3 border border-blue-100">
                <span className="font-mono text-xs bg-blue-600 text-white px-2 py-1 rounded mr-2">{code}</span>
                <span className="text-sm text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Code className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                Frontend
              </h3>
              <div className="space-y-2">
                {['React.js', 'TailwindCSS', 'React Router', 'Lucide Icons'].map((tech, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                Backend (Demo)
              </h3>
              <div className="space-y-2">
                {['FastAPI', 'Whisper AI', 'IndicTrans2', 'AI Processing'].map((tech, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white shadow-md">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 mr-3" />
            <h2 className="text-3xl font-bold">Team SafeHorizon</h2>
          </div>
          <p className="text-lg mb-4">
            Empowering multilingual communication across India through AI-powered localization
          </p>
          <div className="bg-white/20 rounded-lg p-4 mb-6">
            <p className="font-medium mb-1">Smart India Hackathon 2025</p>
            <p className="text-sm opacity-90">For evaluators and learning institutions across India 🇮🇳</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore Platform
          </button>
        </div>
      </div>
    </div>
  );
}