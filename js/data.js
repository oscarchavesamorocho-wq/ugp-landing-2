/* ---------- Datos (única fuente del contenido dinámico) ---------- */
var DATA = {
  events: [
    { name: "UGP 19", brand: "UGP", image: "assets/images/events/flyer-ugp19-cartelera.jpg", date: "Sábado 23 de mayo de 2026", time: "7:00 PM", place: "Coliseo Universidad de Medellín", desc: "Cartel internacional de MMA con combate estelar, cartelera principal y preliminares.", state: "finalizado", status: "confirmado" },
    { name: "Noche de peleas LDA", brand: "LDA", image: "assets/images/events/flyer-lda-boleteria.jpg", date: "Por confirmar", time: "Por confirmar", place: "Fonda Dulce Jesús Mío, vía Las Palmas, Medellín", desc: "Evento de la Liga de Ascenso en jaula pentagonal. Palcos a 50 cm y 80 cm sobre el suelo.", state: "pendiente", status: "confirmado" },
    { name: "Próximo evento", brand: "UGP", image: "assets/images/events/flyer-demo-proximo.jpg", date: "Fecha de ejemplo", time: "7:00 PM", place: "Lugar de ejemplo", desc: "Así se vería un evento publicado con venta abierta.", state: "proximo", status: "demo" },
    { name: "Evento en curso", brand: "UGP", image: "assets/images/events/flyer-demo-activo.jpg", date: "Fecha de ejemplo", time: "7:00 PM", place: "Lugar de ejemplo", desc: "Así se vería un evento que está ocurriendo hoy.", state: "activo", status: "demo" },
    { name: "Evento cancelado", brand: "UGP", image: "assets/images/events/flyer-demo-cancelado.jpg", date: "Fecha de ejemplo", time: "7:00 PM", place: "Lugar de ejemplo", desc: "Así se vería un evento que no se realizó.", state: "cancelado", status: "demo" }
  ],
  stateLabel: { proximo: "Próximo", activo: "Activo", finalizado: "Finalizado", cancelado: "Cancelado", pendiente: "Fecha por confirmar" },
  prices: {
    ugp19: {
      label: "UGP 19",
      cols: [["Lanzamiento", "hasta el 17 de abril"], ["Preventa", "hasta el 17 de mayo"], ["Precio full", "hasta el día del evento"]],
      rows: [["General Plata", 60000, 80000, 100000], ["General Oro", 80000, 120000, 160000], ["VIP", 120000, 160000, 200000], ["VIP 1ª fila", 150000, 190000, 230000], ["Palcos individuales", 190000, 230000, 270000], ["Palcos x4 personas", 880000, 1040000, 1200000], ["Palcos x6 personas", 1320000, 1560000, 1800000]],
      note: "Precios de UGP 19, evento finalizado el 23 de mayo de 2026. Valores en pesos colombianos. No son una oferta vigente."
    },
    lda: {
      label: "LDA",
      cols: [["Preventa", ""], ["Precio full", "desde una semana antes del evento"]],
      rows: [["General", 60000, 80000], ["Preferencial", 80000, 100000], ["VIP 2ª fila", 110000, 140000], ["VIP 1ª fila", 140000, 170000], ["Palco individual", 140000, 170000], ["Palco x4 personas", 600000, 900000], ["Palco x6 personas", 900000, 1350000]],
      note: "Referencia de una noche de LDA en la Fonda Dulce Jesús Mío. Su fecha está por confirmar. Valores en pesos colombianos."
    }
  },
  features: [
    ["Gestión de eventos", "El administrador crea, edita, publica y elimina eventos, con validación de campos y fechas."],
    ["Información deportiva", "Cartelera, fichas de peleadores y contenido multimedia de cada evento."],
    ["Boletería digital", "Compra en línea con pasarela de pagos, ticket con código QR único y envío por correo."],
    ["Historial", "El cliente consulta y descarga de nuevo sus tickets, validando su correo."],
    ["Patrocinadores", "Registro de aliados con su logo y formulario de contacto para empresas interesadas."],
    ["Administración y reportes", "Panel con acceso por correo y contraseña, y reportes de ventas y asistencia."],
    ["Soporte y alcance", "Enlace al WhatsApp oficial, soporte multilenguaje y comentarios de usuarios."]
  ]
};
