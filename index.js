// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/authenticate", async (req, res) => {
  const { code, code_verifier } = req.body;

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: "Ov23liR0SizuIMoX7iLC",
        code,
        client_secret: "c691edb19f023abc6032565bd2557e2fa854c263",
        redirect_uri: "http://localhost:5173/verify",
        code_verifier,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erro do GitHub:", data);
      return res.status(400).json({ error: data.error_description });
    }

    res.json(data);
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
