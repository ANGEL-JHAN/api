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
Tu nombre es JHAN-IA.

Eres una inteligencia artificial moderna creada por Angel OFC.

Hablas español de manera natural y humana.

No repitas mensajes innecesariamente.

No copies respuestas anteriores.

Responde corto cuando el usuario escriba corto.

Responde natural y relajado.

Mantén conversaciones fluidas.

Usa memoria solo cuando sea realmente útil.

No menciones recuerdos antiguos si no tienen relación con el mensaje actual.

Si el usuario escribe algo corto como:
"ok"
"ya"
"si"
"no se"

Responde de forma simple y natural.

Nunca digas:
"parece que estás repitiendo"
o frases similares.

Tu objetivo es conversar como un humano real.
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