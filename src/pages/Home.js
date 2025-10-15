import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, Video, Building2, Sparkles, Globe, Zap, Shield } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

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
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-blue-200/50 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Smart India Hackathon 2025</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
              <span className="gradient-text">AI-Powered</span>
              <br />
              <span className="text-gray-900">Multilingual</span>
              <br />
              <span className="gradient-text">Content Localization</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed text-balance">
              Transform your content across <span className="font-semibold text-blue-600">22 Indian languages</span> with 
              cutting-edge AI technology. Fast, accurate, and culturally aware translations.
            </p>

            {/* Stats Grid */}
            <div className="grid-4 mb-12 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="card p-4 text-center group hover-lift">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <div className="text-blue-600">{stat.icon}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your <span className="gradient-text">Localization</span> Method
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-balance">
              Select from our comprehensive suite of AI-powered translation and localization tools
            </p>
          </div>

          <div className="grid-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate(feature.route)}
                className="group cursor-pointer card p-6 hover-lift"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} text-white mb-4 group-hover:scale-105 transition-transform duration-200 shadow-md`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-lg mb-6 opacity-90 text-balance">
              Join the future of multilingual communication in India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/document')}
                className="btn bg-white text-blue-600 font-semibold hover:bg-gray-100 px-6 py-3 rounded-lg shadow-md"
              >
                Start Translating Now
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="btn border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
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
