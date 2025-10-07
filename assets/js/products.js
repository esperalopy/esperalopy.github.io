// assets/js/products.js
// Catálogo robusto: intenta fetch del JSON con rompe-caché y si falla usa datos embebidos.
(function () {
  const TEL = '595994252213';
  const URL_JSON = 'assets/products.json?v=' + Date.now(); // rompe-caché siempre

  // Datos embebidos (fallback) — incluyen tu JBL + demos
  const EMBEBIDOS = [
    {
      "id": "jbl-510bt-negro",
      "nombre": "Auriculares JBL inalámbricos",
      "descripcion": "Sonido JBL Pure Bass, diseño plegable y hasta 40 h de reproducción.",
      "precio": 100000,
      "moneda": "PYG",
      "categoria": "Audio",
      "imagen": "assets/img/productos/auriculares-jbl-510bt.webp",
      "estado": "Usado • Muy bueno",
      "disponible": true
    },
    {
      "id": "demo-iph11",
      "nombre": "iPhone 11 64GB (demo)",
      "descripcion": "Equipo de muestra. Libre y en buen estado.",
      "precio": 2150000,
      "moneda": "PYG",
      "categoria": "Telefonía",
      "imagen": "assets/feature2.png",
      "estado": "Usado • Excelente",
      "disponible": true
    },
    {
      "id": "demo-acer-a315",
      "nombre": "Notebook Acer A315 (demo)",
      "descripcion": "i5 • 8GB RAM • 256GB SSD. Ideal estudio.",
      "precio": 2900000,
      "moneda": "PYG",
      "categoria": "Computación",
      "imagen": "assets/feature1.png",
      "estado": "Seminuevo",
      "disponible": true
    },
    {
      "id": "demo-jbl-go3",
      "nombre": "Parlante portátil (demo)",
      "descripcion": "Compacto y potente. Resistente a salpicaduras.",
      "precio": 320000,
      "moneda": "PYG",
      "categoria": "Audio",
      "imagen": "assets/feature3.png",
      "estado": "Nuevo",
      "disponible": false
    },
    {
      "id": "demo-smart-tv",
      "nombre": "Smart TV 43\" (demo)",
      "descripcion": "Full HD, apps principales incluidas.",
      "precio": 2100000,
      "moneda": "PYG",
      "categoria": "Electro",
      "imagen": "assets/hero.png",
      "estado": "Garantía 3 meses",
      "disponible": true
    },
    {
      "id": "demo-notebook-basic",
      "nombre": "Notebook básica (demo)",
      "descripcion": "4GB RAM • 128GB SSD • Para navegar y ofimática.",
      "precio": 1450000,
      "moneda": "PYG",
      "categoria": "Computación",
      "imagen": "assets/feature1.png",
      "estado": "Usado • Bueno",
      "disponible": true
    },
    {
      "id": "demo-auris",
      "nombre": "Auriculares inalámbricos (demo)",
      "descripcion": "Buena batería y estuche de carga.",
      "precio": 185000,
      "moneda": "PYG",
      "categoria": "Audio",
      "imagen": "assets/feature3.png",
      "estado": "Seminuevo",
      "disponible": true
    },
    {
      "id": "demo-android",
      "nombre": "Smartphone Android (demo)",
      "descripcion": "64GB • Cámara doble • Libre.",
      "precio": 780000,
      "moneda": "PYG",
      "categoria": "Telefonía",
      "imagen": "assets/feature2.png",
      "estado": "Usado • Muy bueno",
      "disponible": true
    },
    {
      "id": "demo-microondas",
      "nombre": "Microondas 20L (demo)",
      "descripcion": "Funciona perfecto. Limpio y probado.",
      "precio": 360000,
      "moneda": "PYG",
      "categoria": "Electro",
      "imagen": "assets/hero.png",
      "estado": "Garantía 30 días",
      "disponible": true
    },
    {
      "id": "demo-reservado",
      "nombre": "Producto reservado (demo)",
      "descripcion": "Ejemplo de artículo no disponible.",
      "precio": 999999,
      "moneda": "PYG",
      "categoria": "Telefonía",
      "imagen": "assets/feature2.png",
      "estado": "Reservado",
      "disponible": false
    }
  ];

  // Esperar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const $grid = document.getElementById('gridProductos');
    const $tpl = document.getElementById('tplProducto');
    const $buscar = document.getElementById('buscar');
    const $filtro = document.getElementById('filtroCategoria');
    if (!$grid) return;

    const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

    function linkWhatsApp(nombre, precioFmt, id) {
      const texto = encodeURIComponent(`Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`);
      return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
    }

    function pintar(lista, aviso='') {
      const frag = document.createDocumentFragment();
      if (aviso) {
        const p = document.createElement('p');
        p.style.opacity = '0.85';
        p.style.margin = '8px 0 12px';
        p.textContent = aviso;
        frag.appendChild(p);
      }
      if (!lista.length) {
        const p = document.createElement('p');
        p.style.opacity = '0.85';
        p.textContent = 'No hay productos para mostrar.';
        $grid.replaceChildren(p);
        return;
      }

      if (!$tpl) {
        // Generamos cards sin template (por si falta)
        lista.forEach(p => {
          const card = document.createElement('article');
          card.style.cssText = 'background:#0b1220;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;';
          card.innerHTML =
            `<div style="position:relative;aspect-ratio:1/1;background:#0d1b2a;">
               <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">
               <span style="position:absolute;top:10px;left:10px;background:#1d4ed8;color:#fff;padding:4px 8px;border-radius:999px;font-size:12px;">${p.estado ?? ''}</span>
             </div>
             <div style="padding:12px 14px;display:flex;flex-direction:column;gap:6px;">
               <h3 style="font-size:16px;margin:0;line-height:1.2;">${p.nombre ?? 'Producto'}</h3>
               <p style="opacity:.8;font-size:14px;margin:0;min-height:38px;">${p.descripcion ?? ''}</p>
               <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
                 <strong style="font-size:18px;">${fmtPYG.format(Number(p.precio||0))}</strong>
                 <a href="${linkWhatsApp(p.nombre, fmtPYG.format(Number(p.precio||0)), p.id||'')}" target="_blank" rel="noopener"
                    style="text-decoration:none;padding:8px 10px;border-radius:10px;background:#22c55e;color:#0b1220;font-weight:600;">${p.disponible===false?'Agotado / Consultar':'WhatsApp'}</a>
               </div>
             </div>`;
          frag.appendChild(card);
        });
        $grid.style.display = 'grid';
        $grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(220px,1fr))';
        $grid.style.gap = '16px';
        $grid.replaceChildren(frag);
        return;
      }

      // Con template
      lista.forEach(p => {
        const node = $tpl.content.cloneNode(true);
        const img = node.querySelector('img');
        img.src = p.imagen;
        img.alt = p.nombre;
        img.loading = 'lazy';
        img.onerror = () => { img.style.objectFit = 'contain'; img.style.opacity = '0.85'; };

        node.querySelector('.badge').textContent = p.estado || '';
        node.querySelector('h3').textContent = p.nombre || 'Producto';
        node.querySelector('.desc').textContent = p.descripcion || '';
        const precioFmt = fmtPYG.format(Number(p.precio || 0));
        node.querySelector('.precio').textContent = precioFmt;

        const a = node.querySelector('.btnWp');
        a.href = linkWhatsApp(p.nombre, precioFmt, p.id || '');
        a.target = '_blank';
        a.rel = 'noopener';
        if (p.disponible === false) {
          a.textContent = 'Agotado / Consultar';
          a.style.opacity = 0.7;
        }
        frag.appendChild(node);
      });
      $grid.replaceChildren(frag);
    }

    // ---------- Carga con timeout + fallback ----------
    let resuelto = false;
    // Fallback por si tarda mucho el fetch
    const t = setTimeout(() => {
      if (!resuelto) {
        resuelto = true;
        console.warn('[productos] timeout: usando embebidos');
        pintar(EMBEBIDOS, '⚠️ Mostrando productos embebidos (timeout al leer assets/products.json).');
      }
    }, 2500);

    fetch(URL_JSON, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(data => {
        if (resuelto) return; // ya pintamos por timeout
        clearTimeout(t);
        resuelto = true;
        if (!Array.isArray(data)) throw new Error('JSON no es array');
        pintar(data);
      })
      .catch(err => {
        if (resuelto) return;
        clearTimeout(t);
        resuelto = true;
        console.warn('[productos] error fetch, uso embebidos:', err);
        pintar(EMBEBIDOS, '⚠️ Mostrando productos embebidos (no se pudo leer assets/products.json).');
      });

    // Buscador/filtro (se re-aplican al renderizar; con embebidos también funciona)
    const aplicarFiltros = (listaBase) => {
      return () => {
        const q = (document.getElementById('buscar')?.value || '').toLowerCase().trim();
        const cat = (document.getElementById('filtroCategoria')?.value || '');
        const base = listaBase || EMBEBIDOS;
        const filtrados = base.filter(p => {
          const texto = `${p.nombre ?? ''} ${p.descripcion ?? ''}`.toLowerCase();
          const okTexto = !q || texto.includes(q);
          const okCat = !cat || p.categoria === cat;
          return okTexto && okCat;
        });
        pintar(filtrados);
      };
    };
    // listeners básicos (si aún no cargó JSON, filtrará embebidos)
    $buscar?.addEventListener('input', aplicarFiltros());
    $filtro?.addEventListener('change', aplicarFiltros());
  }
})();
