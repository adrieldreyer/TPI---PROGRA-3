const apiNegocio = "https://6915009984e8bd126af85a40.mockapi.io/ReservasAutos/"; // <-- reemplazá con tu endpoint real

const formAuto = document.getElementById("formAuto");
const listaAutos = document.getElementById("listaAutos");
const logoutBtn = document.getElementById("logoutBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const submitAutoBtn = document.getElementById("submitAutoBtn");


const marcaInput = document.getElementById("marca");
const modeloInput = document.getElementById("modelo");
const precioInput = document.getElementById("precioDia");
const disponibleCheckbox = document.getElementById("disponibleCheckbox");
const estadoSelect = document.getElementById("estadoAuto");

// estado de edición
let editMode = false;
let idActual = null;

// logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

// verificar rol ADMIN
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "ADMIN") {
  alert("Acceso denegado. Solo ADMIN.");
  window.location.href = "index.html";
}

// Cargar y mostrar autos
async function cargarAutos() {
  if (!listaAutos) return;
  listaAutos.innerHTML = "Cargando...";
  try {
    const res = await fetch(`${apiNegocio}/cars`);
    const autos = await res.json();

    listaAutos.innerHTML = autos.map(auto => {
      // presentar estado legible
      const disponibleTexto = auto.disponible === true ? "Disponible" : "No disponible";
      const estadoDetalle = auto.estadoAuto ? auto.estadoAuto.replace('_', ' ') : "disponible";
      return `
        <div class="card">
          <h4>${auto.marca} ${auto.modelo}</h4>
          <p>💲 ${auto.precioDia} / día</p>
          <p>Disponibilidad: <strong>${disponibleTexto}</strong></p>
          <p>Estado: <strong>${estadoDetalle}</strong></p>
          <div>
            <button class="btn-edit" data-id="${auto.id}">✏️ Editar</button>
            <button class="btn-delete" data-id="${auto.id}">🗑️ Eliminar</button>
          </div>
        </div>
      `;
    }).join("");

    // bind botones
    document.querySelectorAll(".btn-delete").forEach(b => {
      b.addEventListener("click", (e) => eliminarAuto(e.currentTarget.dataset.id));
    });
    document.querySelectorAll(".btn-edit").forEach(b => {
      b.addEventListener("click", (e) => editarAuto(e.currentTarget.dataset.id));
    });

  } catch (err) {
    console.error(err);
    listaAutos.innerHTML = "<p>Error al cargar autos.</p>";
  }
}

formAuto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevo = {
    marca: marcaInput.value.trim(),
    modelo: modeloInput.value.trim(),
    precioDia: Number(precioInput.value),
    disponible: disponibleSelect.value === "true", // convertir string a boolean
    estadoAuto: estadoSelect.value || "normal"
  };

  try {
    if (editMode && idActual) {
      await fetch(`${apiNegocio}/cars/${idActual}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
      });
      alert("Auto actualizado");
    } else {
      await fetch(`${apiNegocio}/cars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
      });
      alert("Auto creado");
    }
    cancelarEdicion();
    cargarAutos();
  } catch (err) {
    console.error(err);
    alert("Error al guardar el auto");
  }
});

// función editar: carga datos al formulario
async function editarAuto(id) {
  try {
    const res = await fetch(`${apiNegocio}/cars/${id}`);
    const auto = await res.json();
    marcaInput.value = auto.marca || "";
    modeloInput.value = auto.modelo || "";
    precioInput.value = auto.precioDia || "";
    disponibleSelect.value = auto.disponible ? "true" : "false"; // asignar string
    estadoSelect.value = auto.estadoAuto || "normal";

    editMode = true;
    idActual = id;
    submitAutoBtn.textContent = "Actualizar Auto";
    cancelEditBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    alert("Error al obtener datos del auto");
  }
}

// cancelar edición
function cancelarEdicion() {
  formAuto.reset();
  disponibleSelect.value = "true"; // default Disponible
  estadoSelect.value = "normal";
  editMode = false;
  idActual = null;
  submitAutoBtn.textContent = "Guardar Auto";
  cancelEditBtn.style.display = "none";
}

// bind cancelar
if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => cancelarEdicion());
}

// eliminar auto
async function eliminarAuto(id) {
  if (!confirm("¿Seguro que deseas eliminar este auto?")) return;
  try {
    await fetch(`${apiNegocio}/cars/${id}`, { method: "DELETE" });
    cargarAutos();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar");
  }
}

// inicializar
cargarAutos();