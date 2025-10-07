// assets/js/products.js
// Carga el JSON con rompe-caché y siempre puede mostrar TODO con un botón.
// Si algo falla, te lo avisa arriba de la grilla.
(async function () {
  const TEL = '595994252213';
  const urlJSON = 'assets/products.json?v=' + Date.now(); // rompe caché

  const $grid   = document.getElementById('gridProductos');
  const $tpl    = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');

  if (!$grid) return;

  // Aviso helper
  const showMsg = (text) => {
    const p = document.createElement('p');
    p.style.opacity = '0.85';
    p.style.margin = '8px 0';
    p.textContent = text;
    $grid.appendChild(p);
  };

  // Asegura layout de grilla aunque estilos no carguen
  $grid.style.display = 'grid';
  $grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(220px,1fr))';
  $grid.style.gap = '16px';

  const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

  function linkWhatsApp(nombre, precioFmt, id) {
    const texto = encodeURIComponent(`Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`);
    return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
  }

  function render(lista) {
    $grid.innerHTML = '';
    if (!lista || !lista.length) {
      showMsg('No hay productos con esos filtros.');
      return;
    }
    const frag = document.createDocumentFragment();
    lista.forEach(p => {
      const card = $tpl ? $tpl.content.cloneNode(true) : (() => {
        // card de emergencia si falta el <template>
        const art = document.createElement('article');
        art.style.cssText = 'background:#0b1220;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;';
        art.innerHTML = `
          <div style="position:relative;aspect-ratio:1/1;background:#0d1b2a;">
            <img alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
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
        return tpl.content.cloneNode(true);
      })();

      const img = card.querySelector('img');
      img.src = p.imagen; img.alt = p.nombre; img.loading = 'lazy';
      img.onerror = () => { img.style.objectFit = 'contain'; img.style.opacity = '0.85'; };

      card.querySelector('.badge').textContent = p.estado || '';
      card.querySelector('h3').textContent    = p.nombre || 'Producto';
      card.querySelector('.desc').textContent = p.descripcion || '';
      const precioFmt = fmtPYG.format(Number(p.precio || 0));
      card.querySelector('.precio').textContent = precioFmt;

      const a = card.querySelector('.btnWp');
      a.href = linkWhatsApp(p.nombre, precioFmt, p.id || '');
      if (p.disponible === false) { a.textContent = 'Agotado / Consultar'; a.style.opacity = 0.7; }

      frag.appendChild(card);
    });
    $grid.appendChild(frag);
  }

  let productos = [];

  // Botón "Mostrar todo" por si el usuario se pierde
  const addShowAll = () => {
    if (!$filtro?.parentElement) return;
    if ($filtro.parentElement.querySelector('.btnShowAll')) return;
    const btn = document.createElement('button');
    btn.className = 'btnShowAll';
    btn.textContent = 'Limpiar filtros';
    btn.type = 'button';
    btn.style.cssText = 'margin-left:8px;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#0f172a;color:#fff;cursor:pointer;';
    btn.onclick = () => { if ($buscar) $buscar.value = ''; if ($filtro) $filtro.value = ''; render(productos); };
    $filtro.parentElement.appendChild(btn);
  };

  try {
    $grid.innerHTML = '<p style="opacity:.85">Cargando catálogo…</p>';
    const r = await fetch(urlJSON, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('El JSON debe ser un array []');
    productos = data;
    addShowAll();
    // Primera vista SIEMPRE: todo
    if ($buscar) $buscar.value = '';
    if ($filtro) $filtro.value = '';
    render(productos);
  } catch (err) {
    console.error('[catalogo] Error leyendo products.json:', err);
    $grid.innerHTML = '';
    showMsg('⚠️ No pudimos cargar los productos. Revisá assets/products.json.');
    return;
  }

  function aplicarFiltros() {
    const q   = ($buscar?.value || '').toLowerCase().trim();
    const cat = $filtro?.value || ''; // "" = Todas
    // Siempre filtramos sobre la lista completa
    const filtrados = productos.filter(p => {
      const texto = `${p.nombre ?? ''} ${p.descripcion ?? ''}`.toLowerCase();
      const okTexto = !q || texto.includes(q);
      const okCat   = !cat || p.categoria === cat;
      return okTexto && okCat;
    });
    render(filtrados);
  }

  $buscar?.addEventListener('input', aplicarFiltros);
  $filtro?.addEventListener('change', () => {
    // Cuando cambia categoría, limpiamos buscador para evitar “filtros fantasmas”
    if ($buscar) $buscar.value = '';
    aplicarFiltros();
  });
})();
