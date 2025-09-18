document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  cargarCarruselNoticias();
});

async function obtenerDolarApi(tipo) {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${tipo}`, {
        method: 'GET',
        cache: 'no-cache' 
      });
    const data = await res.json();
    return { compra: data.compra.toFixed(2), venta: data.venta.toFixed(2) };
  } catch {
    return { compra: "N/D", venta: "N/D" };
  }
}

async function obtenerDolarCriptoYa() {
  try {
    const arsRes = await fetch("https://criptoya.com/api/buenbit/dai/ars", {
        method: 'GET',
        cache: 'no-cache' 
      });
    const usdRes = await fetch("https://criptoya.com/api/buenbit/dai/usd", {
        method: 'GET',
        cache: 'no-cache' 
      });
    const ars = await arsRes.json();
    const usd = await usdRes.json();
    const compra = (ars.bid / usd.ask).toFixed(2);
    const venta = (ars.ask / usd.bid).toFixed(2);
    const variacion = usd.variation;
    return { compra, venta };
  } catch {
    return { compra: "N/D", venta: "N/D" };
  }
}

async function obtenerDolarBlueCriptoYa() {
  try {
    const res = await fetch("https://criptoya.com/api/dolar", {
        method: 'GET',
        cache: 'no-cache' 
      });
    const data = await res.json();
    return {
      compra: data.blue.bid.toFixed(2),
      venta: data.blue.ask.toFixed(2),
      variacionBlue: data.blue.variation,
      variacionMep: data.mep.al30.ci.variation,
      variacionBuenBit: data.cripto.usdt.variation,
      variacionOficial: data.oficial.variation
    };
  } catch {
    return { compra: "N/D", venta: "N/D" };
  }
}

async function cargarDatos() {
  await cargarCotizaciones();
  resaltarMejoresValores();
  mostrarReferencias();
  mostrarHoraActualizacion();
}

const COMISION_MEP = 0.01; // 1% de comisión

function formatearVariacionHTML(valor) {
  if (valor == null || isNaN(valor)) return '<div class="variacion">&nbsp;</div>';
  const num = parseFloat(valor).toFixed(2);
  if (num > 0) {
    return `<div class="variacion">▲ ${num}%</div>`;
  } else if (num < 0) {
    return `<div class="variacion">▼ ${num}%</div>`;
  } else {
    return `<div class="variacion">= ${num}%</div>`;
  }
}

async function cargarCotizaciones() {
  const oficial = await obtenerDolarApi("oficial");
  const mep = await obtenerDolarApi("bolsa");
  const buenbit = await obtenerDolarCriptoYa();
  const blue = await obtenerDolarBlueCriptoYa();

  // Calcular precios MEP con comisión
  const mepCompraComision = (parseFloat(mep.compra) * (1 - COMISION_MEP)).toFixed(2);
  const mepVentaComision = (parseFloat(mep.venta) * (1 + COMISION_MEP)).toFixed(2);

  document.getElementById("oficial-compra").innerHTML =
    `<div class="celda-precio">$${oficial.compra}<div class="variacion">&nbsp;</div></div>`;
  document.getElementById("oficial-venta").innerHTML =
    `<div class="celda-precio">$${oficial.venta}${formatearVariacionHTML(blue.variacionOficial)}</div>`;

  document.getElementById("mep-compra").innerHTML =
    `<div class="celda-precio">$${mepCompraComision}<div class="variacion"></div></div>`;
  document.getElementById("mep-venta").innerHTML =
    `<div class="celda-precio">$${mepVentaComision}${formatearVariacionHTML(blue.variacionMep)}</div>`;

  document.getElementById("buenbit-compra").innerHTML =
    `<div class="celda-precio">$${buenbit.compra}<div class="variacion">&nbsp;</div></div>`;
  document.getElementById("buenbit-venta").innerHTML =
    `<div class="celda-precio">$${buenbit.venta}${formatearVariacionHTML(blue.variacionBuenBit)}</div>`;

  document.getElementById("blue-compra").innerHTML =
    `<div class="celda-precio">$${blue.compra}<div class="variacion">&nbsp;</div></div>`;
  document.getElementById("blue-venta").innerHTML =
    `<div class="celda-precio">$${blue.venta}${formatearVariacionHTML(blue.variacionBlue)}</div>`;
}



function resaltarMejoresValores() {
  const compras = [...document.querySelectorAll("td[id$='compra']")];
  const ventas = [...document.querySelectorAll("td[id$='venta']")];

  let maxCompra = Math.max(...compras.map(td => parseFloat(td.textContent.substring(1)) || -Infinity));
  let minVenta = Math.min(...ventas.map(td => parseFloat(td.textContent.substring(1)) || Infinity));

  compras.forEach(td => {
    if (parseFloat(td.textContent.substring(1)) === maxCompra) td.classList.add("mejor-compra");
  });

  ventas.forEach(td => {
    if (parseFloat(td.textContent.substring(1)) === minVenta) td.classList.add("mejor-venta");
  });
}

function mostrarReferencias() {
  const compras = [...document.querySelectorAll("td[id$='compra']")];
  const ventas = [...document.querySelectorAll("td[id$='venta']")];

  let maxCompra = Math.max(...compras.map(td => parseFloat(td.textContent.substring(1)) || -Infinity));
  let minVenta = Math.min(...ventas.map(td => parseFloat(td.textContent.substring(1)) || Infinity));

  const mejorCompraTipo = compras.find(td => parseFloat(td.textContent.substring(1)) === maxCompra)
    .parentElement.firstElementChild.textContent;

  const mejorVentaTipo = ventas.find(td => parseFloat(td.textContent.substring(1)) === minVenta)
    .parentElement.firstElementChild.textContent;

  document.getElementById('referencias-row').innerHTML =
    `✔️ Mejor precio para vender: <strong>${mejorCompraTipo.trim()} $${maxCompra}</strong> | Menor precio para comprar: <strong>${mejorVentaTipo.trim()} $${minVenta}</strong>`;
}

function mostrarHoraActualizacion() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-AR', { hour12: false });
  document.getElementById('hora-row').textContent = `⏱ Última actualización: ${hora}`;
}

async function cargarCarruselNoticias() {
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.clarin.com/rss/economia');
    const data = await res.json();

    const contenedor = document.getElementById("noticiasCarousel");
    if (!data.items || !Array.isArray(data.items)) return;

    contenedor.innerHTML = ''; // Limpiar contenido previo

    data.items.slice(0, 5).forEach((noticia, i) => {
      const imagen = noticia.enclosure?.link || 'https://placehold.co/800x400?text=-';

      const item = document.createElement("div");
      item.className = "carousel-item" + (i === 0 ? " active" : "");
      item.innerHTML = `
        <img src="${imagen}" class="carrusel-img" alt="Imagen de la noticia">
        <div class="carousel-caption bg-dark bg-opacity-75 rounded-bottom p-3">
          <a href="${noticia.link}" target="_blank" class="h6 d-block text-white text-decoration-none mb-1" rel="noopener noreferrer">
            🗞️ ${noticia.title}
          </a>
          <small class="text-light">${new Date(noticia.pubDate).toLocaleDateString()}</small>
        </div>
      `;
      contenedor.appendChild(item);
    });

    const carruselElement = document.querySelector('#carruselNoticias');
    bootstrap.Carousel.getInstance(carruselElement) || new bootstrap.Carousel(carruselElement, {
      interval: 4000,
      ride: 'carousel'
    });

  } catch (error) {
    console.error("Error al cargar noticias:", error);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  cargarCarruselNoticias();
});

async function cargarClima() {
    const climaDiv = document.getElementById('climaInfo');
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-34.61&longitude=-58.38&current_weather=true');
      const data = await res.json();
      const c = data.current_weather;

      climaDiv.textContent = `Buenos Aires, Argentina: ${c.temperature}°C | 💨 ${c.windspeed} km/h`;
    } catch (err) {
      climaDiv.textContent = 'Buenos Aires, Argentina: clima no disponible';
      console.error(err);
    }
  }

  cargarClima();

  document.getElementById("refreshBtn").addEventListener("click", () => {
  cargarDatos();
});
