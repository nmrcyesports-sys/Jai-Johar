import os
import re
import urllib.request
import hashlib

# Ensure assets/images directory exists
os.makedirs('assets/images', exist_ok=True)

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

url_pattern = re.compile(r'https://images\.unsplash\.com/[^"\'\s]+')

downloaded = {}

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    urls = set(url_pattern.findall(content))
    
    for url in urls:
        if url not in downloaded:
            # Create a short hash for filename
            url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()[:10]
            filename = f"img_{url_hash}.jpg"
            filepath = os.path.join('assets', 'images', filename)
            
            print(f"Downloading {url} to {filepath}...")
            try:
                # Add a user-agent to avoid 403 Forbidden
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                    out_file.write(response.read())
                downloaded[url] = f"assets/images/{filename}"
            except Exception as e:
                print(f"Failed to download {url}: {e}")
                
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace URLs with local paths
    for url, local_path in downloaded.items():
        content = content.replace(url, local_path)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done replacing images!")
