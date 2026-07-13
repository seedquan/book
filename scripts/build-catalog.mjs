import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const booksRoot = path.resolve("books");
const entries = await readdir(booksRoot, { withFileTypes: true });
const catalogue = [];

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
  const manifestPath = path.join(booksRoot, entry.name, "book.json");
  try {
    const book = JSON.parse(await readFile(manifestPath, "utf8"));
    if (!book.slug || !book.title || !book.status || !book.reading_url) {
      throw new Error("missing required public metadata");
    }
    catalogue.push(book);
  } catch (error) {
    throw new Error(`Invalid book manifest at books/${entry.name}/book.json: ${error.message}`);
  }
}

catalogue.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
await mkdir(path.resolve("public"), { recursive: true });
await writeFile(path.resolve("public", "catalog.json"), `${JSON.stringify({ books: catalogue }, null, 2)}\n`);
console.log(`Built catalogue with ${catalogue.length} book(s).`);
