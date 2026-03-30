const brain = require("brain.js");

// Crear red neuronal
const net = new brain.NeuralNetwork();

// Entrenamiento básico
net.train([
  { input: { hola: 1 }, output: { saludo: 1 } },
  { input: { adios: 1 }, output: { despedida: 1 } },
  { input: { gracias: 1 }, output: { amable: 1 } }
]);

// Función para convertir texto a input
function procesarTexto(texto) {
  texto = texto.toLowerCase();

  return {
    hola: texto.includes("hola") ? 1 : 0,
    adios: texto.includes("adios") ? 1 : 0,
    gracias: texto.includes("gracias") ? 1 : 0
  };
}

// Generar respuesta
function generarRespuesta(mensaje) {
  const input = procesarTexto(mensaje);
  const resultado = net.run(input);

  if (resultado.saludo > 0.5) return "Hola 👋";
  if (resultado.despedida > 0.5) return "Adiós 👋";
  if (resultado.amable > 0.5) return "De nada 😊";

  return "No entendí 😅";
}

module.exports = { generarRespuesta };