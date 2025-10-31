# Fotomultaslab

Mapa interactivo de cámaras de fotodetección en Barranquilla, Colombia.

![Status](https://img.shields.io/badge/status-active-success.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)

Demo: https://YamiCueto.github.io/fotomultaslab

## Estructura

- `index.html` - Interfaz principal
- `style.css` - Estilos y variables (modo oscuro)
- `script.js` - Lógica: carga de datos, Leaflet, clusters, Fuse, GSAP
- `data/camaras.json` - Datos locales de cámaras
- `assets/` - Iconos y logo

## Cómo probar localmente

Recomendado: servir con un servidor local (evita restricciones CORS en algunos navegadores):

```powershell
# Desde la raíz del proyecto
python -m http.server 8000
# Luego abrir http://127.0.0.1:8000 en tu navegador
```

También puedes usar extensiones tipo "Live Server" en VS Code.

## Despliegue en GitHub Pages

```powershell
git init
git add .
git commit -m "🚀 Initial commit - Mapa interactivo de fotomultas Barranquilla"
git branch -M main
git remote add origin https://github.com/YamiCueto/fotomultaslab.git
git push -u origin main
```

Luego activar Pages desde Settings → Pages → Source: main / root.

## Cómo actualizar `data/camaras.json`

Añade objetos con la siguiente estructura:

```json
{
  "id": 10,
  "nombre": "Cámara ejemplo",
  "tipo": "VELOCIDAD",
  "direccion": "Dirección...",
  "latitud": "10.0",
  "longitud": "-74.0"
}
```

## Licencia

MIT © 2025 YamiCueto
