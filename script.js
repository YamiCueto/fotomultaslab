// script.js - Lógica principal (Vanilla JS)
// Carga cámaras, inicializa mapa, clusters, buscador (Fuse) y animaciones (GSAP).

const mapConfig = {
  center: [10.96854, -74.78132], // Barranquilla
  zoom: 13,
  // Use OpenStreetMap tiles (public, no API key required)
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; OpenStreetMap contributors'
};

let map, markersCluster, camaras = [], fuse;
const cameraListEl = document.getElementById('cameraList');
const searchInput = document.getElementById('searchInput');
const counterEl = document.querySelector('.counter');

document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  const datos = await cargarCamaras();
  camaras = datos;
  await initFuse(camaras);
  renderMarkers(camaras);
  renderLista(camaras);
  animateCounter(camaras.length);
  attachUI();
  // Register service worker for PWA/offline support with update detection
  if('serviceWorker' in navigator){
    try{
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registered');
      
      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            if(confirm('🆕 Nueva versión disponible. ¿Actualizar ahora?')){
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
    }catch(e){
      console.warn('Service Worker registration failed', e);
    }
  }
  
    // Mobile sidebar toggle wiring: hamburger, close and overlay
    const toggleBtn = document.getElementById('toggleSidebar')
    const closeBtn = document.getElementById('closeSidebar')
    const overlayEl = document.getElementById('overlay')
    const sidebarEl = document.getElementById('sidebar')
  
    function openSidebar(){
        if(!sidebarEl) return
        sidebarEl.classList.add('active')
        if(overlayEl) overlayEl.classList.add('active')
    }
    function closeSidebar(){
        if(!sidebarEl) return
        sidebarEl.classList.remove('active')
        if(overlayEl) overlayEl.classList.remove('active')
    }
  
    if(toggleBtn) toggleBtn.addEventListener('click', openSidebar)
    if(closeBtn) closeBtn.addEventListener('click', closeSidebar)
    if(overlayEl) overlayEl.addEventListener('click', closeSidebar)
  
    // close with Escape key
    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape') closeSidebar()
    })
});

/* ==================== User Tour / Stepper ==================== */
const tourSteps = [
  {
    title: 'Buscar cámaras',
    body: 'Usa la barra de búsqueda para buscar direcciones o nombres de cámaras. La búsqueda es difusa y funciona con errores tipográficos.'
  },
  {
    title: 'Filtros',
    body: 'Activa los filtros de Velocidad, Luz roja o Cruce para mostrar sólo ciertos tipos de cámaras. Si no hay filtros activados, se muestran todas.'
  },
  {
    title: 'Mapa y marcadores',
    body: 'Interactúa con el mapa: haz zoom, arrastra y pulsa en los marcadores para ver más información y enlaces a Google Maps.'
  },
  {
    title: 'Clusterización',
    body: 'Cuando hay muchas cámaras cercanas se agrupan en clusters. Haz zoom para expandirlos y ver cada cámara individual.'
  },
  {
    title: 'Mi ubicación',
    body: 'Pulsa el botón 📍 para centrar el mapa en tu ubicación (si otorgas permiso al navegador).'
  },
  {
    title: 'Instalar como App',
    body: 'Puedes instalar esta web como una app en tu dispositivo (Add to Home). Para mejor soporte, asegúrate de usar el icono que se añadió al manifest.'
  }
];

function buildTour(){
  const overlay = document.getElementById('tourOverlay');
  const content = document.getElementById('tourContent');
  const dots = document.getElementById('tourDots');
  content.innerHTML = '';
  dots.innerHTML = '';
  tourSteps.forEach((s, idx) => {
    const step = document.createElement('div');
    step.className = 'tour-step';
    step.id = 'tour-step-' + idx;
    step.innerHTML = `<h4>${s.title}</h4><p>${s.body}</p>`;
    content.appendChild(step);

    const d = document.createElement('div');
    d.className = 'dot';
    d.dataset.idx = idx;
    dots.appendChild(d);
  });
}

let tourIndex = 0;
function showTour(idx=0){
  buildTour();
  tourIndex = idx;
  const overlay = document.getElementById('tourOverlay');
  overlay.setAttribute('aria-hidden','false');
  updateTour();
}
function hideTour(){
  const overlay = document.getElementById('tourOverlay');
  overlay.setAttribute('aria-hidden','true');
}
function updateTour(){
  tourSteps.forEach((_,i)=>{
    const el = document.getElementById('tour-step-'+i);
    if(el) el.classList.toggle('active', i===tourIndex);
    const dot = document.querySelector(`#tourDots .dot[data-idx='${i}']`);
    if(dot) dot.classList.toggle('active', i===tourIndex);
  });
  document.getElementById('tourPrev').disabled = (tourIndex===0);
  document.getElementById('tourNext').textContent = (tourIndex===tourSteps.length-1)?'Finalizar':'Siguiente';
}

document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'btnTour'){
    showTour(0);
  }
});

document.addEventListener('DOMContentLoaded', ()=>{
  // wire tour controls
  const prev = document.getElementById('tourPrev');
  const next = document.getElementById('tourNext');
  const skip = document.getElementById('tourSkip');
  const done = document.getElementById('tourDone');
  const overlay = document.getElementById('tourOverlay');

  if(prev) prev.addEventListener('click', ()=>{ if(tourIndex>0){ tourIndex--; updateTour(); } });
  if(next) next.addEventListener('click', ()=>{ if(tourIndex < tourSteps.length-1){ tourIndex++; updateTour(); } else { localStorage.setItem('fotomultas_tour_seen','1'); hideTour(); } });
  if(skip) skip.addEventListener('click', ()=>{ localStorage.setItem('fotomultas_tour_seen','1'); hideTour(); });
  if(done) done.addEventListener('click', ()=>{ localStorage.setItem('fotomultas_tour_seen','1'); hideTour(); });
  if(overlay) overlay.addEventListener('click', (ev)=>{ if(ev.target===overlay){ localStorage.setItem('fotomultas_tour_seen','1'); hideTour(); } });

  // show tour automatically for first-time users
  try{
    const seen = localStorage.getItem('fotomultas_tour_seen');
    if(!seen){
      // small timeout so UI is ready
      setTimeout(()=> showTour(0), 700);
    }
  }catch(e){ /* ignore storage errors */ }
});

/* ==================== End tour ==================== */

async function cargarCamaras(){
  try{
    const res = await fetch('./data/camaras.json');
    const data = await res.json();
    // Normalizar y filtrar registros válidos
    return data
      .map(c => ({
        // varios datasets pueden usar distintos nombres; normalizamos
        nombre: c.nombre || c.name || '',
        tipo: (c.tipo || c.tipo_de_infracci_n || c.tipo_de_infracción || '').toString(),
        direccion: c.direccion || c.description || '',
        latitud: c.latitud || (c.point && c.point.coordinates && c.point.coordinates[1]) || '',
        longitud: c.longitud || (c.point && c.point.coordinates && c.point.coordinates[0]) || ''
      }))
      .filter(c => c.latitud && c.longitud && !isNaN(parseFloat(c.latitud)) && !isNaN(parseFloat(c.longitud)));
  }catch(e){
    console.error('Error cargando cámaras', e);
    return [];
  }
}

function initMap(){
  map = L.map('map', {zoomControl:true}).setView(mapConfig.center, mapConfig.zoom);
  L.tileLayer(mapConfig.tileUrl, {attribution: mapConfig.tileAttribution, maxZoom: 19}).addTo(map);
  markersCluster = L.markerClusterGroup();
  map.addLayer(markersCluster);
}

function getIconoPorTipo(tipo){
  tipo = (tipo||'').toUpperCase();
  if(tipo.includes('VELOCIDAD')) return './assets/icons/camera-speed.svg';
  if(tipo.includes('LUZ')) return './assets/icons/camera-light.svg';
  if(tipo.includes('CRUCE')) return './assets/icons/camera-block.svg';
  return './assets/icons/camera-speed.svg';
}

function renderMarkers(list){
  markersCluster.clearLayers();
  list.forEach((cam, idx) => {
    const lat = parseFloat(cam.latitud), lng = parseFloat(cam.longitud);
    if(isNaN(lat) || isNaN(lng)) return;

    const iconUrl = getIconoPorTipo(cam.tipo || '');
    const icon = L.icon({
      iconUrl,
      iconSize: [36,36],
      className: 'camera-marker'
    });

    const marker = L.marker([lat,lng], {icon});

    const popupHtml = `
      <div class="popup-custom">
        <div class="popup-header">
          <img src="${iconUrl}" alt="icon" width="28" height="28" />
          <span class="badge">${cam.tipo || 'CAMARA'}</span>
        </div>
        <div class="popup-body">
          <h4>${cam.nombre || cam.name || 'Cámara'}</h4>
          <p class="address">${cam.direccion || cam.description || ''}</p>
          <a class="btn-directions" href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">📍 Ver en Google Maps</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {closeButton:true});
    marker.on('add', () => {
      // animación cuando el icono se añade
      try{
        const el = marker._icon;
        if(el){
          gsap.fromTo(el, {scale:0, opacity:0}, {scale:1, opacity:1, duration:0.45, ease:'back.out(1.8)', delay: idx*0.01});
        }
      }catch(e){/* ignore */}
    });

    markersCluster.addLayer(marker);
  });
}

function renderLista(list){
  cameraListEl.innerHTML = '';
  list.forEach((cam, idx) => {
    const el = document.createElement('div');
    el.className = 'item panel';
    el.innerHTML = `
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px">
          <strong>${cam.nombre || cam.name}</strong>
          <div class="meta">${cam.tipo || ''}</div>
        </div>
        <div class="meta">${cam.direccion || ''}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      const lat = parseFloat(cam.latitud), lng = parseFloat(cam.longitud);
      map.setView([lat,lng], 17, {animate:true});
      // abrir popup correspondiente: buscar marker en cluster
      markersCluster.eachLayer(layer => {
        if(layer.getLatLng && layer.getLatLng().lat === lat && layer.getLatLng().lng === lng){
          layer.openPopup();
        }
      });
    });
    cameraListEl.appendChild(el);
  });
}

async function initFuse(list){
  const options = {keys:['nombre','direccion','tipo','name','description'], threshold:0.35};
  try{
    // Si Fuse no está disponible globalmente, cargamos la versión UMD desde CDN
    if(typeof Fuse === 'undefined' && typeof window !== 'undefined'){
      // Try primary CDN (jsDelivr), then unpkg as fallback
      const cdns = [
        'https://cdn.jsdelivr.net/npm/fuse.js@7.6.0/dist/fuse.min.js',
        'https://unpkg.com/fuse.js@7.6.0/dist/fuse.min.js'
      ];
      let loaded = false;
      for(const url of cdns){
        try{
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Error loading ' + url));
            document.head.appendChild(s);
          });
          loaded = true;
          break;
        }catch(err){
          console.warn(err);
        }
      }
      if(!loaded){
        console.warn('Fuse.js could not be loaded from CDNs');
      }
    }

    if(typeof Fuse === 'undefined'){
      // Provide a tiny fallback: simple substring search (case-insensitive) so search still works
      console.warn('Fuse not available after attempts; using simple substring fallback search');
      fuse = null;
      return;
    }

    fuse = new Fuse(list, options);
  }catch(e){
    console.warn('Fuse init error', e);
    fuse = null;
  }
}

// Debounce helper
function debounce(fn, wait=300){
  let t;
  return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn.apply(this,args),wait)};
}

// Simple substring search fallback when Fuse.js is not available
function simpleSearch(list, q){
  const qq = q.toLowerCase();
  return list.filter(item => {
    return (item.nombre || item.name || '').toString().toLowerCase().includes(qq)
      || (item.direccion || item.description || '').toString().toLowerCase().includes(qq)
      || (item.tipo || '').toString().toLowerCase().includes(qq);
  });
}

function applyFilters(){
  const q = searchInput.value.trim();
  let results = camaras;
  
  // Apply search
  if(q){
    if(fuse) results = fuse.search(q).map(r=>r.item);
    else results = simpleSearch(camaras, q);
  }
  
  // Apply type filters
  const activeTypes = Array.from(document.querySelectorAll('.filters input:checked')).map(i=>i.dataset.type);
  if(activeTypes.length > 0){
    results = results.filter(c => activeTypes.some(t => (c.tipo||'').toUpperCase().includes(t)));
  }
  
  renderMarkers(results);
  renderLista(results);
}

function attachUI(){
  searchInput.addEventListener('input', debounce(applyFilters, 250));
  
  // filtros
  document.querySelectorAll('.filters input').forEach(cb=>cb.addEventListener('change', applyFilters));

  document.getElementById('btnMiUbicacion').addEventListener('click', ()=>{
    if(!navigator.geolocation){
      mostrarNotificacion('Tu navegador no soporta geolocalización','error');
      return;
    }
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude, longitude} = pos.coords;
      map.setView([latitude, longitude], 15);
      L.marker([latitude, longitude], {
        icon: L.divIcon({className:'user-marker', html:'<div class="pulse"></div>', iconSize:[20,20]})
      }).addTo(map);
    }, err => mostrarNotificacion('No pudimos obtener tu ubicación','error'));
  });

  // theme toggle
  document.getElementById('btnTheme').addEventListener('click', ()=>{
    document.documentElement.classList.toggle('light');
    // simple toggle visual (could be extended)
  });
}

function animateCounter(total){
  gsap.to(counterEl, {
    innerText: total,
    duration: 1.8,
    snap:{innerText:1},
    onUpdate: function(){ counterEl.textContent = Math.ceil(this.targets()[0].innerText); }
  });
}

function mostrarNotificacion(mensaje, tipo='info'){
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  Object.assign(toast.style, {position:'fixed',right:'18px',bottom:'18px',padding:'10px 14px',borderRadius:'8px',background:'rgba(0,0,0,0.6)',color:'#fff',zIndex:9999});
  document.body.appendChild(toast);
  gsap.fromTo(toast, {x:200,opacity:0},{x:0,opacity:1,duration:0.4});
  setTimeout(()=>{gsap.to(toast,{x:200,opacity:0,duration:0.3,onComplete:()=>toast.remove()})},3000);
}
