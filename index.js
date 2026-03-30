const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { generarRespuesta, guardarMemoria } = require("./ia");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// =========================
// 🤖 ENDPOINT IA (POST)
// =========================
app.post("/api/ia", async (req, res) => {
  const { mensaje, usuario = "anonimo" } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: "Falta mensaje" });
  }

  try {
    // 🔹 generar respuesta
    const respuesta = generarRespuesta(mensaje, usuario);

    // 🔹 guardar en memoria en tiempo real
    guardarMemoria(usuario, mensaje, respuesta);

    // 🔹 opcional: guardar también en DB externa
    try {
      await fetch("https://database-2poz.onrender.com/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario,
          mensaje,
          respuesta,
          fecha: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("❌ Error guardando en DB externa:", err.message);
    }

    res.json({ respuesta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error IA" });
  }
});

// =========================
// 🚀 RUN
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 JHAN-IA corriendo en puerto ${PORT}`));