// 🧠 memoria por usuario
const memoria = {};

// 🎲 random
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 📚 mega diccionario (500+ palabras)
const diccionario = {
  saludo: [
    "hola","holaaa","holi","holis","hello","hey","heyyy","buenas","buenos dias",
    "buenas tardes","buenas noches","que tal","q tal","ola","holap","holaa",
    "holiwis","holiwis","saludos","saludo","ey","eyy","wena","wenas","hi","hi!",
    "hola bro","hola amigo","hola crack","hola genio","hola maquina","hola jefe",
    "holaaa que tal","holaaaa","holaaa bro","holaaa amigo","holaaa crack"
  ],

  despedida: [
    "adios","adiós","bye","goodbye","nos vemos","hasta luego","hasta pronto",
    "me voy","chao","chau","hasta mañana","hasta luego bro","bye bye","me retiro",
    "nos vidrios","me largo","salgo","hasta la vista","hasta despues"
  ],

  ayuda: [
    "ayuda","help","auxilio","necesito ayuda","puedes ayudarme","me ayudas",
    "tengo un problema","soporte","asistencia","ayudame","help me","socorro",
    "puedes ayudar","me echas una mano","tengo dudas","explicame","explícame"
  ],

  identidad: [
    "quien eres","qué eres","que eres","eres un bot","eres humano",
    "eres real","eres una ia","eres inteligencia artificial","quien sos",
    "que cosa eres","eres robot","eres programa","eres maquina"
  ],

  nombre: [
    "como te llamas","cual es tu nombre","tu nombre","dime tu nombre",
    "nombre","como te dicen","tu apodo","tienes nombre"
  ],

  creador: [
    "quien te creo","quien te hizo","quien es tu creador",
    "tu creador","quien te programo","quien te desarrollo",
    "de donde vienes","quien te invento"
  ],

  gracias: [
    "gracias","muchas gracias","thanks","thank you","te lo agradezco",
    "gracias bro","gracias amigo","te agradezco","mil gracias","gracias crack"
  ],

  confirmacion: [
    "ok","oke","vale","listo","perfecto","esta bien","está bien",
    "de acuerdo","correcto","okey","oki","okey dokey"
  ],

  insultos: [
    "tonto","idiota","estupido","imbecil","callate","cállate","no sirves",
    "eres malo","eres inutil","basura","feo","tonto bot","mal bot"
  ],

  emociones: [
    "triste","feliz","enojado","molesto","contento","deprimido","cansado",
    "estresado","aburrido","emocionado","nervioso","ansioso"
  ]
};

// 🔍 detector masivo
function detectar(mensaje) {
  const t = mensaje.toLowerCase();

  const result = {};

  for (let tipo in diccionario) {
    result[tipo] = diccionario[tipo].some(p => t.includes(p));
  }

  result.pregunta = t.includes("?");

  return result;
}

// 🤖 IA ULTRA
function generarRespuesta(mensaje, usuario = "anonimo") {
  const intent = detectar(mensaje);

  if (!memoria[usuario]) memoria[usuario] = [];

  const historial = memoria[usuario];

  // 👤 creador
  if (intent.creador) {
    return "Mi creador es **ANGEL OFC DEV** 😎🔥";
  }

  // 🤖 nombre
  if (intent.nombre) {
    return "Mi nombre es JHAN-IA 🤖";
  }

  // 👋 saludo
  if (intent.saludo) {
    return random([
      "Hola 👋 ¿Cómo estás?",
      "Hey 😎 ¿Qué tal?",
      "Buenas 🔥 dime en qué te ayudo",
      "Hola humano 🤖"
    ]);
  }

  // 👋 despedida
  if (intent.despedida) {
    return random([
      "Adiós 👋",
      "Nos vemos 😎",
      "Cuídate 🔥",
      "Hasta luego crack"
    ]);
  }

  // ❓ ayuda
  if (intent.ayuda) {
    return "Claro 😎 puedo responder preguntas, conversar contigo y aprender contigo 🔥";
  }

  // 🤖 identidad
  if (intent.identidad) {
    return "Soy JHAN-IA, una inteligencia creada por **ANGEL OFC DEV** 🤖🔥";
  }

  // 🙏 gracias
  if (intent.gracias) {
    return random([
      "De nada 😎",
      "Para eso estoy 🔥",
      "No hay problema crack"
    ]);
  }

  // 👍 confirmación
  if (intent.confirmacion) {
    return "Perfecto 👍";
  }

  // 😡 insultos
  if (intent.insultos) {
    return random([
      "Hey 😅 tranquilo, estoy aquí para ayudarte",
      "No hace falta insultar 🤖",
      "Podemos llevarnos bien 😎"
    ]);
  }

  // 😊 emociones
  if (intent.emociones) {
    return "Entiendo cómo te sientes 🤔 ¿quieres hablar de eso?";
  }

  // 🧠 contexto
  if (historial.length > 0) {
    if (intent.pregunta) {
      return "Buena pregunta 🤔 dame más detalles para ayudarte mejor";
    }

    return random([
      "Interesante 🤔",
      "Cuéntame más 😎",
      "Sigue, te escucho 🔥",
      "Hmm 🤖"
    ]);
  }

  // 🤖 fallback
  return random([
    "No entendí muy bien 🤔",
    "Explícate mejor 😎",
    "Interesante... dime más 🔥",
    "Hmm 🤖"
  ]);
}

// 💾 memoria
function guardarMemoria(usuario, mensaje, respuesta) {
  if (!memoria[usuario]) memoria[usuario] = [];

  memoria[usuario].push({ mensaje, respuesta });

  if (memoria[usuario].length > 20) {
    memoria[usuario].shift();
  }
}

module.exports = {
  generarRespuesta,
  guardarMemoria
};