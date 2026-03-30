const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch"); // 🔥 IMPORTANTE
const { generarRespuesta, guardarMemoria } = require("./ia");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// 🔑 ARCHIVO DE KEYS
const KEYS_FILE = "keys.json";

// 🔹 API KEY base
let apiKeys = [
  {
    usuario: "admin",
    apiKey: "123456",
    plan: "admin",
    uso: 0,
    limite: 999999
  }
];

// 🔹 Cargar keys guardadas
if (fs.existsSync(KEYS_FILE)) {
  const fileKeys = JSON.parse(fs.readFileSync(KEYS_FILE));
  apiKeys = [...apiKeys, ...fileKeys];
}

// 🔹 Obtener API KEY
function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// =========================
// 🔹 GENERAR API KEY
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
// 🟢 ROOT
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =========================
// 🔐 VALIDACIÓN PRO
// =========================
function validarKey(key, res) {
  const keyData = apiKeys.find(k => k.apiKey === key);

  if (!keyData) {
    res.status(401).json({ error: "API KEY inválida" });
    return null;
  }

  if (keyData.uso >= keyData.limite) {
    res.status(403).json({ error: "Límite de uso alcanzado" });
    return null;
  }

  return keyData;
}

// =========================
// 🤖 GET /api/ia
// =========================
app.get("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.query;

  const keyData = validarKey(key, res);
  if (!keyData) return;

  if (!mensaje) return res.json({ error: "Falta mensaje" });

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    // 🔥 SUMAR USO
    keyData.uso++;

    fs.writeFileSync(
      KEYS_FILE,
      JSON.stringify(apiKeys.filter(k => k.apiKey !== "123456"), null, 2)
    );

    // 💾 Guardar en DB
    (async () => {
      try {
        await fetch("https://database-2poz.onrender.com/guardar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario,
            mensaje,
            respuesta,
            fecha: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error("❌ Error DB:", err.message);
      }
    })();

    res.json({
      respuesta,
      uso: keyData.uso,
      limite: keyData.limite,
      restante: keyData.limite - keyData.uso
    });

  } catch (err) {
    console.error("❌ Error IA:", err);
    res.status(500).json({ error: "Error procesando la IA" });
  }
});

// =========================
// 🤖 POST /api/ia
// =========================
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.body;

  const keyData = validarKey(key, res);
  if (!keyData) return;

  if (!mensaje) return res.status(400).json({ error: "Falta mensaje" });

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    // 🔥 SUMAR USO
    keyData.uso++;

    fs.writeFileSync(
      KEYS_FILE,
      JSON.stringify(apiKeys.filter(k => k.apiKey !== "123456"), null, 2)
    );

    // 💾 Guardar en DB
    (async () => {
      try {
        await fetch("https://database-2poz.onrender.com/guardar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario,
            mensaje,
            respuesta,
            fecha: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error("❌ Error DB:", err.message);
      }
    })();

    res.json({
      respuesta,
      uso: keyData.uso,
      limite: keyData.limite,
      restante: keyData.limite - keyData.uso
    });

  } catch (err) {
    console.error("❌ Error IA:", err);
    res.status(500).json({ error: "Error procesando la IA" });
  }
});

// =========================
// 💬 CHAT LIBRE
// =========================
app.post("/chat", (req, res) => {
  const { mensaje, usuario = "anonimo" } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: "Escribe un mensaje" });
  }

  try {
    const respuesta = generarRespuesta(mensaje, usuario);
    guardarMemoria(usuario, mensaje, respuesta);

    res.json({ respuesta });

  } catch (err) {
    console.error("❌ Error /chat:", err);
    res.status(500).json({ error: "Error procesando la IA" });
  }
});

// 🚀 SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 JHAN-IA corriendo en puerto ${PORT}`);
});