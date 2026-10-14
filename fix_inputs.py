filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

# Add URL params extraction
old_params = """  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId'); 
  
  const [calendar, setCalendar] = useState<any>(null);"""

new_params = """  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId'); 
  const urlGuestName = searchParams.get('guestName');
  const urlGuestEmail = searchParams.get('guestEmail');
  
  const [calendar, setCalendar] = useState<any>(null);"""
ts = ts.replace(old_params, new_params)

# Add default form data
old_form_data = "const [formData, setFormData] = useState({ guestName: '', guestEmail: '', notes: '' });"
new_form_data = "const [formData, setFormData] = useState({ guestName: urlGuestName || '', guestEmail: urlGuestEmail || '', notes: '' });"
ts = ts.replace(old_form_data, new_form_data)

# Update inputs
old_name_input = """<input required type="text" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} placeholder="Ej. Juan Pérez" />"""
new_name_input = """<input required type="text" value={formData.guestName} readOnly={!!urlGuestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: urlGuestName ? '#f1f5f9' : 'white', cursor: urlGuestName ? 'not-allowed' : 'text', color: urlGuestName ? '#64748b' : 'inherit' }} placeholder="Ej. Juan Pérez" />"""
ts = ts.replace(old_name_input, new_name_input)

old_email_input = """<input required type="email" value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} placeholder="ejemplo@correo.com" />"""
new_email_input = """<input required type="email" value={formData.guestEmail} readOnly={!!urlGuestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: urlGuestEmail ? '#f1f5f9' : 'white', cursor: urlGuestEmail ? 'not-allowed' : 'text', color: urlGuestEmail ? '#64748b' : 'inherit' }} placeholder="ejemplo@correo.com" />"""
ts = ts.replace(old_email_input, new_email_input)

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated PublicBooking inputs")
