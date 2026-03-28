const express = require("express");
const brain = require("brain.js");

const app = express();
app.use(express.json());

// 🟢 Ruta principal
app.get("/", (req, res) => {
  res.send("🚀 API con IA + API KEY funcionando");
});

// 🧠 IA
const net = new brain.NeuralNetwork();

net.train([
  { input: { hola: 1 }, output: { saludo: 1 } },
  { input: { adios: 1 }, output: { despedida: 1 } },
  { input: { ayuda: 1 }, output: { ayuda: 1 } }
]);

function procesar(texto) {
  texto = texto.toLowerCase();
  return {
    hola: texto.includes("hola") ? 1 : 0,
    adios: texto.includes("adios") ? 1 : 0,
    ayuda: texto.includes("ayuda") ? 1 : 0
  };
}

function responder(r) {
  if (r.saludo > 0.5) return "Hola 👋";
  if (r.despedida > 0.5) return "Adiós 🚀";
  if (r.ayuda > 0.5) return "¿En qué te ayudo?";
  return "No entiendo 🤔";
}

// 🔑 API KEYS
const apiKeys = ["123456"];

// 🔐 Obtener API KEY (header o URL)
function obtenerApiKey(req) {
  return req.headers["x-api-key"] || req.query.key;
}

// 🤖 POST protegido
app.post("/api/ia", (req, res) => {
  const key = obtenerApiKey(req);

  if (!key || !apiKeys.includes(key)) {
    return res.status(401).json({ error: "API KEY inválida" });
  }

  const { mensaje } = req.body;

  if (!mensaje) {
    return res.json({ error: "Debes enviar un mensaje" });
  }

  const input = procesar(mensaje);
  const resultado = net.run(input);
  const respuesta = responder(resultado);

  res.json({ respuesta });
});

// 🌐 GET protegido
app.get("/api/ia", (req, res) => {
  const key = obtenerApiKey(req);

  if (!key || !apiKeys.includes(key)) {
    return res.json({ error: "API KEY inválida" });
  }

  const mensaje = req.query.mensaje || "hola";

  const input = procesar(mensaje);
  const resultado = net.run(input);
  const respuesta = responder(resultado);

  res.json({ respuesta });
});

// 🔥 IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT + " 🔐🤖");
});