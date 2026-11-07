const apiKey = process.env.GEMINI_API_KEY || '';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log('Available models:');
    data.models.forEach(m => {
      if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
        console.log('-', m.name, '| Display:', m.displayName);
      }
    });
  } else {
    console.log('Response:', data);
  }
}

listModels();
