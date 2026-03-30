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
// 🧠 RESPUESTAS PREDEFINIDAS MASIVAS - JHAN-IA
// =========================

const respuestasPredefinidas = [];

// ---------- Creador ----------
const creador = "ANGEL OFC";
const nombreBot = "JHAN-IA";

const creadorPreguntas = [
  "quien es tu creador","quien te creo","tu creador",
  "quien te diseño","quien te programo","quien te hizo",
  "autor","desarrollador","programador",
  "nombre del creador","como se llama tu creador",
  "cual es el nombre de tu creador"
];

for(let i=0; i<50; i++){
  creadorPreguntas.forEach(p => {
    respuestasPredefinidas.push({ pregunta: [p], respuesta: `Mi creador es ${creador} 🤖` });
  });
}

// ---------- Nombre del bot ----------
const nombrePreguntas = [
  "como te llamas","cual es tu nombre","tu nombre",
  "quien eres","como te identificas",
  "nombre del bot","como te llaman","tu nombre es",
  "quien es jhan-ia"
];

for(let i=0;i<50;i++){
  nombrePreguntas.forEach(p=>{
    respuestasPredefinidas.push({ pregunta:[p], respuesta:`Mi nombre es ${nombreBot} 🤖` });
  });
}

// ---------- Saludos ----------
const saludos = [
  "hola","buenos dias","buenas tardes","buenas noches",
  "que tal","como estas","qué tal","holaa","hey","buen dia",
  "saludos","buenas"
];

for(let i=0;i<100;i++){
  saludos.forEach(p=>{
    respuestasPredefinidas.push({ 
      pregunta:[p], 
      respuesta: ()=> {
        const h = new Date().toLocaleTimeString("es-PE",{ hour:"2-digit", hour12:false, timeZone:"America/Lima" });
        const hour = parseInt(h.split(":")[0]);
        if(hour<12) return "¡Buenos días! 😎 ¿Cómo estás?";
        if(hour<18) return "¡Buenas tardes! 😎 ¿Cómo estás?";
        return "¡Buenas noches! 😎 ¿Cómo estás?";
      } 
    });
  });
}

// ---------- Estado ----------
const estados = [
  "bien","muy bien","todo bien","excelente","mal","no muy bien","triste","cansado",
  "feliz","genial","contento","agotado","estresado","relajado"
];

for(let i=0;i<50;i++){
  estados.forEach(p=>{
    if(["bien","muy bien","todo bien","excelente","feliz","genial","contento"].includes(p)){
      respuestasPredefinidas.push({ pregunta:[p], respuesta:"¡Qué bueno! Me alegra escucharlo 😎" });
    } else {
      respuestasPredefinidas.push({ pregunta:[p], respuesta:"Lo siento 😔 ¿quieres contarme qué pasó?" });
    }
  });
}

// ---------- Despedidas ----------
const despedidas = ["adios","nos vemos","chao","hasta luego","bye","goodbye"];

for(let i=0;i<50;i++){
  despedidas.forEach(p=>{
    respuestasPredefinidas.push({ pregunta:[p], respuesta:"Hasta luego 👋 ¡Que tengas un buen día!" });
  });
}

// ---------- Hora / Fecha ----------
const tiempo = ["hora","que hora es","dime la hora","que dia es hoy","fecha","hoy es"];

for(let i=0;i<50;i++){
  tiempo.forEach(p=>{
    if(["hora","que hora es","dime la hora"].includes(p)){
      respuestasPredefinidas.push({ pregunta:[p], respuesta:()=>`La hora actual en Perú es ${new Date().toLocaleTimeString("es-PE",{ hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"America/Lima" })} ⏰` });
    } else {
      respuestasPredefinidas.push({ pregunta:[p], respuesta:()=>`Hoy en Perú es ${new Date().toLocaleDateString("es-PE",{ weekday:"long", year:"numeric", month:"long", day:"numeric", timeZone:"America/Lima" })} 📅` });
    }
  });
}

// ---------- Conversación general (frases comunes) ----------
const conversacion = [
  "gracias","muchas gracias","thank you","de nada","ok","vale","perfecto","entiendo","claro","si","sí","no","tal vez","quizás","quizá","okey","genial"
];

for(let i=0;i<50;i++){
  conversacion.forEach(p=>{
    if(["gracias","muchas gracias","thank you"].includes(p)){
      respuestasPredefinidas.push({ pregunta:[p], respuesta:"¡De nada! 🤖 Siempre estoy aquí para ayudarte" });
    } else if(["ok","vale","perfecto","entiendo","claro","si","sí","okey","genial"].includes(p)){
      respuestasPredefinidas.push({ pregunta:[p], respuesta:"¡Entendido! 😎" });
    } else if(["no","tal vez","quizás","quizá"].includes(p)){
      respuestasPredefinidas.push({ pregunta:[p], respuesta:"Hmm 🤔 ¿Quieres explicarme más?" });
    }
  });
}

// ---------- Esto ya genera cientos de combinaciones ----------
console.log(`✅ Respuestas predefinidas cargadas: ${respuestasPredefinidas.length}`);

module.exports = { respuestasPredefinidas }; 

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