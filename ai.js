const brain = require("brain.js");

// ⚠️ usar configuración simple
const net = new brain.NeuralNetwork({
  hiddenLayers: [3],
});

// entrenamiento
net.train([
  { input: { hola: 1 }, output: { saludo: 1 } },
  { input: { adios: 1 }, output: { despedida: 1 } },
  { input: { gracias: 1 }, output: { amable: 1 } }
]);

function procesarTexto(texto) {
  if (!texto) texto = "";

  texto = texto.toLowerCase();

  return {
    hola: texto.includes("hola") ? 1 : 0,
    adios: texto.includes("adios") ? 1 : 0,
    gracias: texto.includes("gracias") ? 1 : 0
  };
}

function generarRespuesta(mensaje) {
  try {
    const input = procesarTexto(mensaje);

    const resultado = net.run(input);

    if (!resultado) return "No entendí 😅";

    if (resultado.saludo > 0.5) return "Hola 👋";
    if (resultado.despedida > 0.5) return "Adiós 👋";
    if (resultado.amable > 0.5) return "De nada 😊";

    return "No entendí 😅";

  } catch (e) {
    console.log("ERROR IA:", e);
    return "Error en IA";
  }
}

module.exports = { generarRespuesta };