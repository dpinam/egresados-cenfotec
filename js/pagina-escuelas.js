/* ============================================================
   pagina-escuelas.js
   Gestion de escuelas academicas (RF-06).
   CRUD sobre Local Storage. La cantidad de carreras asociadas
   se calcula a partir de la coleccion de carreras.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-escuela");
  const cuerpoTabla = document.getElementById("tabla-escuelas");
  let idEnEdicion = null;

  function carrerasPorEscuela(nombre) {
    return Almacenamiento.obtener(CLAVES.carreras).filter(c => c.escuela === nombre).length;
  }

  function pintarTabla() {
    const lista = Almacenamiento.obtener(CLAVES.escuelas);
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="5">No hay escuelas registradas.</td></tr>';
      return;
    }
    lista.forEach(es => {
      const clase = es.estado === "Activa" ? "estado-exito" : "estado-neutro";
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + es.nombre + "</td>" +
        "<td>" + (es.director || "-") + "</td>" +
        "<td>" + carrerasPorEscuela(es.nombre) + "</td>" +
        '<td><span class="estado ' + clase + '">' + es.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + es.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + es.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formulario);

    const nombre = document.getElementById("nombre").value;
    if (!Validar.requerido(nombre)) {
      Mensajes.mostrarError("nombre", "El nombre de la escuela es obligatorio.");
      return;
    }
    const repetida = Almacenamiento.obtener(CLAVES.escuelas)
      .some(e => e.nombre.toLowerCase() === nombre.trim().toLowerCase() && e.id !== idEnEdicion);
    if (repetida) {
      Mensajes.mostrarError("nombre", "Ya existe una escuela con ese nombre.");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      director: document.getElementById("director").value.trim(),
      descripcion: document.getElementById("desc").value.trim(),
      estado: "Activa"
    };

    if (idEnEdicion) {
      Almacenamiento.actualizar(CLAVES.escuelas, idEnEdicion, datos);
      Mensajes.aviso("aviso-escuela", "Escuela actualizada.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Guardar escuela";
    } else {
      datos.id = Almacenamiento.generarId();
      Almacenamiento.agregar(CLAVES.escuelas, datos);
      Mensajes.aviso("aviso-escuela", "Escuela creada.", "exito");
    }
    formulario.reset();
    pintarTabla();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const es = Almacenamiento.obtener(CLAVES.escuelas).find(x => x.id === editar);
      if (!es) { return; }
      document.getElementById("nombre").value = es.nombre;
      document.getElementById("director").value = es.director || "";
      document.getElementById("desc").value = es.descripcion || "";
      idEnEdicion = es.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar esta escuela?")) {
        Almacenamiento.eliminar(CLAVES.escuelas, eliminar);
        Mensajes.aviso("aviso-escuela", "Escuela eliminada.", "exito");
        pintarTabla();
      }
    }
  });

  document.getElementById("nombre").addEventListener("input", () => Mensajes.limpiarError("nombre"));
  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Guardar escuela";
  });

  pintarTabla();
});
