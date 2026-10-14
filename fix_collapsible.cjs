const fs = require("fs");
let content = fs.readFileSync("src/pages/portal/admin/AdminProyectos.tsx", "utf8");

// Add ChevronDown, ChevronUp to lucide-react imports if not there
if (!content.includes("ChevronDown")) {
    content = content.replace("import { Briefcase", "import { ChevronDown, ChevronUp, Briefcase");
}

// Add metadata?: any; to Activity interface
content = content.replace("description?: string;\n  createdAt: string;", "description?: string;\n  metadata?: any;\n  createdAt: string;");

// Insert CollapsibleActivityBody component right before AdminProyectos component
const componentStr = `
const CollapsibleActivityBody = ({ act }: { act: Activity }) => {
  const [expanded, setExpanded] = useState(false);
  if (!act.description) return null;

  if (act.type === 'AUTO_EMAIL') {
    return (
      <div style={{ marginTop: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setExpanded(!expanded)} 
          style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#475569', fontWeight: 500, fontSize: '0.9rem' }}
        >
          <span>{expanded ? 'Ocultar previsualización de correo' : 'Ver correo original (HTML)'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <div 
            style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: 'white', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }} 
            dangerouslySetInnerHTML={{ __html: act.description }} 
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
      {act.description}
    </div>
  );
};

export default function AdminProyectos() {
`;
content = content.replace("export default function AdminProyectos() {", componentStr);

// Replace act.title display to include WorkflowName if available
const oldTitleDisplay1 = `<strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>{act.title}</strong>`;
const newTitleDisplay1 = `<strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</strong>`;
content = content.replace(oldTitleDisplay1, newTitleDisplay1);

const oldTitleDisplay2 = `<strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{act.title}</strong>`;
const newTitleDisplay2 = `<strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</strong>`;
content = content.replace(oldTitleDisplay2, newTitleDisplay2);

// Replace {act.description && ( ... )} with <CollapsibleActivityBody act={act} />
// We need to be careful. There are two instances. Let's do a regex replacement.
const oldBodyRegex1 = /\{act\.description && \([\s\S]*?\{\s*act\.description\s*\}[\s\S]*?<\/div>\s*\)\s*\}/g;
content = content.replace(oldBodyRegex1, "<CollapsibleActivityBody act={act} />");

fs.writeFileSync("src/pages/portal/admin/AdminProyectos.tsx", content);
