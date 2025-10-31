git init
git add .
git commit -m "🚀 Initial commit - Mapa interactivo de fotomultas Barranquilla"
git branch -M main
git remote add origin https://github.com/YamiCueto/fotomultaslab.git
git push -u origin main
# Fotomultaslab

Mapa interactivo de cámaras de fotodetección en Barranquilla, Colombia.

![Status](https://img.shields.io/badge/status-active-success.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)

Pequeña demo local que muestra la ubicación y tipo de cámaras (exceso de velocidad, luz roja y bloqueo de cruce) usando datos JSON locales y Leaflet.

## Estructura del proyecto

- `index.html` — Interfaz principal (header, sidebar, mapa)
- `style.css` — Variables de diseño (modo oscuro), componentes y responsive
- `script.js` — Lógica: carga/normalización de `data/camaras.json`, inicialización de Leaflet, MarkerCluster, Fuse (búsqueda) y animaciones GSAP
- `data/camaras.json` — Dataset local con ubicaciones y metadatos
- `assets/` — Iconos SVG y logo

## Requisitos

- Navegador moderno (Chrome/Firefox/Edge/Safari — últimas versiones)
- No se requieren herramientas de compilación (solo HTML/CSS/JS)

## Probar localmente

Se recomienda servir el contenido vía HTTP para evitar restricciones de fetch de archivos locales. Desde la raíz del proyecto puedes usar:

```powershell
python -m http.server 8000
# abrir http://127.0.0.1:8000
```

O usar la extensión Live Server de VS Code.


## Actualizar los datos (`data/camaras.json`)

El JSON puede contener distintos nombres de campos; el script normaliza automáticamente las propiedades más comunes (por ejemplo `name`, `nombre`, `tipo_de_infracci_n`, `point.coordinates`). Un elemento ejemplo mínimo:

```json
{
  "nombre": "Calle ejemplo",
  "tipo": "EXCESO DE VELOCIDAD",
  "direccion": "Dirección ejemplo",
  "latitud": "10.97",
  "longitud": "-74.78"
}
```

Para datasets con campo `description` que incluye HTML (`<br>`), el script mostrará la cadena tal cual; puedo añadir limpieza automática si lo deseas.

## Contribuir

- Abre un issue o PR con cambios en `data/camaras.json` o mejoras en la UI.
- Mantén los assets SVG optimizados y pequeños.

## Licencia

MIT © 2025 YamiCueto
