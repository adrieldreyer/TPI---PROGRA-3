const apiUrl = "https://<TU-PROYECTO>.mockapi.io"; // reemplazá con tu URL base

const logoutBtn = document.getElementById("logoutBtn");
const busqueda = document.getElementById("busqueda");
const listaAutos = document.getElementById("listaAutos");
const misReservas = document.getElementById("misReservas");

// Verificar login y rol
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "USUARIO") {
  // allow admins to preview? redirect for safety
  if (!user) {
    alert("Acceso denegado. Iniciá sesión.");
    window.location.href = "index.html";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

// Cargar autos disponibles
async function cargarAutos(filtro = "") {
  if (!listaAutos) return;
  try {
    const res = await fetch(`${apiUrl}/cars`);
    const autos = await res.json();

    const filtrados = autos.filter(a =>
      a.disponible === "Disponible" &&
      (a.marca.toLowerCase().includes(filtro.toLowerCase()) ||
       a.modelo.toLowerCase().includes(filtro.toLowerCase()))
    );

    listaAutos.innerHTML = filtrados.length
      ? filtrados.map(auto => `
        <div class="card">
          <h4>${auto.marca} ${auto.modelo}</h4>
          <p>💲 ${auto.precioDia}/día</p>
          <label>Inicio</label>
          <input type="date" id="inicio-${auto.id}" />
          <label>Fin</label>
          <input type="date" id="fin-${auto.id}" />
          <button class="btn-reservar" data-id="${auto.id}" data-precio="${auto.precioDia}">Reservar</button>
        </div>
      `).join("")
      : "<p>No hay autos disponibles.</p>";

    // bind reservar buttons
    document.querySelectorAll(".btn-reservar").forEach(b => {
      b.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const precio = Number(e.target.dataset.precio);
        reservar(id, precio);
      });
    });

  } catch (err) {
    console.error(err);
    listaAutos.innerHTML = "<p>Error al cargar autos.</p>";
  }
}

// buscar
if (busqueda) {
  busqueda.addEventListener("input", (e) => cargarAutos(e.target.value));
}

// reservar
async function reservar(idAuto, precioDia) {
  const inicioEl = document.getElementById(`inicio-${idAuto}`);
  const finEl = document.getElementById(`fin-${idAuto}`);
  if (!inicioEl || !finEl) { alert("Error de selección de fechas"); return; }

  const fechaInicio = inicioEl.value;
  const fechaFin = finEl.value;

  if (!fechaInicio || !fechaFin) {
    alert("Debe seleccionar ambas fechas.");
    return;
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diff = fin - inicio;
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (dias <= 0) {
    alert("La fecha de fin debe ser posterior a la de inicio.");
    return;
  }

  const total = dias * precioDia;

  try {
    await fetch(`${apiUrl}/rentals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        carId: idAuto,
        fechaInicio,
        fechaFin,
        total,
        estado: "Pendiente"
      })
    });

    await fetch(`${apiUrl}/cars/${idAuto}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: "Alquilado" })
    });

    alert("Reserva realizada con éxito.");
    cargarAutos();
    cargarReservas();
  } catch (err) {
    console.error(err);
    alert("Error al realizar la reserva.");
  }
}

// cargar reservas del usuario
async function cargarReservas() {
  if (!misReservas) return;
  try {
    const res = await fetch(`${apiUrl}/rentals`);
    const rentals = await res.json();
    const mis = rentals.filter(r => String(r.userId) === String(user.id));

    misReservas.innerHTML = mis.length
      ? mis.map(r => `
        <div class="card">
          <p>Auto ID: ${r.carId}</p>
          <p>Desde: ${r.fechaInicio}</p>
          <p>Hasta: ${r.fechaFin}</p>
          <p>Total: 💲${r.total}</p>
          <p>Estado: <strong>${r.estado}</strong></p>
        </div>
      `).join("")
      : "<p>No tienes reservas aún.</p>";
  } catch (err) {
    console.error(err);
    misReservas.innerHTML = "<p>Error al cargar reservas.</p>";
  }
}

// inicializar
cargarAutos();
cargarReservas();
