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

// 🤖 GET /api/ia para navegador con query ?key=...&mensaje=...
app.get("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.query;

  if (!key || !apiKeys.includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }
  if (!mensaje) {
    return res.json({ error: "Falta mensaje en query" });
  }

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    // Guardar en DB (asíncrono)
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
      } catch (err) {
        console.error("❌ Error guardando en DB:", err.message);
      }
    })();

    res.json({ respuesta });
  } catch (err) {
    console.error("❌ Error procesando mensaje:", err);
    res.status(500).json({ error: "Error procesando la IA" });
  }
});

// 🤖 POST /api/ia para bot
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.body;

  if (!key || !apiKeys.includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }
  if (!mensaje) {
    return res.status(400).json({ error: "Falta mensaje" });
  }

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    // Guardar en DB (asíncrono)
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
      } catch (err) {
        console.error("❌ Error guardando en DB:", err.message);
      }
    })();

    res.json({ respuesta });
  } catch (err) {
    console.error("❌ Error procesando mensaje:", err);
    res.status(500).json({ error: "Error procesando la IA" });
  }
});

// 🚀 Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 JHAN-IA corriendo en puerto ${PORT}`);
});