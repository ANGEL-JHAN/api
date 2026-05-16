const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// =========================
// 🔥 IA PRINCIPAL
// =========================
async function generarRespuesta(
  mensaje,
  usuario
) {

  try {

    const completion =
      await client.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [

        {
          role: "system",

          content: `
Eres JHAN-IA.

Una IA moderna creada por Angel.

Hablas español.
Eres inteligente.
Tienes memoria.
Conversas naturalmente.
Eres amigable.
          `
        },

        {
          role: "user",
          content: mensaje
        }

      ],

      temperature: 0.8

    });

    return completion
      .choices[0]
      .message
      .content;

  } catch(err) {

    console.error(err);

    return "Error IA";
  }
}

// =========================
// 🔥 MEMORIA
// =========================
function guardarMemoria() {}

module.exports = {
  generarRespuesta,
  guardarMemoria
};