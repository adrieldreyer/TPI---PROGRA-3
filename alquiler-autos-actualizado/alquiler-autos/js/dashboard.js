// API de negocio
const apiNegocio = "https://6915009984e8bd126af85a40.mockapi.io/ReservasAutos/"; // <-- reemplazá con tu endpoint real

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

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

// Cargar datos de dashboard
async function cargarDatos() {
  try {
    // Obtener datos de reservas y autos
    const [resRentals, resCars] = await Promise.all([
      fetch(`${apiNegocio}/rentals`),
      fetch(`${apiNegocio}/cars`)
    ]);
    const rentals = await resRentals.json();
    const cars = await resCars.json();

    // Si no hay reservas
    if (!rentals || rentals.length === 0) {
      document.getElementById("chartAlquileres").outerHTML = "<p>No hay reservas aún.</p>";
      totalAlquileresEl.textContent = "0";
      ingresosTotalesEl.textContent = "$0";
      ultimaReservaEl.textContent = "-";
      return;
    }

    // Agrupar reservas por estado
    const estados = ["Pendiente", "Confirmado", "Finalizado", "Cancelado"];
    const conteo = estados.map(e => rentals.filter(r => r.estado === e).length);

    // Calcular ingresos totales (solo confirmados o finalizados)
    const ingresos = rentals
      .filter(r => r.estado === "Confirmado" || r.estado === "Finalizado")
      .reduce((sum, r) => sum + Number(r.total || 0), 0);

    // Última reserva
    const fechas = rentals.map(r => new Date(r.fechaFin));
    const ultima = new Date(Math.max(...fechas));

    // Calcular cantidad de autos disponibles y alquilados
    const disponibles = cars.filter(c => c.disponible === true).length;
    const alquilados = cars.filter(c => c.disponible === false).length;

    // Mostrar datos
    totalAlquileresEl.textContent = rentals.length;
    ingresosTotalesEl.textContent = `$${ingresos.toLocaleString("es-AR")}`;
    ultimaReservaEl.textContent = isNaN(ultima.getTime()) ? "-" : ultima.toLocaleDateString("es-AR");

    // Crear gráfico de barras de alquileres
    const ctx = document.getElementById("chartAlquileres").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: estados,
        datasets: [
          {
            label: "Cantidad de alquileres",
            data: conteo,
            borderWidth: 1
          },
          {
            label: "Autos disponibles / alquilados",
            data: [disponibles, alquilados, 0, 0],
            borderWidth: 1,
            backgroundColor: "rgba(0, 123, 255, 0.3)"
          }
        ]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });

  } catch (err) {
    console.error(err);
    document.getElementById("chartAlquileres").outerHTML = "<p>Error al cargar datos.</p>";
  }
}

cargarDatos();