console.log("Site loaded");

// ===== Page list =====
// The order here decides the sidebar order and what "previous"/"next" go to.
// Pages with file: null are shown greyed out in the sidebar and skipped by previous/next.
// When you create a page, set its file name, e.g. file: "crystal.html".
const pages = [
  { title: "Overview",              file: "CAMS/CAMS_home.html" },
  { title: "Chromatography",        file: "CAMS/chromo.html" },
  { title: "Crystallization",       file: "CAMS/cryzt.html" },
  { title: "Extraction",            file: "CAMS/extr.html" },
  { title: "Excess free energy",    file: "CAMS/gamma.html" },
  { title: "Stabilization",         file: "CAMS/stable.html" },
  { title: "Surrogate Formulation", file: "CAMS/surr.html" },
];

// ===== Paths =====
// main.js sits in the website's top folder, so its location tells us where the site root is.
// All file names in this script are written relative to that root (e.g. "CAMS/CAMS_home.html"),
// and siteUrl() turns them into full addresses, so they work from pages in any folder.
const siteRoot = new URL(".", document.currentScript.src);

function siteUrl(file) {
  return new URL(file, siteRoot).href;
}

// Is this a link to a file in the site (not "#section", "https://...", "mailto:...")?
function isSiteLink(link) {
  return link && !/^(#|[a-z]+:|\/)/i.test(link);
}

async function loadPartial(selector, file) {
  const target = document.querySelector(selector);
  if (!target) return; // this page doesn't use the shared header/footer

  const response = await fetch(siteUrl(file));

  if (!response.ok) {
    throw new Error(`Could not load ${file}: ${response.status}`);
  }

  target.innerHTML = await response.text();

  // Links and images in header.html/footer.html are written relative to the site root;
  // fix them up so they also work on pages inside folders.
  target.querySelectorAll("[href], [src]").forEach(el => {
    for (const attr of ["href", "src"]) {
      const value = el.getAttribute(attr);
      if (isSiteLink(value)) el.setAttribute(attr, siteUrl(value));
    }
  });
}

// Path of the page we're on, relative to the site root, e.g. "chromo.html" or "CAMS/CAMS_home.html"
function currentFile() {
  const page = decodeURIComponent(location.pathname);
  const root = decodeURIComponent(siteRoot.pathname);
  let file = page.startsWith(root) ? page.slice(root.length) : page;
  if (file === "" || file.endsWith("/")) file += "index.html";
  return file;
}

// Sidebar overview: fills <aside id="page-nav"></aside>
function buildPageNav() {
  const nav = document.querySelector("#page-nav");
  if (!nav) return;

  const current = currentFile();
  const items = pages.map(page => {
    if (!page.file) {
      return `<li class="coming-soon">${page.title}</li>`;
    }
    const cls = page.file === current ? ' class="current"' : "";
    return `<li><a href="${siteUrl(page.file)}"${cls}>${page.title}</a></li>`;
  });

  nav.innerHTML = `<h4>Pages</h4><ul>${items.join("")}</ul>`;
}

// Previous / next buttons: fills <div id="prev-next"></div>
function buildPrevNext() {
  const box = document.querySelector("#prev-next");
  if (!box) return;

  const livePages = pages.filter(page => page.file);
  const i = livePages.findIndex(page => page.file === currentFile());
  if (i === -1) return;

  const prev = livePages[i - 1];
  const next = livePages[i + 1];

  box.innerHTML =
    (prev ? `<a href="${siteUrl(prev.file)}" class="btn">← ${prev.title}</a>` : "<span></span>") +
    (next ? `<a href="${siteUrl(next.file)}" class="btn">${next.title} →</a>` : "");
}

loadPartial("#site-header", "header.html");
loadPartial("#site-footer", "footer.html");
buildPageNav();
buildPrevNext();
