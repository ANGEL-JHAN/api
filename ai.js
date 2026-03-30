const fs = require("fs");

const DATA_FILE = "memoria.json";

// 🔹 Cargar memoria
function cargarMemoria() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// 🔹 Guardar memoria
function guardarMemoria(usuario, mensaje, respuesta) {
  const data = cargarMemoria();
  data.push({ usuario, mensaje, respuesta });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 🔹 Buscar respuesta en memoria
function buscarMemoria(mensaje) {
  const data = cargarMemoria();

  const encontrado = data.find(item =>
    item.mensaje.toLowerCase() === mensaje.toLowerCase()
  );

  return encontrado ? encontrado.respuesta : null;
}

// 🔹 Buscar en respuestas personalizadas
function buscarRespuestaPersonalizada(mensaje) {
  mensaje = mensaje.toLowerCase();

  for (let item of respuestas) {
    for (let palabra of item.palabras) {
      if (mensaje.includes(palabra)) {
        return item.respuesta;
      }
    }
  }

  return null;
}

// 🔹 Generar respuesta
function generarRespuesta(mensaje, usuario) {

  // 1️⃣ Buscar en memoria
  const memoria = buscarMemoria(mensaje);
  if (memoria) return memoria;

  // 2️⃣ Respuestas personalizadas
  const personalizada = buscarRespuestaPersonalizada(mensaje);
  if (personalizada) {
    guardarMemoria(usuario, mensaje, personalizada);
    return personalizada;
  }

  // 3️⃣ Respuesta por defecto inteligente
  const respuestasDefault = [
    "Interesante 🤔",
    "Cuéntame más...",
    "No entendí bien 😅",
    "Explícame mejor"
  ];

  const respuesta = respuestasDefault[Math.floor(Math.random() * respuestasDefault.length)];

  guardarMemoria(usuario, mensaje, respuesta);

  return respuesta;
}

module.exports = {
  generarRespuesta,
  guardarMemoria
};