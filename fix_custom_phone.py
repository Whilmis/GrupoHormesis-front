filename = "src/pages/contacto/Contacto.tsx"
with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove my old fake CustomPhoneInput
content = re.sub(r'const CustomPhoneInput = \(\) => \{[\s\S]*?\};\n', '', content)

better_phone_input = """
const CustomPhoneInput = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+34', flag: '🇪🇸', name: 'España' });
  
  const countries = [
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+51', flag: '🇵🇪', name: 'Perú' },
    { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' }
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', width: '100%', position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginRight: '1rem', position: 'relative' }}
      >
        <span style={{ fontSize: '1.2rem' }}>{selectedCountry.flag}</span>
        <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{selectedCountry.code}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '110%', left: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 50, width: '200px', maxHeight: '200px', overflowY: 'auto' }}>
          {countries.map(c => (
            <div 
              key={c.code}
              onClick={() => { setSelectedCountry(c); setIsOpen(false); }}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
              <span style={{ fontSize: '0.9rem', color: '#1e293b', flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.code}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: '1px', height: '24px', background: '#e2e8f0', marginRight: '1rem' }}></div>
      <input 
        type="tel" 
        name="phone" 
        placeholder="600 000 000" 
        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b', padding: '0.25rem 0' }} 
      />
    </div>
  );
};
"""

content = content + "\n\n" + better_phone_input

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)
