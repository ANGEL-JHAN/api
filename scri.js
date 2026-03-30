// =========================
// 🔥 ANGEL OFC DEV - SCRI.JS
// =========================

const API_URL = "https://mi-api-clnb.onrender.com";

let usuarioGlobal = '';
let ultimaKey = '';

// =========================
// 🔹 TOGGLE PASS
// =========================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
}

// =========================
// 🔹 TOAST
// =========================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// =========================
// 🔹 SWITCH LOGIN/SIGNUP
// =========================
function showSignup(e) {
  e.preventDefault();
  document.getElementById('loginCard').classList.add('hidden');
  document.getElementById('signupCard').classList.remove('hidden');
}

function showLogin(e) {
  e.preventDefault();
  document.getElementById('signupCard').classList.add('hidden');
  document.getElementById('loginCard').classList.remove('hidden');
}

// =========================
// 🔹 SIGNUP
// =========================
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('signupName').value.trim();
  const usuario = document.getElementById('signupUser').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!nombre || !usuario || !email || !password) return showToast("⚠️ Completa todos los campos");

  try {
    // Llamar a la API para generar la key al registrarse
    const res = await fetch(`${API_URL}/api/generar-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, plan: "free" })
    });

    const data = await res.json();
    if (!data.apiKey) throw new Error("No se pudo generar la API key");

    usuarioGlobal = usuario;
    ultimaKey = data.apiKey;

    // Guardar usuario para futuras sesiones
    localStorage.setItem('usuarioGlobal', usuarioGlobal);

    showToast(`✅ Cuenta creada. Tu API Key: ${ultimaKey}`);

    // Limpiar formulario
    document.getElementById('signupForm').reset();

    // Cambiar a login
    showLogin(new Event('click'));

  } catch (err) {
    console.error(err);
    showToast("❌ Error registrando usuario");
  }
});

// =========================
// 🔹 LOGIN
// =========================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!usuario || !password) return showToast("⚠️ Completa todos los campos");

  try {
    // Aquí simulamos login, en tu API real podrías validar password
    // Para ahora, solo verificamos si hay keys asociadas
    const res = await fetch(`${API_URL}/api/mis-keys/${usuario}`);
    const keys = await res.json();

    if (!Array.isArray(keys) || keys.length === 0) {
      return showToast("❌ Usuario no encontrado o sin keys");
    }

    usuarioGlobal = usuario;
    ultimaKey = keys[0].apiKey;

    localStorage.setItem('usuarioGlobal', usuarioGlobal);

    showToast(`✅ Bienvenido, ${usuario}. Tu API Key: ${ultimaKey}`);

    // Aquí podrías redirigir a tu panel de usuario o mostrar tabs
  } catch (err) {
    console.error(err);
    showToast("❌ Error iniciando sesión");
  }
});

// =========================
// 🔹 AUTO LOGIN SI HAY USUARIO GUARDADO
// =========================
window.addEventListener('load', async () => {
  const savedUser = localStorage.getItem('usuarioGlobal');
  if (savedUser) {
    usuarioGlobal = savedUser;

    try {
      const res = await fetch(`${API_URL}/api/mis-keys/${usuarioGlobal}`);
      const keys = await res.json();
      if (Array.isArray(keys) && keys.length > 0) {
        ultimaKey = keys[0].apiKey;
        showToast(`✅ Bienvenido de nuevo, ${usuarioGlobal}. Tu API Key: ${ultimaKey}`);
      }
    } catch(err){
      console.error(err);
    }
  }
});