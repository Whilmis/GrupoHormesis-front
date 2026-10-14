const fs = require("fs");

function replaceStrings(file, replacements) {
    let content = fs.readFileSync(file, "utf8");
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(file, content);
}

const projReplacements = [
    ["Volver a Empresas Potenciales", "{t('portal.back_to_potential_companies', 'Volver a Empresas Potenciales')}"],
    ["Volver a Empresas", "{t('portal.back_to_companies', 'Volver a Empresas')}"],
    ["Buzón de Entrada", "{t('portal.inbox', 'Buzón de Entrada')}"],
    ["Empresas Potenciales", "{t('portal.potential_companies', 'Empresas Potenciales')}"],
    ["Panel Global de Actividades", "{t('portal.global_activities_panel', 'Panel Global de Actividades')}"],
    ["⚡ Línea de Tiempo Global del Proyecto", "⚡ {t('portal.global_project_timeline', 'Línea de Tiempo Global del Proyecto')}"],
    ["Panel de Actividades y Correos IA", "{t('portal.activities_ai_emails_panel', 'Panel de Actividades y Correos IA')}"],
    ["Sin Nombre", "{t('portal.no_name', 'Sin Nombre')}"],
    ["Empresa Desconocida", "{t('portal.unknown_company', 'Empresa Desconocida')}"],
    ["Visitar Web", "{t('portal.visit_website', 'Visitar Web')}"],
    ["No hay actividades registradas.", "{t('portal.no_activities_registered', 'No hay actividades registradas.')}"]
];

const wfReplacements = [
    ["Ver Prospectos / Leads (CRM)", "{t('portal.view_prospects_leads', 'Ver Prospectos / Leads (CRM)')}"],
    ["Cosecha Exitosa", "{t('portal.successful_harvest', 'Cosecha Exitosa')}"],
    ["Leads Encontrados", "{t('portal.leads_found', 'Leads Encontrados')}"],
    ["Término buscado", "{t('portal.search_term', 'Término buscado')}"],
    ["Búsqueda por defecto", "{t('portal.default_search', 'Búsqueda por defecto')}"],
    ["Dirección", "{t('portal.address', 'Dirección')}"],
    ["Teléfono", "{t('portal.phone', 'Teléfono')}"],
    ["Sitio Web", "{t('portal.website', 'Sitio Web')}"],
    ["Rating", "{t('portal.rating', 'Rating')}"],
    ["No disponible", "{t('portal.not_available', 'No disponible')}"],
    ["Cada hora", "{t('portal.every_hour', 'Cada hora')}"],
    ["Todos los días a las", "{t('portal.every_day_at', 'Todos los días a las')}"],
    ["Una vez a la semana", "{t('portal.once_a_week', 'Una vez a la semana')}"],
    ["Expresión Cron:", "{t('portal.cron_expression', 'Expresión Cron:')}"]
];

replaceStrings("src/pages/portal/admin/AdminProyectos.tsx", projReplacements);
replaceStrings("src/pages/portal/admin/AdminWorkflows.tsx", wfReplacements);

// Now update en/translation.json
let enTrans = JSON.parse(fs.readFileSync("src/locales/en/translation.json", "utf8"));
const portalUpdates = {
    "back_to_potential_companies": "Back to Potential Companies",
    "back_to_companies": "Back to Companies",
    "inbox": "Inbox",
    "potential_companies": "Potential Companies",
    "global_activities_panel": "Global Activities Panel",
    "global_project_timeline": "Global Project Timeline",
    "activities_ai_emails_panel": "Activities and AI Emails Panel",
    "no_name": "No Name",
    "unknown_company": "Unknown Company",
    "visit_website": "Visit Website",
    "no_activities_registered": "No registered activities.",
    "view_prospects_leads": "View Prospects / Leads (CRM)",
    "successful_harvest": "Successful Harvest",
    "leads_found": "Leads Found",
    "search_term": "Search Term",
    "default_search": "Default Search",
    "address": "Address",
    "phone": "Phone",
    "website": "Website",
    "rating": "Rating",
    "not_available": "Not available",
    "every_hour": "Every hour",
    "every_day_at": "Every day at",
    "once_a_week": "Once a week",
    "cron_expression": "Cron Expression:"
};

enTrans.portal = { ...enTrans.portal, ...portalUpdates };
fs.writeFileSync("src/locales/en/translation.json", JSON.stringify(enTrans, null, 2));

console.log("Translations added successfully!");
