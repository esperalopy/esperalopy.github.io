# Plantilla segura para GitHub Pages

Esta carpeta contiene una **plantilla estática** (sin JavaScript externo) pensada para publicarse en **GitHub Pages** de forma gratuita.

## Archivos
- `index.html`: página principal con metas de seguridad y SEO.
- `styles.css`: estilos modernos, responsive y sin dependencias externas.
- `assets/`: imágenes y logo local (evitamos llamadas a terceros).
- `.nojekyll`: desactiva el procesado de Jekyll (útil si usás carpetas con `_`).
- `assets/favicon.png`, `assets/logo.svg`, `assets/og-image.png`.

## Pasos rápidos de publicación
1. Creá un repositorio llamado **`usuario.github.io`** (reemplazá *usuario* por tu usuario real de GitHub).
2. Subí los archivos de esta carpeta a la **raíz** del repo.
3. Entrá a **Settings → Pages** y asegurate de que la fuente sea *Deploy from a branch* con `main / (root)`.
4. Esperá a que se publique y probá `https://usuario.github.io`.

## Buenas prácticas de seguridad
- Activá **2FA** en GitHub: *Settings → Password and authentication → Two-factor authentication*.
- En **Settings → Pages** marcá **Enforce HTTPS** (si usás dominio propio).
- Evitá scripts o recursos de terceros. Si necesitás íconos o fuentes, preferí versiones **locales**.
- Usá `rel="noopener noreferrer"` en enlaces `target="_blank"` (ya aplicado).
- Mantené tus imágenes en `assets/` y optimizalas.

## Personalización
- Cambiá textos del `index.html` (marca, WhatsApp, correo).
- Reemplazá imágenes en `assets/` por las tuyas con los mismos nombres o actualizá las rutas.
- Ajustá colores en `:root` dentro de `styles.css`.
