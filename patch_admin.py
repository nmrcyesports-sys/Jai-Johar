import os
import re

with open('admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()
    
# Add nav item
if 'data-target="view-menu"' not in admin_html:
    admin_html = admin_html.replace(
        '<div class="admin-nav-item" data-target="view-cms">\n        Site Content\n      </div>',
        '<div class="admin-nav-item" data-target="view-cms">\n        Site Content\n      </div>\n      <div class="admin-nav-item" data-target="view-menu">\n        Menu Items\n      </div>'
    )
    
# Add view-menu section
new_view = """
      <!-- MENU VIEW -->
      <div class="admin-view" id="view-menu">
        <div class="admin-card" style="max-width: 1000px">
          <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2>Manage Menu</h2>
            <button class="btn btn--primary btn--sm" id="btn-add-menu">Add New Item</button>
          </div>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="table-menu">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Menu Form Modal (Hidden by default) -->
        <div class="admin-card" id="menu-form-container" style="display: none; max-width: 600px; margin-top: 24px;">
          <h3 id="menu-form-title">Add Menu Item</h3>
          <form id="menu-form" style="display:flex; flex-direction:column; gap:16px; margin-top: 16px;">
            <input type="hidden" id="menu-id" name="id">
            
            <div style="display:flex; gap: 16px;">
              <div style="flex:1;">
                <label style="font-size:12px;font-weight:600;color:var(--text-dim);display:block;margin-bottom:4px;">Item Name</label>
                <input type="text" id="menu-name" name="name" required style="width:100%; padding:10px; border:1px solid var(--border-bright); border-radius:4px;">
              </div>
              <div style="flex:1;">
                <label style="font-size:12px;font-weight:600;color:var(--text-dim);display:block;margin-bottom:4px;">Price</label>
                <input type="text" id="menu-price" name="price" required style="width:100%; padding:10px; border:1px solid var(--border-bright); border-radius:4px;">
              </div>
            </div>
            
            <div>
              <label style="font-size:12px;font-weight:600;color:var(--text-dim);display:block;margin-bottom:4px;">Category</label>
              <input type="text" id="menu-category" name="category" required style="width:100%; padding:10px; border:1px solid var(--border-bright); border-radius:4px;" list="cat-list">
              <datalist id="cat-list">
                <option value="Starters">
                <option value="Thalis">
                <option value="Mains">
                <option value="Breads">
                <option value="Desserts">
                <option value="Beverages">
              </datalist>
            </div>
            
            <div>
              <label style="font-size:12px;font-weight:600;color:var(--text-dim);display:block;margin-bottom:4px;">Description</label>
              <textarea id="menu-desc" name="description" rows="3" style="width:100%; padding:10px; border:1px solid var(--border-bright); border-radius:4px; resize:vertical;"></textarea>
            </div>
            
            <div>
              <label style="font-size:12px;font-weight:600;color:var(--text-dim);display:block;margin-bottom:4px;">Image</label>
              <div style="display:flex; gap:16px; align-items:flex-end;">
                <img id="menu-img-preview" src="" style="width:100px; height:100px; object-fit:cover; border-radius:8px; display:none; border:1px solid var(--border);">
                <input type="hidden" id="menu-image" name="image">
                <input type="file" id="menu-file-upload" accept="image/*" style="font-size: 14px;">
              </div>
            </div>
            
            <div style="display:flex; gap: 12px; margin-top: 8px;">
              <button type="submit" class="btn btn--primary">Save Item</button>
              <button type="button" class="btn btn--secondary" id="btn-cancel-menu" style="background:var(--surface); border:1px solid var(--border-bright); color:var(--text);">Cancel</button>
            </div>
          </form>
        </div>
      </div>
"""
if 'id="view-menu"' not in admin_html:
    admin_html = admin_html.replace('<!-- CMS VIEW -->', new_view + '\n      <!-- CMS VIEW -->')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(admin_html)

# Update js/admin.js
with open('js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

menu_logic = """
// Menu Logic
document.addEventListener("DOMContentLoaded", () => {
  const tableMenu = document.getElementById("table-menu");
  const formContainer = document.getElementById("menu-form-container");
  const menuForm = document.getElementById("menu-form");
  const btnAdd = document.getElementById("btn-add-menu");
  const btnCancel = document.getElementById("btn-cancel-menu");
  const imgPreview = document.getElementById("menu-img-preview");
  const fileUpload = document.getElementById("menu-file-upload");
  const hiddenImage = document.getElementById("menu-image");
  
  if(!tableMenu) return;

  let menuItems = [];

  const loadMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if(res.ok) {
        menuItems = await res.json();
        renderMenu();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const renderMenu = () => {
    tableMenu.innerHTML = "";
    menuItems.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          ${item.image ? `<img src="${item.image}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">` : `<div style="width:50px;height:50px;background:#eee;border-radius:4px;"></div>`}
        </td>
        <td style="font-weight:600;">${item.name}</td>
        <td><span class="admin-badge" style="background: #eef2ff; color: #4f46e5;">${item.category}</span></td>
        <td>${item.price}</td>
        <td>
          <button class="btn-action edit-menu-btn" data-id="${item.id}" style="color:var(--accent); font-weight:600; margin-right: 12px; cursor:pointer; background:none; border:none; padding:0;">Edit</button>
          <button class="btn-action delete-menu-btn" data-id="${item.id}" style="color:#ef4444; font-weight:600; cursor:pointer; background:none; border:none; padding:0;">Delete</button>
        </td>
      `;
      tableMenu.appendChild(tr);
    });

    document.querySelectorAll(".edit-menu-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const item = menuItems.find(i => i.id === id);
        if(item) openForm(item);
      });
    });

    document.querySelectorAll(".delete-menu-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        if(confirm("Are you sure you want to delete this item?")) {
          const id = e.target.getAttribute("data-id");
          menuItems = menuItems.filter(i => i.id !== id);
          await saveMenu();
        }
      });
    });
  };

  const saveMenu = async () => {
    try {
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuItems)
      });
      renderMenu();
    } catch (err) {
      console.error(err);
      alert("Failed to save menu");
    }
  };

  const openForm = (item = null) => {
    formContainer.style.display = "block";
    if(item) {
      document.getElementById("menu-form-title").textContent = "Edit Menu Item";
      document.getElementById("menu-id").value = item.id;
      document.getElementById("menu-name").value = item.name || "";
      document.getElementById("menu-price").value = item.price || "";
      document.getElementById("menu-category").value = item.category || "";
      document.getElementById("menu-desc").value = item.description || "";
      hiddenImage.value = item.image || "";
      
      if(item.image) {
        imgPreview.src = item.image;
        imgPreview.style.display = "block";
      } else {
        imgPreview.style.display = "none";
        imgPreview.src = "";
      }
    } else {
      document.getElementById("menu-form-title").textContent = "Add Menu Item";
      menuForm.reset();
      document.getElementById("menu-id").value = Date.now().toString();
      hiddenImage.value = "";
      imgPreview.style.display = "none";
      imgPreview.src = "";
    }
    formContainer.scrollIntoView({ behavior: 'smooth' });
  };

  btnAdd.addEventListener("click", () => openForm());
  btnCancel.addEventListener("click", () => {
    formContainer.style.display = "none";
    menuForm.reset();
  });

  fileUpload.addEventListener("change", async (e) => {
    if(e.target.files.length > 0) {
      const fd = new FormData();
      fd.append("image", e.target.files[0]);
      // Note: we removed the 'key' requirement in backend
      
      fileUpload.disabled = true;
      try {
        const res = await fetch("/api/upload-image", { method: "POST", body: fd });
        if(res.ok) {
          const data = await res.json();
          imgPreview.src = data.path;
          imgPreview.style.display = "block";
          hiddenImage.value = data.path;
        } else {
          alert("Image upload failed");
        }
      } catch(err) {
        console.error(err);
      }
      fileUpload.disabled = false;
    }
  });

  menuForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(menuForm);
    const itemData = Object.fromEntries(fd.entries());
    
    // Check if editing or adding
    const existingIdx = menuItems.findIndex(i => i.id === itemData.id);
    if(existingIdx >= 0) {
      menuItems[existingIdx] = itemData;
    } else {
      menuItems.push(itemData);
    }
    
    await saveMenu();
    formContainer.style.display = "none";
    menuForm.reset();
  });

  loadMenu();
});
"""

if '// Menu Logic' not in admin_js:
    with open('js/admin.js', 'a', encoding='utf-8') as f:
        f.write('\n' + menu_logic)

print("Admin patched")
