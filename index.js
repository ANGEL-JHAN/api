const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { generarRespuesta, guardarMemoria } = require("./ia");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos (index.html, CSS, JS, etc.)
app.use(express.static(path.join(__dirname)));

// 🔑 API KEY por defecto + carga desde keys.json
const KEYS_FILE = "keys.json";
let apiKeys = [{ usuario: "admin", apiKey: "123456" }]; // 🔹 Tu API vieja siempre válida

if (fs.existsSync(KEYS_FILE)) {
  const fileKeys = JSON.parse(fs.readFileSync(KEYS_FILE));
  apiKeys = [...apiKeys, ...fileKeys]; // 🔹 Combina la key 123456 con las generadas
}

// Función para obtener API Key del header o query
function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// =========================
// 🔹 Generador de API Key
// =========================
app.post("/api/generar-key", (req, res) => {
  const { usuario = "anonimo", plan = "free" } = req.body;

  const planes = {
    free: 50,
    pro: 500,
    enterprise: 999999
  };

  const newKey = uuidv4();

  const nuevaKeyObj = {
    usuario,
    apiKey: newKey,
    plan,
    uso: 0,
    limite: planes[plan] || 50
  };

  apiKeys.push(nuevaKeyObj);

  fs.writeFileSync(
    KEYS_FILE,
    JSON.stringify(apiKeys.filter(k => k.apiKey !== "123456"), null, 2)
  );

  res.json({
    apiKey: newKey,
    plan,
    limite: nuevaKeyObj.limite
  });
});

// =========================
// 🟢 Ruta raíz
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =========================
// 🤖 GET /api/ia
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
// 🤖 POST /api/ia
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
// 🔹 Endpoint de chat
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

// 🚀 Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 JHAN-IA corriendo en puerto ${PORT}`);
});