// assets/js/products.js
// Muestra productos SIEMPRE: primero embebidos (instantáneo) y luego
// intenta cargar assets/products.json (rompe caché). Si sale bien, reemplaza.
// Búsqueda y filtro por categoría incluidos.

(function () {
  const TEL = '595994252213';
  const URL_JSON = 'assets/products.json?v=' + Date.now();

  const $grid   = document.getElementById('gridProductos');
  const $tpl    = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');
  const $btnClr = document.getElementById('btnLimpiar');
  if (!$grid) return;

  // Layout base
  $grid.style.display = 'grid';
  $grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(220px,1fr))';
  $grid.style.gap = '16px';

  const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

  // Catálogo embebido (incluye el JBL)
  let base = [
    {
      "id": "jbl-510bt-negro",
      "nombre": "Auriculares JBL inalámbricos",
      "descripcion": "Sonido JBL Pure Bass. Plegables y cómodos, hasta 40 h de batería.",
      "precio": 100000,
      "moneda": "PYG",
      "categoria": "Audio",
      "imagen": "assets/img/productos/auriculares-jbl-510bt.webp",
      "estado": "Usado • Muy bueno",
      "disponible": true
    },
    {
      "id": "demo-notebook-basic",
      "nombre": "Notebook usada – buena",
      "descripcion": "Equipo listo para estudio/trabajo. Revisión básica hecha.",
      "precio": 2200000,
      "moneda": "PYG",
      "categoria": "Computación",
      "imagen": "assets/feature1.png",
      "estado": "Usado • Bueno",
      "disponible": true
    },
    {
      "id": "demo-android",
      "nombre": "Smartphone – liberado",
      "descripcion": "Pantalla nítida, batería OK. Incluye cargador.",
      "precio": 950000,
      "moneda": "PYG",
      "categoria": "Telefonía",
      "imagen": "assets/feature2.png",
      "estado": "Usado • Muy bueno",
      "disponible": true
    },
    {
      "id": "demo-parlante",
      "nombre": "Parlante portátil",
      "descripcion": "Sonido potente, tamaño compacto.",
      "precio": 320000,
      "moneda": "PYG",
      "categoria": "Audio",
      "imagen": "assets/feature3.png",
      "estado": "Seminuevo",
      "disponible": false
    }
  ];

  function linkWhatsApp(nombre, precioFmt, id) {
    const texto = encodeURIComponent(`Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`);
    return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
  }

  function render(lista) {
    $grid.innerHTML = '';
    if (!lista.length) {
      const p = document.createElement('p');
      p.style.opacity = '0.85';
      p.textContent = 'No hay productos con esos filtros.';
      $grid.appendChild(p);
      return;
    }
    const frag = document.createDocumentFragment();

    lista.forEach(p => {
      let node;
      if ($tpl) {
        node = $tpl.content.cloneNode(true);
      } else {
        // tarjeta de emergencia si no hay <template>
        const art = document.createElement('article');
        art.style.cssText = 'background:#0b1220;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;';
        art.innerHTML = `
          <div style="position:relative;aspect-ratio:1/1;background:#0d1b2a;">
            <img alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">
            <span class="badge" style="position:absolute;top:10px;left:10px;background:#1d4ed8;color:#fff;padding:4px 8px;border-radius:999px;font-size:12px;"></span>
          </div>
          <div style="padding:12px 14px;display:flex;flex-direction:column;gap:6px;">
            <h3 style="font-size:16px;margin:0;line-height:1.2;"></h3>
            <p class="desc" style="opacity:.8;font-size:14px;margin:0;min-height:38px;"></p>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
              <strong class="precio" style="font-size:18px;"></strong>
              <a class="btnWp" target="_blank" rel="noopener"
                 style="text-decoration:none;padding:8px 10px;border-radius:10px;background:#22c55e;color:#0b1220;font-weight:600;">WhatsApp</a>
            </div>
          </div>`;
        const tpl = document.createElement('template'); tpl.content.appendChild(art);
        node = tpl.content.cloneNode(true);
      }

      const img = node.querySelector('img');
      img.src = p.imagen; img.alt = p.nombre; img.loading = 'lazy';
      img.onerror = () => { img.style.objectFit = 'contain'; img.style.opacity = '0.85'; };

      node.querySelector('.badge').textContent = p.estado || '';
      node.querySelector('h3').textContent    = p.nombre || 'Producto';
      node.querySelector('.desc').textContent = p.descripcion || '';
      const precioFmt = fmtPYG.format(Number(p.precio || 0));
      node.querySelector('.precio').textContent = precioFmt;

      const a = node.querySelector('.btnWp');
      a.href = linkWhatsApp(p.nombre, precioFmt, p.id || '');
      if (p.disponible === false) { a.textContent = 'Agotado / Consultar'; a.style.opacity = 0.7; }

      frag.appendChild(node);
    });
    $grid.appendChild(frag);
  }

  function aplicarFiltros() {
    const q   = ($buscar?.value || '').toLowerCase().trim();
    const cat = $filtro?.value || '';
    const filtrados = base.filter(p => {
      const texto = `${p.nombre ?? ''} ${p.descripcion ?? ''}`.toLowerCase();
      const okTexto = !q || texto.includes(q);
      const okCat   = !cat || p.categoria === cat;
      return okTexto && okCat;
    });
    render(filtrados);
  }

  // Primera vista (embebidos)
  if ($buscar) $buscar.value = '';
  if ($filtro) $filtro.value = '';
  render(base);

  // Listeners
  $buscar?.addEventListener('input', aplicarFiltros);
  $filtro?.addEventListener('change', () => { if ($buscar) $buscar.value = ''; aplicarFiltros(); });
  $btnClr?.addEventListener('click', () => { if ($buscar) $buscar.value = ''; if ($filtro) $filtro.value = ''; render(base); });

  // Intento de carga del JSON real (si existe, reemplaza)
  fetch(URL_JSON, { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
    .then(data => {
      if (!Array.isArray(data)) throw new Error('JSON no es array');
      base = data;
      if ($buscar) $buscar.value = '';
      if ($filtro) $filtro.value = '';
      render(base);
    })
    .catch(err => {
      console.warn('[catalogo] No se pudo leer assets/products.json. Se muestran los embebidos.', err);
    });
})();
