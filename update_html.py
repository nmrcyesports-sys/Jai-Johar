import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'admin.html']

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Inject cms.js before main.js if not there
    if 'js/cms.js' not in content:
        content = content.replace('<script src="js/main.js"></script>', '<script src="js/cms.js"></script>\n  <script src="js/main.js"></script>')

    # Add data-cms-key for headers common pattern: <h1 class="page-header__title">...</h1>
    content = re.sub(r'(<h1 class="page-header__title">)(.*?)(</h1>)', 
                     lambda m: m.group(1) + f'<span data-cms-key="{file.split(".")[0]}.title">' + m.group(2) + '</span>' + m.group(3), 
                     content, flags=re.DOTALL)
                     
    content = re.sub(r'(<p class="page-header__subtitle">)(.*?)(</p>)', 
                     lambda m: m.group(1) + f'<span data-cms-key="{file.split(".")[0]}.subtitle">' + m.group(2) + '</span>' + m.group(3), 
                     content, flags=re.DOTALL)

    if file == 'index.html':
        content = re.sub(r'(<h1 class="hero__title[^>]*>)(.*?)(</h1>)', r'\1<span data-cms-key="home.heroTitle">\2</span>\3', content, flags=re.DOTALL)
        content = re.sub(r'(<p class="hero__subtitle[^>]*>)(.*?)(</p>)', r'\1<span data-cms-key="home.heroSubtitle">\2</span>\3', content, flags=re.DOTALL)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Updated HTML files with CMS tags")
