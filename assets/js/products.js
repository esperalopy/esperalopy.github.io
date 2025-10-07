// assets/js/products.js
// Carga products.json (rompe caché), y al cambiar categoría limpia el buscador.
(async function () {
  const TEL = '595994252213';
  const urlJSON = 'assets/products.json?v=' + Date.now(); // evita caché

  const $grid   = document.getElementById('gridProductos');
  const $tpl    = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');

  if (!$grid || !$tpl) return;

  const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

  let productos = [];

  // Cargar JSON
  try {
    const r = await fetch(urlJSON, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('El JSON debe ser un array []');
    productos = data;
  } catch (err) {
    console.error('[catalogo] No se pudo leer products.json:', err);
    $grid.innerHTML = '<p style="opacity:.85">⚠️ No pudimos cargar los productos. Revisá <code>assets/products.json</code>.</p>';
    return;
  }

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
      const node = $tpl.content.cloneNode(true);

      const img = node.querySelector('img');
      img.src = p.imagen; img.alt = p.nombre; img.loading = 'lazy';
      img.onerror = () => { img.style.objectFit = 'contain'; img.style.opacity = '0.85'; };

      node.querySelector('.badge').textContent = p.estado || '';
      node.querySelector('h3').textContent = p.nombre || 'Producto';
      node.querySelector('.desc').textContent = p.descripcion || '';
      const precioFmt = fmtPYG.format(Number(p.precio || 0));
      node.querySelector('.precio').textContent = precioFmt;

      const a = node.querySelector('.btnWp');
      a.href = linkWhatsApp(p.nombre, precioFmt, p.id || '');
      a.target = '_blank'; a.rel = 'noopener';
      if (p.disponible === false) {
        a.textContent = 'Agotado / Consultar';
        a.style.opacity = 0.7;
      }
      frag.appendChild(node);
    });
    $grid.appendChild(frag);
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

  // Eventos
  $buscar?.addEventListener('input', aplicarFiltros);

  // Al cambiar categoría, limpiamos el buscador y mostramos todo lo de esa categoría
  $filtro?.addEventListener('change', () => {
    if ($buscar) $buscar.value = ''; // ← clave para que "Todas" muestre todo
    aplicarFiltros();
  });

  // Primera render: limpiamos buscador y mostramos todo
  if ($buscar) $buscar.value = '';
  if ($filtro) $filtro.value = ''; // “Todas”
  render(productos);
})();
