const apiNegocio = "https://6915009984e8bd126af85a40.mockapi.io/ReservasAutos/"; // <-- reemplazá con tu endpoint real

const logoutBtn = document.getElementById("logoutBtn");
const busqueda = document.getElementById("busqueda");
const listaAutos = document.getElementById("listaAutos");
const misReservas = document.getElementById("misReservas");

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "USUARIO") {
  alert("Acceso denegado. Solo usuarios registrados.");
  window.location.href = "index.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// Cargar autos disponibles (true)
async function cargarAutos(filtro = "") {
  const res = await fetch(`${apiNegocio}/cars`);
  const autos = await res.json();

  const filtrados = autos.filter(a =>
    a.disponible === true &&
    (a.marca.toLowerCase().includes(filtro.toLowerCase()) ||
     a.modelo.toLowerCase().includes(filtro.toLowerCase()))
  );

  listaAutos.innerHTML = filtrados.length
    ? filtrados.map(auto => `
      <div class="card">
        <h4>${auto.marca} ${auto.modelo}</h4>
        <p>💲 ${auto.precioDia}/día</p>
        <input type="date" id="inicio-${auto.id}" />
        <input type="date" id="fin-${auto.id}" />
        <button onclick="reservar('${auto.id}', ${auto.precioDia})">Reservar</button>
      </div>
    `).join("")
    : "<p>No hay autos disponibles.</p>";
}

// Buscar
busqueda.addEventListener("input", (e) => cargarAutos(e.target.value));

// Reservar auto
async function reservar(idAuto, precioDia) {
  const inicio = document.getElementById(`inicio-${idAuto}`).value;
  const fin = document.getElementById(`fin-${idAuto}`).value;

  if (!inicio || !fin) return alert("Seleccioná ambas fechas.");

  const dias = Math.ceil((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return alert("La fecha de fin debe ser posterior.");

  const total = dias * precioDia;

  await fetch(`${apiNegocio}/rentals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      carId: idAuto,
      fechaInicio: inicio,
      fechaFin: fin,
      total,
      estado: "Pendiente"
    })
  });

  await fetch(`${apiNegocio}/cars/${idAuto}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disponible: false, estadoAuto: "alquilado" })
  });

  alert("Reserva realizada con éxito.");
  cargarAutos();
  cargarReservas();
}

// Mostrar reservas del usuario
async function cargarReservas() {
  const res = await fetch(`${apiNegocio}/rentals`);
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
}

cargarAutos();
cargarReservas();