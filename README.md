# UGP – Último Guerrero en Pie · Landing informativa

Página informativa del proyecto UGP (eventos de MMA, boletería, patrocinio y plataforma web).
HTML, CSS y JavaScript puros, sin build. Three.js r128 incluido en `assets/vendor/`.

## Cómo ejecutarla
- Abre `index.html` con doble clic, o en VS Code usa la extensión **Live Server** (clic derecho en `index.html` → *Open with Live Server*).
- Las tipografías vienen de Google Fonts, así que necesitas internet la primera vez. Sin ellas se usan fuentes de respaldo.

## Estructura
```
index.html          Estructura y contenido de las 12 secciones
css/style.css       Colores y tipografías (variables en :root), layout y componentes
js/data.js          ÚNICA fuente del contenido dinámico: eventos, precios, áreas del sistema
js/ui.js            Pinta eventos con filtro, tabla de precios y tarjetas; animación de entrada
js/hero-3d.js       Jaula octagonal 3D de la portada (Three.js) con fallback
assets/images/      Imágenes oficiales (eventos, careos de peleadores, planos y marcas)
assets/vendor/      three.min.js (r128)
```
Los scripts son clásicos (no módulos) para que funcionen también abriendo el archivo directo. El orden en `index.html` importa: `three` → `data` → `ui` → `hero-3d`.

## Cómo editar el contenido
- **Eventos:** `js/data.js` → `DATA.events`. Cada uno lleva `status` (`"confirmado"` o `"demo"`) y `state` (`proximo`, `activo`, `finalizado`, `cancelado`, `pendiente`). El texto "Ejemplo demostrativo" aparece solo con `status: "demo"`.
- **Precios:** `DATA.prices`. Valores en pesos colombianos.
- **Áreas del sistema y su estado:** `DATA.features`. Hoy todas figuran como **Previstas** en `js/ui.js` (insignia `b-plan`). Tras auditar el código, cambia la insignia a *Implementada* o *Parcial*.
- **Experiencias, peleadores y patrocinadores:** son marcadores en `index.html` (secciones `#protagonistas`, `#experiencias`, `#patrocinio`). Reemplázalos cuando haya datos confirmados.
- **Colores y tipografías:** variables al inicio de `css/style.css`.

## Cómo cambiar los luchadores 3D por modelos reales
Hoy son figuras articuladas hechas con formas simples en `js/hero-3d.js` (función `makeFighter`). Pelean con una coreografía de 8 s (`plan`): jab, cruzado y patadas, con reacción al golpe, giro dentro de la jaula, vaivén de cámara, haces de luz, polvo y público. Puedes cambiar la secuencia editando `plan`. Para usar modelos GLB, agrega `GLTFLoader` de Three.js r128 en `assets/vendor/`, coloca los modelos en `assets/models/` (menos de 3 MB en total, comprimidos) y reemplaza `A` y `B` por los modelos cargados.

## Portada y accesibilidad
- Respeta `prefers-reduced-motion`: dibuja un solo cuadro sin movimiento.
- Pausa el render cuando la portada no está visible; limita `devicePixelRatio` a 2; libera recursos al salir.
- Sin WebGL, con ≤ 2 núcleos o si se pierde el contexto, se muestra una ilustración fija.

## Reglas de contenido
- No inventar datos: lo no confirmado va como **Ejemplo demostrativo** o **Por confirmar**.
- Los precios de UGP 19 y LDA son referencia de eventos concretos, no una oferta vigente.
- La landing no vende ni cobra. La compra de boletería forma parte del proyecto, pero aquí solo se explica.
