import os
import re

with open('admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()
    
# Add nav item
if 'data-target="view-images"' not in admin_html:
    admin_html = admin_html.replace(
        '<div class="admin-nav-item" data-target="view-cms">\n        Site Content\n      </div>',
        '<div class="admin-nav-item" data-target="view-cms">\n        Text Content\n      </div>\n      <div class="admin-nav-item" data-target="view-images">\n        Image Manager\n      </div>'
    )
    
# Add view-images section
new_view = """
      <!-- IMAGES VIEW -->
      <div class="admin-view" id="view-images">
        <div class="admin-card" style="max-width: 1000px">
          <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2>Image Manager</h2>
            <p style="color: var(--text-dim); margin:0;">Upload and change images across your website.</p>
          </div>
          <form id="images-form">
            <div id="images-fields-container" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:24px;">
              <!-- Fields injected by JS -->
            </div>
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-bright);">
              <button type="submit" class="btn btn--primary">Save All Changes</button>
            </div>
          </form>
        </div>
      </div>
"""
if 'id="view-images"' not in admin_html:
    admin_html = admin_html.replace('<!-- CMS VIEW -->', new_view + '\n      <!-- CMS VIEW -->')

# Update title of CMS View to "Text Content"
admin_html = admin_html.replace('<h2>Site Content</h2>', '<h2>Text Content</h2>')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(admin_html)

# Update js/admin.js
with open('js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

# Replace the single loop with two loops, one for text, one for images
target = """      for (const [key, value] of Object.entries(data)) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "4px";
        wrapper.style.marginBottom = "12px";
        wrapper.style.paddingBottom = "12px";
        wrapper.style.borderBottom = "1px solid var(--border-bright)";

        const label = document.createElement("label");"""

if 'imagesContainer' not in admin_js:
    admin_js = admin_js.replace(
        'const cmsForm = document.getElementById("cms-form");',
        'const cmsForm = document.getElementById("cms-form");\n  const imagesContainer = document.getElementById("images-fields-container");\n  const imagesForm = document.getElementById("images-form");'
    )
    
    # We will just rewrite the JS loop
    old_loop_start = admin_js.find('for (const [key, value] of Object.entries(data)) {')
    old_loop_end = admin_js.find('cmsContainer.appendChild(wrapper);') + len('cmsContainer.appendChild(wrapper);\n      }')
    
    new_loop = """
      for (const [key, value] of Object.entries(data)) {
        const isImage = (typeof value === 'string' && value.startsWith('assets/images/'));
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "4px";
        wrapper.style.marginBottom = "12px";
        wrapper.style.paddingBottom = "12px";
        
        if (isImage) {
            wrapper.style.border = "1px solid var(--border-bright)";
            wrapper.style.padding = "16px";
            wrapper.style.borderRadius = "8px";
            wrapper.style.background = "var(--surface-2)";
        } else {
            wrapper.style.borderBottom = "1px solid var(--border-bright)";
        }

        const label = document.createElement("label");
        const friendlyLabels = {
          "home.heroTitle": "Home Page: Main Hero Title",
          "home.heroSubtitle": "Home Page: Main Hero Subtitle",
          "about.title": "About Page: Main Title",
          "about.subtitle": "About Page: Subtitle",
          "about.text1": "About Page: Story Paragraph 1",
          "about.text2": "About Page: Story Paragraph 2",
          "menu.title": "Menu Page: Main Title",
          "menu.subtitle": "Menu Page: Subtitle",
          "contact.title": "Contact Page: Main Title",
          "contact.subtitle": "Contact Page: Subtitle",
          "contact.phone": "Global: Contact Phone Number",
          "contact.email": "Global: Contact Email",
          "contact.address": "Global: Contact Physical Address",
          "reservations.title": "Reservations Page: Main Title",
          "reservations.subtitle": "Reservations Page: Subtitle",
          "footer.about": "Global: Footer About Text",
          
          "index.image1": "Home: Top Banner",
          "index.image2": "Home: Circle 1",
          "index.image3": "Home: Circle 2",
          "index.image4": "Home: Circle 3",
          "index.image5": "Home: Story Image",
          "index.image6": "Home: Mini Gallery 1",
          "index.image7": "Home: Mini Gallery 2",
          "index.image8": "Home: Mini Gallery 3",
          "index.image9": "Home: Mini Gallery 4",
          "index.image10": "Home: Mini Gallery 5",
          "index.image11": "Home: Mini Gallery 6",
          "index.image12": "Home: Avatar 1",
          "index.image13": "Home: Avatar 2",
          "index.image14": "Home: Avatar 3",
          "index.image15": "Home: Map",
          "about.image16": "About: Top Banner",
          "about.image17": "About: Roots Image",
          "about.image18": "About: Team 1",
          "about.image19": "About: Team 2",
          "about.image20": "About: Team 3",
          "about.image21": "About: Team 4",
          "about.image22": "About: Map",
          "contact.image23": "Contact: Top Banner",
          "contact.image24": "Contact: Map",
          "gallery.image25": "Gallery: Top Banner",
          "gallery.image26": "Gallery: Grid 1",
          "gallery.image27": "Gallery: Grid 2",
          "gallery.image28": "Gallery: Grid 3",
          "gallery.image29": "Gallery: Grid 4",
          "gallery.image30": "Gallery: Grid 5",
          "gallery.image31": "Gallery: Grid 6",
          "gallery.image32": "Gallery: Grid 7",
          "gallery.image33": "Gallery: Grid 8",
          "gallery.image34": "Gallery: Grid 9",
          "gallery.image35": "Gallery: Grid 10",
          "gallery.image36": "Gallery: Grid 11",
          "gallery.image37": "Gallery: Grid 12",
          "gallery.image38": "Gallery: Avatar 1",
          "gallery.image39": "Gallery: Avatar 2",
          "gallery.image40": "Gallery: Avatar 3",
          "gallery.image41": "Gallery: Map",
          "reservations.image42": "Reservations: Banner",
          "reservations.image43": "Reservations: Map",
          "menu.image44": "Menu: Banner",
          "menu.image45": "Menu: Map"
        };
        label.textContent = friendlyLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/\./g, ' › ').toUpperCase();
        label.style.fontSize = "12px";
        label.style.fontWeight = "600";
        label.style.letterSpacing = "0.5px";
        label.style.color = isImage ? "var(--text)" : "var(--text-dim)";
        wrapper.appendChild(label);

        if (isImage) {
          const imgPreview = document.createElement("img");
          imgPreview.src = value;
          imgPreview.style.width = "100%";
          imgPreview.style.height = "160px";
          imgPreview.style.objectFit = "cover";
          imgPreview.style.borderRadius = "8px";
          imgPreview.style.marginBottom = "8px";
          imgPreview.style.border = "1px solid var(--border)";

          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.name = key;
          hiddenInput.value = value;

          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.style.fontSize = "12px";
          fileInput.style.width = "100%";
          
          fileInput.addEventListener("change", async (e) => {
            if(e.target.files.length > 0) {
              const fd = new FormData();
              fd.append("image", e.target.files[0]);
              fd.append("key", key);
              
              fileInput.disabled = true;
              
              const uploadRes = await fetch("/api/upload-image", {
                method: "POST",
                body: fd
              });
              if(uploadRes.ok) {
                const uploadData = await uploadRes.json();
                imgPreview.src = uploadData.path;
                hiddenInput.value = uploadData.path;
                if(window.showToast) window.showToast('Updated!', 'Image uploaded and live.');
                else alert("Image updated live!");
              } else {
                alert("Failed to upload image.");
              }
              fileInput.disabled = false;
            }
          });

          wrapper.appendChild(imgPreview);
          wrapper.appendChild(hiddenInput);
          wrapper.appendChild(fileInput);
          if (imagesContainer) imagesContainer.appendChild(wrapper);
        } else {
          let input;
          if (value.length > 60) {
            input = document.createElement("textarea");
            input.rows = 4;
            input.style.resize = "vertical";
          } else {
            input = document.createElement("input");
            input.type = "text";
          }
          
          input.name = key;
          input.value = value;
          input.style.padding = "10px";
          input.style.border = "1px solid var(--border-bright)";
          input.style.borderRadius = "4px";
          input.style.fontFamily = "inherit";
          input.style.fontSize = "14px";
          input.style.background = "var(--surface)";
          input.style.color = "var(--text)";
          
          wrapper.appendChild(input);
          cmsContainer.appendChild(wrapper);
        }
      }
"""
    
    admin_js = admin_js[:old_loop_start] + new_loop + admin_js[old_loop_end:]
    
    # Also we need to attach submit to imagesForm
    submit_logic = """
  if(imagesForm) {
    imagesForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(imagesForm);
      const updatedData = Object.fromEntries(formData.entries());
      
      // Merge with text content data so we don't wipe it out!
      try {
          const resOrig = await fetch("/api/content");
          const origData = await resOrig.json();
          const finalData = { ...origData, ...updatedData };
          
          const res = await fetch("/api/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalData)
          });
          if(res.ok) {
            if(window.showToast) window.showToast("Saved!", "Image changes are live.");
            else alert("Image changes saved!");
          }
      } catch (err) {}
    });
  }
"""
    # Let's fix cmsForm submit logic too (to not wipe out image data!)
    cms_submit_logic = """
  cmsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(cmsForm);
    const updatedData = Object.fromEntries(formData.entries());
    
    try {
      const resOrig = await fetch("/api/content");
      const origData = await resOrig.json();
      const finalData = { ...origData, ...updatedData };
      
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData)
      });
      if(res.ok) {
        if(window.showToast) window.showToast("Saved!", "Text changes are live.");
        else alert("Content saved successfully!");
      } else {
        alert("Failed to save content.");
      }
    } catch(err) {
      console.error(err);
      alert("Error saving content.");
    }
  });
"""
    
    # Replace the existing cmsForm submit logic
    old_submit_start = admin_js.find('cmsForm.addEventListener("submit", async (e) => {')
    old_submit_end = admin_js.find('});', old_submit_start) + 3
    
    admin_js = admin_js[:old_submit_start] + cms_submit_logic + submit_logic + admin_js[old_submit_end:]

    with open('js/admin.js', 'w', encoding='utf-8') as f:
        f.write(admin_js)

print("Images tab separated successfully")
