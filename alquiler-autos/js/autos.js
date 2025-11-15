const apiUrl = "https://<TU-PROYECTO>.mockapi.io"; // reemplazá con tu endpoint

const formAuto = document.getElementById("formAuto");
const listaAutos = document.getElementById("listaAutos");
const logoutBtn = document.getElementById("logoutBtn");

// Manejo logout (si existe)
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

// Verificación de rol
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "ADMIN") {
  if (window.location.pathname.endsWith("autos.html") || window.location.pathname.endsWith("dashboard.html")) {
    alert("Acceso denegado. Solo ADMIN.");
    window.location.href = "index.html";
  }
}

// cargar autos
async function cargarAutos() {
  if (!listaAutos) return;
  listaAutos.innerHTML = "Cargando...";
  try {
    const res = await fetch(`${apiUrl}/cars`);
    const autos = await res.json();

    listaAutos.innerHTML = autos.map(auto => `
      <div class="card">
        <h4>${auto.marca} ${auto.modelo}</h4>
        <p>💲 ${auto.precioDia} / día</p>
        <p>Estado: <strong>${auto.disponible}</strong></p>
        <div>
          <button class="btn-edit" data-id="${auto.id}">✏️ Editar</button>
          <button class="btn-delete" data-id="${auto.id}">🗑️ Eliminar</button>
        </div>
      </div>
    `).join("");

    // Bind events
    document.querySelectorAll(".btn-delete").forEach(b => {
      b.addEventListener("click", (e) => eliminarAuto(e.target.dataset.id));
    });
    document.querySelectorAll(".btn-edit").forEach(b => {
      b.addEventListener("click", (e) => editarAuto(e.target.dataset.id));
    });

  } catch (err) {
    console.error(err);
    listaAutos.innerHTML = "<p>Error al cargar autos.</p>";
  }
}

// agregar auto
if (formAuto) {
  formAuto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevoAuto = {
      marca: document.getElementById("marca").value.trim(),
      modelo: document.getElementById("modelo").value.trim(),
      precioDia: Number(document.getElementById("precioDia").value),
      disponible: document.getElementById("disponible").value
    };
    try {
      await fetch(`${apiUrl}/cars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoAuto)
      });
      formAuto.reset();
      cargarAutos();
    } catch (err) {
      console.error(err);
      alert("Error al crear el auto");
    }
  });
}

// editar
async function editarAuto(id) {
  try {
    const res = await fetch(`${apiUrl}/cars/${id}`);
    const auto = await res.json();

    document.getElementById("marca").value = auto.marca;
    document.getElementById("modelo").value = auto.modelo;
    document.getElementById("precioDia").value = auto.precioDia;
    document.getElementById("disponible").value = auto.disponible;

    // change submit to update
    formAuto.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await fetch(`${apiUrl}/cars/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            marca: document.getElementById("marca").value.trim(),
            modelo: document.getElementById("modelo").value.trim(),
            precioDia: Number(document.getElementById("precioDia").value),
            disponible: document.getElementById("disponible").value
          })
        });
        alert("Auto actualizado");
        formAuto.reset();
        formAuto.onsubmit = null;
        cargarAutos();
      } catch (err) {
        console.error(err);
        alert("Error al actualizar");
      }
    };
  } catch (err) {
    console.error(err);
    alert("Error al obtener el auto");
  }
}

// eliminar auto
async function eliminarAuto(id) {
  if (!confirm("¿Seguro que deseas eliminar este auto?")) return;
  try {
    await fetch(`${apiUrl}/cars/${id}`, { method: "DELETE" });
    cargarAutos();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar");
  }
}

// inicializar
cargarAutos();
