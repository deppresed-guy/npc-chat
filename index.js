const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for cross-origin requests
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Chill, you’re hitting the API too hard! Try again later.',
  })
);

// Validate environment variables
if (!process.env.OPENROUTER_API_KEY) {
  console.error('Yo, you forgot to set OPENROUTER_API_KEY in your env!');
  process.exit(1);
}

// Handle GET requests to the root
app.get('/', (req, res) => {
  res.json({
    message: 'Yo, welcome to the AI Chatbot API! Hit /chat with a POST request and a JSON body like {"message": "your vibe"} to chat with Elias.',
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Validate input
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Gimme a real message, fam! It’s gotta be a non-empty string.',
    });
  }

  // Define Elias's personality (Gen Z vibes)
  const rolePrompt = `You’re Elias, a super chill, witty Gen Z AI with a knack for memes and humor. Respond to the user’s message with some spicy, lighthearted banter, throwing in Gen Z slang and a touch of sarcasm. Keep it short, fun, and vibey.`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          { role: 'system', content: rolePrompt },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 200, // Prevent super long responses
        temperature: 0.9, // Add some spice to the replies
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://your-app-url.com', // Use a configurable URL
          'X-Title': 'AI Chatbot API',
        },
        timeout: 10000, // 10s timeout to avoid hanging
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    let errorMessage = 'Something went wrong, bruh. Try again later.';

    if (status === 429) {
      errorMessage = 'Whoa, slow down! We’re hitting the API rate limit. Chill for a bit.';
    } else if (status === 401) {
      errorMessage = 'Oops, looks like the API key’s acting sus. Check that vibe.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Yo, the API’s taking a nap. Try again in a sec.';
    }

    res.status(status).json({
      success: false,
      error: errorMessage,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server’s vibin’ on port ${PORT} 🚀`));
