const root = document.documentElement;
root.classList.add("js");

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");
const backdrop = document.querySelector(".nav-backdrop");

function setMenu(open) {
  root.classList.toggle("menu-open", open);
  menuButton?.setAttribute("aria-expanded", String(open));
}

menuButton?.addEventListener("click", () => {
  setMenu(!root.classList.contains("menu-open"));
});

backdrop?.addEventListener("click", () => setMenu(false));
navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

const progress = document.querySelector(".reading-progress span");
function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const filter = document.querySelector(".nav-search input");
filter?.addEventListener("input", () => {
  const query = filter.value.trim().toLowerCase();
  document.querySelectorAll(".chapter-nav .nav-link").forEach((link) => {
    link.hidden =
      Boolean(query) && !link.textContent.toLowerCase().includes(query);
  });
  document.querySelectorAll(".chapter-nav .nav-section").forEach((section) => {
    let sibling = section.nextElementSibling;
    let visible = false;
    while (sibling && !sibling.classList.contains("nav-section")) {
      if (sibling.classList.contains("nav-link") && !sibling.hidden)
        visible = true;
      sibling = sibling.nextElementSibling;
    }
    section.hidden = !visible;
  });
});

const tocLinks = new Map(
  [...document.querySelectorAll(".page-toc a")].map((link) => [
    decodeURIComponent(link.hash.slice(1)),
    link,
  ]),
);

if (tocLinks.size && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (left, right) =>
            left.boundingClientRect.top - right.boundingClientRect.top,
        )[0];
      if (!visible) return;
      tocLinks.forEach((link, id) => {
        link.classList.toggle("is-active", id === visible.target.id);
      });
    },
    { rootMargin: "-12% 0px -76% 0px" },
  );
  tocLinks.forEach((_, id) => {
    const heading = document.getElementById(id);
    if (heading) observer.observe(heading);
  });
}

document.querySelectorAll("pre").forEach((pre) => {
  const code = pre.querySelector("code");
  if (!code) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-code";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = "Copied";
      window.setTimeout(() => (button.textContent = "Copy"), 1400);
    } catch {
      button.textContent = "Select text";
    }
  });
  pre.append(button);
});
