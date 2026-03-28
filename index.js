const express = require("express");
const { generarRespuesta, guardarMemoria } = require("./ia");

const app = express();
app.use(express.json());

// 🔑 API KEY
const apiKeys = ["123456"];

function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// 🟢 ruta principal
app.get("/", (req, res) => {
  res.send("🚀 API JHAN-IA activa");
});

// 🤖 API IA
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);

  if (!key || !apiKeys.includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }

  const { mensaje, usuario = "anonimo" } = req.body;

  if (!mensaje) {
    return res.json({ error: "Falta mensaje" });
  }

  const respuesta = generarRespuesta(mensaje, usuario);

  guardarMemoria(usuario, mensaje, respuesta);

  // 💾 guardar en tu DB
  try {
    const dbRes = await fetch("https://database-2poz.onrender.com/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario,
        mensaje,
        respuesta,
        fecha: new Date().toISOString()
      })
    });

    const text = await dbRes.text();

    console.log("STATUS:", dbRes.status);
    console.log("RESPUESTA DB:", text);

  } catch (error) {
    console.log("❌ Error guardando:", error);
  }

  res.json({ respuesta });
});

// 🚀 servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🤖 JHAN-IA corriendo en puerto " + PORT);
});