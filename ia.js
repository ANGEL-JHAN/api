// =========================
// 🧠 IA CUSTOMIZABLE - ia.js
// =========================

// Memoria por usuario
const memoria = {};
// Memoria global (para aprender de todas las conversaciones)
const memoriaGlobal = [];

// 🎲 Función para elegir al azar
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔍 Limpiar texto (minúsculas + trim)
function limpiar(texto) {
  return texto.toLowerCase().trim();
}

// 🔥 Comparación simple de similitud
function similar(a, b) {
  a = limpiar(a);
  b = limpiar(b);
  return a.includes(b) || b.includes(a);
}

// =========================
// 📝 PREGUNTAS PREDEFINIDAS
// Puedes agregar más aquí fácilmente
// =========================
const respuestasPredefinidas = [
  { pregunta: "quien te creo", respuesta: "Mi creador es ANGEL OFC 🤖" },
  { pregunta: "como te llamas", respuesta: "Mi nombre es JHAN-IA 🤖" },
  { pregunta: "hola", respuesta: "¡Hola! ¿Cómo estás? 🤖" },
  { pregunta: "adios", respuesta: "¡Hasta luego! 🔥" },
];

// =========================
// 🧠 Buscar mejor respuesta
// =========================
function buscarMejorRespuesta(mensaje) {
  const limpio = limpiar(mensaje);

  // 🔹 1. Revisar preguntas predefinidas
  for (const item of respuestasPredefinidas) {
    if (similar(item.pregunta, limpio)) return item.respuesta;
  }

  // 🔹 2. Revisar memoria global
  const matches = memoriaGlobal.filter(c => similar(c.mensaje, limpio));
  if (matches.length === 0) return null;

  // ⭐ ordenar por score
  matches.sort((a, b) => (b.score || 1) - (a.score || 1));

  return matches[0].respuesta;
}

// =========================
// 🤖 Generar respuesta
// =========================
function generarRespuesta(mensaje, usuario = "anonimo") {
  mensaje = limpiar(mensaje);

  if (!memoria[usuario]) memoria[usuario] = [];

  // 🔹 1. Buscar en preguntas predefinidas o memoria global
  const global = buscarMejorRespuesta(mensaje);
  if (global) return global;

  // 🔹 2. Contexto usuario (respuestas aleatorias)
  const historial = memoria[usuario];
  if (historial.length > 0) {
    return random([
      "Cuéntame más 🤔",
      "Interesante 😎",
      "Sigue hablando 🔥"
    ]);
  }

  // 🔹 3. Respuesta base por defecto
  return random([
    "Hmm 🤖",
    "Explícate mejor 😎",
    "No entendí bien 🤔"
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
  if (memoria[usuario].length > 20) memoria[usuario].shift();

  // Memoria global (evitar duplicados)
  const existente = memoriaGlobal.find(c => c.mensaje === mensaje && c.respuesta === respuesta);
  if (existente) existente.score++;
  else memoriaGlobal.push(data);

  // Limitar memoria global
  if (memoriaGlobal.length > 2000) memoriaGlobal.shift();
}

// =========================
// 📦 Exportar funciones
// =========================
module.exports = {
  generarRespuesta,
  guardarMemoria,
  memoriaGlobal,
  respuestasPredefinidas, // puedes agregar nuevas respuestas desde aquí
};