import os
import re

seo_data = {
    'index.html': {
        'title': 'Jai Johar Family Restaurant | Authentic Jharkhand Cuisine in Dhanbad',
        'desc': 'Welcome to Jai Johar Family Restaurant in Dhanbad. Enjoy authentic, traditional Jharkhand thalis, tribal flavors, and wood-fired delicacies.',
        'keys': 'Jai Johar, Jharkhand cuisine, Dhanbad restaurant, tribal food, family restaurant, thali, Litti Chokha',
        'og_img': 'assets/images/img_f37bcfed61.jpg'
    },
    'about.html': {
        'title': 'Our Story | Jai Johar Family Restaurant',
        'desc': 'Discover the heritage and passion behind Jai Johar Family Restaurant. Learn about our local roots, traditional recipes, and family history in Dhanbad.',
        'keys': 'our story, restaurant history, Dhanbad heritage, tribal food history, family restaurant Dhanbad',
        'og_img': 'assets/images/img_2447cb01b8.jpg'
    },
    'contact.html': {
        'title': 'Contact & Location | Jai Johar Family Restaurant',
        'desc': 'Get in touch with Jai Johar Family Restaurant in Dhanbad. View our map, hours, and contact information to plan your visit.',
        'keys': 'contact Jai Johar, restaurant location Dhanbad, Dhanbad dining hours, restaurant contact',
        'og_img': 'assets/images/img_83781f50f7.jpg'
    },
    'gallery.html': {
        'title': 'Gallery | Jai Johar Family Restaurant',
        'desc': 'Explore the beautiful ambiance, traditional dishes, and happy customers at Jai Johar Family Restaurant in our photo gallery.',
        'keys': 'restaurant gallery, food photos Dhanbad, Jai Johar ambiance, traditional thali photos',
        'og_img': 'assets/images/img_2cd0f6446d.jpg'
    },
    'reservations.html': {
        'title': 'Book a Table | Jai Johar Family Restaurant',
        'desc': 'Reserve your table at Jai Johar Family Restaurant. Experience the finest authentic tribal cuisine in Dhanbad for your next family gathering.',
        'keys': 'book a table, restaurant reservations Dhanbad, dine-in Dhanbad, Jai Johar booking',
        'og_img': 'assets/images/img_ba8717d4f3.jpg'
    },
    'menu.html': {
        'title': 'Our Menu | Jai Johar Family Restaurant',
        'desc': 'Browse the Jai Johar Family Restaurant menu. Featuring authentic Jharkhand curries, vegetarian specialties, and traditional sweet delicacies.',
        'keys': 'Jharkhand menu, tribal food menu, Dhanbad restaurant menu, vegetarian thali, non-veg thali',
        'og_img': 'assets/images/img_f37bcfed61.jpg'
    },
    'admin.html': {
        'title': 'Admin Dashboard | Jai Johar',
        'desc': 'Admin dashboard for Jai Johar Family Restaurant.',
        'keys': '',
        'og_img': '',
        'noindex': True
    }
}

html_files = ['index.html', 'about.html', 'contact.html', 'gallery.html', 'reservations.html', 'menu.html', 'admin.html']

for file in html_files:
    if not os.path.exists(file):
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove existing <title> and <meta name="description"> tags
    content = re.sub(r'<title>.*?</title>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<meta\s+name=["\']description["\'].*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove existing SEO tags if we ran this before or they were placed differently
    content = re.sub(r'<meta\s+name=["\']keywords["\'].*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<meta\s+name=["\']robots["\'].*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<meta\s+name=["\']author["\'].*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<meta\s+property=["\']og:.*?["\'].*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<meta\s+name=["\']twitter:.*?["\'].*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    data = seo_data.get(file)
    if not data:
        continue
        
    title = data['title']
    desc = data['desc']
    keys = data['keys']
    img = data['og_img']
    is_admin = data.get('noindex', False)
    
    seo_block = f"""
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <meta name="keywords" content="{keys}">
    <meta name="author" content="Jai Johar Family Restaurant">
"""
    if is_admin:
        seo_block += '    <meta name="robots" content="noindex, nofollow">\n'
    else:
        seo_block += f"""    <meta name="robots" content="index, follow">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{img}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Jai Johar Family Restaurant">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{img}">
"""
    
    # insert seo_block just before </head> or after <meta name="viewport" ...>
    if '<meta name="viewport"' in content:
        # insert right after viewport
        content = re.sub(r'(<meta name="viewport" content="width=device-width, initial-scale=1.0">)', r'\1' + seo_block.replace('\\', '\\\\'), content, count=1)
    else:
        content = content.replace('</head>', seo_block + '</head>')
        
    # Clean up empty lines that might have been left behind
    content = re.sub(r'\n\s*\n', '\n', content)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("SEO patching complete.")
