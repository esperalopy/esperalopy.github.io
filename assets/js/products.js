// assets/js/products.js
// Catálogo con búsqueda/filtro y CTA por WhatsApp.
// Estados soportados:
// - disponible === false  => "Agotado / Avísame" (botón ámbar)
// - reservado === true    => "Reservado / Consultar" (badge rojo + tarjeta atenuada)
// - estado: "Reservado"   => igual que reservado === true
// - cualquier otro        => "WhatsApp" (botón verde)

(async function () {
  const TEL = '595994252213';                // tu número sin + ni 0
  const URL_JSON = 'assets/products.json';   // fuente del catálogo

  // Elementos del DOM
  const $grid    = document.getElementById('gridProductos');
  const $tpl     = document.getElementById('tplProducto');
  const $buscar  = document.getElementById('buscar');
  const $filtro  = document.getElementById('filtroCategoria');
  const $limpiar = document.getElementById('btnLimpiar');

  // Formateador a guaraníes
  const fmtPYG = new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'PYG', maximumFractionDigits: 0
  });

  // Placeholder SVG si falta imagen
  const IMG_FALLBACK =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
         <defs>
           <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
             <stop offset="0" stop-color="#0d1b2a"/>
             <stop offset="1" stop-color="#132238"/>
           </linearGradient>
         </defs>
         <rect width="600" height="600" fill="url(#g)"/>
         <text x="50%" y="50%" dy=".35em" text-anchor="middle"
               fill="#94a3b8" font-family="sans-serif" font-size="22">
           Sin imagen
         </text>
       </svg>`
    );

  // Cargar catálogo
  let productos = [];
  try {
    const resp = await fetch(URL_JSON, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No se pudo cargar assets/products.json');
    productos = await resp.json();
    if (!Array.isArray(productos)) throw new Error('El JSON debe ser un array de productos');
  } catch (err) {
    console.error(err);
    if ($grid) {
      $grid.innerHTML = `<p style="opacity:.85">No pudimos cargar el catálogo. Verificá <code>assets/products.json</code>.</p>`;
    }
    return;
  }

  // Asegurar template (si falta, crear uno mínimo)
  function ensureTemplate() {
    if ($tpl) return $tpl;
    const t = document.createElement('template');
    t.id = 'tplProducto';
    t.innerHTML = `
      <article class="card" style="background:#0b1220; border:1px solid rgba(255,255,255,.1); border-radius:16px; overflow:hidden; display:flex; flex-direction:column;">
        <div style="position:relative; aspect-ratio:1/1; background:#0d1b2a;">
          <img alt="" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
          <span class="badge" style="position:absolute; top:10px; left:10px; background:#1d4ed8; color:#fff; padding:4px 8px; border-radius:999px; font-size:12px;"></span>
        </div>
        <div style="padding:12px 14px; display:flex; flex-direction:column; gap:6px;">
          <h3 style="font-size:16px; margin:0; line-height:1.2;"></h3>
          <p class="desc" style="opacity:.8; font-size:14px; margin:0; min-height:38px;"></p>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
            <strong class="precio" style="font-size:18px;"></strong>
            <a class="btnWp" target="_blank" rel="noopener"
               style="text-decoration:none; padding:8px 10px; border-radius:10px; background:#22c55e; color:#0b1220; font-weight:600;">
              WhatsApp
            </a>
          </div>
        </div>
      </article>
    `;
    document.body.appendChild(t);
    return t;
  }

  // Render de tarjetas
  function render(lista) {
    if (!$grid) return;
    const tpl = ensureTemplate();

    $grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    lista.forEach(p => {
      const node = tpl.content.cloneNode(true);

      // Referencias
      const article = node.querySelector('article') || node.firstElementChild;
      const img = node.querySelector('img');
      const $badge = node.querySelector('.badge');
      const $title = node.querySelector('h3');
      const $desc = node.querySelector('.desc');
      const $precio = node.querySelector('.precio');
      const $cta = node.querySelector('.btnWp');

      // Imagen
      img.src = p.imagen || IMG_FALLBACK;
      img.alt = p.nombre || 'Producto';

      // Estado "Reservado"
      const isReservado = p.reservado === true || (typeof p.estado === 'string' && p.estado.trim().toLowerCase() === 'reservado');

      // Badge
      if (isReservado) {
        $badge.textContent = 'Reservado';
        $badge.style.background = '#ef4444'; // rojo
        $badge.style.color = '#fff';
      } else if (p.estado) {
        $badge.textContent = p.estado;
        $badge.style.background = '#1d4ed8'; // azul por defecto
        $badge.style.color = '#fff';
      } else {
        $badge.style.display = 'none';
      }

      // Título, descripción, precio
      $title.textContent = p.nombre || 'Producto sin nombre';
      $desc.textContent = p.descripcion || '';
      const precioNum = typeof p.precio === 'number' ? p.precio : 0;
      $precio.textContent = fmtPYG.format(precioNum);

      // Mensajes para WhatsApp
      const base = `Hola Esperalopy! Me interesa este producto:\n${p.nombre || ''} – ${fmtPYG.format(precioNum)} (ID: ${p.id || 's/id'}).\n`;
      const textoDisponible   = encodeURIComponent(base + '¿Sigue disponible?');
      const textoReservado    = encodeURIComponent(base + 'Veo que está reservado. ¿Puedo confirmar si se libera o dejar mis datos?');
      const textoNoDisponible = encodeURIComponent(base + 'Está agotado. Por favor, avísenme cuando llegue nuevamente 🙏');

      // Apariencia y CTA según estado
      if (p.disponible === false) {
        // AGOTADO
        article.style.opacity = '0.92';
        $cta.textContent = 'Agotado / Avísame';
        $cta.href = `https://wa.me/${TEL}?text=${textoNoDisponible}`;
        $cta.style.background = '#f59e0b'; // ámbar
        $cta.style.color = '#0b1220';
        $cta.title = 'Producto agotado: tocá para avisarte cuando llegue';
      } else if (isReservado) {
        // RESERVADO
        article.style.opacity = '0.9';
        $cta.textContent = 'Reservado / Consultar';
        $cta.href = `https://wa.me/${TEL}?text=${textoReservado}`;
        $cta.style.background = '#ef4444'; // rojo
        $cta.style.color = '#fff';
        $cta.title = 'Producto reservado: consultá por disponibilidad';
      } else {
        // DISPONIBLE
        article.style.opacity = '1';
        $cta.textContent = 'WhatsApp';
        $cta.href = `https://wa.me/${TEL}?text=${textoDisponible}`;
        $cta.style.background = '#22c55e'; // verde
        $cta.style.color = '#0b1220';
        $cta.title = 'Consultar por WhatsApp';
      }

      frag.appendChild(node);
    });

    $grid.appendChild(frag);

    if (!lista.length) {
      $grid.innerHTML = `<p style="opacity:.85;margin:.5rem 0">No se encontraron productos con ese filtro.</p>`;
    }
  }

  // Filtros
  function aplicarFiltros() {
    const q = ($buscar?.value || '').toLowerCase().trim();
    const cat = $filtro?.value || '';
    const filtrados = productos.filter(p => {
      const texto = `${p.nombre || ''} ${p.descripcion || ''}`.toLowerCase();
      const okTexto = !q || texto.includes(q);
      const okCat = !cat || (p.categoria === cat);
      return okTexto && okCat;
    });
    render(filtrados);
  }

  // Eventos
  $buscar?.addEventListener('input', aplicarFiltros);
  $filtro?.addEventListener('change', aplicarFiltros);
  $limpiar?.addEventListener('click', () => {
    if ($buscar) $buscar.value = '';
    if ($filtro) $filtro.value = '';
    render(productos);
  });

  // Inicial
  render(productos);
})();
