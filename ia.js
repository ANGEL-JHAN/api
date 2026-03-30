// =========================
// 🧠 MODO DIOS TOTAL
// =========================

const memoria = {};
const memoriaGlobal = [];

// 🎲 random
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔍 limpiar
function limpiar(t) {
  return t.toLowerCase().trim();
}

// 🔥 SIMILITUD SIMPLE
function similar(a, b) {
  a = limpiar(a);
  b = limpiar(b);

  return a.includes(b) || b.includes(a);
}

// =========================
// 🧠 BUSCAR MEJOR RESPUESTA
// =========================
function buscarMejorRespuesta(mensaje) {
  const matches = memoriaGlobal.filter(c =>
    similar(c.mensaje, mensaje)
  );

  if (matches.length === 0) return null;

  // ⭐ ordenar por score
  matches.sort((a, b) => (b.score || 1) - (a.score || 1));

  return matches[0].respuesta;
}

// =========================
// 🤖 GENERAR RESPUESTA
// =========================
function generarRespuesta(mensaje, usuario = "anonimo") {
  mensaje = limpiar(mensaje);

  if (!memoria[usuario]) memoria[usuario] = [];

  // 🔥 1. BUSCAR EN IA GLOBAL
  const global = buscarMejorRespuesta(mensaje);
  if (global) return global + " 🤖";

  // 🔥 2. CONTEXTO USUARIO
  const historial = memoria[usuario];

  if (historial.length > 0) {
    return random([
      "Cuéntame más 🤔",
      "Interesante 😎",
      "Sigue hablando 🔥"
    ]);
  }

  // 🔥 3. RESPUESTA BASE
  return random([
    "Hmm 🤖",
    "Explícate mejor 😎",
    "No entendí bien 🤔"
  ]);
}

// =========================
// 💾 GUARDAR MEMORIA
// =========================
function guardarMemoria(usuario, mensaje, respuesta) {
  const data = {
    mensaje,
    respuesta,
    score: 1
  };

  // usuario
  if (!memoria[usuario]) memoria[usuario] = [];
  memoria[usuario].push(data);

  if (memoria[usuario].length > 20) {
    memoria[usuario].shift();
  }

  // 🔥 GLOBAL (evitar duplicados)
  const existente = memoriaGlobal.find(c =>
    c.mensaje === mensaje && c.respuesta === respuesta
  );

  if (existente) {
    existente.score++; // ⭐ mejora ranking
  } else {
    memoriaGlobal.push(data);
  }

  // limitar memoria
  if (memoriaGlobal.length > 2000) {
    memoriaGlobal.shift();
  }
}

module.exports = {
  generarRespuesta,
  guardarMemoria,
  memoriaGlobal // 🔥 exportamos para API
};