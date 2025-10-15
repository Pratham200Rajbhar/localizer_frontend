import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Code, Globe, Zap, Shield, Award, Target, ArrowLeft, CheckCircle, Star, Layers } from 'lucide-react';
import { DEFAULT_LANGUAGES } from '../utils/constants';

const About = () => {
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
    <div className="min-h-screen bg-gray-100">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Home
            </button>
          </div>
          
          <div className="max-w-4xl">
            <div className="flex items-start">
              <div className="icon-container-lg bg-blue-gradient mr-6">
                <Award size={32} className="text-white" />
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <h1 className="text-4xl font-bold mr-6 text-gray-900">
                    Team SafeHorizon
                  </h1>
                  <div className="badge-enterprise">
                    <Star className="w-4 h-4 mr-2" />
                    SIH 2025 Finalist
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 max-w-3xl mb-6">
                  Revolutionizing multilingual education through AI-powered content localization 
                  for India's diverse linguistic landscape.
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="badge-enterprise">
                    <Target size={16} className="mr-2" />
                    Problem Statement 25203
                  </div>
                  <div className="badge-enterprise">
                    <Globe size={16} className="mr-2" />
                    Smart India Hackathon 2025
                  </div>
                  <div className="badge-enterprise">
                    <Layers size={16} className="mr-2" />
                    AI-Powered Localization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">

        {/* Problem Statement */}
        <div className="card mb-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
            <Target className="mr-3 text-blue-600" size={28} />
            Problem Statement Analysis
          </h2>
          
          <div className="bg-gray-100">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">AI-Powered Multilingual Content Localization Engine</h3>
              <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">
                PS-25203
              </div>
            </div>
            <p className="text-lg opacity-90 leading-relaxed">
              Develop an AI-powered solution that can automatically translate and localize content 
              across multiple Indian languages while preserving cultural context and domain-specific terminology.
            </p>
          </div>
          
          {/* Challenge Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Challenge
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                India's linguistic diversity creates barriers in educational content accessibility, 
                limiting learning opportunities across regions.
              </p>
            </div>
            
            <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Impact
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Millions of students and professionals face language barriers when accessing 
                quality educational and training content.
              </p>
            </div>
            
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Solution
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                AI-powered localization engine that preserves context while making content 
                accessible in 22+ Indian languages.
              </p>
            </div>
          </div>
        </div>

        {/* Solution Features */}
        <div className="card mb-12">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 text-center">
            Comprehensive Localization Solution
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Our platform provides end-to-end multilingual content processing with enterprise-grade 
            accuracy and seamless platform integrations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="group p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start mb-6">
                  <div className="w-14 h-14 bg-blue-gradient rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {solution.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{solution.title}</h3>
                    <p className=" text-gray-600 leading-relaxed">{solution.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Production Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Languages */}
        <div className="card mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-gradient rounded-2xl flex items-center justify-center mr-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  Multilingual Support
                  <span className="ml-4 bg-green-gradient text-white px-4 py-2 rounded-xl text-lg font-bold">
                    {languages.length}+ Languages
                  </span>
                </h2>
                <p className=" text-gray-600 mt-2">
                  Comprehensive coverage of Indian regional languages with cultural context preservation
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {languages.map(([code, name]) => (
              <div key={code} className="group flex items-center bg-gray-100">
                <span className="font-mono text-sm bg-blue-gradient text-white px-3 py-2 rounded-lg mr-3 font-bold group-hover:scale-110 transition-transform duration-300">
                  {code}
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Language Features */}
          <div className="mt-8 p-6 bg-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              Advanced Language Processing Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Cultural context preservation across translations</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Domain-specific terminology handling</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Real-time confidence scoring for quality assurance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-purple-gradient rounded-2xl flex items-center justify-center mr-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enterprise Technology Stack</h2>
                <p className=" text-gray-600 mt-2">
                  Built with modern, scalable technologies for production-grade performance
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend Stack */}
            <div className="p-8 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-10 h-10 bg-blue-gradient rounded-lg flex items-center justify-center mr-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                Frontend Architecture
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'React 19.2.0', desc: 'Modern component-based UI framework' },
                  { name: 'TailwindCSS 3.4', desc: 'Utility-first CSS with custom design system' },
                  { name: 'React Router', desc: 'Client-side routing and navigation' },
                  { name: 'Lucide Icons', desc: 'Professional iconography system' }
                ].map((tech, index) => (
                  <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-blue-100">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{tech.name}</span>
                      <p className="text-xs text-gray-600 mt-1">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Stack */}
            <div className="p-8 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-10 h-10 bg-purple-gradient rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                AI Processing Engine
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'FastAPI', desc: 'High-performance Python web framework' },
                  { name: 'Whisper AI', desc: 'OpenAI speech recognition and synthesis' },
                  { name: 'IndicTrans2', desc: 'State-of-the-art Indian language translation' },
                  { name: 'ML Pipeline', desc: 'Custom AI processing and optimization' }
                ].map((tech, index) => (
                  <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-purple-100">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{tech.name}</span>
                      <p className="text-xs text-gray-600 mt-1">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="mt-8 p-6 bg-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 text-green-600 mr-2" />
              Performance Benchmarks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">95%+</div>
                <div className="text-sm text-gray-600">Translation Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">&lt;2s</div>
                <div className="text-sm text-gray-600">Average Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">22+</div>
                <div className="text-sm text-gray-600">Supported Languages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">99.9%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="relative bg-gray-50">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                <Users className="w-10 h-10" />
              </div>
              <div className="text-left">
                <h2 className="text-4xl font-bold mb-2">Team SafeHorizon</h2>
                <p className="text-xl opacity-90">Innovation Through Collaboration</p>
              </div>
            </div>
            
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
              Empowering India's multilingual education ecosystem through cutting-edge AI technology 
              and deep understanding of cultural linguistics.
            </p>
            
            {/* Achievement Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <Award className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Smart India Hackathon</h3>
                <p className="text-sm opacity-90">2025 National Competition</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <Target className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Problem Statement</h3>
                <p className="text-sm opacity-90">PS-25203 Localization</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <Globe className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Impact Vision</h3>
                <p className="text-sm opacity-90">Pan-India Accessibility</p>
              </div>
            </div>
            
            {/* Mission Statement */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg leading-relaxed opacity-95">
                "To break down language barriers in Indian education by creating an AI-powered 
                localization platform that preserves cultural context while making quality content 
                accessible to every learner, regardless of their linguistic background."
              </p>
            </div>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/')} 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explore Our Platform
              </button>
              <button 
                onClick={() => navigate('/document-translation')} 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Try Demo Now
              </button>
            </div>
            
            {/* Footer Note */}
            <p className="mt-8 text-sm opacity-75">
              🇮🇳 Proudly contributing to Digital India and educational accessibility initiatives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;


