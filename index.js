const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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", // Your key
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
    console.log("Sending request to OpenRouter with message:", message);
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: "You are Elias, a wise guardian of Solivane, speaking in a mystical tone. Respond with poetic flair and always mention Solivane's mysteries." },
        { role: "user", content: message }
      ],
      max_tokens: 99999999999999999999,
      temperature: 1.2,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });
    console.log("Received completion:", completion);
    let reply = completion.choices[0].message.content;
    const processedReply = reply.startsWith("I am Elias") ? reply : "I am Elias. " + reply;
    return res.status(200).json({ reply: processedReply });
  } catch (error) {
    console.error("OpenRouter API Error:", error.message || error);
    return res.status(500).json({ error: "Failed to get response from AI" });
  }
}
