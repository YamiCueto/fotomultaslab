# 🔥 Prompt ULTRA refinado para Copilot/GPT-5 mini
## Con diseño pro, modo oscuro, íconos custom y animaciones GSAP

```markdown
Tú eres mi asistente senior de desarrollo frontend.  
Crea un proyecto llamado **fotomultaslab**, publicado en GitHub Pages, usando **Vanilla JS, HTML y CSS** (sin frameworks).  

---

## 🎯 Objetivo
Visualizar las **cámaras de fotodetección (fotomultas)** en Barranquilla, Colombia, usando un **archivo JSON local** con datos estructurados de ubicaciones reales.

---

## 📁 Estructura del proyecto

```
📁 fotomultaslab/
├── index.html
├── style.css
├── script.js
├── data/
│   └── camaras.json          ← JSON con los datos proporcionados
├── assets/
│   ├── icons/
│   │   ├── camera-speed.svg   ← Ícono para exceso de velocidad
│   │   ├── camera-light.svg   ← Ícono para luz roja
│   │   └── camera-block.svg   ← Ícono para bloqueo de cruce
│   └── logo.svg               ← Logo del proyecto
└── README.md
```

---

## 🎨 Diseño y UX

### Paleta de colores (modo oscuro por defecto)
```css
:root {
  --bg-primary: #0a0e27;
  --bg-secondary: #161b33;
  --accent: #ff6b35;
  --accent-hover: #ff8c42;
  --text: #e8eaf6;
  --text-muted: #9fa8da;
  --success: #00e676;
  --border: rgba(255, 255, 255, 0.1);
}
```

### Tipografía
- Fuente principal: **'Inter', system-ui, -apple-system, sans-serif**
- Pesos: 400 (normal), 600 (semibold), 700 (bold)
- Importar desde Google Fonts

### Layout
1. **Header fijo** con:
   - Logo + título "Fotomultas Barranquilla"
   - Toggle modo oscuro/claro (con transición suave)
   - Contador animado de cámaras activas

2. **Panel lateral izquierdo** (colapsable en móvil):
   - Buscador con autocompletado de direcciones
   - Filtros por tipo de infracción (checkboxes estilizados)
   - Lista scrolleable de cámaras con scroll virtual

3. **Mapa principal** (Leaflet):
   - Tiles oscuros: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png`
   - Clusterer para agrupar marcadores cercanos
   - Popup custom con glassmorphism

4. **Footer minimalista**:
   - "Datos actualizados: Oct 2025 | Fuente: DATT Barranquilla"
   - Links a GitHub y API

---

## ⚡ Funcionalidades técnicas

### 1. Carga y procesamiento de datos
```javascript
// Cargar desde data/camaras.json
async function cargarCamaras() {
  const response = await fetch('./data/camaras.json');
  const camaras = await response.json();
  
  // Filtrar solo registros válidos
  return camaras.filter(c => 
    c.latitud && 
    c.longitud && 
    parseFloat(c.latitud) && 
    parseFloat(c.longitud)
  );
}
```

### 2. Marcadores inteligentes con íconos dinámicos
```javascript
function getIconoPorTipo(tipo) {
  if (tipo.includes('VELOCIDAD')) return 'camera-speed.svg';
  if (tipo.includes('LUZ ROJA')) return 'camera-light.svg';
  if (tipo.includes('CRUCE')) return 'camera-block.svg';
  return 'camera-speed.svg'; // default
}
```

### 3. Popup personalizado con glassmorphism
```html
<div class="popup-custom">
  <div class="popup-header">
    <img src="${icono}" alt="tipo">
    <span class="badge">${tipo_infraccion}</span>
  </div>
  <div class="popup-body">
    <h4>${name}</h4>
    <p class="address">${description}</p>
    <a href="https://www.google.com/maps?q=${lat},${lng}" 
       target="_blank" 
       class="btn-directions">
      📍 Ver en Google Maps
    </a>
  </div>
</div>
```

### 4. Animaciones con GSAP
```javascript
// Al cargar la página
gsap.from('.header', { 
  y: -100, 
  opacity: 0, 
  duration: 0.8, 
  ease: 'power3.out' 
});

// Al agregar cada marcador
gsap.from(marker._icon, {
  scale: 0,
  duration: 0.4,
  ease: 'back.out(1.7)',
  delay: index * 0.02  // Efecto cascada
});

// Contador animado
gsap.to('.counter', {
  textContent: totalCamaras,
  duration: 2,
  ease: 'power1.out',
  snap: { textContent: 1 },
  onUpdate: function() {
    this.targets()[0].textContent = Math.ceil(this.targets()[0].textContent);
  }
});
```

### 5. Buscador con fuzzy matching
```javascript
import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.mjs';

const fuse = new Fuse(camaras, {
  keys: ['name', 'description'],
  threshold: 0.3
});

searchInput.addEventListener('input', (e) => {
  const resultados = fuse.search(e.target.value);
  actualizarListaCamaras(resultados.map(r => r.item));
});
```

### 6. Geolocalización del usuario
```javascript
btnMiUbicacion.addEventListener('click', () => {
  if (!navigator.geolocation) {
    mostrarNotificacion('Tu navegador no soporta geolocalización', 'error');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 15);
      
      L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: 'user-marker',
          html: '<div class="pulse"></div>',
          iconSize: [20, 20]
        })
      }).addTo(map);
    },
    (error) => {
      mostrarNotificacion('No pudimos obtener tu ubicación', 'error');
    }
  );
});
```

---

## 🎬 Efectos visuales adicionales

### Glassmorphism en paneles
```css
.panel {
  background: rgba(22, 27, 51, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Loading skeleton mientras carga
```html
<div class="skeleton-loader">
  <div class="skeleton-map"></div>
  <div class="skeleton-list">
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
  </div>
</div>
```

### Notificaciones toast
```javascript
function mostrarNotificacion(mensaje, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  
  gsap.fromTo(toast, 
    { x: 300, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
  );
  
  setTimeout(() => {
    gsap.to(toast, {
      x: 300,
      opacity: 0,
      duration: 0.3,
      onComplete: () => toast.remove()
    });
  }, 3000);
}
```

---

## 📱 Responsive

### Breakpoints
```css
/* Móvil */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
  }
  
  .sidebar.active {
    left: 0;
  }
  
  .toggle-sidebar {
    display: block; /* Botón hamburguesa */
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .sidebar {
    width: 350px;
  }
}
```

---

## 🚀 Optimizaciones

1. **Lazy loading de marcadores**: Solo renderizar los visibles en el viewport del mapa
2. **Debounce en búsqueda**: Esperar 300ms después del último input
3. **Service Worker**: Cachear el JSON y tiles del mapa para uso offline
4. **Compresión de assets**: Usar SVGs minificados

---

## 📦 CDNs a incluir

```html
<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Leaflet.markercluster -->
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>

<!-- GSAP -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

---

## 📄 README.md

Incluir:
1. Banner con screenshot del proyecto
2. Badges: ![Status](https://img.shields.io/badge/status-active-success.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)
3. Demo en vivo: `https://YamiCueto.github.io/fotomultaslab`
4. Instalación local:
   ```bash
   git clone https://github.com/YamiCueto/fotomultaslab.git
   cd fotomultaslab
   # Abrir con Live Server o:
   python -m http.server 8000
   ```
5. Contribuciones: Cómo actualizar el JSON con nuevas cámaras
6. Licencia MIT
7. Créditos: Datos de DATT Barranquilla, diseño inspirado en [mencionar si aplica]

---

## 🎯 Entregables

Genera los siguientes archivos COMPLETOS y listos para producción:

1. ✅ `index.html` - Estructura semántica con meta tags optimizados para SEO
2. ✅ `style.css` - Sistema de diseño completo con variables CSS y modo oscuro
3. ✅ `script.js` - Lógica modular con comentarios explicativos
4. ✅ `data/camaras.json` - El JSON proporcionado formateado
5. ✅ `assets/icons/*.svg` - 3 íconos minimalistas en SVG
6. ✅ `README.md` - Documentación profesional con capturas
7. ✅ `.gitignore` - Para excluir archivos innecesarios
8. ✅ `LICENSE` - Archivo MIT License

---

## 🚢 Instrucciones de deployment

Al finalizar, proporciona los comandos exactos para:

1. **Inicializar Git**:
   ```bash
   git init
   git add .
   git commit -m "🚀 Initial commit - Mapa interactivo de fotomultas Barranquilla"
   ```

2. **Crear repo en GitHub**:
   - Ir a https://github.com/new
   - Nombre: `fotomultaslab`
   - Descripción: "🚦 Mapa interactivo de cámaras de fotodetección en Barranquilla, Colombia"
   - Público ✅
   - NO inicializar con README

3. **Conectar y subir**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YamiCueto/fotomultaslab.git
   git push -u origin main
   ```

4. **Activar GitHub Pages**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / folder: `/ (root)`
   - Save
   - Esperar 1-2 minutos
   - Tu sitio estará en: `https://YamiCueto.github.io/fotomultaslab`

---

## ⚠️ Restricciones críticas

- ❌ NO usar Node.js, npm, webpack ni build tools
- ❌ NO frameworks (React, Vue, Angular)
- ✅ Solo HTML + CSS + Vanilla JS
- ✅ Todo debe funcionar al abrir `index.html` directamente
- ✅ Compatible con Chrome, Firefox, Safari (últimas 2 versiones)

---

**Genera todo el código inicial ahora, optimizado para producción, con comentarios útiles y siguiendo las mejores prácticas de 2025.**


## 🎨 Preview de cómo se verá

- **Header**: Barra superior con logo, título y toggle modo oscuro
- **Sidebar**: Panel con búsqueda inteligente + filtros + lista de cámaras
- **Mapa**: Ocupa el resto de la pantalla con clusters de marcadores
- **Animaciones**: Aparición suave de elementos, contador que sube animado, marcadores que escalan al aparecer

---