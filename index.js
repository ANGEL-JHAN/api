// =========================
// 🔥 ANGEL OFC DEV - INDEX.JS COMPLETO
// =========================

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { generarRespuesta, guardarMemoria } = require("./ia");
const { v4: uuidv4 } = require("uuid");

// 🔥 SUPABASE
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔥 FIX fetch para Node / Render
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// =========================
// ✅ MIDDLEWARES
// =========================
app.use(cors({
  origin: "*",
  methods: ["GET","POST","DELETE"],
  allowedHeaders: ["Content-Type","x-api-key"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// =========================
// 🔑 CONFIG KEYS
// =========================
const KEYS_FILE = "keys.json";

// Crear archivo si no existe
if (!fs.existsSync(KEYS_FILE)) {
  fs.writeFileSync(KEYS_FILE, "[]");
}

// Key admin (uso ilimitado)
let apiKeys = [
  {
    usuario: "admin",
    apiKey: process.env.ADMIN_KEY || "123456",
    plan: "admin",
    uso: 0,
    limite: Infinity,
    ultimoReset: new Date().toISOString()
  }
];

// Cargar keys externas
try {

  const fileKeys = JSON.parse(
    fs.readFileSync(KEYS_FILE)
  );

  apiKeys = [
    ...apiKeys,
    ...fileKeys.filter(
      fk => !apiKeys.some(
        k => k.apiKey === fk.apiKey
      )
    )
  ];

} catch (err) {

  console.error(
    "❌ Error leyendo keys.json"
  );
}

// Guardar keys
function guardarKeys() {

  fs.writeFileSync(
    KEYS_FILE,

    JSON.stringify(
      apiKeys.filter(
        k => k.plan !== "admin"
      ),
      null,
      2
    )
  );
}

// =========================
// 🔹 Obtener API key
// =========================
function obtenerApiKey(req) {

  return (
    req.headers["x-api-key"] ||
    req.query.key
  );
}

// =========================
// 🔹 Validar y reset diario
// =========================
function validarKey(key, res) {

  if (!key) {

    res.status(401).json({
      error:"Falta API KEY"
    });

    return null;
  }

  const keyData = apiKeys.find(
    k => k.apiKey === key
  );

  if (!keyData) {

    res.status(401).json({
      error:"API KEY inválida"
    });

    return null;
  }

  // Reset diario cada 24h
  if (keyData.plan !== "admin") {

    const ahora = new Date();

    const ultimoReset = new Date(
      keyData.ultimoReset || 0
    );

    const diff = ahora - ultimoReset;

    if (diff >= 24*60*60*1000) {

      keyData.uso = 0;

      keyData.ultimoReset =
        ahora.toISOString();
    }
  }

  if (keyData.uso >= keyData.limite) {

    res.status(403).json({
      error:"Límite alcanzado"
    });

    return null;
  }

  return keyData;
}

// =========================
// 🔹 GENERAR NUEVA KEY
// =========================
app.post("/api/generar-key", async (req, res) => {

  const {
    usuario="anonimo",
    plan="free"
  } = req.body;

  const planes = {
    free:50,
    pro:500,
    enterprise:999999
  };

  if (!planes[plan]) {

    return res.status(400).json({
      error:"Plan inválido"
    });
  }

  const newKey = uuidv4();

  const nuevaKey = {

    usuario,

    apiKey:newKey,

    plan,

    uso:0,

    limite:planes[plan],

    ultimoReset:new Date().toISOString()
  };

  apiKeys.push(nuevaKey);

  guardarKeys();

  // 🔥 Guardar también en DB externa
  try {

    await fetch(
      "https://database-2poz.onrender.com/guardar-key",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify(nuevaKey)
      }
    );

  } catch(err) {

    console.error(
      "❌ Error guardando en DB externa:",
      err.message
    );
  }

  res.json({
    apiKey:newKey,
    plan,
    limite:nuevaKey.limite
  });
});

// =========================
// 🔹 OBTENER KEYS DE UN USUARIO
// =========================
app.get("/api/mis-keys/:usuario", async (req, res) => {

  const { usuario } = req.params;

  try {

    const userKeys = apiKeys.filter(
      k => k.usuario === usuario
    );

    res.json(userKeys);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error:"Error obteniendo keys"
    });
  }
});

// =========================
// 🗑️ ELIMINAR KEY
// =========================
app.delete("/api/eliminar-key/:key", (req, res) => {

  const { key } = req.params;

  const antes = apiKeys.length;

  apiKeys = apiKeys.filter(
    k => k.apiKey !== key
  );

  guardarKeys();

  if (apiKeys.length === antes) {

    return res.status(404).json({
      error:"Key no encontrada"
    });
  }

  res.json({
    success:true
  });
});

// =========================
// 🤖 ENDPOINT IA
// =========================
app.post("/api/ia", async (req, res) => {

  const key = obtenerApiKey(req);

  const {
    mensaje,
    usuario = "anonimo"
  } = req.body;

  const keyData = validarKey(key, res);

  if (!keyData) return;

  if (!mensaje) {

    return res.status(400).json({
      error:"Falta mensaje"
    });
  }

  try {

    // =========================
    // 🔥 GUARDAR MEMORIA SUPABASE
    // =========================
    await supabase
      .from("memoria")
      .insert([
        {
          user_id: usuario,
          contenido: mensaje
        }
      ]);

    // =========================
    // 🔥 LEER MEMORIA
    // =========================
    const { data: recuerdos } = await supabase
      .from("memoria")
      .select("*")
      .eq("user_id", usuario)
      .order("created_at", {
        ascending: false
      })
      .limit(10);

    // =========================
    // 🔥 FORMATEAR MEMORIA
    // =========================
    const memoriaTexto = recuerdos
      ?.reverse()
      ?.map(r => r.contenido)
      ?.join("\n");

    // =========================
    // 🔥 PROMPT IA
    // =========================
    const promptIA = `
MEMORIA:
${memoriaTexto}

USUARIO:
${mensaje}
`;

    // =========================
    // 🔥 RESPUESTA IA
    // =========================
    const respuesta = await generarRespuesta(
  promptIA,
  usuario
);

    // =========================
    // 🔥 MEMORIA LOCAL
    // =========================
    guardarMemoria(
      usuario,
      mensaje,
      respuesta
    );

    // =========================
    // 🔥 INCREMENTAR USO
    // =========================
    if (keyData.plan !== "admin") {

      keyData.uso++;

      guardarKeys();
    }

    // =========================
    // 🔥 DB EXTERNA
    // =========================
    try {

      await fetch(
        "https://database-2poz.onrender.com/guardar",
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body: JSON.stringify({
            usuario,
            mensaje,
            respuesta,
            fecha:new Date().toISOString()
          })
        }
      );

    } catch(err) {

      console.error(
        "❌ DB externa:",
        err.message
      );
    }

    // =========================
    // ✅ RESPUESTA FINAL
    // =========================
    res.json({

      respuesta,

      memoria:
        recuerdos?.length || 0,

      uso:keyData.uso,

      limite:keyData.limite,

      restante:
        keyData.limite - keyData.uso
    });

  } catch(err) {

    console.error(err);

    res.status(500).json({
      error:"Error IA"
    });
  }
});

// =========================
// 🔹 REGISTRO
// =========================
app.post("/api/register", async (req, res) => {

  const {
    nombre,
    usuario,
    email,
    password
  } = req.body;

  if (!usuario || !email || !password) {

    return res.status(400).json({
      error:"Faltan datos"
    });
  }

  try {

    const response = await fetch(
      "https://database-2poz.onrender.com/usuarios/guardar",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify({
          nombre,
          usuario,
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (data.error) {

      return res.status(400).json({
        error:data.error
      });
    }

    res.json({
      success:true,
      message:"Usuario registrado"
    });

  } catch(err) {

    console.error(err);

    res.status(500).json({
      error:"Error al registrar"
    });
  }
});

// =========================
// 🔹 LOGIN
// =========================
app.post("/api/login", async (req,res) => {

  const {
    usuario,
    password
  } = req.body;

  if (!usuario || !password) {

    return res.status(400).json({
      error:"Faltan datos"
    });
  }

  try {

    const response = await fetch(
      `https://database-2poz.onrender.com/usuarios/${usuario}`
    );

    const data = await response.json();

    if (!data || data.password !== password) {

      return res.status(401).json({
        error:"Usuario o contraseña inválidos"
      });
    }

    res.json({
      success:true,
      usuario:data.usuario
    });

  } catch(err) {

    console.error(err);

    res.status(500).json({
      error:"Error login"
    });
  }
});

// =========================
// 🟢 ENDPOINT ROOT
// =========================
app.get("/", (req,res)=> {

  res.sendFile(
    path.join(__dirname,"index.html")
  );
});

// =========================
// 🚀 RUN SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> {

  console.log(
    `🔥 JHAN-IA corriendo en puerto ${PORT}`
  );
});