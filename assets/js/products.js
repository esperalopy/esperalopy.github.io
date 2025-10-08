// assets/js/products.js
// Catálogo con búsqueda/filtro, WhatsApp y RESERVAR (localStorage).
// Estados:
// - disponible === false -> "Agotado / Avísame" (ámbar)
// - reservado (global: p.reservado=true o estado="Reservado") -> badge rojo + "Reservado / Consultar"
// - reservado (local: guardado en este dispositivo al tocar "Reservar") -> igual que reservado
// - disponible -> "WhatsApp" (verde) + botón "Reservar" (azul)

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
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:auto;">
            <strong class="precio" style="font-size:18px;"></strong>
            <a class="btnWp" target="_blank" rel="noopener"
               style="text-decoration:none; padding:8px 10px; border-radius:10px; background:#22c55e; color:#0b1220; font-weight:600;">
              WhatsApp
            </a>
            <button class="btnReservar"
                    style="padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:#1d4ed8; color:#fff; font-weight:600; cursor:pointer;">
              Reservar
            </button>
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

      // Imagen
      img.src = p.imagen || IMG_FALLBACK;
      img.alt = p.nombre || 'Producto';

      // Estado calculado
      const isReservadoGlobal = p.reservado === true || (typeof p.estado === 'string' && p.estado.trim().toLowerCase() === 'reservado');
      const isReservadoLocal  = reservasLocal[p.id] === true;
      const isReservado = isReservadoGlobal || isReservadoLocal;
      const isAgotado = p.disponible === false;

      // Badge
      if (isReservado) {
        $badge.textContent = 'Reservado';
        $badge.style.background = '#ef4444'; // rojo
        $badge.style.color = '#fff';
      } else if (p.estado && !isAgotado) {
        $badge.textContent = p.estado;
        $badge.style.background = '#1d4ed8';
        $badge.style.color = '#fff';
      } else if (isAgotado) {
        $badge.textContent = 'Agotado';
        $badge.style.background = '#f59e0b'; // ámbar
        $badge.style.color = '#0b1220';
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
      const textoDisponible   = encodeURIComponent(base + '¿Sigue disponible?');
      const textoReservado    = encodeURIComponent(base + 'Veo que está reservado. ¿Puedo confirmar si se libera o dejar mis datos?');
      const textoNoDisponible = encodeURIComponent(base + 'Está agotado. Por favor, avísenme cuando llegue nuevamente 🙏');
      const textoQuieroReservar = encodeURIComponent(base + 'Quisiera reservarlo, por favor. ¿Cómo seguimos?');

      // Apariencia + CTA según estado
      if (isAgotado) {
        article.style.opacity = '0.92';
        $cta.textContent = 'Agotado / Avísame';
        $cta.href = `https://wa.me/${TEL}?text=${textoNoDisponible}`;
        $cta.style.background = '#f59e0b';
        $cta.style.color = '#0b1220';
        $cta.title = 'Producto agotado: tocá para avisarte cuando llegue';
        // Reservar no aplica
        $reservar.style.display = 'none';
      } else if (isReservado) {
        article.style.opacity = '0.9';
        $cta.textContent = 'Reservado / Consultar';
        $cta.href = `https://wa.me/${TEL}?text=${textoReservado}`;
        $cta.style.background = '#ef4444';
        $cta.style.color = '#fff';
        $cta.title = 'Producto reservado: consultá por disponibilidad';

        // Botón para cancelar reserva local (solo si es local)
        if (isReservadoLocal && !isReservadoGlobal) {
          $reservar.textContent = 'Quitar reserva (este dispositivo)';
          $reservar.style.display = 'inline-block';
          $reservar.style.background = '#0f172a';
          $reservar.style.border = '1px solid rgba(255,255,255,.25)';
          $reservar.onclick = () => {
            const map = leerReservas();
            delete map[p.id];
            escribirReservas(map);
            render(lista); // re-render con estado actualizado
          };
        } else {
          $reservar.style.display = 'none';
        }
      } else {
        // Disponible
        article.style.opacity = '1';
        $cta.textContent = 'WhatsApp';
        $cta.href = `https://wa.me/${TEL}?text=${textoDisponible}`;
        $cta.style.background = '#22c55e';
        $cta.style.color = '#0b1220';
        $cta.title = 'Consultar por WhatsApp';

        // Botón Reservar activo
        $reservar.textContent = 'Reservar';
        $reservar.style.display = 'inline-block';
        $reservar.style.background = '#1d4ed8';
        $reservar.style.color = '#fff';
        $reservar.onclick = () => {
          // guardar reserva local
          const map = leerReservas();
          map[p.id] = true;
          escribirReservas(map);

          // abrir WhatsApp para reservar
          window.open(`https://wa.me/${TEL}?text=${textoQuieroReservar}`, '_blank');

          // refrescar UI
          render(lista);
        };
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
