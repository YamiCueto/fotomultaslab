# DATA.md — Datos y formato

## Objetivo

Describir cómo está estructurado `data/camaras.json`, cómo actualizarlo cuando el gobierno publica nuevos datos y cómo integrar otras fuentes.

---

## Formato esperado

El repositorio usa un JSON array; cada elemento representa una cámara. Se normalizan distintos campos. **Campos principales:**

- `nombre` (string) — nombre o referencia de la cámara
- `tipo` (string) — tipo de infracción: "VELOCIDAD", "LUZ ROJA", "CRUCE"
- `direccion` (string) — dirección textual
- `latitud` (string|number) — latitud decimal (ej. "10.96854")
- `longitud` (string|number) — longitud decimal (ej. "-74.78132")
- `fuente` (string, opcional) — URL o referencia al dataset original
- `fecha_actualizacion` (string, opcional) — formato YYYY-MM-DD

### Ejemplo completo

```json
[
  {
    "nombre": "Calle 50 con Carrera 46",
    "tipo": "VELOCIDAD",
    "direccion": "Cll 50 #46-21, Barranquilla",
    "latitud": "10.96854",
    "longitud": "-74.78132",
    "fuente": "https://datos.barranquilla.gov.co/dataset/camaras-2025.csv",
    "fecha_actualizacion": "2025-10-01"
  },
  {
    "nombre": "Av. Circunvalar - Cra 38",
    "tipo": "LUZ ROJA",
    "direccion": "Av. Circunvalar #38-10",
    "latitud": "10.97123",
    "longitud": "-74.79456"
  }
]
```

---

## Normalización automática

El `script.js` ya convierte varias variantes de campo para soportar datasets heterogéneos:

- `name` → `nombre`
- `tipo_de_infracci_n`, `tipo_de_infracción` → `tipo`
- `description` → `direccion`
- `point.coordinates` → `longitud` / `latitud` (para datasets GeoJSON)

**Validación interna:** el script filtra registros donde `latitud` o `longitud` sean `null`, `undefined` o `NaN`.

---

## Actualizar datos oficiales

### Pasos recomendados

1. **Descarga** el archivo desde la plataforma de datos abiertos del gobierno (DATT, Secretaría, portal municipal).
2. **Identifica columnas:** busca lat, lon, dirección, tipo de infracción.
3. **Transformación:**
   - Usa Python, Node, Excel o herramientas CLI (`jq`, `csvkit`) para mapear columnas al schema requerido.
   - Ejemplo Python:
     ```python
     import pandas as pd
     df = pd.read_csv('camaras_oficial.csv')
     df_clean = df[['nombre','tipo','direccion','latitud','longitud']].dropna()
     df_clean.to_json('camaras.json', orient='records', force_ascii=False, indent=2)
     ```
4. **Valida:**
   - Todas las filas deben tener `latitud`/`longitud` válidas (no NaN).
   - Evita duplicados: agrupa por `(lat,lon)` o `(nombre,direccion)`.
   - Verifica tipos: normaliza "EXCESO VELOCIDAD" → "VELOCIDAD", etc.
5. **Reemplaza** `data/camaras.json` y registra `fecha_actualizacion` en un comentario o archivo README local.

### Al publicar un PR incluye

- Fuente original (URL del portal o dataset)
- Descripción del proceso de limpieza / transformación
- Número de registros añadidos/eliminados
- Fecha de actualización

---

## API endpoints (opcional)

Actualmente el proyecto usa JSON local. Si integras una **API pública**:

1. Añade la URL en `DATA.md`.
2. Modifica `script.js` para consumir:
   ```js
   const res = await fetch('https://api.example.com/camaras');
   const data = await res.json();
   ```
3. Documenta rate limits, autenticación (si aplica) y formato de respuesta.

---

## Schema (JSON Schema minimal)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "nombre": { "type": "string" },
      "tipo": { "type": "string", "enum": ["VELOCIDAD", "LUZ ROJA", "CRUCE"] },
      "direccion": { "type": "string" },
      "latitud": { "type": ["string", "number"] },
      "longitud": { "type": ["string", "number"] },
      "fuente": { "type": "string" },
      "fecha_actualizacion": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" }
    },
    "required": ["latitud", "longitud"]
  }
}
```

---

## Recursos y enlaces

- **Portal datos abiertos Barranquilla:** (añadir URL oficial si está disponible)
- **DATT / Secretaría de Tránsito:** contacto para solicitar actualizaciones
- **Herramientas útiles:**
  - [geojson.io](https://geojson.io) — validar coordenadas visualmente
  - [QGIS](https://qgis.org) — análisis geoespacial avanzado
  - [csvkit](https://csvkit.readthedocs.io) — manipular CSVs desde CLI

---

**Preguntas o problemas con los datos?** Abre un [issue en GitHub](https://github.com/YamiCueto/fotomultaslab/issues).
