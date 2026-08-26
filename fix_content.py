import json

with open('content.json', 'r') as f:
    content = json.load(f)

for key, val in content.items():
    if val.startswith('src="') and val.endswith('"'):
        content[key] = val[5:-1]

with open('content.json', 'w') as f:
    json.dump(content, f, indent=2)

print("Fixed content.json!")
