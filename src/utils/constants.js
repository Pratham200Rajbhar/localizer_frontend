// API configuration and constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Default supported languages fallback (matching the 22 Indian languages from API)
export const DEFAULT_LANGUAGES = [
  ['as', 'Assamese'],
  ['bn', 'Bengali'],
  ['brx', 'Bodo'],
  ['doi', 'Dogri'],
  ['gu', 'Gujarati'],
  ['hi', 'Hindi'],
  ['kn', 'Kannada'],
  ['ks', 'Kashmiri'],
  ['kok', 'Konkani'],
  ['mai', 'Maithili'],
  ['ml', 'Malayalam'],
  ['mni', 'Manipuri'],
  ['mr', 'Marathi'],
  ['ne', 'Nepali'],
  ['or', 'Odia'],
  ['pa', 'Punjabi'],
  ['sa', 'Sanskrit'],
  ['sat', 'Santali'],
  ['sd', 'Sindhi'],
  ['ta', 'Tamil'],
  ['te', 'Telugu'],
  ['ur', 'Urdu']
];

// API endpoints
export const API_ENDPOINTS = {
  supportedLanguages: `${API_BASE_URL}/supported-languages`,
  contentUpload: `${API_BASE_URL}/content/upload`,
  detectLanguage: `${API_BASE_URL}/detect-language`,
  translate: `${API_BASE_URL}/translate`,
  speechTranslate: `${API_BASE_URL}/speech/translate`,
  videoLocalize: `${API_BASE_URL}/video/localize`,
  integrationUpload: `${API_BASE_URL}/integration/upload`,
  integrationStatus: `${API_BASE_URL}/integration/status`,
};

// Error messages
export const ERROR_MESSAGES = {
  networkError: 'Network error - please check your connection',
  serverError: 'Server error - please try again later',
  fileUploadError: 'File upload failed - please try a different file',
  translationError: 'Translation failed - please try again',
  languageDetectionError: 'Language detection failed',
  invalidResponse: 'Invalid response from server',
};