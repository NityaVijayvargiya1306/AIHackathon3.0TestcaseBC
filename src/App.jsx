//creeate backlog power automate take user input, backlog no and drop of down of selecting feature 
//tracking log in sharepoitn who used it.
//how to make public use how to deploy

import React, { useState, useEffect } from 'react';
import { FileText, Loader2, CheckCircle, AlertCircle, Download, MessageSquare, Settings, Trash2, RefreshCw } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    moduleName: '',
    functionality: '',
    functionality2: '',
    userRole: '',
    businessProcess: '',
    dataRequirements: '',
    integrations: '',
    expectedBehavior: ''
  });

  const [testCases, setTestCases] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [customRules, setCustomRules] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadDefaultPrompts();
  }, []);

  const loadDefaultPrompts = () => {
    const defaultSystemPrompt = `You are an expert QA engineer specializing in Microsoft Dynamics 365 Business Central with 10+ years of experience. Your expertise includes:
- Functional, integration, regression, and UAT testing
- Business Central specific workflows and navigation
- ERP best practices and validation rules
- Data integrity and security testing

CRITICAL INSTRUCTIONS:
- Generate ONLY valid JSON array format
- NO markdown formatting, NO code blocks, NO explanatory text
- Each test case must be complete and actionable
- Focus on Business Central specific scenarios
- Use sentence casing for ALL text fields (capitalize only the first word and proper nouns)`;

    const defaultCustomRules = `TEST CASE GENERATION RULES:

1. COVERAGE REQUIREMENTS:
   - Include positive (happy path) scenarios
   - Include negative scenarios (validation failures, error handling)
   - Include edge cases and boundary conditions
   - Include security and permission testing
   - Include integration points testing

2. BUSINESS CENTRAL SPECIFICS:
   - Reference BC pages, actions, and fields correctly
   - Include navigation paths (e.g., "Navigate to Sales & Marketing > Sales Orders")
   - Consider BC posting processes and document flows
   - Include dimension and approval workflow testing where applicable
   - Test both UI and API endpoints if relevant

3. TEST CASE STRUCTURE:
   - Test Case ID: Sequential (TC-001, TC-002, etc.)
   - Title: Clear, action-oriented, sentence case (capitalize only first word and proper nouns)
   - Description: Detailed scenario explanation in sentence case
   - Preconditions: System state, data setup, user permissions in sentence case
   - Test Steps: Numbered, clear actions with expected results in sentence case
   - Test Data: Specific, realistic sample data in sentence case
   - Priority: High, Medium, or Low (capitalize first letter only)
   - Type: Functional, Integration, Regression, Performance, or Security (capitalize first letter only)

4. DATA REQUIREMENTS:
   - Specify master data needed (customers, vendors, items, etc.)
   - Include setup tables and configuration
   - Provide realistic test data samples
   - Consider multi-company scenarios if applicable

5. VALIDATION POINTS:
   - Database updates and ledger entries
   - Document status changes
   - Calculated fields and amounts
   - Error messages and warnings
   - User notifications and workflows

6. BEST PRACTICES:
   - One test case = One scenario
   - Clear pass/fail criteria
   - Repeatable and independent tests
   - Include cleanup steps if needed
   - Consider performance thresholds for large data volumes

IMPORTANT: ALL text content must use sentence casing - capitalize only the first word of each sentence and proper nouns (like Business Central, Azure, company names, etc.). Do not use title case or all caps except for acronyms.`;

    setSystemPrompt(defaultSystemPrompt);
    setCustomRules(defaultCustomRules);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const buildPrompt = () => {
    return `${customRules}

MODULE DETAILS:
===============
Module: ${formData.moduleName}
Functionality 1: ${formData.functionality}
Functionality 2: ${formData.functionality2 || 'Not specified'}
User role: ${formData.userRole || 'Not specified'}
Business process: ${formData.businessProcess || 'Not specified'}
Data requirements: ${formData.dataRequirements || 'Not specified'}
Integrations: ${formData.integrations || 'None'}
Expected behavior: ${formData.expectedBehavior || 'Not specified'}

${feedback ? `\nUSER FEEDBACK ON PREVIOUS GENERATION:\n${feedback}\n` : ''}

REQUIRED OUTPUT FORMAT:
======================
Generate 20 comprehensive test cases in this EXACT JSON structure:
[
  {
    "testCaseId": "TC-001",
    "title": "Test case title in sentence case",
    "description": "Detailed description in sentence case of what is being tested",
    "preconditions": ["Precondition 1 in sentence case", "Precondition 2 in sentence case"],
    "testSteps": [
      {
        "step": 1,
        "action": "Action to perform in sentence case",
        "expectedResult": "Expected outcome in sentence case"
      }
    ],
    "testData": "Sample test data needed in sentence case",
    "priority": "High",
    "type": "Functional",
    "expectedResult": "Overall expected result for the test case in sentence case"
  }
]

CRITICAL FORMATTING RULES:
- Use sentence casing for ALL text fields (title, description, preconditions, test steps, test data, expected results)
- Capitalize only the first word of each sentence and proper nouns
- Priority must be: High, Medium, or Low (capitalize first letter only)
- Type must be: Functional, Integration, Regression, Performance, or Security (capitalize first letter only)
- Do NOT use title case, ALL CAPS (except acronyms), or camelCase

IMPORTANT: Return ONLY the JSON array. No additional text, explanations, or markdown formatting.`;
  };

  const generateTestCases = async (isRefinement = false) => {
    setLoading(true);
    setError('');
    if (!isRefinement) {
      setTestCases([]);
    }

    try {
      if (!formData.moduleName || !formData.functionality) {
        throw new Error('Module name and functionality are required');
      }

      const userMessage = {
        role: 'user',
        content: buildPrompt()
      };

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory,
        userMessage
      ];

      console.log('🚀 Sending request to Azure...');
      console.log('Messages count:', messages.length);

      // DIRECT CALL to Azure OpenAI (bypassing proxy server)

      const DEPLOYMENT_NAME = 'gpt-5.1-chat';
      const API_VERSION = '2025-01-01-preview';
      // const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
      // const AZURE_API_KEY = import.meta.env.VITE_AZURE_API_KEY;

      const response = await fetch(
        '/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'api-key': AZURE_API_KEY
        },
        body: JSON.stringify({
          messages: messages
        })
      }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);

        if (response.status === 404) {
          throw new Error('Backend server not running. Please start with: npm run server');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Check Azure API key in server.js');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait and try again.');
        } else if (response.status === 500) {
          throw new Error(errorData.error?.message || 'Server error. Check server logs.');
        } else {
          throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('✅ Received response:', data);

      // Log token usage
      if (data.usage) {
        console.log('📊 Token Usage:');
        console.log('  - Prompt tokens (input):', data.usage.prompt_tokens);
        console.log('  - Completion tokens (output):', data.usage.completion_tokens);
        console.log('  - Total tokens:', data.usage.total_tokens);
        console.log('  - Prompt tokens details:', data.usage.prompt_tokens_details);
        console.log('  - Completion tokens details:', data.usage.completion_tokens_details);
      }

      const content = data.choices?.[0]?.message?.content || '';

      if (!content) {
        throw new Error('No response from AI. Please try again.');
      }

      console.log('Raw content received:', content.substring(0, 200) + '...');

      let parsedTestCases;
      try {
        const cleanContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^[\s\n]*\[/g, '[')
          .replace(/\][\s\n]*$/g, ']')
          .trim();

        parsedTestCases = JSON.parse(cleanContent);
        console.log('✅ Successfully parsed test cases:', parsedTestCases.length);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        console.error('Content received:', content);
        throw new Error('Failed to parse AI response. The AI returned invalid JSON.');
      }

      if (!Array.isArray(parsedTestCases)) {
        throw new Error('Invalid response format. Expected an array of test cases.');
      }

      if (parsedTestCases.length === 0) {
        throw new Error('No test cases generated. Please provide more details.');
      }

      const newHistory = [
        ...conversationHistory,
        userMessage,
        {
          role: 'assistant',
          content: JSON.stringify(parsedTestCases, null, 2)
        }
      ];
      setConversationHistory(newHistory);

      setTestCases(parsedTestCases);
      setShowFeedback(true);
      setFeedback('');

      console.log('✅ Test cases set successfully');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'An error occurred while generating test cases');
    } finally {
      setLoading(false);
    }
  };

  const refineTestCases = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback on what you want to change');
      return;
    }
    await generateTestCases(true);
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setTestCases([]);
    setFeedback('');
    setShowFeedback(false);
    setError('');
  };

  const exportTestCases = () => {
    const dataStr = JSON.stringify(testCases, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BC_TestCases_${formData.moduleName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'Test case ID,Title,Description,Priority,Type,Test data,Expected result\n';

    testCases.forEach(tc => {
      const row = [
        tc.testCaseId,
        `"${(tc.title || '').replace(/"/g, '""')}"`,
        `"${(tc.description || '').replace(/"/g, '""')}"`,
        tc.priority,
        tc.type,
        `"${(tc.testData || '').replace(/"/g, '""')}"`,
        `"${(tc.expectedResult || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BC_TestCases_${formData.moduleName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPrompts = () => {
    const promptData = {
      systemPrompt,
      customRules,
      lastGenerated: new Date().toISOString()
    };
    const dataStr = JSON.stringify(promptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BC_TestGen_Prompts_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPrompts = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
          if (data.customRules) setCustomRules(data.customRules);
          alert('Prompts imported successfully!');
        } catch (err) {
          alert('Failed to import prompts. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearForm = () => {
    setFormData({
      moduleName: '',
      functionality: '',
      functionality2: '',
      userRole: '',
      businessProcess: '',
      dataRequirements: '',
      integrations: '',
      expectedBehavior: ''
    });
    setTestCases([]);
    setError('');
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'functional': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'integration': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'regression': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'performance': return 'bg-cyan-50 text-cyan-600 border-cyan-200';
      case 'security': return 'bg-pink-50 text-pink-600 border-pink-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Business Central test case generator
                </h1>
                <p className="text-gray-600 mt-1">
                  Powered by Azure AI Foundry
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                title="Settings"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              {conversationHistory.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all"
                  title="Clear conversation"
                >
                  <Trash2 className="w-6 h-6 text-red-600" />
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-600">
            Generate comprehensive, AI-powered test cases for Microsoft Dynamics 365 Business Central.
            Refine results with iterative feedback.
          </p>

          {conversationHistory.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">
              <MessageSquare className="w-4 h-4" />
              <span>Active conversation: {Math.floor(conversationHistory.length / 2)} iterations</span>
            </div>
          )}
        </div>

        {showSettings && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Configuration</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportPrompts}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Export config
                </button>
                <label className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer">
                  Import config
                  <input
                    type="file"
                    accept=".json"
                    onChange={importPrompts}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={loadDefaultPrompts}
                  className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset defaults
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  System prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="Define the AI's role and expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom rules & standards
                </label>
                <textarea
                  value={customRules}
                  onChange={(e) => setCustomRules(e.target.value)}
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="Define your testing standards, rules, and best practices..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Test case requirements</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="moduleName"
                value={formData.moduleName}
                onChange={handleInputChange}
                placeholder="e.g., Sales order management"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User role
              </label>
              <input
                type="text"
                name="userRole"
                value={formData.userRole}
                onChange={handleInputChange}
                placeholder="e.g., Sales manager"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Functionality description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="functionality"
                value={formData.functionality}
                onChange={handleInputChange}
                placeholder="Describe the first functionality in detail..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Functionality
              </label>
              <textarea
                name="functionality2"
                value={formData.functionality2}
                onChange={handleInputChange}
                placeholder="Describe the second functionality in detail (optional)..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business process flow
              </label>
              <textarea
                name="businessProcess"
                value={formData.businessProcess}
                onChange={handleInputChange}
                placeholder="Step-by-step process flow..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data requirements
              </label>
              <input
                type="text"
                name="dataRequirements"
                value={formData.dataRequirements}
                onChange={handleInputChange}
                placeholder="e.g., Customer master, Item master"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Integrations
              </label>
              <input
                type="text"
                name="integrations"
                value={formData.integrations}
                onChange={handleInputChange}
                placeholder="e.g., Power BI, Payment gateway"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expected behavior
              </label>
              <textarea
                name="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={handleInputChange}
                placeholder="Expected results in the happy path scenario..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => generateTestCases(false)}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating test cases...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Generate test cases
                </>
              )}
            </button>

            <button
              onClick={clearForm}
              disabled={loading}
              className="px-6 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Clear form
            </button>
          </div>
        </div>

        {showFeedback && testCases.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Refine test cases</h2>
            <p className="text-gray-600 mb-4">
              Not satisfied with the results? Provide feedback and regenerate with improvements.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="E.g., Add more negative test cases, Include security testing..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all mb-4"
            />
            <button
              onClick={refineTestCases}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Refine test cases
                </>
              )}
            </button>
          </div>
        )}

        {testCases.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated test cases
                <span className="ml-3 text-lg font-normal text-gray-600">
                  ({testCases.length} test {testCases.length === 1 ? 'case' : 'cases'})
                </span>
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </button>
                <button
                  onClick={exportTestCases}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Push to devops
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {testCase.testCaseId}: {testCase.title}
                      </h3>
                      <p className="text-gray-700">{testCase.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getPriorityColor(testCase.priority)}`}>
                        {testCase.priority}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getTypeColor(testCase.type)}`}>
                        {testCase.type}
                      </span>
                    </div>
                  </div>

                  {testCase.preconditions && testCase.preconditions.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        Preconditions
                      </h4>
                      <ul className="list-none space-y-2">
                        {testCase.preconditions.map((pre, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-indigo-600 font-bold mt-1">›</span>
                            <span>{pre}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testCase.testSteps && testCase.testSteps.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        Test steps
                      </h4>
                      <div className="space-y-3">
                        {testCase.testSteps.map((step, i) => (
                          <div
                            key={i}
                            className="bg-white border border-gray-200 p-4 rounded-lg hover:border-indigo-300 transition-all"
                          >
                            <p className="font-semibold text-gray-900 mb-2">
                              <span className="inline-block bg-indigo-600 text-white w-6 h-6 rounded-full text-center text-sm leading-6 mr-2">
                                {step.step}
                              </span>
                              {step.action}
                            </p>
                            <p className="text-gray-600 text-sm ml-8">
                              <span className="font-semibold text-green-700">✓ Expected:</span> {step.expectedResult}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {testCase.testData && (
                    <div className="mb-5">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        Test data
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-gray-800">{testCase.testData}</p>
                      </div>
                    </div>
                  )}

                  {testCase.expectedResult && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Expected result
                      </h4>
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-gray-800">{testCase.expectedResult}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {testCases.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Ready to generate test cases
            </h3>
            <p className="text-gray-600">
              Fill in the required fields and click "Generate test cases" to create comprehensive test scenarios.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}