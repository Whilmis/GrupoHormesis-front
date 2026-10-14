const fs = require("fs");

let content = fs.readFileSync("src/pages/portal/admin/AdminProyectos.tsx", "utf8");
content = content.replace(/>Buzón de Entrada</g, ">{t('portal.inbox', 'Buzón de Entrada')}<");
content = content.replace(/>Empresas Potenciales</g, ">{t('portal.potential_companies', 'Empresas Potenciales')}<");
content = content.replace(/>Panel Global de Actividades</g, ">{t('portal.global_activities_panel', 'Panel Global de Actividades')}<");
content = content.replace(/>⚡ Línea de Tiempo Global del Proyecto</g, ">⚡ {t('portal.global_project_timeline', 'Línea de Tiempo Global del Proyecto')}<");
fs.writeFileSync("src/pages/portal/admin/AdminProyectos.tsx", content);
