# Sistema de Gestion de Egresados - Universidad CENFOTEC

Proyecto del curso **SOFT-06 - Diseno y Programacion Web** (Seccion SCP0, Periodo 2026-C2).
Avance 2: interfaz web con HTML, CSS y JavaScript, con validacion de formularios y
almacenamiento de datos en **Local Storage**.

## Integrantes
- Dylan Pina Moya
- Luis Alonso Aguero Suarez

## Como ejecutar
No requiere instalacion ni servidor.

1. Abrir la carpeta en VS Code (o hacer doble clic en `Egresados-CENFOTEC.code-workspace`).
2. Instalar la extension **Live Server** si se sugiere.
3. Clic derecho en `index.html` -> **Open with Live Server**.

Alternativa: abrir `index.html` directamente en el navegador.

## Roles de acceso (demo)
Desde la portada, entrar por **Iniciar sesion**, escribir el nombre y elegir un rol:
- **Registro**: egresados, titulos, carreras y escuelas.
- **Bienestar Estudiantil**: actividades, comunidades, mentorias, comunicados y oportunidades.
- **Egresado**: perfil, mentorias, comunidades y oportunidades.

## Estructura
```
PROYECTO WEB/
├── index.html            Portada publica (landing)
├── login.html            Inicio de sesion
├── inicio.html           Panel de inicio
├── perfil.html           Perfil del egresado
├── egresados.html        Gestion de egresados (+ importacion CSV)
├── titulos.html          Gestion de titulos
├── carreras.html         Gestion de carreras
├── escuelas.html         Gestion de escuelas
├── actividades.html      Gestion de actividades
├── comunidades.html      Gestion de comunidades
├── mentorias.html        Gestion de mentorias
├── oportunidades.html    Oportunidades laborales
├── comunicados.html      Comunicados
├── css/styles.css        Estilos
├── assets/img/           Imagenes y logos
└── js/                   Logica (validacion, Local Storage, navegacion, por pagina)
```


## Notas
Los datos de ejemplo se cargan la primera vez. Para reiniciarlos, borrar el
almacenamiento del sitio en el navegador (o cambia solo al actualizar la version de datos).
