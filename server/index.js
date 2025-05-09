require('dotenv').config(); // Load environment variables from .env file
require('dotenv').config(); // Ensure dotenv is at the very top
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
// Use port from environment variable for Render, default to 3001 for local
const port = process.env.PORT || 3001; 

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Trying another common model

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the AI Prompt SaaS Tool Backend!');
});

// API endpoint for generating prompts (now conversational)
app.post('/api/generate-prompt', async (req, res) => {
  const { inputText, history } = req.body; // Expect history array

  if (!inputText || typeof inputText !== 'string' || inputText.trim() === '') {
    return res.status(400).json({ message: 'Invalid input: inputText is required.' });
  }

  // Validate history if provided
  let chatHistory = [];
  if (Array.isArray(history)) {
    chatHistory = history.map(msg => {
      // Convert our app's message format to Gemini's format
      // Our app: { text: "...", type: "userInput" | "aiPrompt" }
      // Gemini: { role: "user" | "model", parts: [{ text: "..." }] }
      if (msg.type === 'userInput') {
        return { role: "user", parts: [{ text: msg.text }] };
      } else if (msg.type === 'aiPrompt') {
        return { role: "model", parts: [{ text: msg.text }] };
      }
      return null; // Or handle errors/other types
    }).filter(Boolean); // Remove any nulls if other message types were present
  }
  
  // console.log("Received history for Gemini:", JSON.stringify(chatHistory, null, 2));
  // console.log("Current user input:", inputText);

  const systemInstruction = `You are an expert Prompt Engineering Assistant. Your goal is to help users craft high-quality, effective prompts for Large Language Models (LLMs).

When a user provides an idea, keywords, or a draft prompt, your tasks are to:
1. Analyze their input.
2. If the input is too vague, ask clarifying questions to understand their goal, target audience, desired output format, style, or any constraints.
3. Offer specific, actionable suggestions to improve their prompt. This might include:
    - Adding more context or detail.
    - Specifying the desired role for the LLM (e.g., "Act as a historian...").
    - Defining the output format (e.g., "Provide the answer as a JSON object...", "Write a blog post...").
    - Suggesting techniques like chain-of-thought, few-shot examples, or negative constraints.
    - Improving clarity, conciseness, or specificity.
4. Provide alternative phrasings or complete revised prompts if appropriate.
5. Explain the reasoning behind your suggestions – why will these changes lead to a better output from an LLM?
6. Maintain a helpful, encouraging, and expert persona.
7. If the user asks for a prompt for a specific task (e.g., "write a marketing email"), help them construct that prompt step-by-step, rather than just writing the email for them. Your focus is on *prompt construction*.

Do not generate the content that the user's final prompt would generate. Instead, help them write the prompt itself.
If the user's input is very short or just keywords, you might start by offering a few diverse example prompts they could build upon, or ask them to elaborate on their goal.
Always aim to be conversational and guide the user through the prompt refinement process.`;

  // Prepend system instruction and an initial model response to guide the conversation
  const fullConversationHistory = [
    { role: "user", parts: [{ text: systemInstruction }] },
    { role: "model", parts: [{ text: "Okay, I'm ready to help you craft an excellent prompt! What idea or draft prompt do you have in mind?" }] },
    ...chatHistory // User's actual conversation history from the client
  ];

  try {
    const chat = model.startChat({
      history: fullConversationHistory,
      // Optional: generationConfig, safetySettings
    });

    const result = await chat.sendMessage(inputText); // Send the current user's message
    const response = result.response;
    const generatedText = response.text();
    
    res.json({ prompt: generatedText });

  } catch (error) {
    console.error('Error calling Gemini API (conversational):', error);
    // Send a more user-friendly error message
    let errorMessage = 'Failed to generate prompt due to an issue with the AI service.';
    if (error.message && error.message.includes('API key not valid')) {
        errorMessage = 'Failed to generate prompt: The API key is not valid. Please check your .env file.';
    } else if (error.message) {
        errorMessage = `AI service error: ${error.message}`;
    }
    res.status(500).json({ message: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
