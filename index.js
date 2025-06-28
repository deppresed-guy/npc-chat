const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: "be funny" },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 1.2,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });

    let reply = completion.choices[0].message.content;
    const processedReply = reply.startsWith("I am Elias") ? reply : "I am Elias. " + reply;
    return res.status(200).json({ reply: processedReply });
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return res.status(500).json({ error: "Failed to get response from AI" });
  }
}
