# EXPANSION_TEMPLATE.md

Este documento es una **guía paso a paso** para replicar **Fotomultas Lab** en otra ciudad de América Latina (o cualquier región).

---

## 🎯 Objetivo

Crear un mapa interactivo de cámaras de tráfico que:
- Ayude a ciudadanos a conocer ubicaciones de fotomultas.
- Fomente transparencia gubernamental sobre infraestructura de tránsito.
- Sea replicable sin depender de infraestructura backend costosa.

---

## ⏱️ Estimación de tiempo

| Fase | Tiempo estimado |
|------|----------------|
| Obtener datos | 2-5 horas |
| Transformar/validar | 1-3 horas |
| Configurar mapa | 30 min |
| Deploy (GitHub Pages) | 15 min |
| Personalización (branding, meta tags) | 1 hora |
| **Total** | **~5-10 horas** |

*Nota: si los datos están en formato estructurado (CSV/JSON), el tiempo es menor. Si requieren web scraping o solicitudes FOIA, puede tomar días/semanas.*

---

## 🗂️ Paso 1: Obtener los datos

### Fuentes sugeridas

1. **Portales de datos abiertos** (preferido)
   - Colombia: [datos.gov.co](https://datos.gov.co)
   - Argentina: [datos.gob.ar](https://datos.gob.ar)
   - México: [datos.gob.mx](https://datos.gob.mx)
   - Chile: [datos.gob.cl](https://datos.gob.cl)

2. **Secretarías/Ministerios de Tránsito**
   - Secretaría de Movilidad local.
   - Policía de Tránsito.
   - Buscar "fotomultas", "cámaras de tráfico", "sistema de fotomultas" en sitios oficiales.

3. **Solicitudes FOIA / Derecho de petición**
   - Si no hay datos abiertos, solicita oficialmente el dataset bajo ley de transparencia.
   - Modelo de petición (ejemplo Colombia):
     > "Con fundamento en la Ley 1712 de 2014, solicito el dataset actualizado de ubicación de cámaras de foto-detección de infracciones de tránsito instaladas en [Ciudad], incluyendo latitud, longitud, tipo de infracción detectada y fecha de instalación."

4. **Web scraping (último recurso)**
   - Algunos sitios publican listas en HTML. Usa `BeautifulSoup`, `Puppeteer` o `Scrapy` para extraer.

### Formato ideal

CSV o JSON con al menos:
- `nombre` o `id`: identificador único.
- `latitud`, `longitud`: coordenadas WGS84.
- `tipo`: tipo de infracción (velocidad, luz roja, cruce prohibido).
- `direccion`: ubicación legible para humanos.
- `fecha_instalacion` (opcional).

---

## 🛠️ Paso 2: Transformar y validar

### Script de transformación

Ejemplo en Python:

```python
import pandas as pd
import json

# Cargar CSV descargado
df = pd.read_csv("data_raw/camaras_ciudad.csv", encoding="utf-8")

# Normalizar nombres de columnas
df.rename(columns={
    "Nombre": "nombre",
    "Latitud": "latitud",
    "Longitud": "longitud",
    "Tipo": "tipo",
    "Dirección": "direccion"
}, inplace=True)

# Normalizar tipos
tipo_map = {
    "Exceso de velocidad": "VELOCIDAD",
    "Semáforo en rojo": "LUZ ROJA",
    "Cruce prohibido": "CRUCE"
}
df["tipo"] = df["tipo"].map(tipo_map).fillna("VELOCIDAD")

# Eliminar registros sin coordenadas
df = df.dropna(subset=["latitud", "longitud"])

# Validar rango (ej. Colombia: lat 2-12, lon -79 a -66)
df = df[(df["latitud"] > 2) & (df["latitud"] < 12) &
        (df["longitud"] > -79) & (df["longitud"] < -66)]

# Export JSON
cameras = df.to_dict(orient="records")
with open("data/camaras.json", "w", encoding="utf-8") as f:
    json.dump(cameras, f, ensure_ascii=False, indent=2)

print(f"✅ {len(cameras)} cámaras exportadas")
```

### Validación visual

1. **Carga en QGIS:**
   - Importa el JSON como capa de puntos.
   - Revisa visualmente que las coordenadas caen en calles/intersecciones.

2. **geojson.io:**
   - Convierte a GeoJSON y carga en [geojson.io](https://geojson.io).
   - Verifica ubicaciones manualmente.

---

## 🗺️ Paso 3: Configurar el mapa

### Fork el proyecto

```bash
git clone https://github.com/YamiCueto/fotomultaslab.git fotomultas-ciudad
cd fotomultas-ciudad
```

### Actualizar datos

1. Reemplaza `data/camaras.json` con tu dataset.
2. Edita `script.js`:
   ```js
   const mapConfig = {
     center: [4.6097, -74.0817], // ← tus coordenadas (ej. Bogotá)
     zoom: 12,                   // ajusta según tamaño de ciudad
     // ...
   };
   ```

### Prueba local

```bash
# Python
python -m http.server 8000

# Node
npx http-server -p 8000

# abre http://127.0.0.1:8000
```

---

## 🚀 Paso 4: Deploy en GitHub Pages

1. **Crea un repo en GitHub:**
   ```bash
   git remote set-url origin https://github.com/TU_USUARIO/fotomultas-ciudad.git
   git branch -M main
   git push -u origin main
   ```

2. **Activa GitHub Pages:**
   - Settings → Pages → Source: Deploy from a branch → Branch: `main` → `/root` → Save.

3. **Accede a tu sitio:**
   - `https://TU_USUARIO.github.io/fotomultas-ciudad`

---

## 🎨 Paso 5: Personalizar branding

### Cambiar nombre y logo

1. **index.html:**
   ```html
   <title>Fotomultas [Tu Ciudad]</title>
   <meta property="og:title" content="Mapa de Fotomultas - [Ciudad]">
   <meta property="og:description" content="Encuentra cámaras de tráfico...">
   ```

2. **manifest.json:**
   ```json
   {
     "name": "Fotomultas [Ciudad]",
     "short_name": "[Ciudad]",
     "start_url": "./?utm_source=homescreen",
     "icons": [...]
   }
   ```

3. **Generar iconos:**
   - Edita `assets/logo.svg` con el nombre/color de tu ciudad.
   - Ejecuta:
     ```bash
     npm install sharp
     node scripts/generate_icons.js
     ```

### Actualizar meta tags

- `og-image.png`: captura del mapa centrado en tu ciudad o diseña uno nuevo (1200×630 px).
- `description`: menciona el nombre de la ciudad en el meta description para SEO local.

---

## 📣 Paso 6: Difusión local

### Estrategias

1. **Redes sociales:**
   - Post en grupos de Facebook locales (conductores, ciclistas, movilidad).
   - Tweet mencionando a la Secretaría de Tránsito o alcaldía.
   - Reddit: subreddit de tu ciudad.

2. **Medios:**
   - Envía nota de prensa a medios locales (radio, periódicos, blogs de tecnología cívica).
   - Pitch: "Herramienta gratuita que ayuda a conductores a conocer ubicación de fotomultas, promoviendo transparencia".

3. **Comunidad:**
   - Presenta el proyecto en meetups de desarrolladores, civic tech, o gobierno abierto.
   - Añade el proyecto a directorios como [Code for All](https://codeforall.org/), [Civic Tech Field Guide](https://civictech.guide/).

---

## ✅ Checklist de lanzamiento

- [ ] Datos obtenidos y validados (sin coordenadas erróneas).
- [ ] `data/camaras.json` actualizado.
- [ ] Centro del mapa (`mapConfig.center`) ajustado.
- [ ] Branding personalizado (título, logo, og-image).
- [ ] Prueba local exitosa (mapa carga, filtros funcionan).
- [ ] Deploy en GitHub Pages activo.
- [ ] README actualizado con fuente de datos y créditos.
- [ ] Post inicial en redes sociales (al menos 1 canal).
- [ ] Issue abierto en repo original (para visibilidad de otras ciudades).

---

## 🆘 Soporte

Si tienes problemas replicando el proyecto:
1. Revisa la sección **Troubleshooting** en el README.
2. Busca issues similares en [YamiCueto/fotomultaslab](https://github.com/YamiCueto/fotomultaslab/issues).
3. Abre un nuevo issue con etiqueta `expansion`.

**¡Éxito en tu lanzamiento!** 🚀
