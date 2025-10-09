// assets/js/products.js
// Catálogo con búsqueda/filtro, ORDENAR, WhatsApp, RESERVAR (localStorage) + TOAST
// + Lazy-load con blur + contador de resultados.

(async function () {
  const TEL = '595994252213';                // tu número sin + ni 0
  const URL_JSON = 'assets/products.json';   // fuente del catálogo

  // Elementos del DOM
  const $grid    = document.getElementById('gridProductos');
  const $tpl     = document.getElementById('tplProducto');
  const $buscar  = document.getElementById('buscar');
  const $filtro  = document.getElementById('filtroCategoria');
  const $ordenar = document.getElementById('ordenar');
  const $limpiar = document.getElementById('btnLimpiar');
  const $toast   = document.getElementById('toast');
  const $count   = document.getElementById('contadorProductos');

  // Toast helper
  let toastTimer = null;
  function showToast(msg) {
    if (!$toast) return;
    $toast.textContent = msg;
    $toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.remove('show'), 2400);
  }

  // Formateador a guaraníes
  const fmtPYG = new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'PYG', maximumFractionDigits: 0
  });

  // Placeholders para lazy-load
  const IMG_PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
        <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0d1b2a"/><stop offset="1" stop-color="#132238"/></linearGradient></defs>
        <rect width="60" height="60" fill="url(#g)"/>
      </svg>`
    );
  const IMG_FALLBACK =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
         <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
           <stop offset="0" stop-color="#0d1b2a"/><stop offset="1" stop-color="#132238"/></linearGradient></defs>
         <rect width="600" height="600" fill="url(#g)"/>
         <text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="22">Sin imagen</text>
       </svg>`
    );

  // Helpers reserva local
  const LS_KEY = 'esperalopy_reservas_v1';
  function leerReservas() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
    catch { return {}; }
  }
  function escribirReservas(map) {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  }

  // Cargar catálogo
  let productos = [];
  try {
    const resp = await fetch(URL_JSON, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No se pudo cargar assets/products.json');
    productos = await resp.json();
    if (!Array.isArray(productos)) throw new Error('El JSON debe ser un array de productos');
  } catch (err) {
    console.error(err);
    if ($grid) $grid.innerHTML = `<p style="opacity:.85">No pudimos cargar el catálogo. Verificá <code>assets/products.json</code>.</p>`;
    if ($count) $count.textContent = '';
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
          <img alt="" loading="lazy" class="lazy-img" style="width:100%; height:100%; object-fit:cover; display:block;">
          <span class="badge" style="position:absolute; top:10px; left:10px; background:#1d4ed8; color:#fff; padding:4px 8px; border-radius:999px; font-size:12px;"></span>
        </div>
        <div style="padding:14px; display:flex; flex-direction:column; gap:8px;">
          <h3 style="font-size:16px; margin:0; line-height:1.2;"></h3>
          <p class="desc" style="opacity:.8; font-size:14px; margin:0; min-height:38px;"></p>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:12px; flex-wrap:wrap;">
            <strong class="precio" style="font-size:18px;"></strong>
            <a class="btnWp" target="_blank" rel="noopener" style="text-decoration:none; padding:10px 12px; border-radius:10px; background:#22c55e; color:#0b1220; font-weight:600; display:inline-block; line-height:1;">WhatsApp</a>
            <button class="btnReservar" style="padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:#1d4ed8; color:#fff; font-weight:600; cursor:pointer; display:inline-block; line-height:1;">Reservar</button>
          </div>
        </div>
      </article>`;
    document.body.appendChild(t);
    return t;
  }

  // INTERSECTION OBSERVER para imágenes (lazy)
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const real = img.getAttribute('data-src');
      if (real) {
        img.onload = () => img.classList.add('lazy-loaded');
        img.onerror = () => { img.src = IMG_FALLBACK; img.classList.add('lazy-loaded'); };
        img.src = real;
      }
      obs.unobserve(img);
    });
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  function lazyWatch(img) {
    try { io.observe(img); } catch { /* noop */ }
  }

  // Render de tarjetas
  function render(lista) {
    if (!$grid) return;
    const tpl = ensureTemplate();
    const reservasLocal = leerReservas();

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
      const $reservar = node.querySelector('.btnReservar');

      // LAZY: placeholder en src y real en data-src
      const realSrc = p.imagen || IMG_FALLBACK;
      img.src = IMG_PLACEHOLDER;
      img.setAttribute('data-src', realSrc);
      img.alt = p.nombre || 'Producto';
      img.classList.remove('lazy-loaded');

      // Estado calculado
      const isReservadoGlobal = p.reservado === true || (typeof p.estado === 'string' && p.estado.trim().toLowerCase() === 'reservado');
      const isReservadoLocal  = reservasLocal[p.id] === true;
      const isReservado = isReservadoGlobal || isReservadoLocal;
      const isAgotado = p.disponible === false;

      // Badge
      if (isReservado) {
        $badge.textContent = 'Reservado';
        $badge.style.background = '#ef4444'; $badge.style.color = '#fff';
      } else if (p.estado && !isAgotado) {
        $badge.textContent = p.estado;
        $badge.style.background = '#1d4ed8'; $badge.style.color = '#fff';
      } else if (isAgotado) {
        $badge.textContent = 'Agotado';
        $badge.style.background = '#f59e0b'; $badge.style.color = '#0b1220';
      } else {
        $badge.style.display = 'none';
      }

      // Texto
      $title.textContent = p.nombre || 'Producto sin nombre';
      $desc.textContent = p.descripcion || '';
      const precioNum = typeof p.precio === 'number' ? p.precio : 0;
      $precio.textContent = fmtPYG.format(precioNum);

      // Mensajes Whatsapp
      const base = `Hola Esperalopy! Me interesa este producto:\n${p.nombre || ''} – ${fmtPYG.format(precioNum)} (ID: ${p.id || 's/id'}).\n`;
      const textoDisponible     = encodeURIComponent(base + '¿Sigue disponible?');
      const textoReservado      = encodeURIComponent(base + 'Veo que está reservado. ¿Puedo confirmar si se libera o dejar mis datos?');
      const textoNoDisponible   = encodeURIComponent(base + 'Está agotado. Por favor, avísenme cuando llegue nuevamente 🙏');
      const textoQuieroReservar = encodeURIComponent(base + 'Quisiera reservarlo, por favor. ¿Cómo seguimos?');

      // Apariencia + CTA según estado
      if (isAgotado) {
        article.style.opacity = '0.92';
        $cta.textContent = 'Agotado / Avísame';
        $cta.href = `https://wa.me/${TEL}?text=${textoNoDisponible}`;
        $cta.style.background = '#f59e0b'; $cta.style.color = '#0b1220';
        $cta.title = 'Producto agotado: tocá para avisarte cuando llegue';
        $reservar.style.display = 'none';
      } else if (isReservado) {
        article.style.opacity = '0.9';
        $cta.textContent = 'Reservado / Consultar';
        $cta.href = `https://wa.me/${TEL}?text=${textoReservado}`;
        $cta.style.background = '#ef4444'; $cta.style.color = '#fff';
        $cta.title = 'Producto reservado: consultá por disponibilidad';

        if (isReservadoLocal && !isReservadoGlobal) {
          $reservar.textContent = 'Quitar reserva (este dispositivo)';
          $reservar.style.display = 'inline-block';
          $reservar.style.background = '#0f172a';
          $reservar.style.border = '1px solid rgba(255,255,255,.25)';
          $reservar.onclick = () => {
            const map = leerReservas(); delete map[p.id]; escribirReservas(map);
            showToast('Reserva quitada'); render(lista);
          };
        } else {
          $reservar.style.display = 'none';
        }
      } else {
        // Disponible
        article.style.opacity = '1';
        $cta.textContent = 'WhatsApp';
        $cta.href = `https://wa.me/${TEL}?text=${textoDisponible}`;
        $cta.style.background = '#22c55e'; $cta.style.color = '#0b1220';
        $cta.title = 'Consultar por WhatsApp';

        // Botón Reservar activo
        $reservar.textContent = 'Reservar';
        $reservar.style.display = 'inline-block';
        $reservar.style.background = '#1d4ed8'; $reservar.style.color = '#fff';
        $reservar.onclick = () => {
          const map = leerReservas(); map[p.id] = true; escribirReservas(map);
          showToast('Producto reservado');
          window.open(`https://wa.me/${TEL}?text=${textoQuieroReservar}`, '_blank');
          render(lista);
        };
      }

      // Agregar al fragmento
      frag.appendChild(node);

      // Registrar imagen para lazy-load
      lazyWatch(img);
    });

    $grid.appendChild(frag);

    // Contador
    if ($count) {
      const n = lista.length || 0;
      $count.textContent = n === 1 ? '· 1 producto' : `· ${n} productos`;
    }

    if (!lista.length) {
      $grid.innerHTML = `<p style="opacity:.85;margin:.5rem 0">No se encontraron productos con ese filtro.</p>`;
    }
  }

  // Ordenamiento
  function ordenarLista(lista, criterio) {
    const arr = [...lista];
    switch (criterio) {
      case 'precio-asc':  arr.sort((a,b) => (a.precio??0) - (b.precio??0)); break;
      case 'precio-desc': arr.sort((a,b) => (b.precio??0) - (a.precio??0)); break;
      case 'nombre-asc':  arr.sort((a,b) => (a.nombre||'').localeCompare(b.nombre||'')); break;
      case 'nombre-desc': arr.sort((a,b) => (b.nombre||'').localeCompare(a.nombre||'')); break;
      case 'nuevo':       arr.sort((a,b) => new Date(b.fecha||0) - new Date(a.fecha||0)); break;
      default: break; // relevancia (orden del JSON)
    }
    return arr;
  }

  // Filtros + Orden
  function aplicarFiltros() {
    const q = ($buscar?.value || '').toLowerCase().trim();
    const cat = $filtro?.value || '';
    const ord = $ordenar?.value || 'relevancia';

    let filtrados = productos.filter(p => {
      const texto = `${p.nombre || ''} ${p.descripcion || ''}`.toLowerCase();
      const okTexto = !q || texto.includes(q);
      const okCat = !cat || (p.categoria === cat);
      return okTexto && okCat;
    });

    filtrados = ordenarLista(filtrados, ord);
    render(filtrados);
  }

  // Eventos
  $buscar?.addEventListener('input', aplicarFiltros);
  $filtro?.addEventListener('change', aplicarFiltros);
  $ordenar?.addEventListener('change', aplicarFiltros);
  $limpiar?.addEventListener('click', () => {
    if ($buscar) $buscar.value = '';
    if ($filtro) $filtro.value = '';
    if ($ordenar) $ordenar.value = 'relevancia';
    render(productos);
  });

  // Inicial
  render(productos);
})();
