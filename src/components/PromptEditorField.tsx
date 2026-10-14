import React, { useState } from "react";
import "./PromptEditorField.css";

interface PromptVariable {
  tag: string;
  description: string;
}

interface PromptTemplate {
  title: string;
  content: string;
}

interface PromptEditorProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  variables: PromptVariable[];
  templates: PromptTemplate[];
}

export const PromptEditorField: React.FC<PromptEditorProps> = ({
  label,
  description,
  value,
  onChange,
  variables,
  templates
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const insertVariable = (tag: string) => {
    // Inserta la variable al final del texto (o se podría hacer en la posición del cursor)
    onChange(value ? `${value} ${tag}` : tag);
  };

  const useTemplate = (content: string) => {
    if (window.confirm("¿Reemplazar el contenido actual con esta plantilla?")) {
      onChange(content);
      setShowTemplates(false);
    }
  };

  return (
    <div className="prompt-editor-container">
      <div className="prompt-header">
        <label className="prompt-label">{label}</label>
        {templates.length > 0 && (
          <button 
            type="button"
            className="btn-templates"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? "Ocultar Plantillas" : "Ver Plantillas"}
          </button>
        )}
      </div>
      
      {description && <p className="prompt-description">{description}</p>}

      {showTemplates && (
        <div className="prompt-templates-panel">
          <h4>Plantillas de Ejemplo</h4>
          <div className="templates-list">
            {templates.map((tpl, i) => (
              <div key={i} className="template-card">
                <h5>{tpl.title}</h5>
                <p>{tpl.content}</p>
                <button type="button" onClick={() => useTemplate(tpl.content)}>Usar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="prompt-variables">
        <span className="variables-title">Variables Disponibles (clic para insertar):</span>
        <div className="variables-list">
          {variables.map((v, i) => (
            <button 
              key={i} 
              type="button" 
              className="badge-variable" 
              onClick={() => insertVariable(v.tag)}
              title={v.description}
            >
              {v.tag}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Escribe tus instrucciones para la IA aquí..."
      />
    </div>
  );
};

