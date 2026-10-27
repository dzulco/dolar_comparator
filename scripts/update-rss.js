const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

const parser = new Parser();

async function main() {
  try {
    const feed = await parser.parseURL("https://www.clarin.com/rss/economia");

    const items = (feed.items || [])
      .slice(0, 5)
      .map((noticia) => ({
        title: noticia.title || "",
        link: noticia.link || "",
        pubDate: noticia.pubDate || "",
        image:
          noticia.enclosure?.url ||
          noticia.enclosure?.link ||
          "https://placehold.co/800x400?text=-",
      }));

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