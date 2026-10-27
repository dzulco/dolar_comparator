async function cargarNoticias() {
  try {
    const res = await fetch("./data/noticias.json");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    const lista = document.getElementById("listaNoticias");

    if (!lista) return;

    lista.innerHTML = "";

    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      lista.innerHTML = "<p>No se encontraron noticias.</p>";
      return;
    }

    items.forEach((noticia) => {
      const item = document.createElement("a");
      item.href = noticia.link;
      item.target = "_blank";
      item.rel = "noopener noreferrer";
      item.className = "list-group-item list-group-item-action flex-column align-items-start";

      const fecha = new Date(noticia.pubDate);
      const fechaFormateada = isNaN(fecha) ? "" : fecha.toLocaleDateString();

      const descripcion = noticia.description
        ? noticia.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 150)
        : "Sin descripción";

      item.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${noticia.title}</h5>
          <small>${fechaFormateada}</small>
        </div>
        <p class="mb-1 text-truncate">${descripcion}...</p>
      `;

      lista.appendChild(item);
    });
  } catch (error) {
    const lista = document.getElementById("listaNoticias");
    if (lista) {
      lista.innerHTML = "<p>Error cargando las noticias.</p>";
    }
    console.error("Error al cargar noticias:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarNoticias);