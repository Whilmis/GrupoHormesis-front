const fs = require("fs");
let content = fs.readFileSync("src/pages/portal/admin/AdminProyectos.tsx", "utf8");

const oldTitleDisplay1 = `<strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</strong>`;
const newTitleDisplay1 = `<strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
  <span>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</span>
  {act.metadata?.coupon && (
    <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e3a8a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      🎟️ Cupón de Referido: {act.metadata.coupon}
    </span>
  )}
</strong>`;
content = content.replace(oldTitleDisplay1, newTitleDisplay1);

const oldTitleDisplay2 = `<strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</strong>`;
const newTitleDisplay2 = `<strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
  <span>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</span>
  {act.metadata?.coupon && (
    <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e3a8a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      🎟️ Cupón: {act.metadata.coupon}
    </span>
  )}
</strong>`;
content = content.replace(oldTitleDisplay2, newTitleDisplay2);

fs.writeFileSync("src/pages/portal/admin/AdminProyectos.tsx", content);
