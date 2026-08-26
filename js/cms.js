document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) return;
    const content = await response.json();
    
    const elements = document.querySelectorAll("[data-cms-key]");
    elements.forEach(el => {
      const key = el.getAttribute("data-cms-key");
      if (content[key]) {
        el.innerHTML = content[key];
      }
    });

    const imgElements = document.querySelectorAll("[data-cms-img]");
    imgElements.forEach(el => {
      const key = el.getAttribute("data-cms-img");
      if (content[key]) {
        el.src = content[key];
      }
    });
  } catch (err) {
    console.error("Failed to load CMS content", err);
  }
});