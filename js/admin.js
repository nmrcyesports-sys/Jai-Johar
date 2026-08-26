/* ============================================
   JAI JOHAR — Admin Dashboard Logic
   ============================================ */

(function () {
  'use strict';

  // State
  var data = {
    reservations: [],
    messages: [],
    subscribers: []
  };

  // DOM Elements
  var navItems = document.querySelectorAll('.admin-nav-item');
  var views = document.querySelectorAll('.admin-view');
  var pageTitle = document.getElementById('admin-page-title');
  var dateEl = document.getElementById('admin-current-date');
  
  var tBodies = {
    reservations: document.getElementById('tbody-reservations'),
    messages: document.getElementById('tbody-messages'),
    subscribers: document.getElementById('tbody-subscribers')
  };

  var badges = {
    reservations: document.getElementById('badge-reservations'),
    messages: document.getElementById('badge-messages'),
    subscribers: document.getElementById('badge-subscribers')
  };

  // Init
  function init() {
    setDate();
    loadData();
    renderAll();
    setupNavigation();
  }

  function setDate() {
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }

  function loadData() {
    data.reservations = JSON.parse(localStorage.getItem('jaijohar_reservations') || '[]');
    data.messages = JSON.parse(localStorage.getItem('jaijohar_messages') || '[]');
    data.subscribers = JSON.parse(localStorage.getItem('jaijohar_subscribers') || '[]');
    
    // Sort descending by date
    data.reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    data.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    data.subscribers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function saveData(type) {
    if (type === 'reservations') localStorage.setItem('jaijohar_reservations', JSON.stringify(data.reservations));
    if (type === 'messages') localStorage.setItem('jaijohar_messages', JSON.stringify(data.messages));
    if (type === 'subscribers') localStorage.setItem('jaijohar_subscribers', JSON.stringify(data.subscribers));
    updateBadges();
  }

  function setupNavigation() {
    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        navItems.forEach(n => n.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        item.classList.add('active');
        var targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
        
        // Update Title
        var title = item.textContent.replace(/[0-9]/g, '').trim();
        if (pageTitle) pageTitle.textContent = title;
      });
    });
  }

  function updateBadges() {
    var pendingRes = data.reservations.filter(r => r.status === 'Pending').length;
    var unreadMsg = data.messages.filter(m => m.status === 'Unread').length;
    var subs = data.subscribers.length;

    if (badges.reservations) badges.reservations.textContent = pendingRes;
    if (badges.messages) badges.messages.textContent = unreadMsg;
    if (badges.subscribers) badges.subscribers.textContent = subs;
  }

  // ---- RENDERERS ----

  function renderEmpty(colspan, message) {
    return `
      <tr>
        <td colspan="${colspan}">
          <div class="admin-empty-state">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <p>${message}</p>
          </div>
        </td>
      </tr>
    `;
  }

  function renderReservations() {
    if (!tBodies.reservations) return;
    if (data.reservations.length === 0) {
      tBodies.reservations.innerHTML = renderEmpty(5, "No reservations yet.");
      return;
    }

    tBodies.reservations.innerHTML = data.reservations.map((res, index) => {
      var badgeClass = res.status === 'Confirmed' ? 'confirmed' : 'pending';
      var niceDate = new Date(res.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // format time
      var d = new Date(`2000-01-01T${res.time}`);
      var niceTime = isNaN(d.getTime()) ? res.time : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      var extras = [];
      if(res.occasion) extras.push(res.occasion);
      if(res.notes) extras.push(res.notes);

      return `
        <tr>
          <td>
            <span class="admin-cell-title">${escapeHTML(res.name)}</span>
            <span class="admin-cell-sub">${escapeHTML(res.phone)}<br>${escapeHTML(res.email)}</span>
          </td>
          <td>
            <span class="admin-cell-title">${niceDate}</span>
            <span class="admin-cell-sub">${niceTime}</span>
          </td>
          <td>
            <span class="admin-cell-title">${escapeHTML(res.guests)} Guests</span>
            <span class="admin-cell-sub" style="max-width: 250px">${escapeHTML(extras.join(' — '))}</span>
          </td>
          <td>
            <span class="admin-badge ${badgeClass}">${res.status}</span>
          </td>
          <td>
            <div class="admin-actions" style="justify-content: flex-end;">
              ${res.status === 'Pending' ? `
                <button class="admin-btn-icon success" title="Confirm Reservation" onclick="window.adminActions.updateRes('${res.id}', 'Confirmed')">
                  <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                </button>
              ` : ''}
              <button class="admin-btn-icon" title="Delete" onclick="window.adminActions.deleteRes('${res.id}')">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderMessages() {
    if (!tBodies.messages) return;
    if (data.messages.length === 0) {
      tBodies.messages.innerHTML = renderEmpty(5, "No messages yet.");
      return;
    }

    tBodies.messages.innerHTML = data.messages.map((msg, index) => {
      var badgeClass = msg.status === 'Read' ? 'read' : 'unread';
      var niceDate = new Date(msg.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      return `
        <tr>
          <td>
            <span class="admin-cell-title">${escapeHTML(msg.name)}</span>
            <span class="admin-cell-sub">${escapeHTML(msg.email)}<br>${escapeHTML(msg.phone)}</span>
          </td>
          <td>
            <span class="admin-cell-title">${escapeHTML(msg.subject) || 'No Subject'}</span>
            <span class="admin-cell-sub" style="max-width: 300px">${escapeHTML(msg.message)}</span>
          </td>
          <td>
            <span class="admin-cell-sub">${niceDate}</span>
          </td>
          <td>
            <span class="admin-badge ${badgeClass}">${msg.status}</span>
          </td>
          <td>
            <div class="admin-actions" style="justify-content: flex-end;">
              ${msg.status === 'Unread' ? `
                <button class="admin-btn-icon success" title="Mark as Read" onclick="window.adminActions.updateMsg('${msg.id}', 'Read')">
                  <svg viewBox="0 0 24 24"><path d="M2 12l5.25 5 2.625-3M8 12l5.25 5L22 7"/></svg>
                </button>
              ` : ''}
              <button class="admin-btn-icon" title="Delete" onclick="window.adminActions.deleteMsg('${msg.id}')">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderSubscribers() {
    if (!tBodies.subscribers) return;
    if (data.subscribers.length === 0) {
      tBodies.subscribers.innerHTML = renderEmpty(3, "No subscribers yet.");
      return;
    }

    tBodies.subscribers.innerHTML = data.subscribers.map((sub, index) => {
      var niceDate = new Date(sub.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      
      return `
        <tr>
          <td>
            <span class="admin-cell-title">${escapeHTML(sub.email)}</span>
          </td>
          <td>
            <span class="admin-cell-sub">${niceDate}</span>
          </td>
          <td>
            <div class="admin-actions" style="justify-content: flex-end;">
              <button class="admin-btn-icon" title="Remove" onclick="window.adminActions.deleteSub('${sub.id}')">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderAll() {
    updateBadges();
    renderReservations();
    renderMessages();
    renderSubscribers();
  }

  // Simple HTML escaper
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Expose actions to global scope for inline onclick handlers
  window.adminActions = {
    updateRes: function(id, status) {
      var item = data.reservations.find(r => r.id === id);
      if(item) {
        item.status = status;
        saveData('reservations');
        renderReservations();
      }
    },
    deleteRes: function(id) {
      if(confirm('Delete this reservation?')) {
        data.reservations = data.reservations.filter(r => r.id !== id);
        saveData('reservations');
        renderReservations();
      }
    },
    updateMsg: function(id, status) {
      var item = data.messages.find(m => m.id === id);
      if(item) {
        item.status = status;
        saveData('messages');
        renderMessages();
      }
    },
    deleteMsg: function(id) {
      if(confirm('Delete this message?')) {
        data.messages = data.messages.filter(m => m.id !== id);
        saveData('messages');
        renderMessages();
      }
    },
    deleteSub: function(id) {
      if(confirm('Remove this subscriber?')) {
        data.subscribers = data.subscribers.filter(s => s.id !== id);
        saveData('subscribers');
        renderSubscribers();
      }
    }
  };

  // Run
  document.addEventListener('DOMContentLoaded', init);
})();

// CMS Logic
document.addEventListener("DOMContentLoaded", async () => {
  const cmsContainer = document.getElementById("cms-fields-container");
  const cmsForm = document.getElementById("cms-form");
  const imagesContainer = document.getElementById("images-fields-container");
  const imagesForm = document.getElementById("images-form");
  if(!cmsContainer || !cmsForm) return;

  try {
    const res = await fetch("/api/content");
    if (res.ok) {
      const data = await res.json();
      
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

    }
  } catch(err) {
    console.error("Failed to load CMS content:", err);
  }

  
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
});



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
