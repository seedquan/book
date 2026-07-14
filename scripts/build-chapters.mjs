import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const bookDir = path.resolve("books/moonlight-lighthouse");
const chapterDir = path.join(bookDir, "chapters");
const publicDir = path.resolve("public/chapters");
const book = JSON.parse(await readFile(path.join(bookDir, "book.json"), "utf8"));
const files = (await readdir(chapterDir))
  .filter((name) => /^\d{2}-.+\.md$/.test(name))
  .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }));

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function renderMarkdown(source) {
  const body = source.split(/^## 本章自评\s*$/m)[0].trim();
  const lines = body.split(/\r?\n/);
  const titleLine = lines.shift() ?? "";
  const title = titleLine.replace(/^#\s*(?:第[^ ]+章\s*)?/, "").trim();
  const html = [];
  let paragraph = [];
  let quote = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote><p>${escapeHtml(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushParagraph();
      flushQuote();
    } else if (line.startsWith("> ")) {
      flushParagraph();
      quote.push(line.slice(2));
    } else if (/^##\s+/.test(line)) {
      flushParagraph();
      flushQuote();
      html.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
    } else {
      flushQuote();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushQuote();
  return { title, html: html.join("\n        ") };
}

const chapters = [];
for (const file of files) {
  const number = file.slice(0, 2);
  const source = await readFile(path.join(chapterDir, file), "utf8");
  chapters.push({ number, file, ...renderMarkdown(source) });
}

for (let index = 0; index < chapters.length; index += 1) {
  const chapter = chapters[index];
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  const navigation = [
    previous ? `<a class="next" href="/chapters/${previous.number}/"><div><small>上一章</small><strong>${escapeHtml(previous.title)}</strong></div><b>←</b></a>` : "",
    next ? `<a class="next" href="/chapters/${next.number}/"><div><small>下一章</small><strong>${escapeHtml(next.title)}</strong></div><b>→</b></a>` : `<a class="next" href="/"><div><small>待续</small><strong>返回章节目录</strong></div><b>⌂</b></a>`,
  ].filter(Boolean).join("\n      ");
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="《${escapeHtml(book.title)}》第 ${Number(chapter.number)} 章：${escapeHtml(chapter.title)}" />
    <title>${escapeHtml(chapter.title)}｜${escapeHtml(book.title)}</title>
    <link rel="canonical" href="https://book.seedquan.com/chapters/${chapter.number}/" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="sky" aria-hidden="true"><div class="moon"></div><div class="cloud"></div><div class="hill"></div><div class="tower"></div></div>
    <header class="site-header"><div class="site-bar"><a class="brand" href="/"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>${escapeHtml(book.title)}</span></a><span class="season">第一季 · 找回失去的光</span></div></header>
    <main>
      <div class="crumb">第 ${Number(chapter.number)} 章</div>
      <h1>${escapeHtml(chapter.title)}</h1>
      <section class="reader" aria-label="第 ${Number(chapter.number)} 章正文"><div class="reading-progress" aria-hidden="true"><i></i></div><article>
        ${chapter.html}
        <p class="end-mark">✦ ✦ ✦</p>
      </article></section>
      ${navigation}
      <footer class="footer">《${escapeHtml(book.title)}》 · ${escapeHtml(book.subtitle)}</footer>
    </main>
    <script src="/app.js"></script>
  </body>
</html>\n`;
  const target = path.join(publicDir, chapter.number);
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, "index.html"), html);
}

const cards = chapters.map((chapter) => `<li><a href="/chapters/${chapter.number}/"><span>第 ${Number(chapter.number)} 章</span><strong>${escapeHtml(chapter.title)}</strong></a></li>`).join("\n          ");
const index = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="description" content="《${escapeHtml(book.title)}》章节目录" /><title>${escapeHtml(book.title)}｜章节目录</title><link rel="stylesheet" href="/styles.css" /></head>
<body><div class="sky" aria-hidden="true"><div class="moon"></div><div class="cloud"></div><div class="hill"></div><div class="tower"></div></div><header class="site-header"><div class="site-bar"><a class="brand" href="/"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>${escapeHtml(book.title)}</span></a><span class="season">${escapeHtml(book.subtitle)}</span></div></header><main><div class="crumb">第一季 · 连载中</div><h1>${escapeHtml(book.title)}</h1><p class="subtitle">${escapeHtml(book.description)}</p><section class="reader"><article><h2>章节目录</h2><ol class="chapter-list">${cards}</ol></article></section><footer class="footer">${escapeHtml(book.author)} · ${chapters.length} 章已发布</footer></main></body></html>\n`;
await writeFile(path.resolve("public/index.html"), index);
console.log(`Built ${chapters.length} chapter page(s).`);
