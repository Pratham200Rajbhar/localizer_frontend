import React, { useState } from 'react';
import { 
  Play, Download, Upload, Languages, 
  Database, CheckCircle, AlertCircle, Loader, Copy, Home,
  Edit, Eye, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../utils/apiService';

function ApiTesting() {
  const [activeTest, setActiveTest] = useState('');
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [editableCurls, setEditableCurls] = useState({});
  const [editingCurl, setEditingCurl] = useState(null);

  // Test data
  const sampleText = "Welcome to the AI-powered multilingual content localization engine. This system can translate documents across 22 Indian languages with high accuracy.";
  const sampleQuiz = {
    "assessment": {
      "title": "Basic Computer Knowledge Quiz",
      "instructions": "Answer all questions carefully. Each question has only one correct answer.",
      "time_limit": 30,
      "questions": [
        {
          "id": 1,
          "type": "multiple_choice",
          "question": "What does CPU stand for?",
          "options": ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Computer Processing Unit"],
          "correct_answer": "Central Processing Unit"
        },
        {
          "id": 2,
          "type": "multiple_choice", 
          "question": "Which programming language is known as the backbone of web development?",
          "options": ["Python", "JavaScript", "Java", "C++"],
          "correct_answer": "JavaScript"
        }
      ]
    }
  };

  // API test configurations
  const apiTests = [
    {
      id: 'health',
      title: 'Health Check',
      description: 'Test if the API server is running',
      method: 'GET',
      endpoint: '/',
      curl: `curl -X GET http://localhost:8000/`,
      testFunction: async () => {
        return await apiService.checkHealth();
      }
    },
    {
      id: 'languages',
      title: 'Supported Languages',
      description: 'Get list of all supported languages',
      method: 'GET',
      endpoint: '/supported-languages',
      curl: `curl -X GET http://localhost:8000/supported-languages`,
      testFunction: async () => {
        return await apiService.getSupportedLanguages();
      }
    },
    {
      id: 'detect',
      title: 'Language Detection',
      description: 'Detect language of sample text',
      method: 'POST',
      endpoint: '/detect-language',
      curl: `curl -X POST http://localhost:8000/detect-language \\
  -H "Content-Type: application/json" \\
  -d '{"text": "${sampleText}"}'`,
      testFunction: async () => {
        const response = await apiService.detectLanguage({ text: sampleText });
        return response.data;
      }
    },
    {
      id: 'translate',
      title: 'Text Translation',
      description: 'Translate English text to Hindi',
      method: 'POST',
      endpoint: '/translate',
      curl: `curl -X POST http://localhost:8000/translate \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "${sampleText}",
    "source_language": "en",
    "target_languages": ["hi"],
    "domain": "general",
    "apply_localization": true
  }'`,
      testFunction: async () => {
        const response = await apiService.translateText({
          text: sampleText,
          source_language: "en",
          target_language: "hi",
          domain: "general",
          apply_localization: true
        });
        return response.data;
      }
    },
    {
      id: 'upload',
      title: 'File Upload',
      description: 'Upload a text file to the server',
      method: 'POST',
      endpoint: '/upload',
      curl: `curl -X POST http://localhost:8000/upload \\
  -F "file=@sample_document.txt"`,
      testFunction: async () => {
        // Create a sample file blob
        const blob = new Blob([sampleText], { type: 'text/plain' });
        const file = new File([blob], 'sample_document.txt', { type: 'text/plain' });
        const response = await apiService.uploadContent(file);
        return response.data;
      }
    },
    {
      id: 'assessment',
      title: 'Assessment Translation',
      description: 'Translate quiz/assessment to Hindi',
      method: 'POST',
      endpoint: '/assessment/translate',
      curl: `curl -X POST http://localhost:8000/assessment/translate \\
  -F "file=@sample_quiz.json" \\
  -F "target_language=hi" \\
  -F "domain=education"`,
      testFunction: async () => {
        // Create quiz file blob
        const blob = new Blob([JSON.stringify(sampleQuiz, null, 2)], { type: 'application/json' });
        const file = new File([blob], 'sample_quiz.json', { type: 'application/json' });
        
        return await apiService.translateAssessment(file, 'hi', 'education');
      }
    },
    {
      id: 'integration-status',
      title: 'Integration Service Status',
      description: 'Check LMS integration service status',
      method: 'GET',
      endpoint: '/integration/status',
      curl: `curl -X GET http://localhost:8000/integration/status`,
      testFunction: async () => {
        return await apiService.getIntegrationStatus();
      }
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      description: 'Get system performance metrics',
      method: 'GET',
      endpoint: '/performance',
      curl: `curl -X GET http://localhost:8000/performance`,
      testFunction: async () => {
        return await apiService.getPerformanceMetrics();
      }
    }
  ];

  // Execute API test
  const runTest = async (test) => {
    setActiveTest(test.id);
    setIsLoading(true);
    setError('');

    try {
      const result = await test.testFunction();
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (err) {
      setError(`Test "${test.title}" failed: ${err.message}`);
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          success: false,
          error: err.response?.data || err.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
      setActiveTest('');
    }
  };

  // Copy curl command to clipboard
  const copyCurl = async (curl) => {
    try {
      await navigator.clipboard.writeText(curl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      const response = await apiService.checkHealth();
      setBackendStatus('online');
      return response;
    } catch (error) {
      setBackendStatus('offline');
      throw error;
    }
  };

  // Handle CURL editing
  const handleCurlEdit = (testId, curlCommand) => {
    setEditableCurls(prev => ({
      ...prev,
      [testId]: curlCommand
    }));
  };

  const getEditableCurl = (testId, originalCurl) => {
    return editableCurls[testId] || originalCurl;
  };

  const resetCurl = (testId, originalCurl) => {
    setEditableCurls(prev => ({
      ...prev,
      [testId]: originalCurl
    }));
  };

  // Execute custom CURL command (for demonstration - actual execution would need backend support)
  const executeCustomCurl = async (curlCommand) => {
    try {
      // This is a simplified example - in reality you'd need a backend endpoint 
      // that can execute CURL commands safely
      console.log('Executing CURL:', curlCommand);
      
      // For now, we'll parse basic info and show it was "executed"
      const isGetRequest = curlCommand.includes('-X GET') || (!curlCommand.includes('-X POST') && !curlCommand.includes('-d'));
      const url = curlCommand.match(/https?:\/\/[^\s]+/)?.[0] || 'Unknown URL';
      
      return {
        success: true,
        data: {
          message: 'Custom CURL command executed',
          method: isGetRequest ? 'GET' : 'POST',
          url: url,
          note: 'This is a demo execution. In production, implement secure CURL execution on backend.'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    for (const test of apiTests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Download test results
  const downloadResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      tests: testResults
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_test_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-900">
              API Testing Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${backendStatus === 'online' ? 'bg-green-400' : backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
              <span className="text-sm text-gray-600">
                Backend: {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Unknown'}
              </span>
              <button
                onClick={checkBackendHealth}
                className="ml-2 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors"
              >
                Check
              </button>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Test all backend API endpoints with real data and get instant responses
          </p>
          
          {/* Control buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Run All Tests
            </button>
            
            <button
              onClick={downloadResults}
              disabled={Object.keys(testResults).length === 0}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Results
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* API Tests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {apiTests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-lg p-6">
              {/* Test Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {test.id === 'health' && <CheckCircle className="w-6 h-6 text-green-500 mr-2" />}
                  {test.id === 'languages' && <Languages className="w-6 h-6 text-blue-500 mr-2" />}
                  {test.id === 'detect' && <Languages className="w-6 h-6 text-yellow-500 mr-2" />}
                  {test.id === 'translate' && <Languages className="w-6 h-6 text-purple-500 mr-2" />}
                  {test.id === 'upload' && <Upload className="w-6 h-6 text-indigo-500 mr-2" />}
                  {test.id === 'assessment' && <Database className="w-6 h-6 text-orange-500 mr-2" />}
                  {test.id === 'integration-status' && <Database className="w-6 h-6 text-red-500 mr-2" />}
                  {test.id === 'performance' && <CheckCircle className="w-6 h-6 text-teal-500 mr-2" />}
                  
                  <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  test.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {test.method}
                </span>
              </div>

              {/* Test Description */}
              <p className="text-gray-600 mb-4">{test.description}</p>
              
              {/* Endpoint */}
              <div className="bg-gray-100 p-2 rounded mb-4">
                <code className="text-sm text-gray-800">{test.endpoint}</code>
              </div>

              {/* CURL Command */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">CURL Command:</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCurl(editingCurl === test.id ? null : test.id)}
                      className={`p-1 rounded ${editingCurl === test.id ? 'bg-blue-100 text-blue-800' : 'text-blue-600 hover:text-blue-800'}`}
                      title={editingCurl === test.id ? 'View mode' : 'Edit mode'}
                    >
                      {editingCurl === test.id ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => resetCurl(test.id, test.curl)}
                      className="text-orange-600 hover:text-orange-800 p-1"
                      title="Reset to original"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyCurl(getEditableCurl(test.id, test.curl))}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {editingCurl === test.id ? (
                  <textarea
                    value={getEditableCurl(test.id, test.curl)}
                    onChange={(e) => handleCurlEdit(test.id, e.target.value)}
                    className="w-full bg-gray-900 text-green-400 p-3 rounded text-xs font-mono resize-vertical min-h-[120px]"
                    placeholder="Edit your CURL command here..."
                  />
                ) : (
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                    <pre>{getEditableCurl(test.id, test.curl)}</pre>
                  </div>
                )}
              </div>

              {/* Test Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => runTest(test)}
                  disabled={isLoading}
                  className="w-full bg-skillBlue text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {activeTest === test.id && isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run API Test
                    </>
                  )}
                </button>
                
                {editableCurls[test.id] && editableCurls[test.id] !== test.curl && (
                  <button
                    onClick={async () => {
                      setActiveTest(test.id);
                      setIsLoading(true);
                      try {
                        const result = await executeCustomCurl(editableCurls[test.id]);
                        setTestResults(prev => ({
                          ...prev,
                          [test.id]: {
                            success: result.success,
                            data: result.success ? result.data : null,
                            error: result.success ? null : result.error,
                            timestamp: new Date().toISOString(),
                            customCurl: true
                          }
                        }));
                      } catch (err) {
                        setTestResults(prev => ({
                          ...prev,
                          [test.id]: {
                            success: false,
                            error: err.message,
                            timestamp: new Date().toISOString(),
                            customCurl: true
                          }
                        }));
                      } finally {
                        setIsLoading(false);
                        setActiveTest('');
                      }
                    }}
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Custom CURL
                  </button>
                )}
              </div>

              {/* Test Result */}
              {testResults[test.id] && (
                <div className="mt-4">
                  <div className={`p-3 rounded-lg ${
                    testResults[test.id].success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {testResults[test.id].success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-semibold ${
                        testResults[test.id].success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {testResults[test.id].success ? 'Success' : 'Failed'}
                        {testResults[test.id].customCurl && (
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            Custom CURL
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(testResults[test.id].timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="bg-white p-2 rounded text-xs overflow-x-auto">
                      <pre>
                        {JSON.stringify(
                          testResults[test.id].success 
                            ? testResults[test.id].data 
                            : testResults[test.id].error, 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Start Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold text-gray-800">Start Backend</h3>
                <p className="text-sm text-gray-600">Ensure your FastAPI server is running on localhost:8000</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold text-gray-800">Edit CURL</h3>
                <p className="text-sm text-gray-600">Click the edit icon to modify CURL commands before testing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold text-gray-800">Run Tests</h3>
                <p className="text-sm text-gray-600">Execute API tests or custom CURL commands</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold text-gray-800">Review Results</h3>
                <p className="text-sm text-gray-600">Check JSON responses and copy commands</p>
              </div>
            </div>
          </div>
        </div>

        {/* CURL Editing Features */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Edit className="w-6 h-6 text-purple-600 mr-2" />
            Editable CURL Commands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Edit className="w-8 h-8 text-blue-500" />
              <div>
                <h4 className="font-semibold text-gray-800">Edit Mode</h4>
                <p className="text-sm text-gray-600">Click the edit icon to modify any CURL command</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-8 h-8 text-orange-500" />
              <div>
                <h4 className="font-semibold text-gray-800">Reset</h4>
                <p className="text-sm text-gray-600">Restore the original CURL command anytime</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Play className="w-8 h-8 text-purple-500" />
              <div>
                <h4 className="font-semibold text-gray-800">Execute Custom</h4>
                <p className="text-sm text-gray-600">Run your modified CURL commands with one click</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Files Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Database className="w-6 h-6 text-purple-600 mr-2" />
            Testing Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sample Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sample Text</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">{sampleText}</p>
              </div>
            </div>
            
            {/* Sample Quiz */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sample Quiz (JSON)</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                <pre>{JSON.stringify(sampleQuiz, null, 2)}</pre>
              </div>
            </div>
          </div>
          
          {/* Available Files */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Available Demo Files:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>/demo-assets/sample_document.txt</code> - Text document for translation testing</li>
              <li>• <code>/demo-assets/sample_quiz.json</code> - Assessment file for education domain testing</li>
              <li>• Files are automatically created when running tests</li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ApiTesting;