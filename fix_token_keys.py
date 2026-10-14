filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("if (decoded.guestName) urlGuestName = decoded.guestName;", "if (decoded.guestName || decoded.name) urlGuestName = decoded.guestName || decoded.name;")
content = content.replace("if (decoded.guestEmail) urlGuestEmail = decoded.guestEmail;", "if (decoded.guestEmail || decoded.email) urlGuestEmail = decoded.guestEmail || decoded.email;")

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)
