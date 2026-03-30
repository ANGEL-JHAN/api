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

function generarRespuesta(mensaje) {
  try {
    if (!mensaje) return "Mensaje vacío";

    const input = procesarTexto(mensaje);
    const resultado = net.run(input);

    if (!resultado) return "No entendí 😅";

    if (resultado.saludo && resultado.saludo > 0.5) return "Hola 👋";
    if (resultado.despedida && resultado.despedida > 0.5) return "Adiós 👋";
    if (resultado.amable && resultado.amable > 0.5) return "De nada 😊";

    return "No entendí 😅";

  } catch (error) {
    console.log("ERROR IA:", error);
    return "Error en IA";
  }
}

module.exports = { generarRespuesta };