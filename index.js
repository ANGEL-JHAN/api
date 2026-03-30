// =========================
// 🔥 ANGEL OFC DEV - INDEX.JS COMPLETO
// =========================

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { generarRespuesta, guardarMemoria } = require("./ia");
const { v4: uuidv4 } = require("uuid");

// 🔥 FIX fetch para Node / Render
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// =========================
// ✅ MIDDLEWARES
// =========================
app.use(cors({
  origin: "*",
  methods: ["GET","POST","DELETE"],
  allowedHeaders: ["Content-Type","x-api-key"]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// =========================
// 🔑 CONFIG KEYS
// =========================
const KEYS_FILE = "keys.json";

// Crear archivo si no existe
if (!fs.existsSync(KEYS_FILE)) fs.writeFileSync(KEYS_FILE, "[]");

// Key admin (uso ilimitado)
let apiKeys = [
  {
    usuario: "admin",
    apiKey: process.env.ADMIN_KEY || "123456",
    plan: "admin",
    uso: 0,
    limite: Infinity,
    ultimoReset: new Date().toISOString()
  }
];

// Cargar keys externas
try {
  const fileKeys = JSON.parse(fs.readFileSync(KEYS_FILE));
  apiKeys = [...apiKeys, ...fileKeys.filter(fk => !apiKeys.some(k => k.apiKey === fk.apiKey))];
} catch (err) {
  console.error("❌ Error leyendo keys.json");
}

// Guardar keys
function guardarKeys() {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(apiKeys.filter(k=>k.plan!=="admin"), null, 2));
}

// =========================
// 🔹 Obtener API key
// =========================
function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// =========================
// 🔹 Validar y reset diario
// =========================
function validarKey(key, res) {
  if (!key) { res.status(401).json({ error:"Falta API KEY" }); return null; }

  const keyData = apiKeys.find(k => k.apiKey === key);
  if (!keyData) { res.status(401).json({ error:"API KEY inválida" }); return null; }

  // Reset diario cada 24h (solo planes normales)
  if (keyData.plan !== "admin") {
    const ahora = new Date();
    const ultimoReset = new Date(keyData.ultimoReset || 0);
    const diff = ahora - ultimoReset;
    if (diff >= 24*60*60*1000) { // 24 horas
      keyData.uso = 0;
      keyData.ultimoReset = ahora.toISOString();
    }
  }

  if (keyData.uso >= keyData.limite) {
    res.status(403).json({ error:"Límite alcanzado" });
    return null;
  }

  return keyData;
}

// =========================
// 🔹 GENERAR NUEVA KEY
// =========================
app.post("/api/generar-key", async (req, res) => {
  const { usuario="anonimo", plan="free" } = req.body;

  const planes = { free:50, pro:500, enterprise:999999 };
  if (!planes[plan]) return res.status(400).json({ error:"Plan inválido" });

  const newKey = uuidv4();
  const nuevaKey = {
    usuario,
    apiKey: newKey,
    plan,
    uso: 0,
    limite: planes[plan],
    ultimoReset: new Date().toISOString()
  };

  apiKeys.push(nuevaKey);
  guardarKeys();

  // 🔥 Guardar también en DB externa
  try {
    await fetch("https://database-2poz.onrender.com/guardar-key", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(nuevaKey)
    });
  } catch(err) {
    console.error("❌ Error guardando en DB externa:", err.message);
  }

  res.json({ apiKey:newKey, plan, limite:nuevaKey.limite });
});

// =========================
// 🔹 OBTENER KEYS DE UN USUARIO
// =========================
app.get("/api/mis-keys/:usuario", async (req, res) => {
  const { usuario } = req.params;

  try {
    // Filtrar solo las keys del usuario
    const userKeys = apiKeys.filter(k => k.usuario === usuario);

    res.json(userKeys);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo keys" });
  }
});

// =========================
// 🗑️ ELIMINAR KEY
// =========================
app.delete("/api/eliminar-key/:key", (req, res) => {
  const { key } = req.params;
  const antes = apiKeys.length;
  apiKeys = apiKeys.filter(k => k.apiKey !== key);
  guardarKeys();

  if (apiKeys.length === antes) return res.status(404).json({ error:"Key no encontrada" });
  res.json({ success:true });
});

// =========================
// 🤖 ENDPOINT IA
// =========================
app.post("/api/ia", async (req, res) => {
  const key = obtenerApiKey(req);
  const { mensaje, usuario="anonimo" } = req.body;

  const keyData = validarKey(key, res);
  if (!keyData) return;
  if (!mensaje) return res.status(400).json({ error:"Falta mensaje" });

  try {
    // 🔹 generar respuesta
    const respuesta = generarRespuesta(mensaje, usuario);

    // 🔹 guardar memoria
    guardarMemoria(usuario, mensaje, respuesta);

    // 🔹 incrementar uso y guardar
    if (keyData.plan !== "admin") {
      keyData.uso++;
      guardarKeys();
    }

    // 🔹 guardar DB externa
    try {
      await fetch("https://database-2poz.onrender.com/guardar", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ usuario, mensaje, respuesta, fecha:new Date().toISOString() })
      });
    } catch(err) { console.error("❌ DB externa:", err.message); }

    res.json({
      respuesta,
      uso: keyData.uso,
      limite: keyData.limite,
      restante: keyData.limite - keyData.uso
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error:"Error IA" });
  }
});

// =========================
// 🟢 ENDPOINT ROOT
// =========================
app.get("/", (req,res)=> res.sendFile(path.join(__dirname,"index.html")));

// =========================
// 🚀 RUN SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🔥 JHAN-IA corriendo en puerto ${PORT}`));