import sys

filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

# Add jwt-decode and Lock import
if "import { jwtDecode } from 'jwt-decode';" not in ts:
    ts = ts.replace("import { Clock, User, Mail, CheckCircle, AlertCircle, X } from 'lucide-react';", "import { Clock, User, Mail, CheckCircle, AlertCircle, X, Lock } from 'lucide-react';\nimport { jwtDecode } from 'jwt-decode';")

# Update Params reading
old_params = """  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId'); 
  const urlGuestName = searchParams.get('guestName');
  const urlGuestEmail = searchParams.get('guestEmail');"""

new_params = """  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  let urlGuestName = searchParams.get('guestName') || '';
  let urlGuestEmail = searchParams.get('guestEmail') || '';
  let urlLeadId = searchParams.get('leadId') || '';
  let isSecureToken = false;
  
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.guestName) urlGuestName = decoded.guestName;
      if (decoded.guestEmail) urlGuestEmail = decoded.guestEmail;
      if (decoded.leadId) urlLeadId = decoded.leadId;
      isSecureToken = true;
    } catch (e) {
      console.error("Token de seguridad inválido", e);
    }
  } else {
    // Si no hay token, intentamos usar los legacy estáticos por si acaso
    urlLeadId = searchParams.get('leadId') || urlLeadId;
  }"""
ts = ts.replace(old_params, new_params)


# Add leadId to formData state
old_form_state = "const [formData, setFormData] = useState({ guestName: urlGuestName || '', guestEmail: urlGuestEmail || '', notes: '' });"
new_form_state = "const [formData, setFormData] = useState({ guestName: urlGuestName || '', guestEmail: urlGuestEmail || '', notes: '', leadId: urlLeadId || '' });"
ts = ts.replace(old_form_state, new_form_state)

# Add leadId to handleBook body
old_body = """      const response = await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify({
          startTime: bookingModal.start,
          endTime: bookingModal.end,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          notes: formData.notes
        })
      });"""

new_body = """      const response = await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify({
          startTime: bookingModal.start,
          endTime: bookingModal.end,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          notes: formData.notes,
          leadId: formData.leadId || undefined
        })
      });"""
ts = ts.replace(old_body, new_body)

# Change Input labels and readOnly behavior for Secure Token
old_name_label = """<label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Nombre Completo</label>"""
new_name_label = """<label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Nombre Completo {isSecureToken && <Lock size={14} color="#10b981" />}</label>"""
ts = ts.replace(old_name_label, new_name_label)

old_email_label = """<label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Correo Electrónico</label>"""
new_email_label = """<label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Correo Electrónico {isSecureToken && <Lock size={14} color="#10b981" />}</label>"""
ts = ts.replace(old_email_label, new_email_label)


with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated PublicBooking with JWT decode logic")
