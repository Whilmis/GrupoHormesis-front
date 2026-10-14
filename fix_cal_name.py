filename = "src/pages/portal/admin/AdminWorkflows.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

ts = ts.replace("<option key={cal.id} value={cal.id}>{cal.name}</option>", "<option key={cal.id} value={cal.id}>{cal.name || 'Sin nombre (' + cal.id + ')'}</option>")

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)
