const apiUrl = "https://<TU-PROYECTO>.mockapi.io"; // reemplazá con tu URL

const logoutBtn = document.getElementById("logoutBtn");
const totalAlquileresEl = document.getElementById("totalAlquileres");
const ingresosTotalesEl = document.getElementById("ingresosTotales");
const ultimaReservaEl = document.getElementById("ultimaReserva");

// Verificar rol
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "ADMIN") {
  alert("Acceso denegado. Solo ADMIN.");
  window.location.href = "index.html";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

async function cargarDatos() {
  try {
    const res = await fetch(`${apiUrl}/rentals`);
    const rentals = await res.json();

    if (!rentals || rentals.length === 0) {
      document.getElementById("chartAlquileres").outerHTML = "<p>No hay reservas aún.</p>";
      totalAlquileresEl.textContent = "0";
      ingresosTotalesEl.textContent = "$0";
      ultimaReservaEl.textContent = "-";
      return;
    }

    // Agrupar por estado
    const estados = ["Pendiente", "Confirmado", "Finalizado", "Cancelado"];
    const conteo = estados.map(e => rentals.filter(r => r.estado === e).length);

    // Ingresos totales (confirmado o finalizado)
    const ingresos = rentals
      .filter(r => r.estado === "Confirmado" || r.estado === "Finalizado")
      .reduce((sum, r) => sum + Number(r.total || 0), 0);

    // Última reserva (fechaFin más reciente)
    const fechas = rentals.map(r => new Date(r.fechaFin));
    const ultima = new Date(Math.max(...fechas));

    // Mostrar
    totalAlquileresEl.textContent = rentals.length;
    ingresosTotalesEl.textContent = `$${ingresos.toLocaleString("es-AR")}`;
    ultimaReservaEl.textContent = isNaN(ultima.getTime()) ? "-" : ultima.toLocaleDateString("es-AR");

    // Gráfico
    const ctx = document.getElementById("chartAlquileres").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: estados,
        datasets: [{
          label: "Cantidad de alquileres",
          data: conteo,
          borderWidth: 1
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } }
      }
    });

  } catch (err) {
    console.error(err);
    document.getElementById("chartAlquileres").outerHTML = "<p>Error al cargar datos.</p>";
  }
}

cargarDatos();
