async function obtenerDolarApi(tipo) {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${tipo}`);
    const data = await res.json();
    return { compra: data.compra.toFixed(2), venta: data.venta.toFixed(2) };
  } catch {
    return { compra: "N/D", venta: "N/D" };
  }
}

async function obtenerDolarCriptoYa() {
  try {
    const arsRes = await fetch("https://criptoya.com/api/buenbit/dai/ars");
    const usdRes = await fetch("https://criptoya.com/api/buenbit/dai/usd");
    const ars = await arsRes.json();
    const usd = await usdRes.json();
    const compra = (ars.bid / usd.ask).toFixed(2);
    const venta = (ars.ask / usd.bid).toFixed(2);
    return { compra, venta };
  } catch {
    return { compra: "N/D", venta: "N/D" };
  }
}

async function obtenerDolarBlueCriptoYa() {
  try {
    const res = await fetch("https://criptoya.com/api/dolar");
    const data = await res.json();
    return {
      compra: data.blue.bid.toFixed(2),
      venta: data.blue.ask.toFixed(2)
    };
  } catch {
    return { compra: "N/D", venta: "N/D" };
  }
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
    `✔️ Mejor compra: <strong>${mejorCompraTipo.trim()+ ' $' + maxCompra}</strong> | Venta más barata: <strong>${mejorVentaTipo.trim()+ ' $' + minVenta}</strong>`;
}

function mostrarHoraActualizacion() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-AR', { hour12: false });
  document.getElementById('hora-row').textContent = `⏱ Última actualización: ${hora}`;
}

async function cargarDatos() {
  const oficial = await obtenerDolarApi("oficial");
  const mep = await obtenerDolarApi("bolsa");
  const buenbit = await obtenerDolarCriptoYa();
  const blue = await obtenerDolarBlueCriptoYa();

  document.getElementById("oficial-compra").textContent = '$' + oficial.compra;
  document.getElementById("oficial-venta").textContent = '$' + oficial.venta;

  document.getElementById("mep-compra").textContent = '$' + mep.compra;
  document.getElementById("mep-venta").textContent = '$' + mep.venta;

  document.getElementById("buenbit-compra").textContent = '$' + buenbit.compra;
  document.getElementById("buenbit-venta").textContent = '$' + buenbit.venta;

  document.getElementById("blue-compra").textContent = '$' + blue.compra;
  document.getElementById("blue-venta").textContent = '$' + blue.venta;

  resaltarMejoresValores();
  mostrarReferencias();
  mostrarHoraActualizacion();
}

cargarDatos();

