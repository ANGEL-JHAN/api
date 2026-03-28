const express = require("express");
const brain = require("brain.js");

const app = express();
app.use(express.json());

// 🧠 Memoria por usuario (tipo ChatGPT)
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
    identidad: texto.includes("quien eres") || texto.includes("tu nombre") ? 1 : 0,
    agradecimiento: texto.includes("gracias") ? 1 : 0
  };
}

// 🎲 Respuestas tipo humano
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🤖 Generar respuesta estilo ChatGPT
function generarRespuesta(mensaje, usuario) {
  const input = procesar(mensaje);
  const resultado = net.run(input);

  // 🧠 contexto anterior
  const historial = memoria[usuario] || [];

  if (resultado.saludo > 0.5) {
    return random(["Hola 👋", "Hey 😎", "Buenas 🔥"]);
  }

  if (resultado.despedida > 0.5) {
    return random(["Adiós 👋", "Nos vemos 😎"]);
  }

  if (resultado.ayuda > 0.5) {
    return "Claro, dime qué necesitas 😊";
  }

  if (resultado.identidad > 0.5) {
    return "Soy tu IA estilo ChatGPT creada por ti 🤖🔥";
  }

  if (resultado.agradecimiento > 0.5) {
    return "De nada 😎";
  }

  // 🧠 respuesta con contexto
  if (historial.length > 0) {
    return "Hmm 🤔, antes me dijiste: '" + historial.slice(-1)[0].mensaje + "'";
  }

  return "Interesante... cuéntame más 🤖";
}

// 🔑 API KEY
const apiKeys = ["123456"];

function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// 🤖 API principal
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

  // 🧠 guardar memoria local
  if (!memoria[usuario]) memoria[usuario] = [];

  memoria[usuario].push({
    mensaje,
    respuesta
  });

  // 💾 guardar en tu DB (Render)
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
  } catch (error) {
    console.log("Error guardando:", error);
  }

  res.json({ respuesta });
});

// 🚀 servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🤖 IA estilo ChatGPT activa en puerto " + PORT);
});