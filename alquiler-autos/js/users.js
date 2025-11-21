const apiUsuarios = "https://6915021c84e8bd126af85e66.mockapi.io/Usuarios/users";

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
});

async function cargarUsuarios() {
  const lista = document.getElementById("listaUsuarios");
  lista.innerHTML = "<p>Cargando usuarios...</p>";

  try {
    const res = await fetch(apiUsuarios);
    const usuarios = await res.json();

    lista.innerHTML = "";

    usuarios.forEach(user => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h4>${user.nombre}</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Rol actual:</strong> ${user.role}</p>

        <label>Modificar rol:</label>
        <select data-id="${user.id}" class="selectRol">
          <option value="USUARIO" ${user.role === "USUARIO" ? "selected" : ""}>USUARIO</option>
          <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
        </select>

        <button class="btn-edit btnGuardar" data-id="${user.id}">
          Guardar cambio
        </button>
      `;

      lista.appendChild(card);
    });

    // Listeners para guardar
    document.querySelectorAll(".btnGuardar").forEach(btn => {
      btn.addEventListener("click", cambiarRol);
    });

  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p style='color:red;'>Error al cargar usuarios.</p>";
  }
}

async function cambiarRol(e) {
  const id = e.target.dataset.id;

  const nuevoRol = document.querySelector(`select[data-id="${id}"]`).value;

  try {
    const res = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol: nuevoRol })
    });

    if (!res.ok) throw new Error("Error en el PUT");

    alert("Rol actualizado correctamente ✔");
    cargarUsuarios();

  } catch (err) {
    console.error(err);
    alert("Error al modificar el rol ❌");
  }
}
