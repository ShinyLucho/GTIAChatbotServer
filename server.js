// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));

// CORS fin : ouvre pendant les tests, resserre ensuite via ALLOWED_ORIGINS
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Origin not allowed by CORS"));
  }
}));

app.get("/", (_, res) => res.type("text").send("OK"));   // ← évite la page 502/“Cannot GET /”
app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, temperature } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || process.env.FT_MODEL_ID || "ft:gpt-3.5-turbo-0125:personal:coucou:CR2exqnX",
        messages,
        temperature: typeof temperature === "number" ? temperature : 0,
      }),
    });

    // Transmet le statut réel (utile pour debug 401/429)
    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "server_error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Proxy en ligne sur :${port}`));
