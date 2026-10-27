const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

const parser = new Parser();

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function main() {
  try {
    const feed = await parser.parseURL("https://www.clarin.com/rss/economia");

    const items = (feed.items || [])
      .slice(0, 5)
      .map((noticia) => {
        const description =
          noticia.description ||
          noticia["content:encoded"] ||
          noticia.contentSnippet ||
          noticia.summary ||
          "";

        return {
          title: noticia.title || "",
          link: noticia.link || "",
          pubDate: formatDate(noticia.pubDate),
          description: stripHtml(description),
          image:
            noticia.enclosure?.url ||
            noticia.enclosure?.link ||
            "https://placehold.co/800x400?text=-",
        };
      });

    const outputDir = path.join(__dirname, "..", "data");
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, "noticias.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ items }, null, 2),
      "utf8"
    );

    console.log(`Se generaron ${items.length} noticias en ${outputPath}`);
  } catch (error) {
    console.error("Error al leer el RSS:", error);
    process.exit(1);
  }
}

main();