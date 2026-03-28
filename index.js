const express = require("express");
const brain = require("brain.js");

// ✅ IMPORTANTE: activar fetch en Node
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// ✅ Ruta raíz (arregla "Cannot GET /")
app.get("/", (req, res) => {
  res.send("🚀 JHAN-IA funcionando correctamente");
});

// 🧠 Memoria por usuario
const memoria = {};

// 🧠 IA
const net = new brain.NeuralNetwork();

net.train([
  { input: { saludo: 1 }, output: { saludo: 1 } },
  { input: { despedida: 1 }, output: { despedida: 1 } },
  { input: { ayuda: 1 }, output: { ayuda: 1 } },
  { input: { identidad: 1 }, output: { identidad: 1 } },
  { input: { agradecimiento: 1 }, output: { agradecimiento: 1 } }
]);

// 🔍 Procesar texto
function procesar(texto) {
  texto = texto.toLowerCase();

  return {
    saludo: texto.includes("hola") || texto.includes("buenas") ? 1 : 0,
    despedida: texto.includes("adios") || texto.includes("bye") ? 1 : 0,
    ayuda: texto.includes("ayuda") ? 1 : 0,
    identidad:
      texto.includes("quien eres") ||
      texto.includes("tu nombre") ||
      texto.includes("como te llamas")
        ? 1
        : 0,
    agradecimiento: texto.includes("gracias") ? 1 : 0
  };
}

// 🎲 Random
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🤖 Generar respuesta
function generarRespuesta(mensaje, usuario) {
  const texto = mensaje.toLowerCase();
  const input = procesar(mensaje);
  const resultado = net.run(input);

  const historial = memoria[usuario] || [];

  // 👤 CREADOR
  if (
    texto.includes("quien te creo") ||
    texto.includes("quien es tu creador") ||
    texto.includes("quien te hizo") ||
    texto.includes("creador")
  ) {
    return "Mi creador es **ANGEL OFC DEV** 😎🔥";
  }

  // 🤖 NOMBRE
  if (
    texto.includes("como te llamas") ||
    texto.includes("cual es tu nombre") ||
    texto.includes("tu nombre")
  ) {
    return "Mi nombre es JHAN-IA 🤖";
  }

  // 💬 RESPUESTAS IA
  if (resultado.saludo > 0.5) {
    return random([
      "Hola 👋 soy JHAN-IA",
      "Hey 😎 aquí JHAN-IA",
      "Buenas 🔥 soy JHAN-IA"
    ]);
  }

  if (resultado.despedida > 0.5) {
    return random([
      "Adiós 👋",
      "Nos vemos 😎",
      "Hasta luego 🔥"
    ]);
  }

  if (resultado.ayuda > 0.5) {
    return "Claro, soy JHAN-IA 🤖 ¿en qué te ayudo?";
  }

  if (resultado.identidad > 0.5) {
    return "Soy JHAN-IA 🤖, una IA creada por **ANGEL OFC DEV** 🔥";
  }

  if (resultado.agradecimiento > 0.5) {
    return "De nada 😎";
  }

  // 🧠 contexto
  if (historial.length > 0) {
    return "Hmm 🤔, antes dijiste: '" + historial.slice(-1)[0].mensaje + "'";
  }

  return "Interesante... cuéntame más 🤖";
}

// 🔑 API KEY
const apiKeys = ["123456"];

function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// 🤖 API
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

  // 🧠 guardar memoria
  if (!memoria[usuario]) memoria[usuario] = [];

  memoria[usuario].push({
    mensaje,
    respuesta
  });

  // 💾 guardar en DB (con debug)
  try {
    const response = await fetch("https://database-2poz.onrender.com/guardar", {
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

    console.log("✅ STATUS DB:", response.status);

    const text = await response.text();
    console.log("📦 RESPUESTA DB:", text);

  } catch (error) {
    console.log("❌ Error guardando:", error);
  }

  res.json({ respuesta });
});

// 🚀 servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🤖 JHAN-IA activa en puerto " + PORT);
});