// assets/js/products.js
(async function () {
  const urlJSON = 'assets/products.json';
  const $grid = document.getElementById('gridProductos');
  const $tpl = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');

  // Formateador a guaraníes
  const fmtPYG = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0
  });

  let productos = [];
  try {
    const resp = await fetch(urlJSON, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No se pudo cargar products.json');
    productos = await resp.json();
  } catch (err) {
    console.error(err);
    if ($grid) {
      $grid.innerHTML = '<p style="opacity:.8">No pudimos cargar los productos. Verifica la ruta de <code>assets/products.json</code>.</p>';
    }
    return;
  }

  function render(lista) {
    if (!$grid || !$tpl) return;
    $grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    lista.forEach(p => {
      const node = $tpl.content.cloneNode(true);

      // Imagen, textos y precio
      const img = node.querySelector('img');
      img.src = p.imagen;
      img.alt = p.nombre;

      node.querySelector('.badge').textContent = p.estado || '';
      node.querySelector('h3').textContent = p.nombre;
      node.querySelector('.desc').textContent = p.descripcion || '';
      node.querySelector('.precio').textContent = fmtPYG.format(p.precio);

      // Link de WhatsApp con tu número
      const texto = encodeURIComponent(
        `Hola Esperalopy! Me interesa este producto:\n${p.nombre} – ${fmtPYG.format(p.precio)} (ID: ${p.id}).\n¿Sigue disponible?`
      );
      const tel = '595994252213'; // ← tu número (sin + y sin ceros delante)
      const a = node.querySelector('.btnWp');
      a.href = `https://wa.me/${tel}?text=${texto}`;

      if (p.disponible === false) {
        a.textContent = 'Agotado / Consultar';
        a.style.opacity = 0.7;
      }

      frag.appendChild(node);
    });

    $grid.appendChild(frag);
  }

  function aplicarFiltros() {
    const q = ($buscar?.value || '').toLowerCase().trim();
    const cat = $filtro?.value || '';

    const filtrados = productos.filter(p => {
      const okTexto = !q || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(q);
      const okCat = !cat || p.categoria === cat;
      return okTexto && okCat;
    });

    render(filtrados);
  }

  // Eventos
  $buscar?.addEventListener('input', aplicarFiltros);
  $filtro?.addEventListener('change', aplicarFiltros);

  // Primera renderización
  render(productos);
})();
