// =========================
// 🧠 JHAN-IA CONVERSACIONAL
// =========================

const memoria = {};
const memoriaGlobal = [];

// 🎲 Aleatorio
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔍 Limpiar texto
function limpiar(texto) {
  return texto.toLowerCase().trim();
}

// 🔥 Comparación simple
function similar(a, b) {
  a = limpiar(a);
  b = limpiar(b);
  return a.includes(b) || b.includes(a);
}

// =========================
// ⏰ Saludos según la hora
// =========================
function saludoSegunHora() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "¡Buenos días! ☀️";
  if (h >= 12 && h < 18) return "¡Buenas tardes! 🌤️";
  if (h >= 18 && h < 23) return "¡Buenas noches! 🌙";
  return "¡Hola! 👋";
}

// =========================
// 💬 Respuestas predefinidas
// =========================
const respuestasPredefinidas = [
  { pregunta: "hola", respuesta: saludoSegunHora },
  { pregunta: "buenos dias", respuesta: saludoSegunHora },
  { pregunta: "buenas tardes", respuesta: saludoSegunHora },
  { pregunta: "buenas noches", respuesta: saludoSegunHora },
  { pregunta: "que tal", respuesta: () => "¡Todo bien! 😎 ¿Y tú?" },
  { pregunta: "como estas", respuesta: () => "¡Estoy funcionando perfecto! 🤖" },
  { pregunta: "bien", respuesta: () => "¡Qué bueno! 😄" },
  { pregunta: "mal", respuesta: () => "Oh, espero que mejores pronto 😢" },
  { pregunta: "quien te creo", respuesta: "Mi creador es ANGEL OFC 🤖" },
  { pregunta: "como te llamas", respuesta: "Mi nombre es JHAN-IA 🤖" },
  { pregunta: "hora", respuesta: () => `La hora actual es ${new Date().toLocaleTimeString()} ⏰` },
  { pregunta: "adios", respuesta: () => "¡Hasta luego! 👋" },
  { pregunta: "hasta luego", respuesta: () => "¡Nos vemos pronto! 😊" },
  { pregunta: "gracias", respuesta: () => "¡De nada! 😎" },
];

// =========================
// 🧠 Buscar mejor respuesta
// =========================
function buscarMejorRespuesta(mensaje) {
  const limpio = limpiar(mensaje);

  // 1️⃣ Revisar predefinidas
  for (const item of respuestasPredefinidas) {
    if (similar(item.pregunta, limpio)) {
      return typeof item.respuesta === "function" ? item.respuesta() : item.respuesta;
    }
  }

  // 2️⃣ Revisar memoria global
  const matches = memoriaGlobal.filter(c => similar(c.mensaje, limpio));
  if (matches.length === 0) return null;

  // Ordenar por score
  matches.sort((a, b) => (b.score || 1) - (a.score || 1));

  return matches[0].respuesta;
}

// =========================
// 🤖 Generar respuesta
// =========================
function generarRespuesta(mensaje, usuario = "anonimo") {
  mensaje = limpiar(mensaje);
  if (!memoria[usuario]) memoria[usuario] = [];

  // 1️⃣ Buscar predefinidas o memoria global
  const global = buscarMejorRespuesta(mensaje);
  if (global) return global;

  // 2️⃣ Contexto usuario (respuestas aleatorias para conversación)
  const historial = memoria[usuario];
  if (historial.length > 0) {
    return random([
      "Cuéntame más 🤔",
      "Interesante 😎",
      "Sigue hablando 🔥",
      "Ah, entiendo... 🤖",
      "¡Wow! 🔥",
    ]);
  }

  // 3️⃣ Respuesta base por defecto
  return random([
    "Hmm 🤖",
    "Explícate mejor 😎",
    "No entendí bien 🤔",
  ]);
}

// =========================
// 💾 Guardar memoria
// =========================
function guardarMemoria(usuario, mensaje, respuesta) {
  const data = { mensaje, respuesta, score: 1 };

  // Usuario
  if (!memoria[usuario]) memoria[usuario] = [];
  memoria[usuario].push(data);
  if (memoria[usuario].length > 50) memoria[usuario].shift();

  // Memoria global
  const existente = memoriaGlobal.find(c => c.mensaje === mensaje && c.respuesta === respuesta);
  if (existente) existente.score++;
  else memoriaGlobal.push(data);

  // Limitar memoria global
  if (memoriaGlobal.length > 2000) memoriaGlobal.shift();
}

// =========================
// 📦 Exportar
// =========================
module.exports = {
  generarRespuesta,
  guardarMemoria,
  memoriaGlobal,
  respuestasPredefinidas,
};