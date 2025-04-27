// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configuração do CORS para permitir origens específicas
const allowedOrigins = [
  "http://localhost:5173", // Frontend local
  "https://clone-github-ten.vercel.app", // Frontend na Vercel (substitua por sua URL real)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origem (como Postman) ou de origens permitidas
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"], // Métodos permitidos
    credentials: true, // Permite enviar cookies ou credenciais, se necessário
  })
);

app.use(express.json());

app.post("/api/authenticate", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Código de autorização não fornecido" });
  }

  const clientId = "Ov23liR0SizuIMoX7iLC";
  const clientSecret = "c691edb19f023abc6032565bd2557e2fa854c263"; 
  const redirectUri = req.headers.origin === "http://localhost:5173"
    ? "http://localhost:5173/verify"
    : "https://clone-github-ten.vercel.app/verify"; 

  if (!clientSecret) {
    console.error("CLIENT_SECRET não está definido nas variáveis de ambiente.");
    return res.status(500).json({ error: "Erro de configuração do servidor" });
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        code,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erro do GitHub:", data);
      return res.status(400).json({ error: data.error_description || "Erro ao autenticar com o GitHub" });
    }

    const { access_token } = data;
    if (!access_token) {
      console.error("Token de acesso não retornado:", data);
      return res.status(400).json({ error: "Token de acesso não retornado pelo GitHub" });
    }

    res.json({ access_token });
  } catch (error) {
    console.error("Erro no servidor:", error.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

const PORT = process.env.PORT || 4000; // Suporte para porta do ambiente (ex.: Render)
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});