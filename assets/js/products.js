// assets/js/products.js
// Catálogo dinámico para Esperalopy: carga JSON, renderiza tarjetas y arma WhatsApp por producto.
(async function () {
  // Ruta al “mini-backend” (tu base de datos JSON)
  const URL_JSON = 'assets/products.json';

  // Número de WhatsApp (formato internacional, sin + y sin ceros delante)
  const TEL = '595994252213';

  // Selectores del DOM
  const $grid = document.getElementById('gridProductos');
  const $tpl = document.getElementById('tplProducto');
  const $buscar = document.getElementById('buscar');
  const $filtro = document.getElementById('filtroCategoria');

  if (!$grid || !$tpl) {
    // Si aún no pegaste la sección #productos en index.html, salimos sin romper nada.
    return;
  }

  // Formateador de precio a PYG (guaraníes)
  const fmtPYG = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0
  });

  // Utilidad: armar link robusto de WhatsApp (evita 404)
  function linkWhatsApp(nombre, precioFmt, id) {
    const texto = encodeURIComponent(
      `Hola Esperalopy! Me interesa este producto:\n${nombre} – ${precioFmt} (ID: ${id}).\n¿Sigue disponible?`
    );
    // Usamos la API clásica que funciona en más dispositivos/navegadores
    return `https://api.whatsapp.com/send?phone=${TEL}&text=${texto}`;
  }

  // Cargar datos
  let productos = [];
  try {
    const resp = await fetch(URL_JSON, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No se pudo cargar assets/products.json');
    productos = await resp.json();
    if (!Array.isArray(productos)) throw new Error('El JSON no es un array');
  } catch (err) {
    console.error(err);
    $grid.innerHTML =
      '<p style="opacity:.8">No pudimos cargar los productos. Verificá que exista <code>assets/products.json</code> y que el JSON sea válido.</p>';
    return;
  }

  // Renderizar tarjetas
  function render(lista) {
    $grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    lista.forEach(p => {
      const node = $tpl.content.cloneNode(true);

      // Imagen
      const img = node.querySelector('img');
      img.src = p.imagen;
      img.alt = p.nombre;
      img.loading = 'lazy';
      img.onerror = () => {
        // Si la imagen no existe, evitamos ver un “rompido”
        img.style.opacity = 0.85;
        img.style.objectFit = 'contain';
      };

      // Textos
      node.querySelector('.badge').textContent = p.estado || '';
      node.querySelector('h3').textContent = p.nombre || 'Producto';
      node.querySelector('.desc').textContent = p.descripcion || '';

      // Precio
      const precioFmt = fmtPYG.format(Number(p.precio || 0));
      node.querySelector('.precio').textContent = precioFmt;

      // WhatsApp
      const a = node.querySelector('.btnWp');
      a.href = linkWhatsApp(p.nombre, precioFmt, p.id || '');
      a.target = '_blank';
      a.rel = 'noopener';

      // Estado
      if (p.disponible === false) {
        a.textContent = 'Agotado / Consultar';
        a.style.opacity = 0.7;
      }

      frag.appendChild(node);
    });

    $grid.appendChild(frag);
  }

  // Filtros y búsqueda
  function aplicarFiltros() {
    const q = ($buscar?.value || '').toLowerCase().trim();
    const cat = $filtro?.value || '';

    const filtrados = productos.filter(p => {
      const texto = `${p.nombre ?? ''} ${p.descripcion ?? ''}`.toLowerCase();
      const okTexto = !q || texto.includes(q);
      const okCat = !cat || (p.categoria === cat);
      return okTexto && okCat;
    });

    render(filtrados);
  }

  // Eventos
  $buscar?.addEventListener('input', aplicarFiltros);
  $filtro?.addEventListener('change', aplicarFiltros);

  // Primera carga
  render(productos);
})();
