/* ============================================================
   pagina-perfil.js
   Perfil del egresado (RF-07, RF-08).
   Carga los datos del egresado desde Local Storage, permite
   actualizar su informacion profesional y muestra sus titulos.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  /* El perfil de demostracion corresponde al egresado egr-1. */
  const ID_EGRESADO = "egr-1";

  function egresadoActual() {
    return Almacenamiento.obtener(CLAVES.egresados).find(e => e.id === ID_EGRESADO);
  }

  function cargarDatos() {
    const egr = egresadoActual();
    if (!egr) { return; }
    document.getElementById("identificacion").value = egr.identificacion;
    document.getElementById("nombre").value = egr.nombre;
    document.getElementById("correo").value = egr.correo;
    document.getElementById("telefono").value = egr.telefono;
    document.getElementById("empresa").value = egr.empresa || "";
    document.getElementById("puesto").value = egr.puesto || "";
    if (egr.area) { document.getElementById("area").value = egr.area; }
    document.getElementById("linkedin").value = egr.linkedin || "";
    document.getElementById("portafolio").value = egr.portafolio || "";
  }

  function pintarTitulos() {
    const cuerpo = document.getElementById("tabla-titulos-perfil");
    const titulos = Almacenamiento.obtener(CLAVES.titulos).filter(t => t.egresadoId === ID_EGRESADO);
    cuerpo.innerHTML = "";
    if (titulos.length === 0) {
      cuerpo.innerHTML = '<tr class="fila-vacia"><td colspan="5">No tiene titulos registrados.</td></tr>';
      return;
    }
    titulos.forEach(t => {
      const clase = t.estado === "Graduado" ? "estado-exito" : "estado-alerta";
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + t.tipo + "</td>" +
        "<td>" + t.carrera + "</td>" +
        "<td>" + t.escuela + "</td>" +
        "<td>" + t.anio + "</td>" +
        '<td><span class="estado ' + clase + '">' + t.estado + "</span></td>";
      cuerpo.appendChild(fila);
    });
  }

  function validar() {
    ["correo", "telefono", "linkedin", "portafolio"].forEach(id => Mensajes.limpiarError(id));
    let ok = true;
    if (!Validar.correo(document.getElementById("correo").value)) {
      Mensajes.mostrarError("correo", "Ingrese un correo valido."); ok = false;
    }
    if (!Validar.telefono(document.getElementById("telefono").value)) {
      Mensajes.mostrarError("telefono", "Telefono de 8 digitos (8888-0000)."); ok = false;
    }
    if (!Validar.url(document.getElementById("linkedin").value)) {
      Mensajes.mostrarError("linkedin", "Debe iniciar con http:// o https://"); ok = false;
    }
    if (!Validar.url(document.getElementById("portafolio").value)) {
      Mensajes.mostrarError("portafolio", "Debe iniciar con http:// o https://"); ok = false;
    }
    return ok;
  }

  document.getElementById("btn-guardar-perfil").addEventListener("click", () => {
    if (!validar()) { return; }
    Almacenamiento.actualizar(CLAVES.egresados, ID_EGRESADO, {
      correo: document.getElementById("correo").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      empresa: document.getElementById("empresa").value.trim(),
      puesto: document.getElementById("puesto").value.trim(),
      area: document.getElementById("area").value,
      linkedin: document.getElementById("linkedin").value.trim(),
      portafolio: document.getElementById("portafolio").value.trim()
    });
    Mensajes.aviso("aviso-perfil", "Informacion actualizada correctamente.", "exito");
  });

  document.getElementById("btn-cancelar-perfil").addEventListener("click", () => {
    cargarDatos();
    ["correo", "telefono", "linkedin", "portafolio"].forEach(id => Mensajes.limpiarError(id));
  });

  cargarDatos();
  pintarTitulos();
});
