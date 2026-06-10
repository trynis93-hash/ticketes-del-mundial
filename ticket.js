let tickets = [];
let total = 0;

//*ayuda//
const val = (id) => document.getElementById(id)?.value ?? "";

//?local storage//
function guardarEstado() {
  localStorage.setItem("tickets_mundial", JSON.stringify(tickets));
  localStorage.setItem("total_mundial", JSON.stringify(total));
}

function cargarEstado() {
  const ticketsGuardados = localStorage.getItem("tickets_mundial");
  const totalGuardado = localStorage.getItem("total_mundial");

  if (ticketsGuardados) {
    try {
      tickets = JSON.parse(ticketsGuardados);
    } catch {
      tickets = [];
    }
  }
  if (totalGuardado) total = parseFloat(totalGuardado) || 0;
}

//!ERRORES//
const CAMPOS_ERROR = [
  "err-nombre",
  "err-fecha",
  "err-horario",
  "err-partido",
  "err-precio",
  "err-cantidad",
  "err-estadio",
  "err-pago",
  "err-email",
];

function limpiarErrores() {
  CAMPOS_ERROR.forEach((id) => {
    const span = document.getElementById(id);
    if (span) span.textContent = "";
  });
}

function mostrarError(id, msg) {
  const span = document.getElementById(id);
  if (span) span.textContent = msg;
}

//?toast//
let toastTimeout;
function showToast(msg, tipo = "exito") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  clearTimeout(toastTimeout);
  toast.textContent = msg;
  toast.className = `toast toast-${tipo} show`;
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3200);
}

//*formato//
function formatPrecio(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

//*CONSTRUCTORES DOM//
function crearDetalle(icono, texto) {
  const div = document.createElement("div");
  div.className = "ticket-detail";

  const icon = document.createElement("span");
  icon.className = "detail-icon";
  icon.textContent = icono;

  div.appendChild(icon);
  div.append(texto);

  return div;
}

function crearSubtotal(t) {
  const div = document.createElement("div");
  div.className = "ticket-detail ticket-subtotal";

  const icon = document.createElement("span");
  icon.className = "detail-icon";
  icon.textContent = "💰";

  const strong = document.createElement("strong");
  strong.textContent = formatPrecio(t.precio * t.cantidad);

  div.appendChild(icon);
  div.append(`${t.cantidad} ticket(s) x ${formatPrecio(t.precio)} = `);
  div.appendChild(strong);

  return div;
}

//*tarjeta//
function crearItemTicket(t) {
  const item = document.createElement("div");
  item.className = "ticket-item";
  item.id = `ticket-${t.id}`;

  //?encabezado//
  const headerRow = document.createElement("div");
  headerRow.className = "ticket-header-row";
  const spanPartido = document.createElement("span");
  spanPartido.className = "ticket-partido";
  spanPartido.textContent = t.partido;

  const btnEleminar = document.createElement("button");
  btnEleminar.className = "btn-eliminar";
  btnEleminar.textContent = "x";
  btnEleminar.title = "Eliminar ticket";
  btnEleminar.addEventListener("click", () => handleEliminar(t.id));

  headerRow.appendChild(spanPartido);
  headerRow.appendChild(btnEleminar);

  //!detalles//
  const details = document.createElement("div");
  details.className = "ticket-details";
  details.appendChild(crearDetalle("👤", t.nombre));
  details.appendChild(crearDetalle("📅", `${t.fecha} ⏰ ${t.horario}`));

  details.appendChild(crearDetalle("🏟️", t.estadio));
  details.appendChild(crearDetalle("💳", t.pago));
  if (t.email) details.appendChild(crearDetalle("✉️", t.email));
  details.appendChild(crearSubtotal(t));

  item.appendChild(headerRow);
  item.appendChild(details);
  return item;
}

function crearPanelVacio() {
  const panel = document.createElement("div");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "panel-header";
  header.textContent = "mis tickets";

  const empty = document.createElement("div");
  empty.className = "empty-state";

  const icon = document.createElement("div");
  icon.className = "empty-icon";
  icon.textContent = "🎟️";

  const p1 = document.createElement("p");
  p1.textContent = "No has comprado ningún ticket aún.";

  const p2 = document.createElement("p");
  p2.className = "empty-hint";
  p2.textContent = "completa el formulario para agregar";

  empty.appendChild(icon);
  empty.appendChild(p1);
  empty.appendChild(p2);
  panel.appendChild(header);
  panel.appendChild(empty);
  return panel;
}

function crearPanelTickets() {
  const panel = document.createElement("div");
  panel.className = "panel";

  // Encabezado con contador
  const header = document.createElement("div");
  header.className = "panel-header";
  header.append("mis tickets ");

  const count = document.createElement("span");
  count.className = "ticket-count";
  count.textContent = tickets.length;
  header.appendChild(count);

  // Lista de tickets
  const list = document.createElement("div");
  list.className = "ticket-list";
  tickets.forEach((t) => list.appendChild(crearItemTicket(t)));

  // Fila de total
  const totalRow = document.createElement("div");
  totalRow.className = "ticket-total";

  const label = document.createElement("span");
  label.textContent = "total a pagar";

  const amount = document.createElement("span");
  amount.className = "total-amount";
  amount.textContent = formatPrecio(total);

  totalRow.appendChild(label);
  totalRow.appendChild(amount);

  const btnImprimir = document.createElement("button");
  btnImprimir.className = "btn btn-imprimir";
  btnImprimir.textContent = "🖨️ imprimir tickets";
  btnImprimir.addEventListener("click", () => {
    window.print();
  });

  // Botón limpiar todo
  const btnLimpiar = document.createElement("button");
  btnLimpiar.className = "btn btn-danger";
  btnLimpiar.textContent = "🗑️ limpiar todo";
  btnLimpiar.addEventListener("click", handleLimpiarTodo);

  panel.appendChild(header);
  panel.appendChild(list);
  panel.appendChild(totalRow);
  panel.appendChild(btnImprimir);
  panel.appendChild(btnLimpiar);
  return panel;
}

//*render//
function render() {
  total = tickets.reduce((acc, t) => acc + t.precio * t.cantidad, 0);
  guardarEstado();

  const container = document.getElementById("ticket-container");
  const panel = tickets.length === 0 ? crearPanelVacio() : crearPanelTickets();
  container.replaceChildren(panel);
}

//!error//
function handleComprar() {
  limpiarErrores();

  const nombre = val("inp-nombre").trim();
  const fecha = val("inp-fecha");
  const horario = val("inp-horario");
  const partido = val("inp-partido");
  const precioRaw = val("inp-precio");
  const precio = parseFloat(precioRaw);
  const cantidadRaw = val("inp-cantidad");
  const cantidad = parseInt(cantidadRaw);
  const estadio = val("inp-estadio");
  const pago = val("inp-pago");
  const email = val("inp-email").trim();

  let error = false;

  if (!nombre) {
    mostrarError("err-nombre", "nombre requerido");
    error = true;
  }
  if (!fecha) {
    mostrarError("err-fecha", "fecha requerida");
    error = true;
  }
  if (!horario) {
    mostrarError("err-horario", "horario requerido");
    error = true;
  }
  if (!partido) {
    mostrarError("err-partido", "partido requerido");
    error = true;
  }
  if (!precioRaw) {
    mostrarError("err-precio", "precio requerido");
    error = true;
  }
  if (!estadio) {
    mostrarError("err-estadio", "estadio requerido");
    error = true;
  }
  if (!pago) {
    mostrarError("err-pago", "método de pago requerido");
    error = true;
  }

  if (!cantidadRaw || isNaN(cantidad) || cantidad < 1) {
    mostrarError("err-cantidad", "cantidad inválida (mín. 1)");
    error = true;
  } else if (cantidad > 10) {
    mostrarError("err-cantidad", "máximo 10 tickets por compra");
    error = true;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarError("err-email", "correo electrónico inválido");
    error = true;
  }

  if (error) return;

  tickets.push({
    id: Date.now().toString(),
    nombre,
    fecha,
    horario,
    partido,
    precio,
    cantidad,
    estadio,
    pago,
    email,
  });
  render();
  showToast(`✅ ${cantidad} ticket(s) para ${partido} comprado(s)`);

  [
    "inp-nombre",
    "inp-fecha",
    "inp-horario",
    "inp-partido",
    "inp-precio",
    "inp-cantidad",
    "inp-estadio",
    "inp-pago",
    "inp-email",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("inp-nombre").focus();
}

//?eliminar//
function handleEliminar(id) {
  const t = tickets.find((t) => t.id === id);
  if (!t) return;
  tickets = tickets.filter((t) => t.id !== id);
  render();
  showToast(`🗑️ ticket de ${t.partido} eliminado`, "error");
}

function handleLimpiarTodo() {
  if (!confirm("¿Seguro que quieres eliminar todos los tickets?")) return;
  tickets = [];
  total = 0;
  guardarEstado();
  render();
  showToast("🗑️ todos los tickets fueron eliminados", "error");
}

//?ENTER KEY//
[
  "inp-nombre",
  "inp-fecha",
  "inp-horario",
  "inp-partido",
  "inp-precio",
  "inp-cantidad",
  "inp-estadio",
  "inp-pago",
  "inp-email",
].forEach((id) => {
  const input = document.getElementById(id);
  if (input)
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleComprar();
    });
});

//!init//
cargarEstado();
render();
