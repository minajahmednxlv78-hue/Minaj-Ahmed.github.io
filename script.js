// ====== CONFIG: change this to your GitHub username ======
const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME";
const MAX_REPOS = 6;
// =========================================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Year
$("#year").textContent = new Date().getFullYear();

// Theme toggle (remembered)
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (_) {}
$("#theme-toggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (_) {}
});

// Mobile menu
const menu = $("#menu");
$("#menu-toggle").addEventListener("click", () => menu.classList.toggle("open"));
$$("#menu a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));

// Typing effect
const roles = [
  "Computer Science Engineering Student",
  "Aspiring Software Developer",
  "DSA & Problem Solving Enthusiast",
  "Python | C++ | OOP",
];
let r = 0, c = 0, deleting = false;
const typed = $("#typed");
(function type() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!deleting && c < word.length) c++;
  else if (!deleting) { deleting = true; return setTimeout(type, 1400); }
  else if (c > 0) c--;
  else { deleting = false; r = (r + 1) % roles.length; }
  setTimeout(type, deleting ? 35 : 70);
})();

// Scroll reveal + skill bars
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    $$(".bar div", e.target).forEach(b => (b.style.width = b.dataset.level + "%"));
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => io.observe(el));

// Active nav link on scroll
const links = $$("#menu a");
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

// GitHub repositories
const langColors = { Python: "#3572A5", "C++": "#f34b7d", C: "#888", JavaScript: "#f1e05a", HTML: "#e34c26", CSS: "#563d7c", Java: "#b07219" };

function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

async function loadRepos() {
  if (!GITHUB_USERNAME || GITHUB_USERNAME === "YOUR_GITHUB_USERNAME") return; // keep placeholder cards
  const grid = $("#repo-grid");
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`);
    if (!res.ok) throw new Error(res.status);
    const repos = (await res.json())
      .filter(r => !r.fork && r.name.toLowerCase() !== `${GITHUB_USERNAME}.github.io`.toLowerCase())
      .slice(0, MAX_REPOS);
    if (!repos.length) return;
    grid.innerHTML = repos.map(r => `
      <a class="repo" href="${r.html_url}" target="_blank" rel="noopener">
        <h4>📁 ${escapeHTML(r.name)}</h4>
        <p>${escapeHTML(r.description || "No description yet.")}</p>
        <div class="repo-meta mono">
          ${r.language ? `<span><span style="color:${langColors[r.language] || "var(--accent)"}">●</span> ${escapeHTML(r.language)}</span>` : ""}
          <span>⭐ ${r.stargazers_count}</span>
          <span>🍴 ${r.forks_count}</span>
        </div>
      </a>`).join("");
    $("#all-repos").href = `https://github.com/${GITHUB_USERNAME}?tab=repositories`;
  } catch (err) {
    console.warn("Could not load repos, showing placeholders.", err);
  }
}
loadRepos();
