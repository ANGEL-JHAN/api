// ============================
// 🎆 Partículas
// ============================
(function(){
    const c = document.getElementById('particles');
    for(let i=0;i<40;i++){
        const p=document.createElement('div');
        p.className='particle';
        const s=Math.random()*4+2;
        p.style.width=s+'px';
        p.style.height=s+'px';
        p.style.left=Math.random()*100+'%';
        p.style.animationDuration=Math.random()*15+10+'s';
        p.style.animationDelay=Math.random()*10+'s';
        if(Math.random()>0.5) p.style.background='#b040ff';
        c.appendChild(p);
    }
})();

// ============================
// 🔹 Toggle Login/Signup Cards
// ============================
function showSignup(e){
    if(e) e.preventDefault();
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('signupCard').classList.remove('hidden');
}
function showLogin(e){
    if(e) e.preventDefault();
    document.getElementById('signupCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
}

// ============================
// 🔹 Toggle Password Visibility
// ============================
function togglePassword(id,btn){
    const inp = document.getElementById(id);
    inp.type = inp.type==='password' ? 'text' : 'password';
    btn.style.color = inp.type==='text' ? '#00e5ff' : '';
}

// ============================
// 🔹 Toast Notification
// ============================
function showToast(msg,type){
    const t=document.getElementById('toast');
    t.textContent=msg;
    t.className='toast '+(type||'')+' show';
    setTimeout(()=>t.classList.remove('show'),3000);
}

// ============================
// 🌐 API URL - Database
// ============================
const API_URL = "https://mi-api-clnb.onrender.com";

// ============================
// 🔹 Signup Form
// ============================
document.getElementById('signupForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const nombre = document.getElementById('signupName').value.trim();
    const usuario = document.getElementById('signupUser').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPassword').value;

    if(!nombre||!usuario||!email||!pass) return showToast('Completa todos los campos','error');
    if(pass.length<8) return showToast('Mínimo 8 caracteres','error');

    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ nombre, usuario, email, password:pass })
        });
        const data = await res.json();
        if(res.ok && data.success){
            showToast('¡Cuenta creada! ✅','success');
            setTimeout(()=>window.location.href='index.html',1500); // Redirige directo
        } else {
            showToast(data.error||'Error al registrarse','error');
        }
    } catch(err){
        console.error(err);
        showToast('Error de conexión con la API','error');
    }
});

// ============================
// 🔹 Login Form
// ============================
document.getElementById('loginForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const usuario = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    if(!usuario||!pass) return showToast('Completa todos los campos','error');

    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ usuario, password:pass })
        });
        const data = await res.json();
        if(res.ok && data.success){
            showToast('¡Inicio de sesión exitoso! ✅','success');
            setTimeout(()=>window.location.href='index.html',1000); // Redirige a API keys
        } else {
            showToast(data.error||'Usuario o contraseña incorrectos','error');
        }
    } catch(err){
        console.error(err);
        showToast('Error de conexión con la API','error');
    }
});

// ============================
// 🔹 Inicializar Página
// ============================
document.addEventListener('DOMContentLoaded',()=>{
    // Siempre mostrar login al cargar
    showLogin();
});