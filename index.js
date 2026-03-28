const express = require("express");
const { generarRespuesta, guardarMemoria } = require("./ia");

const app = express();
app.use(express.json());

// 🔑 API KEY
const apiKeys = ["123456"];

// Función para obtener API Key del header o query
function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// 🟢 Ruta raíz
app.get("/", (req, res) => {
  res.send("🚀 API JHAN-IA activa");
});

// 🌐 GET para pruebas de la API en navegador
app.get("/api/ia", (req, res) => {
  res.send("✅ API IA activa. Usa POST para enviar mensajes.");
});

// 🤖 POST /api/ia
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);

  if (!key || !apiKeys.includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }

  const { mensaje, usuario = "anonimo" } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: "Falta mensaje" });
  }

  // Generar respuesta del bot
  let respuesta;
  try {
    respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);
  } catch (err) {
    console.error("❌ Error en IA:", err);
    return res.status(500).json({ error: "Error procesando la IA" });
  }

  // Guardar en tu DB externa (pero no bloquea la respuesta al bot)
  (async () => {
    try {
      const dbRes = await fetch("https://database-2poz.onrender.com/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario,
          mensaje,
          respuesta,
          fecha: new Date().toISOString()
        })
      });

      const text = await dbRes.text();
      console.log("💾 Guardado en DB:", text);
    } catch (error) {
      console.error("❌ Error guardando en DB:", error.message);
      // No bloquea la respuesta al bot
    }
  })();

  // Responder al cliente inmediatamente
  res.json({ respuesta });
});

// 🚀 Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 JHAN-IA corriendo en puerto ${PORT}`);
});