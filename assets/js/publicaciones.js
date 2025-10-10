// assets/js/publicaciones.js
// Muestra automáticamente las publicaciones del CMS (Decap) en el bloque #publicaciones

(function () {
  const OWNER = 'esperalopy';
  const REPO = 'esperalopy.github.io';
  const BRANCH = 'main';
  const POSTS_DIR = 'content/posts';
  const MAX_ITEMS = 6; // cuántas publicaciones mostrar en la home

  const lista = document.getElementById('listaPublicaciones');
  if (!lista) return;

  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; };

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('es-PY', {year:'numeric', month:'short', day:'numeric'}); }
    catch { return iso; }
  };

  const parseFrontMatter = (txt) => {
    const m = txt.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!m) return { data: {}, body: txt };
    const yaml = m[1], body = m[2], data = {};
    yaml.split(/\r?\n/).forEach(line => {
      const mm = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);
      if (mm) data[mm[1]] = mm[2].trim().replace(/^"(.*)"$/, '$1');
    });
    return { data, body };
  };

  async function cargar() {
    try {
      // 1) listar archivos de content/posts
      const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${POSTS_DIR}?ref=${BRANCH}`;
      const res = await fetch(api);
      if (!res.ok) throw new Error('No se pudo listar publicaciones (' + res.status + ')');
      const files = (await res.json()).filter(f => f.type === 'file' && /\.md$/.test(f.name));

      if (files.length === 0) {
        lista.innerHTML = '<p style="opacity:.85">Aún no hay publicaciones. Creá una desde <b>/admin</b>.</p>';
        return;
      }

      // 2) bajar metadata de cada post
      const items = [];
      for (const f of files) {
        const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${POSTS_DIR}/${encodeURIComponent(f.name)}`;
        const txt = await (await fetch(raw)).text();
        const { data } = parseFrontMatter(txt);
        items.push({
          file: f.name,
          title: data.title || f.name.replace(/\.md$/, ''),
          date: data.date || '',
          description: data.description || ''
        });
      }

      // 3) ordenar por fecha desc y cortar
      items.sort((a, b) => (new Date(b.date) - new Date(a.date)));
      const top = items.slice(0, MAX_ITEMS);

      // 4) render
      lista.innerHTML = '';
      top.forEach(it => {
        const href = `/blog.html?post=${encodeURIComponent(`${POSTS_DIR}/${it.file}`)}`;
        lista.appendChild(el(`
          <article class="card" style="background:#0b1220;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:14px;">
            <div style="font-size:.85rem;opacity:.8;margin-bottom:.35rem">${it.date ? fmtDate(it.date) : ''}</div>
            <h3 style="margin:.2rem 0 .4rem 0;font-size:1.05rem"><a href="${href}" style="color:inherit;text-decoration:none">${it.title}</a></h3>
            <p style="opacity:.85;margin:0 0 .5rem 0">${it.description || ''}</p>
            <p style="margin:0"><a href="${href}">Leer más →</a></p>
          </article>
        `));
      });

    } catch (e) {
      console.error(e);
      lista.innerHTML = '<p style="color:#ff6b6b">No se pudieron cargar las publicaciones.</p>';
    }
  }

  cargar();
})();

