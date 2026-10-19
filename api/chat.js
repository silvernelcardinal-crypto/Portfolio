// api/chat.js — Vercel serverless function (runs on the SERVER, not in the browser).
// You do NOT need to edit this file. It needs OPENROUTER_API_KEY set in Vercel.
import profile from "../data/profile.js";
// Free model id. Model ids change! Check openrouter.ai/models?max_price=0
// You can override it with an OPENROUTER_MODEL env var in Vercel (no code change).
const MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";
export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Use POST" });
}
// The secret key lives ONLY in Vercel's Environment Variables
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
return res.status(500).json({ error: "Server is missing the API key" });
}
// Read the visitor's message (limit the length to save quota)
const message = String(req.body?.message || "").trim().slice(0, 500);
if (!message) {
return res.status(400).json({ error: "Empty message" });
}
const systemPrompt = `You are a friendly chatbot on ${profile.name}'s portfolio website.
Answer ONLY using the information below. If the answer is not in the information,
say you don't know and suggest asking about skills, education, or projects.
Never make things up. Keep answers short (1-3 sentences).
INFORMATION:
${JSON.stringify(profile, null, 2)}`;
try {
const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
method: "POST",
headers: {
"Authorization": `Bearer ${apiKey}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
model: MODEL,
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: message }
],
max_tokens: 200,
temperature: 0.3
}),
signal: AbortSignal.timeout(15000) // give up after 15 seconds
});
if (!aiResponse.ok) {
// 429 = rate limit (free models have limits). The frontend will use the fallback bot.
const status = aiResponse.status === 429 ? 429 : 502;
return res.status(status).json({ error: "AI is busy or unavailable" });
}
const data = await aiResponse.json();
const reply = data.choices?.[0]?.message?.content?.trim();
if (!reply) {
return res.status(502).json({ error: "AI gave an empty reply" });
}
return res.status(200).json({ reply });
} catch (error) {
return res.status(502).json({ error: "Could not reach the AI" });
}
}