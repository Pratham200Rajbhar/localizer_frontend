# AI-Powered Multilingual Content Localization Engine - Frontend Demo

**Team SafeHorizon | Smart India Hackathon 2025**  
**Problem Statement ID: 25203**

## 🚀 Project Overview

A React-based frontend demonstration of an AI-powered multilingual translation and localization system supporting 22 Indian languages. This application provides intuitive interfaces showcasing document translation, audio localization, video subtitling, and enterprise LMS integration capabilities.

> **Note**: This is a frontend-only demonstration with simulated backend functionality for evaluation purposes.

## ✨ Features

- **📄 Document Translation**: Demo interface for PDF/DOCX/TXT file translation
- **🎵 Audio Localization**: Simulated speech-to-text → translation → text-to-speech pipeline
- **🎥 Video Localization**: Demo subtitle generation in Indian languages
- **🏢 LMS Integration**: NCVET, MSDE, and LMS platform integration demos with sample API responses
- **🌍 22 Indian Languages**: Complete language support showcase
- **🎨 Clean UI**: Professional design with TailwindCSS and Skill India branding

## 🛠️ Tech Stack

- **Frontend**: React.js, TailwindCSS, React Router DOM
- **Icons**: Lucide React
- **Fonts**: Poppins, Inter
- **Demo Mode**: Static demonstration with simulated processing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The `.env` file is already configured:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

### 3. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── Home.js                 # Landing page with navigation
│   ├── DocumentTranslation.js  # Document upload & translation
│   ├── AudioLocalization.js    # Audio translation pipeline
│   ├── VideoLocalization.js    # Video subtitle generation
│   ├── Integration.js          # LMS/NCVET/MSDE integration
│   └── About.js               # Project information
├── App.js                     # Main routing component
├── App.css                    # TailwindCSS configuration
└── index.css                  # Global styles & fonts

public/
└── demo-assets/               # Demo files for testing
    ├── demo_book_english.pdf
    ├── demo_book_hindi.pdf
    ├── demo_audio.mp3
    └── demo_video.mp4
```

## 🎯 Page Navigation

| Page | Route | Purpose |
|------|-------|---------|
| **Home** | `/` | Landing page with module navigation |
| **Document Translation** | `/document` | File upload → translation workflow |
| **Audio Localization** | `/audio` | Speech translation pipeline |
| **Video Localization** | `/video` | Video subtitle generation |
| **LMS Integration** | `/integration` | Enterprise platform integration demos |
| **About** | `/about` | Project details and team information |

## 🔧 Demo Features

All pages provide interactive demonstrations:

- **Static Data**: Pre-configured language support and demo content
- **Simulated Processing**: Realistic workflow demonstrations
- **File Handling**: Mock file upload and download functionality
- **Audio Processing**: Simulated speech-to-text and translation workflows
- **Video Processing**: Demo subtitle generation and formatting
- **Integration Demos**: Mock API responses for enterprise platforms

## 🎨 Design System

### Colors
- **Primary**: Skill India Blue (`#004aad`)
- **Background**: White
- **Cards**: Light gray (`bg-gray-50`)
- **Text**: Gray scale

### Typography
- **Primary Font**: Poppins (headings, UI elements)
- **Secondary Font**: Inter (body text)
- **Weights**: 400 (regular), 700 (bold)

## 🧪 Testing

### Manual Testing Flow
1. **Home** → Verify navigation buttons work
2. **Document** → Upload file → Detect language → Translate
3. **Audio** → Upload audio → Select target language → Generate translated audio
4. **Video** → Upload video → Generate subtitles → Download
5. **Integration** → Upload file → Check status → Download result
6. **About** → Verify project information and supported languages

### Demo Files
Use the files in `/public/demo-assets/` for testing:
- PDF documents for document translation
- Audio/video files for media processing

## 👥 Team SafeHorizon

**Smart India Hackathon 2025**  
Empowering multilingual communication across India through AI-powered localization technology.

---

**🎯 Evaluator Flow**
1. Home → Introduction and navigation
2. Document → File upload and translation demo
3. Audio → Audio localization workflow
4. Video → Video subtitle generation
5. Integration → API integration demonstrations
6. About → Project context and technical details

**Built for evaluators and learning institutions across India** 🇮🇳
