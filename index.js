const express = require("express");
const cors = require("cors"); // 🔹 Importar CORS
const path = require("path"); // 🔹 Importar path para servir HTML
const fs = require("fs"); // 🔹 Para guardar las API Keys
const { generarRespuesta, guardarMemoria } = require("./ia");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors()); // 🔹 Habilitar CORS

// 🔹 Servir archivos estáticos desde la raíz (para index.html)
app.use(express.static(path.join(__dirname)));

// 🔑 API KEY por defecto
let apiKeys = ["123456"];
const KEYS_FILE = "keys.json";

// 🔹 Cargar keys existentes al iniciar
if (fs.existsSync(KEYS_FILE)) {
  apiKeys = JSON.parse(fs.readFileSync(KEYS_FILE));
}

// 🔹 Función para obtener API Key del header o query
function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// =========================
// 🔹 Generador de API Key
// =========================
app.post("/generate-key", (req, res) => {
  const { usuario = "anonimo" } = req.body;
  const newKey = uuidv4();

  apiKeys.push({ usuario, apiKey: newKey });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(apiKeys, null, 2));

  res.json({
    usuario,
    apiKey: newKey,
    mensaje: "Tu API Key fue generada correctamente"
  });
});

// =========================
// 🟢 Ruta raíz (opcional, ya sirve index.html)
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =========================
// 🤖 GET /api/ia para navegador con query
// =========================
app.get("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.query;

  if (!key || !apiKeys.map(k => k.apiKey).includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }
  if (!mensaje) return res.json({ error: "Falta mensaje en query" });

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    (async () => {
      try {
        const dbRes = await fetch("https://database-2poz.onrender.com/guardar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, mensaje, respuesta, fecha: new Date().toISOString() })
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

// =========================
// 🤖 POST /api/ia para bot
// =========================
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.body;

  if (!key || !apiKeys.map(k => k.apiKey).includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }
  if (!mensaje) return res.status(400).json({ error: "Falta mensaje" });

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    (async () => {
      try {
        const dbRes = await fetch("https://database-2poz.onrender.com/guardar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, mensaje, respuesta, fecha: new Date().toISOString() })
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

// =========================
// 🔹 Endpoint de chat con IA
// =========================
app.post("/chat", (req, res) => {
  const { mensaje, usuario = "anonimo" } = req.body;
  if (!mensaje) return res.status(400).json({ error: "Escribe un mensaje" });

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);
    res.json({ respuesta });
  } catch (err) {
    console.error("❌ Error procesando /chat:", err);
    res.status(500).json({ error: "Error procesando la IA" });
  }
});

// =========================
// 🚀 Servidor
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 JHAN-IA corriendo en puerto ${PORT}`);
});