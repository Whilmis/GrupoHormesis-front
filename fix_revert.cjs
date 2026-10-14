const fs = require("fs");

function replaceStrings(file, replacements) {
    let content = fs.readFileSync(file, "utf8");
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(file, content);
}

const projReplacements = [
    ["{t('portal.back_to_potential_companies', 'Volver a Empresas Potenciales')}", "Volver a Empresas Potenciales"],
    ["{t('portal.back_to_companies', 'Volver a Empresas')}", "Volver a Empresas"],
    ["{t('portal.inbox', 'Buzón de Entrada')}", "Buzón de Entrada"],
    ["{t('portal.potential_companies', 'Empresas Potenciales')}", "Empresas Potenciales"],
    ["{t('portal.global_activities_panel', 'Panel Global de Actividades')}", "Panel Global de Actividades"],
    ["⚡ {t('portal.global_project_timeline', 'Línea de Tiempo Global del Proyecto')}", "⚡ Línea de Tiempo Global del Proyecto"],
    ["{t('portal.activities_ai_emails_panel', 'Panel de Actividades y Correos IA')}", "Panel de Actividades y Correos IA"],
    ["{t('portal.no_name', 'Sin Nombre')}", "Sin Nombre"],
    ["{t('portal.unknown_company', 'Empresa Desconocida')}", "Empresa Desconocida"],
    ["{t('portal.visit_website', 'Visitar Web')}", "Visitar Web"],
    ["{t('portal.no_activities_registered', 'No hay actividades registradas.')}", "No hay actividades registradas."]
];

const wfReplacements = [
    ["{t('portal.view_prospects_leads', 'Ver Prospectos / Leads (CRM)')}", "Ver Prospectos / Leads (CRM)"],
    ["{t('portal.successful_harvest', 'Cosecha Exitosa')}", "Cosecha Exitosa"],
    ["{t('portal.leads_found', 'Leads Encontrados')}", "Leads Encontrados"],
    ["{t('portal.search_term', 'Término buscado')}", "Término buscado"],
    ["{t('portal.default_search', 'Búsqueda por defecto')}", "Búsqueda por defecto"],
    ["{t('portal.address', 'Dirección')}", "Dirección"],
    ["{t('portal.phone', 'Teléfono')}", "Teléfono"],
    ["{t('portal.website', 'Sitio Web')}", "Sitio Web"],
    ["{t('portal.rating', 'Rating')}", "Rating"],
    ["{t('portal.not_available', 'No disponible')}", "No disponible"],
    ["{t('portal.every_hour', 'Cada hora')}", "Cada hora"],
    ["{t('portal.every_day_at', 'Todos los días a las')}", "Todos los días a las"],
    ["{t('portal.once_a_week', 'Una vez a la semana')}", "Una vez a la semana"],
    ["{t('portal.cron_expression', 'Expresión Cron:')}", "Expresión Cron:"]
];

replaceStrings("src/pages/portal/admin/AdminProyectos.tsx", projReplacements);
replaceStrings("src/pages/portal/admin/AdminWorkflows.tsx", wfReplacements);
