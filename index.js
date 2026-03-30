const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// 🔥 IMPORT IA CON MEMORIA GLOBAL
const { generarRespuesta, guardarMemoria, memoriaGlobal } = require("./ia");

const { v4: uuidv4 } = require("uuid");

// 🔥 fetch fix
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// =========================
// 🔥 CORS PRO
// =========================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "x-api-key"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// =========================
// 🔑 KEYS
// =========================
const KEYS_FILE = "keys.json";

if (!fs.existsSync(KEYS_FILE)) {
  fs.writeFileSync(KEYS_FILE, "[]");
}

let apiKeys = [
  {
    usuario: "admin",
    apiKey: process.env.ADMIN_KEY || "123456",
    plan: "admin",
    uso: 0,
    limite: 999999
  }
];

// cargar keys
try {
  const fileKeys = JSON.parse(fs.readFileSync(KEYS_FILE));
  apiKeys = [
    ...apiKeys,
    ...fileKeys.filter(fk => !apiKeys.some(k => k.apiKey === fk.apiKey))
  ];
} catch (err) {
  console.error("Error leyendo keys.json");
}

function guardarKeys() {
  fs.writeFileSync(
    KEYS_FILE,
    JSON.stringify(apiKeys.filter(k => k.plan !== "admin"), null, 2)
  );
}

function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// =========================
// 🔑 GENERAR KEY
// =========================
app.post("/api/generar-key", (req, res) => {
  const { usuario = "anonimo", plan = "free" } = req.body;

  const planes = {
    free: 50,
    pro: 500,
    enterprise: 999999
  };

  if (!planes[plan]) {
    return res.status(400).json({ error: "Plan inválido" });
  }

  const apiKey = uuidv4();

  const nuevaKey = {
    usuario,
    apiKey,
    plan,
    uso: 0,
    limite: planes[plan]
  };

  apiKeys.push(nuevaKey);
  guardarKeys();

  res.json({ apiKey, plan, limite: nuevaKey.limite });
});

// =========================
// 🔑 LISTAR KEYS
// =========================
app.get("/api/mis-keys/:usuario", (req, res) => {
  const keys = apiKeys
    .filter(k => k.usuario === req.params.usuario)
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
// 🗑️ DELETE KEY
// =========================
app.delete("/api/eliminar-key/:key", (req, res) => {
  const before = apiKeys.length;

  apiKeys = apiKeys.filter(k => k.apiKey !== req.params.key);
  guardarKeys();

  if (apiKeys.length === before) {
    return res.status(404).json({ error: "No encontrada" });
  }

  res.json({ success: true });
});

// =========================
// 🔐 VALIDAR KEY
// =========================
function validarKey(key, res) {
  if (!key) {
    res.status(401).json({ error: "Falta API KEY" });
    return null;
  }

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
// 🧠 ENTRENAR IA DESDE DB
// =========================
async function cargarIADesdeDB() {
  try {
    const res = await fetch("https://database-2poz.onrender.com/todos");
    const data = await res.json();

    data.forEach(item => {
      if (
        item.mensaje &&
        item.respuesta &&
        !memoriaGlobal.some(
          m => m.mensaje === item.mensaje && m.respuesta === item.respuesta
        )
      ) {
        memoriaGlobal.push({
          mensaje: item.mensaje,
          respuesta: item.respuesta,
          score: 1
        });
      }
    });

    console.log("🧠 IA entrenada desde DB:", memoriaGlobal.length);
  } catch (err) {
    console.error("Error entrenando IA:", err.message);
  }
}

// 🔥 cargar al iniciar
cargarIADesdeDB();

// =========================
// 🤖 IA (POST)
// =========================
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario = "anonimo" } = req.body;

  const keyData = validarKey(key, res);
  if (!keyData) return;

  if (!mensaje) {
    return res.status(400).json({ error: "Falta mensaje" });
  }

  try {
    const respuesta = generarRespuesta(mensaje, usuario);

    // guardar memoria local + global
    guardarMemoria(usuario, mensaje, respuesta);

    keyData.uso++;
    guardarKeys();

    // 🔥 guardar en DB
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
      console.error("DB error:", err.message);
    }

    res.json({
      respuesta,
      uso: keyData.uso,
      restante: keyData.limite - keyData.uso
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error IA" });
  }
});

// =========================
// 🚀 SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 JHAN-IA MODO DIOS en puerto ${PORT}`);
});