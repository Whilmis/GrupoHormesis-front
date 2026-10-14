filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("color: 'inherit' } />", "color: 'inherit' }} />")

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)
