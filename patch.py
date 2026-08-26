import os
import re
import json

with open('package.json', 'r') as f:
    pkg = f.read()
if 'cp -r assets dist/' not in pkg:
    pkg = pkg.replace('cp -r css dist/"', 'cp -r css dist/ && cp -r assets dist/"')
    with open('package.json', 'w') as f:
        f.write(pkg)

try:
    with open('content.json', 'r') as f:
        content = json.load(f)
except:
    content = {}

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'admin.html']
img_counter = 1

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    def repl(m):
        global img_counter
        tag = m.group(0)
        if 'data-cms-img' in tag:
            return tag
        src = m.group(2)
        
        prefix = file.split('.')[0]
        key = f"{prefix}.image{img_counter}"
        img_counter += 1
        
        content[key] = src
        return tag.replace('src=', f'data-cms-img="{key}" src=')
        
    new_html = re.sub(r'(<img[^>]*?)(src="(assets/images/[^"]+)")([^>]*>)', repl, html)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_html)

with open('content.json', 'w', encoding='utf-8') as f:
    json.dump(content, f, indent=2)

cms_js = """
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
"""
with open('js/cms.js', 'w', encoding='utf-8') as f:
    f.write(cms_js.strip())

with open('js/admin.js', 'r') as f:
    admin = f.read()
    
new_cms_logic = """// CMS Logic
document.addEventListener("DOMContentLoaded", async () => {
  const cmsContainer = document.getElementById("cms-fields-container");
  const cmsForm = document.getElementById("cms-form");
  if(!cmsContainer || !cmsForm) return;

  try {
    const res = await fetch("/api/content");
    if (res.ok) {
      const data = await res.json();
      for (const [key, value] of Object.entries(data)) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "4px";
        wrapper.style.marginBottom = "12px";
        wrapper.style.paddingBottom = "12px";
        wrapper.style.borderBottom = "1px solid var(--border-bright)";

        const label = document.createElement("label");
        label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/\\./g, ' › ').toUpperCase();
        label.style.fontSize = "12px";
        label.style.fontWeight = "600";
        label.style.letterSpacing = "0.5px";
        label.style.color = "var(--text-dim)";

        wrapper.appendChild(label);

        if (typeof value === 'string' && value.startsWith('assets/images/')) {
          const imgPreview = document.createElement("img");
          imgPreview.src = value;
          imgPreview.style.width = "200px";
          imgPreview.style.height = "120px";
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
        }
        cmsContainer.appendChild(wrapper);
      }
    }
  } catch(err) {
    console.error("Failed to load CMS content:", err);
  }

  cmsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(cmsForm);
    const updatedData = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if(res.ok) {
        if(window.showToast) window.showToast("Saved!", "Changes are live on the website.");
        else alert("Content saved successfully! Changes are live on the website.");
      } else {
        alert("Failed to save content.");
      }
    } catch(err) {
      console.error(err);
      alert("Error saving content.");
    }
  });
});
"""

idx = admin.find('// CMS Logic')
if idx != -1:
    admin = admin[:idx] + new_cms_logic
    with open('js/admin.js', 'w') as f:
        f.write(admin)
