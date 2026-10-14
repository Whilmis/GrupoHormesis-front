filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the clear form bug on click
content = content.replace("setFormData({ guestName: '', guestEmail: '', notes: '' });", "setFormData({ guestName: formData.guestName || urlGuestName || '', guestEmail: formData.guestEmail || urlGuestEmail || '', notes: '' });")

# 2. Make the Name input editable
import re
content = re.sub(
    r'<input required type="text" value=\{formData\.guestName\} readOnly=\{!!urlGuestName\}(.*?)(background:.*?)(cursor:.*?)(color:.*?) \/>',
    r'<input required type="text" value={formData.guestName}\1background: \'white\', cursor: \'text\', color: \'inherit\' } />',
    content
)

# 3. Make the Email input editable
content = re.sub(
    r'<input required type="email" value=\{formData\.guestEmail\} readOnly=\{!!urlGuestEmail\}(.*?)(background:.*?)(cursor:.*?)(color:.*?) \/>',
    r'<input required type="email" value={formData.guestEmail}\1background: \'white\', cursor: \'text\', color: \'inherit\' } />',
    content
)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)
