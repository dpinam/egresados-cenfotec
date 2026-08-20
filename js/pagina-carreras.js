/* ============================================================
   pagina-carreras.js
   Gestion de carreras academicas (RF-05).
   CRUD sobre Local Storage. La cantidad de egresados por
   carrera se calcula a partir de los titulos registrados.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-carrera");
  const cuerpoTabla = document.getElementById("tabla-carreras");
  let idEnEdicion = null;

  function cargarEscuelas() {
    const sel = document.getElementById("escuela");
    sel.innerHTML = "";
    Almacenamiento.obtener(CLAVES.escuelas).forEach(es => {
      const op = document.createElement("option");
      op.value = es.nombre;
      op.textContent = es.nombre;
      sel.appendChild(op);
    });
  }

  /* Cuenta cuantos titulos usan una carrera (egresados asociados). */
  function egresadosPorCarrera(nombre) {
    return Almacenamiento.obtener(CLAVES.titulos).filter(t => t.carrera === nombre).length;
  }

  function pintarTabla() {
    const lista = Almacenamiento.obtener(CLAVES.carreras);
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="5">No hay carreras registradas.</td></tr>';
      return;
    }
    lista.forEach(c => {
      const clase = c.estado === "Activa" ? "estado-exito" : "estado-neutro";
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + c.nombre + "</td>" +
        "<td>" + c.escuela + "</td>" +
        "<td>" + egresadosPorCarrera(c.nombre) + "</td>" +
        '<td><span class="estado ' + clase + '">' + c.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + c.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + c.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formulario);

    const nombre = document.getElementById("nombre").value;
    if (!Validar.requerido(nombre)) {
      Mensajes.mostrarError("nombre", "El nombre de la carrera es obligatorio.");
      return;
    }
    /* Evita carreras duplicadas por nombre. */
    const repetida = Almacenamiento.obtener(CLAVES.carreras)
      .some(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase() && c.id !== idEnEdicion);
    if (repetida) {
      Mensajes.mostrarError("nombre", "Ya existe una carrera con ese nombre.");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      escuela: document.getElementById("escuela").value,
      descripcion: document.getElementById("desc").value.trim(),
      estado: "Activa"
    };

    if (idEnEdicion) {
      Almacenamiento.actualizar(CLAVES.carreras, idEnEdicion, datos);
      Mensajes.aviso("aviso-carrera", "Carrera actualizada.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Guardar carrera";
    } else {
      datos.id = Almacenamiento.generarId();
      Almacenamiento.agregar(CLAVES.carreras, datos);
      Mensajes.aviso("aviso-carrera", "Carrera creada.", "exito");
    }
    formulario.reset();
    pintarTabla();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const c = Almacenamiento.obtener(CLAVES.carreras).find(x => x.id === editar);
      if (!c) { return; }
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("escuela").value = c.escuela;
      document.getElementById("desc").value = c.descripcion || "";
      idEnEdicion = c.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar esta carrera?")) {
        Almacenamiento.eliminar(CLAVES.carreras, eliminar);
        Mensajes.aviso("aviso-carrera", "Carrera eliminada.", "exito");
        pintarTabla();
      }
    }
  });

  document.getElementById("nombre").addEventListener("input", () => Mensajes.limpiarError("nombre"));
  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Guardar carrera";
  });

  cargarEscuelas();
  pintarTabla();
});
