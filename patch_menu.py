import os
import json

# 1. Update server.ts
with open('server.ts', 'r', encoding='utf-8') as f:
    server_code = f.read()

menu_endpoints = """
const MENU_FILE = path.join(process.cwd(), "menu.json");
if (!fs.existsSync(MENU_FILE)) {
  const defaultMenu = [
    { id: "1", name: "Traditional Jharkhand Thali", description: "A wholesome meal with rice, dal, chilka roti, rugda curry, and chutneys.", price: "₹350", category: "Thalis", image: "assets/images/img_3ce900d769.jpg" },
    { id: "2", name: "Dhuska & Mutton Curry", description: "Deep-fried rice batter served with spicy country-style mutton.", price: "₹450", category: "Mains", image: "assets/images/img_5e67f940cf.jpg" },
    { id: "3", name: "Handia (Rice Beer) - Mocktail", description: "A refreshing non-alcoholic take on the traditional tribal drink.", price: "₹120", category: "Beverages", image: "assets/images/img_25e3ed6ea2.jpg" },
    { id: "4", name: "Pitha Platter", description: "Assorted sweet and savory steamed rice cakes.", price: "₹200", category: "Desserts", image: "assets/images/img_3bff88f72e.jpg" }
  ];
  fs.writeFileSync(MENU_FILE, JSON.stringify(defaultMenu, null, 2), "utf-8");
}

app.get("/api/menu", (req, res) => {
  try {
    if (!fs.existsSync(MENU_FILE)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(MENU_FILE, "utf-8")));
  } catch (err) {
    res.status(500).json({ error: "Failed to read menu" });
  }
});

app.post("/api/menu", (req, res) => {
  try {
    fs.writeFileSync(MENU_FILE, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save menu" });
  }
});
"""

if '/api/menu' not in server_code:
    server_code = server_code.replace('app.get("/api/content",', menu_endpoints + '\napp.get("/api/content",')
    
    # modify /api/upload-image to not require key
    server_code = server_code.replace(
        'content[key] = newPath;',
        'if(key) { content[key] = newPath; }'
    )
    server_code = server_code.replace(
        'fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");',
        'if(key) { fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8"); }'
    )

    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(server_code)

# 2. Update menu.html
with open('menu.html', 'r', encoding='utf-8') as f:
    menu_html = f.read()

new_menu_section = """
<section class="section menu-page" style="padding-top: 40px;">
  <div class="container" id="menu-container">
    <div style="text-align: center; padding: 40px;">
      <h2 class="section-title">Loading Menu...</h2>
    </div>
  </div>
</section>
<script>
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("menu-container");
  if (!container) return;
  try {
    const res = await fetch("/api/menu");
    if (!res.ok) throw new Error("Failed to load menu");
    const menuItems = await res.json();
    
    // Group by category
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });
    
    container.innerHTML = ""; // clear loading
    
    for (const [cat, items] of Object.entries(categories)) {
      const catHeader = document.createElement("h2");
      catHeader.textContent = cat;
      catHeader.style.marginBottom = "32px";
      catHeader.style.marginTop = "48px";
      catHeader.style.borderBottom = "1px solid var(--border-bright)";
      catHeader.style.paddingBottom = "16px";
      catHeader.style.color = "var(--text)";
      
      const grid = document.createElement("div");
      grid.className = "bento-grid";
      
      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "bento-card bento-card--light";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.gap = "16px";
        
        card.innerHTML = `
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">` : ""}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
            <h3 style="margin:0; font-size: 20px; color: var(--text);">${item.name}</h3>
            <span style="font-weight: 600; color: var(--accent); font-size: 18px; white-space: nowrap;">${item.price}</span>
          </div>
          <p style="margin:0; color: var(--text-dim); line-height: 1.5; font-size: 15px;">${item.description}</p>
        `;
        grid.appendChild(card);
      });
      
      container.appendChild(catHeader);
      container.appendChild(grid);
    }
    
    if(menuItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px;">
          <h2 class="section-title">Our Menu is updating</h2>
          <p style="color: var(--text-dim); margin-top: 16px;">Please check back soon.</p>
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: red;">Failed to load menu.</div>`;
  }
});
</script>
"""

# Replace the "coming soon" section
import re
menu_html = re.sub(r'<section class="section section--centered menu-page">.*?</section>', new_menu_section, menu_html, flags=re.DOTALL)

with open('menu.html', 'w', encoding='utf-8') as f:
    f.write(menu_html)

print("Menu patched")
