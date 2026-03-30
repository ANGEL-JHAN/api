// =========================
// 🧠 MODO DIOS TOTAL - JHAN-IA
// =========================

const memoria = {};
const memoriaGlobal = [];

// 🎲 Función random
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔍 Normalizar texto
function limpiar(t) {
  return t.toLowerCase().trim();
}

// 🔥 Comparación simple
function similar(a, b) {
  a = limpiar(a);
  b = limpiar(b);
  return a.includes(b) || b.includes(a);
}

// =========================
// 🧠 BUSCAR MEJOR RESPUESTA GLOBAL
// =========================
function buscarMejorRespuesta(mensaje) {
  const matches = memoriaGlobal.filter(c =>
    similar(c.mensaje, mensaje)
  );

  if (matches.length === 0) return null;

  matches.sort((a, b) => (b.score || 1) - (a.score || 1));

  return matches[0].respuesta;
}

// =========================
// 🌎 Obtener fecha/hora en Perú
// =========================
function horaPeru() {
  return new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Lima" });
}

function fechaPeru() {
  return new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Lima" });
}

// =========================
// 💬 RESPUESTAS PREDEFINIDAS
// =========================
const respuestasPredefinidas = [
  // ---------- Creador ----------
  { pregunta: ["quien es tu creador","quien te creo","tu creador","quien te diseño","quien te programo","quien te hizo"], 
    respuesta: "Mi creador es ANGEL OFC 🤖" },
  { pregunta: ["como se llama tu creador","nombre del creador","cual es el nombre de tu creador"], 
    respuesta: "El nombre de mi creador es ANGEL OFC 🤖" },
  { pregunta: ["autor","desarrollador","programador"], 
    respuesta: "Fui creado por ANGEL OFC, el desarrollador principal 🤖" },

  // ---------- Nombre del bot ----------
  { pregunta: ["como te llamas","cual es tu nombre","tu nombre","quien eres","como te identificas"], 
    respuesta: "Mi nombre es JHAN-IA 🤖" },
  { pregunta: ["nombre del bot","como te llaman","tu nombre es"], 
    respuesta: "Soy JHAN-IA, tu asistente inteligente 🤖" },
  { pregunta: ["quien es jhan-ia"], 
    respuesta: "Yo soy JHAN-IA, creado por ANGEL OFC 🤖" },

  // ---------- Saludos ----------
  { pregunta: ["hola","buenos dias","buenas tardes","buenas noches","que tal","como estas","qué tal"], 
    respuesta: () => {
      const h = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", hour12: false, timeZone: "America/Lima" });
      const hour = parseInt(h.split(":")[0]);
      if(hour<12) return "¡Buenos días! 😎 ¿Cómo estás?";
      if(hour<18) return "¡Buenas tardes! 😎 ¿Cómo estás?";
      return "¡Buenas noches! 😎 ¿Cómo estás?";
    }
  },
  { pregunta: ["bien","muy bien","todo bien","excelente"], 
    respuesta: "¡Qué bueno! Me alegra escucharlo 😎" },
  { pregunta: ["mal","no muy bien","triste","cansado"], 
    respuesta: "Lo siento 😔 ¿quieres contarme qué pasó?" },

  // ---------- Conversación ----------
  { pregunta: ["gracias","muchas gracias","thank you"], 
    respuesta: "¡De nada! 🤖 Siempre estoy aquí para ayudarte" },
  { pregunta: ["adios","nos vemos","chao"], 
    respuesta: "Hasta luego 👋 ¡Que tengas un buen día!" },
  { pregunta: ["hora","que hora es","dime la hora"], 
    respuesta: () => `La hora actual en Perú es ${horaPeru()} ⏰` },
  { pregunta: ["que dia es hoy","fecha","hoy es"], 
    respuesta: () => `Hoy en Perú es ${fechaPeru()} 📅` },
];

// =========================
// 🤖 GENERAR RESPUESTA
// =========================
function generarRespuesta(mensaje, usuario = "anonimo") {
  mensaje = limpiar(mensaje);

  if(!memoria[usuario]) memoria[usuario] = [];

  // 1️⃣ Buscar en memoria global
  const global = buscarMejorRespuesta(mensaje);
  if(global) return global + " 🤖";

  // 2️⃣ Buscar en respuestas predefinidas
  for(const item of respuestasPredefinidas){
    if(item.pregunta.some(p => similar(p, mensaje))){
      return typeof item.respuesta === "function" ? item.respuesta() : item.respuesta;
    }
  }

  // 3️⃣ Contexto usuario
  const historial = memoria[usuario];
  if(historial.length>0){
    return random([
      "Cuéntame más 🤔",
      "Interesante 😎",
      "Sigue hablando 🔥"
    ]);
  }

  // 4️⃣ Respuesta base
  return random([
    "Hmm 🤖",
    "Explícate mejor 😎",
    "No entendí bien 🤔"
  ]);
}

// =========================
// 💾 GUARDAR MEMORIA
// =========================
function guardarMemoria(usuario,mensaje,respuesta){
  const data = { mensaje, respuesta, score:1 };

  if(!memoria[usuario]) memoria[usuario] = [];
  memoria[usuario].push(data);
  if(memoria[usuario].length>20) memoria[usuario].shift();

  const existente = memoriaGlobal.find(c=>c.mensaje===mensaje && c.respuesta===respuesta);
  if(existente){ existente.score++; } 
  else { memoriaGlobal.push(data); }
  if(memoriaGlobal.length>2000) memoriaGlobal.shift();
}

module.exports = { generarRespuesta, guardarMemoria, memoriaGlobal };