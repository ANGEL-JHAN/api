const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { generarRespuesta, guardarMemoria } = require("./ia");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos
app.use(express.static(path.join(__dirname)));

// =========================
// 🔑 CONFIG KEYS (DB FAKE)
// =========================
const KEYS_FILE = "keys.json";

let apiKeys = [
  {
    usuario: "admin",
    apiKey: "123456",
    plan: "admin",
    uso: 0,
    limite: 999999
  }
];

// Cargar keys
if (fs.existsSync(KEYS_FILE)) {
  const fileKeys = JSON.parse(fs.readFileSync(KEYS_FILE));
  apiKeys = [...apiKeys, ...fileKeys];
}

// Guardar keys
function guardarKeys() {
  fs.writeFileSync(
    KEYS_FILE,
    JSON.stringify(apiKeys.filter(k => k.apiKey !== "123456"), null, 2)
  );
}

// Obtener API key
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

  const nuevaKey = {
    usuario,
    apiKey: newKey,
    plan,
    uso: 0,
    limite: planes[plan] || 50
  };

  apiKeys.push(nuevaKey);
  guardarKeys();

  res.json({
    apiKey: newKey,
    plan,
    limite: nuevaKey.limite
  });
});

// =========================
// 🔑 OBTENER KEYS
// =========================
app.get("/api/mis-keys/:usuario", (req, res) => {
  const { usuario } = req.params;

  const keys = apiKeys
    .filter(k => k.usuario === usuario)
    .map(k => ({
      apiKey: k.apiKey,
      plan: k.plan,
      uso: k.uso,
      limite: k.limite,
      restante: k.limite - k.uso
    }));

  res.json(keys);
});

// =========================
// 🗑️ ELIMINAR KEY
// =========================
app.delete("/api/eliminar-key/:key", (req, res) => {
  const { key } = req.params;

  apiKeys = apiKeys.filter(k => k.apiKey !== key);
  guardarKeys();

  res.json({ success: true });
});

// =========================
// 🟢 ROOT
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =========================
// 🔐 VALIDACIÓN
// =========================
function validarKey(key, res) {
  const keyData = apiKeys.find(k => k.apiKey === key);

  if (!keyData) {
    res.status(401).json({ error: "API KEY inválida" });
    return null;
  }

  if (keyData.uso >= keyData.limite) {
    res.status(403).json({ error: "Límite alcanzado" });
    return null;
  }

  return keyData;
}

// =========================
// 🤖 IA (GET)
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

    keyData.uso++;
    guardarKeys();

    // Guardar en DB externa
    try {
      await fetch("https://database-2poz.onrender.com/guardar", {
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
    } catch (err) {
      console.error("Error DB:", err.message);
    }

    res.json({
      respuesta,
      uso: keyData.uso,
      limite: keyData.limite,
      restante: keyData.limite - keyData.uso
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error IA" });
  }
});

// =========================
// 🤖 IA (POST)
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

    keyData.uso++;
    guardarKeys();

    try {
      await fetch("https://database-2poz.onrender.com/guardar", {
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
    } catch (err) {
      console.error("Error DB:", err.message);
    }

    res.json({
      respuesta,
      uso: keyData.uso,
      limite: keyData.limite,
      restante: keyData.limite - keyData.uso
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error IA" });
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
    res.status(500).json({ error: "Error IA" });
  }
});

// =========================
// 🚀 SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 JHAN-IA corriendo en puerto ${PORT}`);
});