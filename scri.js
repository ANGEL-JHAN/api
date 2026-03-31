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
    t.className='toast '+type+' show';
    setTimeout(()=>t.classList.remove('show'),3000);
}

// ============================
// 🌐 API URL - Database
// ============================
const API_URL = "https://database-2poz.onrender.com"; // Tu API si quieres

// ============================
// 🔹 Signup Form
// ============================
document.getElementById('signupForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const user = document.getElementById('signupUser').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPassword').value;

    if(!name||!user||!email||!pass) return showToast('Completa todos los campos','error');
    if(pass.length<8) return showToast('Mínimo 8 caracteres','error');

    // Aquí puedes enviar a tu API real si quieres
    // const res = await fetch(`${API_URL}/register`, {...})

    // Solo local (mock)
    const newUser = {name,user,email,password:pass};
    localStorage.setItem('new_user', JSON.stringify(newUser));

    showToast('¡Cuenta creada! Ahora inicia sesión','success');
    setTimeout(()=>showLogin(),1500);
});

// ============================
// 🔹 Login Form
// ============================
document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    const emailOrUser = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    if(!emailOrUser||!pass) return showToast('Completa todos los campos','error');

    // Solo local (mock)
    const newUser = JSON.parse(localStorage.getItem('new_user'));
    if(!newUser){
        showToast('Usuario no registrado, crea tu cuenta','error');
        showSignup();
        return;
    }

    if((emailOrUser === newUser.email || emailOrUser === newUser.user) && pass === newUser.password){
        // Guardamos sesión
        localStorage.setItem('user_session', JSON.stringify({logged:true,name:newUser.name,user:newUser.user,email:newUser.email}));
        showToast('¡Inicio de sesión exitoso!','success');
        setTimeout(()=>window.location.href='index.html',1000);
    } else {
        showToast('Email/Usuario o contraseña incorrectos','error');
    }
});

// ============================
// 🔹 Inicializar Página
// ============================
document.addEventListener('DOMContentLoaded',()=>{
    const session = JSON.parse(localStorage.getItem('user_session'));

    // Si ya está logueado, redirige
    if(session?.logged){
        window.location.href='index.html';
        return;
    }

    // Mostrar login por defecto (puedes cambiar a showSignup() si quieres)
    showLogin();
});