const fs = require("fs");
let content = fs.readFileSync("src/pages/portal/admin/AdminProyectos.tsx", "utf8");

// First update the interface to include metadata
if (!content.includes("metadata?: any; // To store coupon etc")) {
    content = content.replace("referredBy?: any;", "referredBy?: any;\n    metadata?: any; // To store coupon etc");
}

// In the INBOX tab (Todo lo Recibido) - leads.map
// We want to replace the lead.referredBy logic with lead.metadata.coupon or lead.metadata.referredByUserId
const oldReferralCodeInbox = `{lead.referredBy && lead.referredBy.name ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Vino referido por: {lead.referredBy.name}
                            </div>
                          ) : lead.referredBy?.userId ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dbeafe', color: '#1e3a8a', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ ID Referidor: {lead.referredBy.userId}
                            </div>
                          ) : null}`;

const newReferralCodeInbox = `{lead.metadata?.coupon ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Cupón / Referido: {lead.metadata.coupon}
                            </div>
                          ) : lead.metadata?.referredByUserId ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dbeafe', color: '#1e3a8a', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ ID Referidor: {lead.metadata.referredByUserId}
                            </div>
                          ) : lead.referredBy && lead.referredBy.name ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Vino referido por: {lead.referredBy.name}
                            </div>
                          ) : null}`;

content = content.replace(oldReferralCodeInbox, newReferralCodeInbox);

// In the COMPANIES tab (Directorio de Empresas) - leads.map
// They are rendered as cards
const oldReferralCodeCompanies = `{lead.referredBy && (
                            <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Vino referido por: {lead.referredBy.name || lead.referredBy.userId || 'Usuario'}
                            </div>
                          )}`;

const newReferralCodeCompanies = `{(lead.metadata?.coupon || lead.metadata?.referredByUserId || lead.referredBy) && (
                            <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Ref: {lead.metadata?.coupon || lead.metadata?.referredByUserId || lead.referredBy?.name || 'Sí'}
                            </div>
                          )}`;

content = content.replace(oldReferralCodeCompanies, newReferralCodeCompanies);

fs.writeFileSync("src/pages/portal/admin/AdminProyectos.tsx", content);
