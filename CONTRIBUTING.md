# CONTRIBUTING.md

Gracias por contribuir a **Fotomultas Lab**. En este archivo encontrarás las pautas para aportar datos, código o mejoras.

---

## 🗺️ Cómo agregar cámaras de otra ciudad

1. **Fork y rama:**
   ```bash
   git checkout -b feat/data-ciudad-<nombre>
   ```

2. **Añade tus datos:**
   - Preferible: crea `data/camaras-<ciudad>.json` (no modifiques el existente si es otra ciudad).
   - Si es un dataset grande, incluye un script de transformación en `scripts/` y documenta los pasos.

3. **Valida:**
   - Latitud/longitud válidas (no NaN, no vacías).
   - Tipo normalizado: "VELOCIDAD", "LUZ ROJA" o "CRUCE" (cuando aplique).
   - Añade campos `fuente` y `fecha_actualizacion` en cada registro o como comentario JSON (si el formato lo permite).

4. **Ajusta el mapa:**
   - Edita `script.js` → `mapConfig.center` y `zoom` para centrar en la nueva ciudad.
   - Ejemplo:
     ```js
     const mapConfig = {
       center: [4.6097, -74.0817], // Bogotá
       zoom: 12,
       // ...
     };
     ```

5. **Prueba localmente:**
   ```bash
   python -m http.server 8000
   # abre http://127.0.0.1:8000
   ```

---

## ✅ Validar ubicaciones

- **Método manual:** usa [Google Maps](https://maps.google.com) o [geojson.io](https://geojson.io) para revisar que la coordenada apunta a la calle mencionada.
- **Método batch:** usa QGIS o librerías (`shapely`, `geojson`) para verificar que las coordenadas caen dentro del polígono urbano/municipal.
- **Herramientas CLI:**
  ```bash
  # Validar JSON syntax
  jq empty data/camaras.json

  # Filtrar registros sin lat/lon
  jq '.[] | select(.latitud == null or .longitud == null)' data/camaras.json
  ```

---

## 📝 PR guidelines

### Título y descripción

- **Formato de título:** `data(ciudad): añadir N cámaras` o `feat(ui): mejorar X` o `fix(map): corregir zoom inicial`.
- **Descripción:** incluye:
  - Fuente de los datos (URL, portal oficial).
  - Proceso de transformación (script, herramienta usada).
  - Número de registros añadidos/eliminados.
  - Fecha de actualización oficial.

### Ejemplo

```markdown
## data(medellin): añadir 45 cámaras de velocidad

- **Fuente:** https://datos.gov.co/dataset/medellin-camaras-2025
- **Proceso:** descarga CSV → pandas → normalización tipo/coordenadas → export JSON
- **Registros:** 45 nuevos (0 eliminados)
- **Fecha:** 2025-11-01
```

### Etiquetas

- Usa labels: `data`, `enhancement`, `bug`, `documentation`.

---

## 🎨 Estilo de código

- **JavaScript:** mantener estilo simple (ES6+), sin transpilación necesaria.
- **Commits:** sigue [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(scope): descripción`
  - `fix(scope): descripción`
  - `docs(scope): descripción`
  - `data(ciudad): descripción`

---

## 🔍 Revisión y merge

- Los PRs serán revisados por el mantenedor.
- Para cambios grandes (refactorización, nueva feature), **abre un issue primero** para discutir antes de invertir tiempo.
- Tiempo estimado de revisión: 3-7 días (proyecto mantenido de forma voluntaria).

---

## 🚀 Ideas de contribución

### Datos

- Actualizar `data/camaras.json` con información oficial reciente.
- Añadir cámaras de otras ciudades (Bogotá, Medellín, Cali, Cartagena).
- Validar coordenadas existentes (reportar errores).

### Features

- Panel de estadísticas (conteo por barrio/tipo).
- Export a CSV/GeoJSON.
- Alertas por zona (notificaciones cuando se actualice dataset).
- Integración con API pública (si existe).
- Modo claro / cambio de tema visual.

### Documentación

- Tutoriales para replicar en otras ciudades.
- Traducción del README a inglés (internacionalización).
- Videos/GIFs demostrando uso.

---

## 📧 Contacto

¿Dudas o sugerencias? Abre un [issue en GitHub](https://github.com/YamiCueto/fotomultaslab/issues) o comenta en los canales comunitarios.

**Gracias por ayudar a hacer esta herramienta más útil y accesible para todos.** 🙌
