import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, Video, Building2, Sparkles, Globe, Zap, Shield } from 'lucide-react';
import { testAPI } from '../utils/apiTest';

export default function Home() {
  const navigate = useNavigate();
  
  // Test API on component mount
  React.useEffect(() => {
    testAPI().then(result => {
      console.log('API Test Result:', result);
    });
  }, []);

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Translation",
      description: "Upload and translate documents across 22 Indian languages with AI precision",
      route: "/document",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Audio Localization", 
      description: "Convert speech to text, translate, and generate natural-sounding audio",
      route: "/audio",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Localization",
      description: "Generate accurate subtitles and dubbing for video content",
      route: "/video", 
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Enterprise Integration",
      description: "Seamless integration with LMS, NCVET, and MSDE platforms",
      route: "/integration",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "22", label: "Indian Languages", icon: <Globe className="w-6 h-6" /> },
    { number: "95%", label: "Accuracy Rate", icon: <Zap className="w-6 h-6" /> },
    { number: "10x", label: "Faster Processing", icon: <Sparkles className="w-6 h-6" /> },
    { number: "100%", label: "Secure", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-skillBlue to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">SafeHorizon</span>
            </div>
            <button 
              onClick={() => navigate('/about')}
              className="px-4 py-2 text-skillBlue hover:bg-skillBlue hover:text-white rounded-lg transition-all duration-200 font-medium"
            >
              About Project
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 mb-8">
            <Sparkles className="w-4 h-4 text-skillBlue mr-2" />
            <span className="text-sm font-medium text-gray-700">Smart India Hackathon 2025</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-skillBlue via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            AI-Powered Multilingual
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-skillBlue bg-clip-text text-transparent">
              Content Localization
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your content across <span className="font-semibold text-skillBlue">22 Indian languages</span> with 
            cutting-edge AI technology. Fast, accurate, and culturally aware translations.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-center mb-2 text-skillBlue">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-skillBlue">Localization</span> Method
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select from our comprehensive suite of AI-powered translation and localization tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate(feature.route)}
                className="group cursor-pointer bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:shadow-skillBlue/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-skillBlue transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-skillBlue font-semibold group-hover:translate-x-2 transition-transform duration-200">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-skillBlue via-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Content?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join the future of multilingual communication in India
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/document')}
                  className="px-8 py-4 bg-white text-skillBlue font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                >
                  Start Translating Now
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-skillBlue transition-all duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-skillBlue to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Team SafeHorizon</span>
          </div>
          <p className="text-gray-600">
            Built for Smart India Hackathon 2025 • Problem Statement 25203
          </p>
        </div>
      </footer>
    </div>
  );
}
