filename = "src/pages/contacto/Contacto.tsx"
with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("eec6f7e7-7706-4b50-8cad-987b1a2fef61", "757c17df-73ea-4427-9ba0-88396360b457")

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)
