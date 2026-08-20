/* ============================================================
   pagina-egresados.js
   Gestion de egresados (RF-02, RF-03, RF-09).
   Registro manual, importacion por CSV, listado con filtros,
   edicion y eliminacion, todo sobre Local Storage.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-egresado");
  const cuerpoTabla = document.getElementById("tabla-egresados");
  const formFiltros = document.getElementById("filtros-egresados");
  let idEnEdicion = null;

  /* ---------- Utilidades de dominio ---------- */

  /* Devuelve el titulo mas reciente de un egresado (para la tabla). */
  function tituloPrincipal(egresadoId) {
    const titulos = Almacenamiento.obtener(CLAVES.titulos)
      .filter(t => t.egresadoId === egresadoId)
      .sort((a, b) => b.anio - a.anio);
    return titulos.length > 0 ? titulos[0] : null;
  }

  function claseEstado(estado) {
    return estado === "Activo" ? "estado-exito" : "estado-neutro";
  }

  /* ---------- Render del listado ---------- */

  function pintarTabla(lista) {
    cuerpoTabla.innerHTML = "";

    if (lista.length === 0) {
      cuerpoTabla.innerHTML =
        '<tr class="fila-vacia"><td colspan="7">No hay egresados que coincidan.</td></tr>';
      return;
    }

    lista.forEach(egr => {
      const titulo = tituloPrincipal(egr.id);
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + egr.identificacion + "</td>" +
        "<td>" + egr.nombre + "</td>" +
        "<td>" + egr.correo + "</td>" +
        "<td>" + (titulo ? titulo.carrera : "-") + "</td>" +
        "<td>" + (titulo ? titulo.anio : "-") + "</td>" +
        '<td><span class="estado ' + claseEstado(egr.estado) + '">' + egr.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + egr.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + egr.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  function aplicarFiltros() {
    const texto = (document.getElementById("f-nombre").value || "").toLowerCase().trim();
    const carrera = document.getElementById("f-carrera").value;
    const escuela = document.getElementById("f-escuela").value;
    const tipo = document.getElementById("f-tipo").value;
    const anio = (document.getElementById("f-anio").value || "").trim();

    const lista = Almacenamiento.obtener(CLAVES.egresados).filter(egr => {
      if (texto && !egr.nombre.toLowerCase().includes(texto)) { return false; }

      const titulos = Almacenamiento.obtener(CLAVES.titulos).filter(t => t.egresadoId === egr.id);
      if (carrera && carrera !== "Todas" && !titulos.some(t => t.carrera === carrera)) { return false; }
      if (escuela && escuela !== "Todas" && !titulos.some(t => t.escuela === escuela)) { return false; }
      if (tipo && tipo !== "Todos" && !titulos.some(t => t.tipo === tipo)) { return false; }
      if (anio && !titulos.some(t => String(t.anio) === anio)) { return false; }
      return true;
    });

    pintarTabla(lista);
  }

  function refrescar() {
    pintarTabla(Almacenamiento.obtener(CLAVES.egresados));
  }

  /* ---------- Alta y edicion ---------- */

  function validarFormulario() {
    Mensajes.limpiarTodos(formulario);
    let ok = true;

    const ident = document.getElementById("ident").value;
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const fecha = document.getElementById("fecha").value;

    if (!Validar.requerido(ident)) { Mensajes.mostrarError("ident", "La identificacion es obligatoria."); ok = false; }
    if (!Validar.requerido(nombre)) { Mensajes.mostrarError("nombre", "El nombre es obligatorio."); ok = false; }
    if (!Validar.correo(correo)) { Mensajes.mostrarError("correo", "Ingrese un correo valido."); ok = false; }
    if (!Validar.telefono(telefono)) { Mensajes.mostrarError("telefono", "Telefono de 8 digitos (8888-0000)."); ok = false; }
    if (!Validar.requerido(fecha)) { Mensajes.mostrarError("fecha", "Seleccione la fecha de registro."); ok = false; }

    /* Evita identificaciones duplicadas (integridad de datos). */
    if (ok) {
      const repetido = Almacenamiento.obtener(CLAVES.egresados)
        .some(e => e.identificacion === ident.trim() && e.id !== idEnEdicion);
      if (repetido) {
        Mensajes.mostrarError("ident", "Ya existe un egresado con esa identificacion.");
        ok = false;
      }
    }
    return ok;
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario()) { return; }

    const datos = {
      identificacion: document.getElementById("ident").value.trim(),
      nombre: document.getElementById("nombre").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      fechaRegistro: document.getElementById("fecha").value,
      empresa: document.getElementById("trabajo").value.trim(),
      estado: "Activo"
    };

    if (idEnEdicion) {
      Almacenamiento.actualizar(CLAVES.egresados, idEnEdicion, datos);
      Mensajes.aviso("aviso-egresado", "Egresado actualizado correctamente.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Registrar egresado";
    } else {
      datos.id = Almacenamiento.generarId();
      datos.area = "";
      datos.puesto = "";
      datos.linkedin = "";
      datos.portafolio = "";
      Almacenamiento.agregar(CLAVES.egresados, datos);
      Mensajes.aviso("aviso-egresado", "Egresado registrado correctamente.", "exito");
    }

    formulario.reset();
    refrescar();
  });

  /* Botones Editar / Eliminar (delegacion de eventos en la tabla). */
  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const egr = Almacenamiento.obtener(CLAVES.egresados).find(e => e.id === editar);
      if (!egr) { return; }
      document.getElementById("ident").value = egr.identificacion;
      document.getElementById("nombre").value = egr.nombre;
      document.getElementById("correo").value = egr.correo;
      document.getElementById("telefono").value = egr.telefono;
      document.getElementById("fecha").value = egr.fechaRegistro;
      document.getElementById("trabajo").value = egr.empresa || "";
      idEnEdicion = egr.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar este egresado? Tambien se quitaran sus titulos.")) {
        Almacenamiento.eliminar(CLAVES.egresados, eliminar);
        /* Mantiene la integridad: elimina los titulos asociados. */
        const titulos = Almacenamiento.obtener(CLAVES.titulos).filter(t => t.egresadoId !== eliminar);
        Almacenamiento.guardar(CLAVES.titulos, titulos);
        Mensajes.aviso("aviso-egresado", "Egresado eliminado.", "exito");
        refrescar();
      }
    }
  });

  /* Limpia errores mientras el usuario escribe. */
  ["ident", "nombre", "correo", "telefono", "fecha"].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) { campo.addEventListener("input", () => Mensajes.limpiarError(id)); }
  });

  /* Boton Limpiar del formulario. */
  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Registrar egresado";
  });

  /* ---------- Filtros ---------- */
  formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    aplicarFiltros();
  });
  formFiltros.addEventListener("reset", () => setTimeout(refrescar, 0));

  /* ---------- Importacion CSV (RF-03) ---------- */
  const botonImportar = document.getElementById("btn-importar");
  const inputArchivo = document.getElementById("archivo-csv");

  botonImportar.addEventListener("click", () => {
    const archivo = inputArchivo.files[0];
    if (!archivo) {
      Mensajes.aviso("aviso-egresado", "Seleccione un archivo CSV primero.", "error");
      return;
    }
    if (!archivo.name.toLowerCase().endsWith(".csv")) {
      Mensajes.aviso("aviso-egresado", "El archivo debe tener extension .csv.", "error");
      return;
    }

    const lector = new FileReader();
    lector.onload = (e) => procesarCSV(e.target.result);
    lector.readAsText(archivo);
  });

  function procesarCSV(contenido) {
    const lineas = contenido.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lineas.length < 2) {
      Mensajes.aviso("aviso-egresado", "El archivo no contiene registros.", "error");
      return;
    }

    const encabezados = lineas[0].split(",").map(h => h.trim().toLowerCase());
    const requeridos = ["identificacion", "nombre", "correo", "telefono"];
    const faltantes = requeridos.filter(r => !encabezados.includes(r));
    if (faltantes.length > 0) {
      Mensajes.aviso("aviso-egresado", "Faltan columnas obligatorias: " + faltantes.join(", "), "error");
      return;
    }

    const existentes = Almacenamiento.obtener(CLAVES.egresados);
    let agregados = 0, omitidos = 0;

    for (let i = 1; i < lineas.length; i++) {
      const celdas = lineas[i].split(",").map(c => c.trim());
      const fila = {};
      encabezados.forEach((h, idx) => { fila[h] = celdas[idx] || ""; });

      const valido = Validar.requerido(fila.identificacion) &&
                     Validar.requerido(fila.nombre) &&
                     Validar.correo(fila.correo);
      const duplicado = existentes.some(e => e.identificacion === fila.identificacion);

      if (!valido || duplicado) { omitidos++; continue; }

      const nuevo = {
        id: Almacenamiento.generarId(),
        identificacion: fila.identificacion,
        nombre: fila.nombre,
        correo: fila.correo,
        telefono: fila.telefono,
        fechaRegistro: fila.fecharegistro || new Date().toISOString().slice(0, 10),
        empresa: fila.empresa || "",
        estado: "Activo"
      };
      existentes.push(nuevo);
      agregados++;
    }

    Almacenamiento.guardar(CLAVES.egresados, existentes);
    refrescar();
    Mensajes.aviso("aviso-egresado",
      "Importacion terminada: " + agregados + " agregados, " + omitidos + " omitidos (duplicados o invalidos).",
      agregados > 0 ? "exito" : "error");
  }

  /* Descarga una plantilla CSV de ejemplo. */
  document.getElementById("btn-plantilla").addEventListener("click", (evento) => {
    evento.preventDefault();
    const contenido = "identificacion,nombre,correo,telefono,fecharegistro,empresa\n" +
                      "1-1111-2222,Nombre Ejemplo,ejemplo@correo.com,8888-9999,2026-01-15,Empresa Ejemplo\n";
    const enlace = document.createElement("a");
    enlace.href = "data:text/csv;charset=utf-8," + encodeURIComponent(contenido);
    enlace.download = "plantilla-egresados.csv";
    enlace.click();
  });

  /* ---------- Arranque ---------- */
  refrescar();
});
