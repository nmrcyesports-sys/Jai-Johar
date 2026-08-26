import os

with open('js/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

label_mapping = """
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
          
          "index.image1": "Home Page: Main Top Background Banner",
          "index.image2": "Home Page: Featured Dish 1 (Circle)",
          "index.image3": "Home Page: Featured Dish 2 (Circle)",
          "index.image4": "Home Page: Featured Dish 3 (Circle)",
          "index.image5": "Home Page: 'Our Story' Section Image",
          "index.image6": "Home Page: Mini Gallery Image 1",
          "index.image7": "Home Page: Mini Gallery Image 2",
          "index.image8": "Home Page: Mini Gallery Image 3",
          "index.image9": "Home Page: Mini Gallery Image 4",
          "index.image10": "Home Page: Mini Gallery Image 5",
          "index.image11": "Home Page: Mini Gallery Image 6",
          "index.image12": "Home Page: Testimonial Avatar 1",
          "index.image13": "Home Page: Testimonial Avatar 2",
          "index.image14": "Home Page: Testimonial Avatar 3",
          "index.image15": "Home Page: Footer Map Image",

          "about.image16": "About Page: Main Top Background Banner",
          "about.image17": "About Page: 'Our Roots' Section Image",
          "about.image18": "About Page: Team Member 1 Photo",
          "about.image19": "About Page: Team Member 2 Photo",
          "about.image20": "About Page: Team Member 3 Photo",
          "about.image21": "About Page: Team Member 4 Photo",
          "about.image22": "About Page: Footer Map Image",

          "contact.image23": "Contact Page: Main Top Background Banner",
          "contact.image24": "Contact Page: Footer Map Image",

          "gallery.image25": "Gallery Page: Main Top Background Banner",
          "gallery.image26": "Gallery Page: Grid Image 1",
          "gallery.image27": "Gallery Page: Grid Image 2",
          "gallery.image28": "Gallery Page: Grid Image 3",
          "gallery.image29": "Gallery Page: Grid Image 4",
          "gallery.image30": "Gallery Page: Grid Image 5",
          "gallery.image31": "Gallery Page: Grid Image 6",
          "gallery.image32": "Gallery Page: Grid Image 7",
          "gallery.image33": "Gallery Page: Grid Image 8",
          "gallery.image34": "Gallery Page: Grid Image 9",
          "gallery.image35": "Gallery Page: Grid Image 10",
          "gallery.image36": "Gallery Page: Grid Image 11",
          "gallery.image37": "Gallery Page: Grid Image 12",
          "gallery.image38": "Gallery Page: Testimonial Avatar 1",
          "gallery.image39": "Gallery Page: Testimonial Avatar 2",
          "gallery.image40": "Gallery Page: Testimonial Avatar 3",
          "gallery.image41": "Gallery Page: Footer Map Image",

          "reservations.image42": "Reservations Page: Main Top Background Banner",
          "reservations.image43": "Reservations Page: Footer Map Image",

          "menu.image44": "Menu Page: Main Top Background Banner",
          "menu.image45": "Menu Page: Footer Map Image"
        };
"""

target = "label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/\\./g, ' › ').toUpperCase();"
replacement = label_mapping + r"        label.textContent = friendlyLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/\./g, ' › ').toUpperCase();"

if target in admin_js:
    admin_js = admin_js.replace(target, replacement)
    with open('js/admin.js', 'w', encoding='utf-8') as f:
        f.write(admin_js)
    print("Labels patched successfully.")
else:
    print("Target string not found in js/admin.js.")
