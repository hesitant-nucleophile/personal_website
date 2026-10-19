console.log("Site loaded");

// ===== Page list =====
// The order here decides the sidebar order and what "previous"/"next" go to.
// Pages with file: null are shown greyed out in the sidebar and skipped by previous/next.
// When you create a page, set its file name, e.g. file: "crystal.html".
const pages = [
  { title: "Home",                  file: "index.html" },
  { title: "Chromatography",        file: "chromo.html" },
  { title: "Crystallization",       file: "cryzt.html" },
  { title: "Extraction",            file: 'extr.html' },
  { title: "Excess free energy",    file: null },
  { title: "Stabilization",         file: null },
  { title: "Surrogate Formulation", file: null },
];

async function loadPartial(selector, file) {
  const target = document.querySelector(selector);
  if (!target) return; // this page doesn't use the shared header/footer

  const response = await fetch(file);

  if (!response.ok) {
    throw new Error(`Could not load ${file}: ${response.status}`);
  }

  target.innerHTML = await response.text();
}

// File name of the page we're on, e.g. "chromo.html" ("" means the site root, i.e. index.html)
function currentFile() {
  const file = location.pathname.split("/").pop();
  return file === "" ? "index.html" : file;
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
    return `<li><a href="${page.file}"${cls}>${page.title}</a></li>`;
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
    (prev ? `<a href="${prev.file}" class="btn">← ${prev.title}</a>` : "<span></span>") +
    (next ? `<a href="${next.file}" class="btn">${next.title} →</a>` : "");
}

loadPartial("#site-header", "header.html");
loadPartial("#site-footer", "footer.html");
buildPageNav();
buildPrevNext();
