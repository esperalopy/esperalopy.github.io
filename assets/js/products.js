// assets/js/products.js
// Carga productos desde assets/products.json; si falla, usa fallback local y muestra aviso.
(async function () {
  const URL_JSON = 'assets/products.json';
  const TEL = '595994252213';

  const $grid = document.getElementById('gridProductos');
  const $tpl = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');

  if (!$grid || !$tpl) return;

  const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

  const FALLBACK = [
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
    }
  ];

  function linkWhatsApp(nombre, precioFmt, id) {
    const texto = encodeURIComponent(
      `Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`
    );
    return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
  }

  let productos = [];
  let aviso = '';

  try {
    const resp = await fetch(URL_JSON, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al leer ${URL_JSON}`);
    const data = await resp.json();
    if (!Array.isArray(data)) throw new Error('El JSON debe ser un array [] de productos');
    productos = data;
  } catch (e) {
    console.error('[PRODUCTOS] Fallback por error:', e);
    productos = FALLBACK;
    aviso = '⚠️ Mostrando productos de prueba porque hubo un problema al leer assets/products.json';
  }

  function render(lista) {
    $grid.innerHTML = '';
    if (aviso) {
      const p = document.createElement('p');
      p.style.opacity = '0.85';
      p.style.margin = '8px 0 12px';
      p.textContent = aviso;
      $grid.appendChild(p);
    }
    if (!lista.length) {
      const p = document.createElement('p');
      p.style.opacity = '0.85';
      p.textContent = 'No hay productos para mostrar.';
      $grid.appendChild(p);
      return;
    }

    const frag = document.createDocumentFragment();
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
    $grid.appendChild(frag);
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

  render(productos);
})();
