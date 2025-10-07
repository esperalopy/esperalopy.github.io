// assets/js/products.js
// Versión de prueba: NO hace fetch. Renderiza una lista demo para verificar que todo el HTML funciona.
(function () {
  const TEL = '595994252213';

  const $grid = document.getElementById('gridProductos');
  const $tpl = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');
  if (!$grid || !$tpl) return;

  const fmtPYG = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 });

  // ======= DEMO LOCAL (sin fetch) =======
  const productos = [
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
    },
    {
      id: 'demo-acer-a315',
      nombre: 'Notebook Acer A315 (demo)',
      descripcion: 'i5 • 8GB RAM • 256GB SSD. Ideal estudio.',
      precio: 2900000,
      moneda: 'PYG',
      categoria: 'Computación',
      imagen: 'assets/feature1.png',
      estado: 'Seminuevo',
      disponible: true
    }
  ];
  // ======================================

  function linkWhatsApp(nombre, precioFmt, id) {
    const texto = encodeURIComponent(`Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`);
    return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
  }

  function render(lista) {
    $grid.innerHTML = '';
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

  // primera carga
  render(productos);
})();
