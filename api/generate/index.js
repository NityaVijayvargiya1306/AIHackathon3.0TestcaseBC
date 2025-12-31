// // module.exports = async function (context, req) {
// //   const DEPLOYMENT_NAME = 'gpt-5.1-chat';
// //   const API_VERSION = '2025-01-01-preview';
// //   const AZURE_ENDPOINT = process.env.VITE_AZURE_ENDPOINT;
// //   const AZURE_API_KEY = process.env.VITE_AZURE_API_KEY;

// //   try {
// //     const response = await fetch(
// //       `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
// //       {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'api-key': AZURE_API_KEY
// //         },
// //         body: JSON.stringify(req.body)
// //       }
// //     );

// //     const data = await response.json();
    
// //     context.res = {
// //       status: response.status,
// //       body: data,
// //       headers: {
// //         'Content-Type': 'application/json'
// //       }
// //     };
// //   } catch (error) {
// //     context.res = {
// //       status: 500,
// //       body: { error: error.message }
// //     };
// //   }
// // };

// const { app } = require('@azure/functions');

// app.http('generate', {
//     methods: ['POST'],
//     authLevel: 'anonymous',
//     handler: async (request, context) => {
//         const DEPLOYMENT_NAME = 'gpt-5.1-chat';
//         const API_VERSION = '2025-01-01-preview';
//         const AZURE_ENDPOINT = process.env.VITE_AZURE_ENDPOINT;
//         const AZURE_API_KEY = process.env.VITE_AZURE_API_KEY;

//         try {
//             const body = await request.json();
            
//             const response = await fetch(
//                 `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'api-key': AZURE_API_KEY
//                     },
//                     body: JSON.stringify(body)
//                 }
//             );

//             const data = await response.json();
            
//             return {
//                 status: response.status,
//                 jsonBody: data,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             };
//         } catch (error) {
//             context.error('Error:', error);
//             return {
//                 status: 500,
//                 jsonBody: { error: error.message }
//             };
//         }
//     }
// });

module.exports = async function (context, req) {
    context.log('🚀 Generate function triggered');
    
    const DEPLOYMENT_NAME = 'gpt-5.1-chat';
    const API_VERSION = '2025-01-01-preview';
    const AZURE_ENDPOINT = process.env.VITE_AZURE_ENDPOINT;
    const AZURE_API_KEY = process.env.VITE_AZURE_API_KEY;

    // Debug logging
    context.log('Environment check:', {
        hasEndpoint: !!AZURE_ENDPOINT,
        hasApiKey: !!AZURE_API_KEY,
        endpointPrefix: AZURE_ENDPOINT ? AZURE_ENDPOINT.substring(0, 20) : 'missing'
    });

    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
        context.res = {
            status: 500,
            body: { 
                error: 'Missing Azure configuration in environment variables',
                details: {
                    hasEndpoint: !!AZURE_ENDPOINT,
                    hasApiKey: !!AZURE_API_KEY
                }
            }
        };
        return;
    }

    try {
        const messages = req.body?.messages;
        
        if (!messages || !Array.isArray(messages)) {
            context.res = {
                status: 400,
                body: { error: 'Missing or invalid messages in request body' }
            };
            return;
        }

        context.log(`Processing ${messages.length} messages`);

        const azureUrl = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
        context.log('Calling Azure OpenAI:', azureUrl.substring(0, 50) + '...');
        
        // Use global fetch (available in Node 18+)
        const response = await fetch(azureUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_API_KEY
            },
            body: JSON.stringify({ messages: messages })
        });

        context.log('Azure response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            context.log('❌ Azure error:', errorText);
            context.res = {
                status: response.status,
                body: { 
                    error: 'Azure OpenAI API error',
                    status: response.status,
                    details: errorText
                }
            };
            return;
        }

        const data = await response.json();
        context.log('✅ Success, tokens used:', data.usage?.total_tokens);
        
        context.res = {
            status: 200,
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
    } catch (error) {
        context.log('❌ Exception:', error);
        context.res = {
            status: 500,
            body: { 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};