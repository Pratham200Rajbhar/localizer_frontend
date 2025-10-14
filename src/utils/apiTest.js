// Debug utility for API testing
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const testAPI = async () => {
  console.log('Testing API connectivity...');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', healthResponse.data);
    
    // Test supported languages
    const languagesResponse = await axios.get(`${API_BASE_URL}/supported-languages`);
    console.log('Supported languages:', languagesResponse.data);
    
    // Test simple translation
    const translationResponse = await axios.post(`${API_BASE_URL}/translate`, {
      text: "Hello",
      source_language: "en", 
      target_languages: ["hi"],
      domain: "general"
    });
    console.log('Translation test:', translationResponse.data);
    
    return {
      health: healthResponse.data,
      languages: languagesResponse.data,
      translation: translationResponse.data
    };
  } catch (error) {
    console.error('API Test Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return { error: error.message };
  }
};

// Call this function when the app loads
window.testAPI = testAPI;