# AI-Powered Multilingual Content Localization Engine

**Team SafeHorizon | Smart India Hackathon 2025**  
**Problem Statement ID: 25203**

## 🚀 Project Overview

A comprehensive React-based frontend for an AI-powered multilingual translation and localization system supporting 22 Indian languages. This application provides intuitive interfaces for document translation, audio localization, video subtitling, and enterprise LMS integration.

## ✨ Features

- **📄 Document Translation**: Upload PDF/DOCX/TXT files with auto language detection
- **🎵 Audio Localization**: Complete speech-to-text → translation → text-to-speech pipeline
- **🎥 Video Localization**: Generate subtitles in Indian languages
- **🏢 LMS Integration**: NCVET, MSDE, and LMS platform integration with API demos
- **🌍 22 Indian Languages**: Complete support for all major Indian languages
- **🎨 Clean UI**: Professional design with TailwindCSS and Skill India branding

## 🛠️ Tech Stack

- **Frontend**: React.js, TailwindCSS, React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Fonts**: Poppins, Inter
- **Backend API**: FastAPI (separate repository)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

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

## 🔧 API Integration

All pages are configured to work with the FastAPI backend:

- **Base URL**: `${process.env.REACT_APP_API_URL}` (configurable)
- **Supported Languages**: `/supported-languages`
- **Document APIs**: `/content/upload`, `/detect-language`, `/translate`
- **Audio APIs**: `/speech/translate`, `/speech/download/{filename}`
- **Video APIs**: `/video/localize`, `/video/download/{filename}`
- **Integration APIs**: `/integration/upload`, `/integration/status`, `/integration/download/{job_id}/{language}/{filename}`

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
