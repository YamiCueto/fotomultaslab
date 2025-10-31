// script.js - Lógica principal (Vanilla JS)
// Carga cámaras, inicializa mapa, clusters, buscador (Fuse) y animaciones (GSAP).

const mapConfig = {
  center: [10.96854, -74.78132], // Barranquilla
  zoom: 13,
  tileUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  tileAttribution: '&copy; Stadia Maps, &copy; OSM'
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
});

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
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.6.0/dist/fuse.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Error loading Fuse.js'));
        document.head.appendChild(s);
      });
    }

    if(typeof Fuse === 'undefined'){
      console.warn('Fuse not available after dynamic load; search will be disabled');
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

function attachUI(){
  searchInput.addEventListener('input', debounce((e)=>{
    const q = e.target.value.trim();
    let results = camaras;
    if(q && fuse){
      results = fuse.search(q).map(r=>r.item);
    }
    // aplicar filtros: si no hay filtros activos, mostrar todo
    const activeTypes = Array.from(document.querySelectorAll('.filters input:checked')).map(i=>i.dataset.type);
    if(activeTypes.length > 0){
      results = results.filter(c => activeTypes.some(t => (c.tipo||'').toUpperCase().includes(t)));
    }

    renderMarkers(results);
    renderLista(results);
  }, 250));

  // filtros
  document.querySelectorAll('.filters input').forEach(cb=>cb.addEventListener('change', ()=>{
    const q = searchInput.value.trim();
    let results = camaras;
    if(q && fuse) results = fuse.search(q).map(r=>r.item);
    const activeTypes = Array.from(document.querySelectorAll('.filters input:checked')).map(i=>i.dataset.type);
    if(activeTypes.length > 0){
      results = results.filter(c => activeTypes.some(t => (c.tipo||'').toUpperCase().includes(t)));
    }
    renderMarkers(results);
    renderLista(results);
  }));

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
