/* ============================================================
   pagina-titulos.js
   Gestion de titulos academicos (RF-04).
   Un egresado puede tener varios titulos. Los selects de
   egresado, carrera y escuela se cargan desde Local Storage
   para mantener la integridad de las relaciones.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-titulo");
  const cuerpoTabla = document.getElementById("tabla-titulos");
  const formFiltros = document.getElementById("filtros-titulos");
  let idEnEdicion = null;

  /* Nombre legible de un egresado a partir de su id. */
  function nombreEgresado(id) {
    const egr = Almacenamiento.obtener(CLAVES.egresados).find(e => e.id === id);
    return egr ? egr.nombre : "(egresado eliminado)";
  }

  /* Rellena los selects que dependen de otras colecciones. */
  function cargarSelects() {
    const selEgresado = document.getElementById("egresado");
    const selCarrera = document.getElementById("carrera");
    const selEscuela = document.getElementById("escuela");

    selEgresado.innerHTML = "";
    Almacenamiento.obtener(CLAVES.egresados).forEach(e => {
      const op = document.createElement("option");
      op.value = e.id;
      op.textContent = e.nombre + " - " + e.identificacion;
      selEgresado.appendChild(op);
    });

    selCarrera.innerHTML = "";
    Almacenamiento.obtener(CLAVES.carreras).forEach(c => {
      const op = document.createElement("option");
      op.value = c.nombre;
      op.textContent = c.nombre;
      selCarrera.appendChild(op);
    });

    selEscuela.innerHTML = "";
    Almacenamiento.obtener(CLAVES.escuelas).forEach(es => {
      const op = document.createElement("option");
      op.value = es.nombre;
      op.textContent = es.nombre;
      selEscuela.appendChild(op);
    });
  }

  function claseEstado(estado) {
    if (estado === "Graduado") { return "estado-exito"; }
    if (estado === "En trámite") { return "estado-alerta"; }
    return "estado-error";
  }

  function pintarTabla(lista) {
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="7">No hay titulos registrados.</td></tr>';
      return;
    }
    lista.forEach(t => {
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + nombreEgresado(t.egresadoId) + "</td>" +
        "<td>" + t.tipo + "</td>" +
        "<td>" + t.carrera + "</td>" +
        "<td>" + t.escuela + "</td>" +
        "<td>" + t.anio + "</td>" +
        '<td><span class="estado ' + claseEstado(t.estado) + '">' + t.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + t.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + t.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  function refrescar() {
    pintarTabla(Almacenamiento.obtener(CLAVES.titulos));
  }

  function validarFormulario() {
    Mensajes.limpiarTodos(formulario);
    let ok = true;
    const anio = document.getElementById("anio").value;
    if (Almacenamiento.obtener(CLAVES.egresados).length === 0) {
      Mensajes.aviso("aviso-titulo", "Primero registre egresados antes de asignar títulos.", "error");
      ok = false;
    }
    if (!Validar.anio(anio)) {
      Mensajes.mostrarError("anio", "Ingrese un año válido (1990-2026).");
      ok = false;
    }
    return ok;
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario()) { return; }

    const datos = {
      egresadoId: document.getElementById("egresado").value,
      tipo: document.getElementById("tipo").value,
      carrera: document.getElementById("carrera").value,
      escuela: document.getElementById("escuela").value,
      anio: Number(document.getElementById("anio").value),
      estado: document.getElementById("estado").value
    };

    if (idEnEdicion) {
      Almacenamiento.actualizar(CLAVES.titulos, idEnEdicion, datos);
      Mensajes.aviso("aviso-titulo", "Título actualizado correctamente.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Guardar título";
    } else {
      datos.id = Almacenamiento.generarId();
      Almacenamiento.agregar(CLAVES.titulos, datos);
      Mensajes.aviso("aviso-titulo", "Título registrado correctamente.", "exito");
    }
    formulario.reset();
    refrescar();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const t = Almacenamiento.obtener(CLAVES.titulos).find(x => x.id === editar);
      if (!t) { return; }
      document.getElementById("egresado").value = t.egresadoId;
      document.getElementById("tipo").value = t.tipo;
      document.getElementById("carrera").value = t.carrera;
      document.getElementById("escuela").value = t.escuela;
      document.getElementById("anio").value = t.anio;
      document.getElementById("estado").value = t.estado;
      idEnEdicion = t.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar este título?")) {
        Almacenamiento.eliminar(CLAVES.titulos, eliminar);
        Mensajes.aviso("aviso-titulo", "Título eliminado.", "exito");
        refrescar();
      }
    }
  });

  document.getElementById("anio").addEventListener("input", () => Mensajes.limpiarError("anio"));

  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Guardar título";
  });

  /* Filtros: egresado (texto), tipo y estado. */
  formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const texto = (document.getElementById("f-egresado").value || "").toLowerCase().trim();
    const tipo = document.getElementById("f-tipo").value;
    const estado = document.getElementById("f-estado").value;

    const lista = Almacenamiento.obtener(CLAVES.titulos).filter(t => {
      const nombre = nombreEgresado(t.egresadoId).toLowerCase();
      if (texto && !nombre.includes(texto)) { return false; }
      if (tipo !== "Todos" && t.tipo !== tipo) { return false; }
      if (estado !== "Todos" && t.estado !== estado) { return false; }
      return true;
    });
    pintarTabla(lista);
  });

  cargarSelects();
  refrescar();
});
