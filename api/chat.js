// api/chat.js — Vercel serverless function (runs on the SERVER, not in the browser).
// You do NOT need to edit this file. It needs OPENROUTER_API_KEY set in Vercel.
import profile from "../data/profile.js";
// ---------- Models ----------
// Free models get busy fast (that is what causes the "429" error), so we try
// several and remember the one that answered. "openrouter/free" is OpenRouter's
// own router — it automatically sends your request to a free model that is up.
// ✏️ Optional: set OPENROUTER_MODEL in Vercel to force one specific model.
const FREE_MODELS = [
"openrouter/free",
"google/gemma-4-31b-it:free",
"google/gemma-4-26b-a4b-it:free",
"minimax/minimax-m3.1-flash:free",
"thinkingmachines/inkling:free",
"liquid/lfm-2.5-2.6b:free",
"dots-studio/dots-3-note-preview:free",
"cohere/north-mini-code:free"
];
const MODELS = process.env.OPENROUTER_MODEL
? [process.env.OPENROUTER_MODEL, ...FREE_MODELS]
: FREE_MODELS;
// Remembers the last model that worked, so the next request goes straight to it.
let workingModel = null;
// ---------- The system prompt: the bot may only use MY info ----------
function buildSystemPrompt() {
return `You are a friendly chatbot on ${profile.name}'s portfolio website.
Answer ONLY using the information below. If the answer is not in the information,
say you don't know and suggest asking about skills, education, projects, the OJT
journal, or contact info. Never make things up. Keep answers short (1-3 sentences).
Use a few emojis to make it friendly.
INFORMATION:
${JSON.stringify(profile, null, 2)}`;
}
// ---------- Ask one model, get an answer (or an error message) ----------
async function askModel(model, apiKey, message, systemPrompt) {
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
method: "POST",
headers: {
"Authorization": `Bearer ${apiKey}`,
"Content-Type": "application/json",
"HTTP-Referer": "https://portfolio-iota-plum-71.vercel.app",
"X-Title": "Silver's Portfolio Chatbot"
},
body: JSON.stringify({
model,
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: message }
],
max_tokens: 200,
temperature: 0.3
}),
signal: AbortSignal.timeout(15000) // give up on a slow model after 15 seconds
});
if (!response.ok) {
return { ok: false, status: response.status, error: `HTTP ${response.status}` };
}
const data = await response.json();
const reply = data.choices?.[0]?.message?.content?.trim();
if (!reply) return { ok: false, status: 502, error: "Empty reply" };
return { ok: true, reply };
}
// ---------- The function Vercel runs ----------
export default async function handler(req, res) {
// GET = a free health check. Open http://your-site.vercel.app/api/chat in the
// browser to see if AI mode is on and which model is working.
if (req.method === "GET") {
return res.status(200).json({
aiEnabled: Boolean(process.env.OPENROUTER_API_KEY),
workingModel,
models: MODELS
});
}
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
const systemPrompt = buildSystemPrompt();
// Try the model that worked last time first, then the rest of the list.
const order = workingModel
? [workingModel, ...MODELS.filter((m) => m !== workingModel)]
: MODELS;
const tried = [];
for (const model of order) {
let result;
try {
result = await askModel(model, apiKey, message, systemPrompt);
} catch (error) {
result = { ok: false, status: 0, error: error.message };
}
if (result.ok) {
workingModel = model; // remember it for the next request
return res.status(200).json({ reply: result.reply, model });
}
tried.push(`${model}: ${result.error}`);
// A bad key will not fix itself — stop here and say so.
if (result.status === 401 || result.status === 403) {
return res.status(502).json({
error: "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in Vercel.",
tried
});
}
// Busy (429) or broken model (404)? Just try the next one.
}
console.log("All models failed:", tried.join(" | "));
return res.status(429).json({
error: "AI is busy right now. Please try again in a moment.",
tried
});
}
