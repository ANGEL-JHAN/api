const express = require("express");
const { generarRespuesta } = require("./ia");

const app = express();
app.use(express.json());

// 🔑 API KEY
const apiKeys = ["123456"];

function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// 🟢 Ruta principal
app.get("/", (req, res) => {
  res.send("🚀 API funcionando con IA separada");
});

// 🤖 POST
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);

  if (!key || !apiKeys.includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }

  const { mensaje } = req.body;

  if (!mensaje) {
    return res.json({ error: "Debes enviar un mensaje" });
  }

  const respuesta = generarRespuesta(mensaje);

  // 💾 Guardar en tu API Python
  try {
    const response = await fetch("https://database-2poz.onrender.com/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensaje, respuesta })
    });

    console.log("STATUS:", response.status);
  } catch (error) {
    console.error("Error guardando:", error);
  }

  res.json({ respuesta });
});

// 🚀 Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});