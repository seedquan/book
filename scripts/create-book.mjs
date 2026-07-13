import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const rawArgs = process.argv.slice(2);
const getArg = (name) => rawArgs[rawArgs.indexOf(`--${name}`) + 1];

if (rawArgs.includes("--help") || !rawArgs.includes("--slug") || !rawArgs.includes("--title")) {
  console.log("Usage: npm run new-book -- --slug <lowercase-slug> --title <title> [--audience <audience>]");
  process.exit(rawArgs.includes("--help") ? 0 : 1);
}

const args = {
  slug: getArg("slug"),
  title: getArg("title"),
  audience: rawArgs.includes("--audience") ? getArg("audience") : undefined,
};

if (!/^[a-z][a-z0-9-]{2,62}$/.test(args.slug)) {
  throw new Error("slug must use lowercase letters, digits, and single hyphens.");
}

const root = path.resolve("books", args.slug);
if (existsSync(root)) throw new Error(`book already exists: ${args.slug}`);

const template = path.resolve("books", "_template");
const metadata = JSON.parse(await readFile(path.join(template, "book.json"), "utf8"));
metadata.slug = args.slug;
metadata.title = args.title;
metadata.audience = args.audience || metadata.audience;

await mkdir(path.join(root, "chapters"), { recursive: true });
await writeFile(path.join(root, "book.json"), `${JSON.stringify(metadata, null, 2)}\n`);
await writeFile(
  path.join(root, "chapters", "01-第一章.md"),
  await readFile(path.join(template, "chapters", "01-第一章.md"), "utf8"),
);

console.log(`Created books/${args.slug}. Write its first chapter, then run npm run build:catalog.`);
