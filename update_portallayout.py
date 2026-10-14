import re

with open("src/pages/portal/PortalLayout.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

sidebar_link = """          { name: t('portal.users', 'Usuarios'), path: '/portal/admin/usuarios', icon: Users },
          { name: 'Calendarios', path: '/portal/admin/calendars', icon: Calendar },"""
ts = ts.replace("{ name: t('portal.users', 'Usuarios'), path: '/portal/admin/usuarios', icon: Users },", sidebar_link)

if "Calendar" not in ts:
    ts = ts.replace("import { LayoutDashboard, Users, Briefcase, Settings, LogOut, Menu, X, FolderKanban } from 'lucide-react';", "import { LayoutDashboard, Users, Briefcase, Settings, LogOut, Menu, X, FolderKanban, Calendar } from 'lucide-react';")

with open("src/pages/portal/PortalLayout.tsx", "w", encoding="utf-8") as f:
    f.write(ts)

print("PortalLayout updated")
