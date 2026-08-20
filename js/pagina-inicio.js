/* ============================================================
   pagina-inicio.js
   Panel de inicio del sistema. Calcula los totales de cada
   coleccion a partir de Local Storage y los muestra en las
   tarjetas de resumen.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  document.getElementById("total-egresados").textContent =
    Almacenamiento.obtener(CLAVES.egresados).length;
  document.getElementById("total-titulos").textContent =
    Almacenamiento.obtener(CLAVES.titulos).length;
  document.getElementById("total-carreras").textContent =
    Almacenamiento.obtener(CLAVES.carreras).length;
  document.getElementById("total-escuelas").textContent =
    Almacenamiento.obtener(CLAVES.escuelas).length;
});
