// API separadas
const apiUsuarios = "https://6915021c84e8bd126af85e66.mockapi.io/Usuarios/";

const user = JSON.parse(localStorage.getItem("user"));
const loginContainer = document.getElementById("loginContainer");
const redirecting = document.getElementById("redirecting");

// Si ya hay usuario guardado → redirigir según rol
if (user) {
  loginContainer.style.display = "none";
  redirecting.style.display = "block";
  if (user.role === "ADMIN") {
    setTimeout(() => (window.location.href = "dashboard.html"), 800);
  } else {
    setTimeout(() => (window.location.href = "reservas.html"), 800);
  }
} else {
  // Si no hay sesión activa, mostrar el formulario
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${apiUsuarios}/users`);
      const users = await res.json();
      const found = users.find(u => u.email === email && u.password === password);

      if (found) {
        localStorage.setItem("user", JSON.stringify(found));
        alert(`Bienvenido ${found.nombre}`);
        if (found.role === "ADMIN") window.location.href = "dashboard.html";
        else window.location.href = "reservas.html";
      } else {
        alert("Credenciales incorrectas.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor de usuarios.");
    }
  });
}