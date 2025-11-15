const apiUrl = "https://<TU-PROYECTO>.mockapi.io"; // reemplazá con tu endpoint

// Registro
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, role: "USUARIO" })
      });
      alert("Registro exitoso, ahora puedes iniciar sesión");
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      alert("Error al registrarse");
    }
  });
}
