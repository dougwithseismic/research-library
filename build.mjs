import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";
import { Marked } from "marked";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLICATIONS = join(ROOT, "publications");
const OUTPUT = join(ROOT, "docs");
const SITE_URL = "https://dougwithseismic.github.io/research-library";
const REPOSITORY_URL = "https://github.com/dougwithseismic/research-library";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const stripTags = (value) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function frontmatter(markdown) {
  if (!markdown.startsWith("---\n")) return { attributes: {}, body: markdown };
  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) return { attributes: {}, body: markdown };
  const attributes = {};
  for (const line of markdown.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    attributes[key] = value;
  }
  return { attributes, body: markdown.slice(end + 5) };
}

function publicationDirectories() {
  return readdirSync(PUBLICATIONS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(PUBLICATIONS, entry.name))
    .filter((directory) => existsSync(join(directory, "publication.json")));
}

function rewriteHref(href) {
  if (!href) return "";
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (href === "./evidence/" || href === "./evidence") return "data/index.html";
  if (href.startsWith("./evidence/"))
    return `data/${href.slice("./evidence/".length)}`;
  if (href === "../evidence/" || href === "../evidence")
    return "data/index.html";
  if (href.startsWith("../evidence/"))
    return `data/${href.slice("../evidence/".length)}`;
  if (href === "./README.md" || href === "README.md") return "index.html";
  return href.replace(/^\.\//, "").replace(/\.md(#.*)?$/, ".html$1");
}

function markdownHtml(markdown) {
  const slugger = new GithubSlugger();
  const headings = [];
  const parser = new Marked({ gfm: true });
  parser.use({
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens);
        const text = stripTags(inner);
        const id = slugger.slug(text);
        if (token.depth === 2 || token.depth === 3) {
          headings.push({ depth: token.depth, id, text });
        }
        return `<h${token.depth} id="${escapeHtml(id)}"><a class="heading-anchor" href="#${escapeHtml(id)}">${inner}<span aria-hidden="true">#</span></a></h${token.depth}>\n`;
      },
      link(token) {
        const href = rewriteHref(token.href);
        const label = this.parser.parseInline(token.tokens);
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
        const external = /^https?:/.test(href);
        return `<a href="${escapeHtml(href)}"${title}${external ? ' class="external" rel="noreferrer"' : ""}>${label}</a>`;
      },
    },
  });
  let html = parser.parse(markdown);
  html = html.replace(/<table>/g, '<div class="table-scroll"><table>');
  html = html.replace(/<\/table>/g, "</table></div>");
  return { html, headings };
}

function navMarkup(publication, activeOutput, prefix = "") {
  let currentSection = "";
  return publication.pages
    .map((page) => {
      const section =
        page.section !== currentSection
          ? `<p class="nav-section">${escapeHtml(page.section)}</p>`
          : "";
      currentSection = page.section;
      return `${section}<a class="nav-link${page.output === activeOutput ? " is-active" : ""}" href="${escapeHtml(`${prefix}${page.output}`)}"${page.output === activeOutput ? ' aria-current="page"' : ""}><span>${escapeHtml(page.number)}</span>${escapeHtml(page.shortTitle)}</a>`;
    })
    .join("\n");
}

function tableOfContents(headings) {
  const items = headings.filter((heading) => heading.depth === 2);
  if (!items.length) return "";
  return `<aside class="page-toc" aria-label="On this page"><p>On this page</p><nav>${items
    .map(
      (heading) =>
        `<a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a>`,
    )
    .join("")}</nav></aside>`;
}

function jsonLd(publication, page, canonical) {
  const values = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      datePublished: publication.observedAt,
      dateModified: publication.observedAt,
      author: { "@type": "Organization", name: "Research Library" },
      publisher: { "@type": "Organization", name: "Research Library" },
      mainEntityOfPage: canonical,
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: publication.title,
        url: `${SITE_URL}/${publication.slug}/`,
      },
    },
  ];
  return JSON.stringify(values).replaceAll("<", "\\u003c");
}

function pageTemplate({ publication, page, body, headings, index }) {
  const canonical = `${SITE_URL}/${publication.slug}/${page.output === "index.html" ? "" : page.output}`;
  const previous = publication.pages[index - 1];
  const next = publication.pages[index + 1];
  const inDataDirectory = page.output.startsWith("data/");
  const assetPrefix = inDataDirectory ? "../../" : "../";
  const pagePrefix = inDataDirectory ? "../" : "";
  const sourceUrl =
    page.source === "../evidence"
      ? `${REPOSITORY_URL}/tree/main/publications/${publication.slug}/evidence`
      : page.source.startsWith("../")
        ? `${REPOSITORY_URL}/blob/main/publications/${publication.slug}/${page.source.slice(3)}`
        : `${REPOSITORY_URL}/blob/main/publications/${publication.slug}/series/${page.source}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)} — Research Library</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="theme-color" content="#111713">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="${assetPrefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${assetPrefix}assets/styles.css">
  <script type="application/ld+json">${jsonLd(publication, page, canonical)}</script>
  <script src="${assetPrefix}assets/site.js" defer></script>
</head>
<body data-page="${escapeHtml(page.output)}">
  <a class="skip-link" href="#content">Skip to content</a>
  <div class="reading-progress" aria-hidden="true"><span></span></div>
  <header class="mobile-bar">
    <a href="${assetPrefix}index.html" class="mobile-brand">Research Library</a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><span class="sr-only">Open navigation</span></button>
  </header>
  <div class="nav-backdrop" aria-hidden="true"></div>
  <div class="site-shell">
    <aside class="site-nav" id="site-nav">
      <div class="nav-header">
        <a class="library-mark" href="${assetPrefix}index.html"><span>R</span><strong>Research<br>Library</strong></a>
        <p>Decision-grade commercial research with the evidence left attached.</p>
      </div>
      <div class="publication-label"><span>${escapeHtml(publication.eyebrow)}</span><strong>${escapeHtml(publication.shortTitle)}</strong></div>
      <label class="nav-search"><span class="sr-only">Filter chapters</span><input type="search" placeholder="Filter chapters…" autocomplete="off"></label>
      <nav class="chapter-nav" aria-label="Research chapters">${navMarkup(publication, page.output, pagePrefix)}</nav>
      <div class="nav-footer"><a href="${inDataDirectory ? "index.html" : "data/index.html"}">Download evidence</a><a href="${sourceUrl}">View Markdown</a></div>
    </aside>
    <main class="main-column" id="content">
      <article class="research-article">
        <header class="article-header">
          <p class="eyebrow">${escapeHtml(publication.eyebrow)} <span>/</span> ${escapeHtml(page.number)}</p>
          <h1>${escapeHtml(page.title)}</h1>
          <p class="dek">${escapeHtml(page.description)}</p>
          <dl class="article-facts"><div><dt>Geography</dt><dd>${escapeHtml(publication.geography)}</dd></div><div><dt>Research date</dt><dd>${escapeHtml(publication.observedAt)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(publication.status)}</dd></div></dl>
        </header>
        <div class="article-body">${body}</div>
        <footer class="article-footer"><p>This publication distinguishes observed evidence, derived calculations, commercial inference and unknowns.</p><a href="${inDataDirectory ? "sources.csv" : "data/sources.csv"}">Source register <span aria-hidden="true">↗</span></a></footer>
      </article>
      <nav class="chapter-pager" aria-label="Adjacent chapters">
        ${previous ? `<a class="previous" href="${escapeHtml(`${pagePrefix}${previous.output}`)}"><span>Previous</span><strong>${escapeHtml(previous.shortTitle)}</strong></a>` : "<span></span>"}
        ${next ? `<a class="next" href="${escapeHtml(`${pagePrefix}${next.output}`)}"><span>Next</span><strong>${escapeHtml(next.shortTitle)}</strong></a>` : `<a class="next" href="${inDataDirectory ? "index.html" : "data/index.html"}"><span>Next</span><strong>Evidence pack</strong></a>`}
      </nav>
    </main>
    ${tableOfContents(headings)}
  </div>
</body>
</html>`;
}

function renderPublication(directory) {
  const publication = JSON.parse(
    readFileSync(join(directory, "publication.json"), "utf8"),
  );
  const destination = join(OUTPUT, publication.slug);
  mkdirSync(destination, { recursive: true });

  publication.pages.forEach((page, index) => {
    const source = join(directory, "series", page.source);
    const parsed = frontmatter(readFileSync(source, "utf8"));
    let markdown = parsed.body.trimStart().replace(/^# .+\n+/, "");
    if (page.source.startsWith("01-")) {
      markdown = markdown
        .split("\n## Publication schema template")[0]
        .trimEnd();
    }
    const rendered = markdownHtml(markdown);
    writeFileSync(
      join(destination, page.output),
      pageTemplate({
        publication,
        page: {
          ...page,
          description: parsed.attributes.meta_description ?? page.description,
        },
        body: rendered.html,
        headings: rendered.headings,
        index,
      }),
    );
  });

  const evidenceSource = join(directory, "evidence");
  const evidenceDestination = join(destination, "data");
  cpSync(evidenceSource, evidenceDestination, { recursive: true });
  const artifacts = readdirSync(evidenceSource)
    .filter((file) => !file.startsWith("."))
    .sort();
  const evidenceMarkdown = `## Download the evidence pack\n\nThe publication keeps its source register, commercial keyword ledger, opportunity scorecard and practitioner evidence available for inspection.\n\n| Artifact | Purpose |\n| --- | --- |\n${artifacts
    .map((file) => {
      const labels = {
        "commercial-keyword-ledger.csv":
          "Retained UK commercial-intent keyword observations",
        "manifest.json": "Research scope, methods, exclusions and limitations",
        "practitioner-evidence-ledger.csv":
          "Payment-model and practitioner evidence claims",
        "scorecard.csv": "Comparable opportunity scores and raw demand totals",
        "sources.csv": "Complete source URL register and limitations",
      };
      return `| [${file}](./${file}) | ${labels[file] ?? "Retained research artifact"} |`;
    })
    .join(
      "\n",
    )}\n\nThese files contain no OAuth tokens, customer identifiers or Companies House API keys.`;
  const renderedEvidence = markdownHtml(evidenceMarkdown);
  const evidencePage = {
    output: "data/index.html",
    source: "../evidence",
    number: "DATA",
    title: "Evidence Pack",
    shortTitle: "Evidence pack",
    description:
      "Downloadable source, keyword, scorecard and practitioner-evidence files.",
  };
  const evidenceHtml = pageTemplate({
    publication,
    page: evidencePage,
    body: renderedEvidence.html,
    headings: renderedEvidence.headings,
    index: publication.pages.length,
  });
  writeFileSync(join(evidenceDestination, "index.html"), evidenceHtml);
  return publication;
}

function libraryHome(publications) {
  const cards = publications
    .map(
      (publication) => `<article class="publication-card">
        <p>${escapeHtml(publication.eyebrow)} <span>·</span> ${escapeHtml(publication.observedAt)}</p>
        <h2><a href="${escapeHtml(publication.slug)}/index.html">${escapeHtml(publication.title)}</a></h2>
        <p>${escapeHtml(publication.summary)}</p>
        <div><span>${publication.pages.length - 1} chapters</span><span>${escapeHtml(publication.geography)}</span><a href="${escapeHtml(publication.slug)}/index.html">Read publication <b aria-hidden="true">↗</b></a></div>
      </article>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Research Library — Commercial decisions with evidence</title>
  <meta name="description" content="Decision-grade commercial research with methods, source ledgers, calculations and uncertainty left attached.">
  <meta name="theme-color" content="#111713">
  <link rel="canonical" href="${SITE_URL}/">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body class="library-home">
  <a class="skip-link" href="#publications">Skip to publications</a>
  <header class="home-header"><a class="library-mark" href="index.html"><span>R</span><strong>Research<br>Library</strong></a><a href="${REPOSITORY_URL}">Source repository ↗</a></header>
  <main>
    <section class="home-hero">
      <p class="eyebrow">Independent research archive / 2026</p>
      <h1>Commercial decisions,<br><em>with the evidence left attached.</em></h1>
      <p>Long-form market research built from current sources, reproducible demand data and explicit uncertainty—not a slide deck of unsupported conclusions.</p>
      <dl><div><dt>${publications.length}</dt><dd>Published series</dd></div><div><dt>${publications.reduce((sum, publication) => sum + publication.pages.length - 1, 0)}</dt><dd>Research chapters</dd></div><div><dt>UK</dt><dd>Primary market</dd></div></dl>
    </section>
    <section class="publication-grid" id="publications">
      <header><p class="eyebrow">Published work</p><h2>Research series</h2></header>
      ${cards}
    </section>
  </main>
  <footer class="home-footer"><p>Research Library</p><p>Observed evidence · Derived calculations · Inference · Unknowns</p></footer>
</body>
</html>`;
}

rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(join(OUTPUT, "assets"), { recursive: true });
cpSync(join(ROOT, "site-src"), join(OUTPUT, "assets"), { recursive: true });
writeFileSync(join(OUTPUT, ".nojekyll"), "");

const publications = publicationDirectories().map(renderPublication);
writeFileSync(join(OUTPUT, "index.html"), libraryHome(publications));
writeFileSync(
  join(OUTPUT, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
const urls = [
  `${SITE_URL}/`,
  ...publications.flatMap((publication) => [
    `${SITE_URL}/${publication.slug}/`,
    ...publication.pages
      .filter((page) => page.output !== "index.html")
      .map((page) => `${SITE_URL}/${publication.slug}/${page.output}`),
    `${SITE_URL}/${publication.slug}/data/`,
  ]),
];
writeFileSync(
  join(OUTPUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join("")}</urlset>\n`,
);
writeFileSync(
  join(OUTPUT, "404.html"),
  libraryHome(publications).replace(
    '<section class="home-hero">',
    '<section class="home-hero"><p class="eyebrow">404 / Page not found</p><p><a href="./index.html">Return to the research library</a></p></section><section class="home-hero" hidden>',
  ),
);

console.log(
  `Built ${publications.length} publication(s) and ${urls.length} indexable pages in ${relative(ROOT, OUTPUT)}/`,
);
