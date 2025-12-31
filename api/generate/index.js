// module.exports = async function (context, req) {
//   const DEPLOYMENT_NAME = 'gpt-5.1-chat';
//   const API_VERSION = '2025-01-01-preview';
//   const AZURE_ENDPOINT = process.env.VITE_AZURE_ENDPOINT;
//   const AZURE_API_KEY = process.env.VITE_AZURE_API_KEY;

//   try {
//     const response = await fetch(
//       `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'api-key': AZURE_API_KEY
//         },
//         body: JSON.stringify(req.body)
//       }
//     );

//     const data = await response.json();
    
//     context.res = {
//       status: response.status,
//       body: data,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     };
//   } catch (error) {
//     context.res = {
//       status: 500,
//       body: { error: error.message }
//     };
//   }
// };

const { app } = require('@azure/functions');

app.http('generate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const DEPLOYMENT_NAME = 'gpt-5.1-chat';
        const API_VERSION = '2025-01-01-preview';
        const AZURE_ENDPOINT = process.env.VITE_AZURE_ENDPOINT;
        const AZURE_API_KEY = process.env.VITE_AZURE_API_KEY;

        try {
            const body = await request.json();
            
            const response = await fetch(
                `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': AZURE_API_KEY
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await response.json();
            
            return {
                status: response.status,
                jsonBody: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } catch (error) {
            context.error('Error:', error);
            return {
                status: 500,
                jsonBody: { error: error.message }
            };
        }
    }
});