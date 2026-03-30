// Variables globales
let usuarioGlobal = '';

// Mostrar login o signup
function showLogin(event){
  if(event) event.preventDefault();
  document.getElementById('loginCard').classList.remove('hidden');
  document.getElementById('signupCard').classList.add('hidden');
}

function showSignup(event){
  if(event) event.preventDefault();
  document.getElementById('signupCard').classList.remove('hidden');
  document.getElementById('loginCard').classList.add('hidden');
}

// Toggle password
function togglePassword(id, btn){
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "👁️" : "🙈";
}

// TOAST
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'),2500);
}

// ======================
// 🔹 LOGIN
// ======================
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const usuario = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if(!usuario || !password){ showToast("⚠️ Completa todos los campos"); return; }

  try{
    const res = await fetch("https://mi-api-clnb.onrender.com/api/login", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();
    if(data.error){ showToast("❌ "+data.error); return; }

    usuarioGlobal = data.usuario;
    showToast("✅ Bienvenido "+usuarioGlobal);
    // Redirigir a página de API keys
    window.location.href = "index.html"; // tu página de generación de keys
  }catch(err){
    console.error(err);
    showToast("❌ Error de conexión");
  }
});

// ======================
// 🔹 REGISTER
// ======================
document.getElementById('signupForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nombre = document.getElementById('signupName').value.trim();
  const usuario = document.getElementById('signupUser').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if(!nombre || !usuario || !email || !password){ showToast("⚠️ Completa todos los campos"); return; }

  try{
    const res = await fetch("https://mi-api-clnb.onrender.com/api/register", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ nombre, usuario, email, password })
    });
    const data = await res.json();
    if(data.error){ showToast("❌ "+data.error); return; }

    usuarioGlobal = usuario;
    showToast("✅ Registro exitoso");
    // Redirigir a página de API keys
    window.location.href = "index.html";
  }catch(err){
    console.error(err);
    showToast("❌ Error de conexión");
  }
});