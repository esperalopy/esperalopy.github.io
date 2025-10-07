// assets/js/products.js
// Versión robusta: pinta tarjetas aunque falte el template o falle el JSON.
(function () {
  const TEL = '595994252213';
  const URL_JSON = 'assets/products.json';

  // Esperar DOM por si el script no se carga con defer
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

    if (!$grid) return; // si no hay sección, salimos

    // Mensaje de carga visible (para saber que el script corre)
    $grid.innerHTML = '<p style="opacity:.85;margin:.5rem 0">Cargando catálogo…</p>';

    const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

    // Datos de respaldo (si falla el fetch)
    const FALLBACK = [
      {
        id: 'jbl-510bt-negro',
        nombre: 'Auriculares JBL inalámbricos',
        descripcion: 'Sonido JBL Pure Bass, diseño plegable y hasta 40 h de reproducción.',
        precio: 100000,
        moneda: 'PYG',
        categoria: 'Audio',
        imagen: 'assets/img/productos/auriculares-jbl-510bt.webp',
        estado: 'Usado • Muy bueno',
        disponible: true
      },
      {
        id: 'demo-iph11',
        nombre: 'iPhone 11 64GB (demo)',
        descripcion: 'Equipo de muestra. Libre y en buen estado.',
        precio: 2150000,
        moneda: 'PYG',
        categoria: 'Telefonía',
        imagen: 'assets/feature2.png',
        estado: 'Usado • Excelente',
        disponible: true
      }
    ];

    // 1) Intentar cargar JSON; si falla, usar FALLBACK
    fetch(URL_JSON, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(data => (Array.isArray(data) ? data : Promise.reject(new Error('JSON no es array'))))
      .catch(err => {
        console.warn('[productos] usando fallback por error:', err);
        // Aviso arriba de la grilla
        const p = document.createElement('p');
        p.style.opacity = '0.85';
        p.textContent = '⚠️ Mostrando productos de prueba (no se pudo leer assets/products.json).';
        $grid.replaceChildren(p);
        return FALLBACK;
      })
      .then(productos => {
        // 2) Render + filtros
        function linkWhatsApp(nombre, precioFmt, id) {
          const texto = encodeURIComponent(`Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`);
          return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
        }

        function render(lista) {
          const frag = document.createDocumentFragment();

          if (lista.length === 0) {
            const p = document.createElement('p');
            p.style.opacity = '0.85';
            p.textContent = 'No hay productos para mostrar.';
            $grid.replaceChildren(p);
            return;
          }

          // Si NO hay template, generamos cards a mano
          if (!$tpl) {
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

        function aplicarFiltros() {
          const q = ($buscar?.value || '').toLowerCase().trim();
          const cat = $filtro?.value || '';
          const filtrados = productos.filter(p => {
            const texto = `${p.nombre ?? ''} ${p.descripcion ?? ''}`.toLowerCase();
            const okTexto = !q || texto.includes(q);
            const okCat = !cat || p.categoria === cat;
            return okTexto && okCat;
          });
          render(filtrados);
        }

        $buscar?.addEventListener('input', aplicarFiltros);
        $filtro?.addEventListener('change', aplicarFiltros);
        aplicarFiltros(); // primera render
      });
  }
})();
