/* ---------- Render de contenido ---------- */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var badge = function (st) { return st === "confirmado" ? '<span class="badge b-ok">Confirmado</span>' : '<span class="badge b-demo">Ejemplo demostrativo</span>'; };

  // eventos
  var filters = [["todos", "Todos"], ["proximo", "Próximo"], ["activo", "Activo"], ["finalizado", "Finalizado"], ["cancelado", "Cancelado"]];
  var current = "todos";
  function renderEvents() {
    $("#ev-list").innerHTML = DATA.events.filter(function (e) { return current === "todos" || e.state === current; }).map(function (e) {
      var mediaHtml = e.image
        ? '<div class="ev-media"><img src="' + e.image + '" alt="' + e.name + '" loading="lazy"></div>'
        : '<div class="ev-art gold">' + e.brand + '</div>';
      return '<article class="card ev ' + e.state + '">' +
        mediaHtml +
        '<div class="row">' + badge(e.status) + '<span class="st ' + e.state + '">' + DATA.stateLabel[e.state] + '</span></div>' +
        '<h3>' + e.name + '</h3>' +
        '<dl><dt>Fecha</dt><dd>' + e.date + '</dd><dt>Hora</dt><dd>' + e.time + '</dd><dt>Lugar</dt><dd>' + e.place + '</dd></dl>' +
        '<p>' + e.desc + '</p></article>';
    }).join("") || '<p class="note">No hay eventos con este estado.</p>';
  }
  function renderFilters() {
    $("#ev-filter").innerHTML = filters.map(function (f) { return '<button type="button" class="chip" data-f="' + f[0] + '" aria-pressed="' + (f[0] === current) + '">' + f[1] + '</button>'; }).join("");
  }
  $("#ev-filter").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    current = b.dataset.f; renderFilters(); renderEvents();
  });
  renderFilters(); renderEvents();

  // precios
  var money = function (n) { return "$" + n.toLocaleString("es-CO"); };
  var cur = "ugp19";
  function renderPrices() {
    var p = DATA.prices[cur];
    $("#price-tabs").innerHTML = Object.keys(DATA.prices).map(function (k) { return '<button type="button" class="chip" data-k="' + k + '" aria-pressed="' + (k === cur) + '">' + DATA.prices[k].label + '</button>'; }).join("");
    $("#price-table").innerHTML = "<thead><tr><th>Localidad</th>" + p.cols.map(function (c) { return '<th class="num">' + c[0] + (c[1] ? "<small>" + c[1] + "</small>" : "") + "</th>"; }).join("") + "</tr></thead><tbody>" +
      p.rows.map(function (r) { return "<tr><td>" + r[0] + "</td>" + r.slice(1).map(function (v) { return '<td class="num">' + money(v) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>";
    $("#price-note").textContent = p.note;
  }
  $("#price-tabs").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return; cur = b.dataset.k; renderPrices();
  });
  renderPrices();

  // áreas del sistema
  $("#features").innerHTML = DATA.features.map(function (f) {
    return '<article class="card rv"><span class="badge b-plan">Previsto</span><h3>' + f[0] + '</h3><p>' + f[1] + '</p></article>';
  }).join("");

  // entrada sutil
  var rv = document.querySelectorAll(".rv");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }
})();
