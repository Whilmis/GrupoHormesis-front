import re

with open("src/components/portal/Sidebar.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

sidebar_link = """  { icon: Users, label: t('portal.sidebar.users', 'Usuarios'), path: '/portal/admin/usuarios' },
  { icon: Calendar, label: 'Calendarios', path: '/portal/admin/calendars' }"""
ts = ts.replace("  { icon: Users, label: t('portal.sidebar.users', 'Usuarios'), path: '/portal/admin/usuarios' }", sidebar_link)

if "Calendar" not in ts:
    ts = ts.replace("import { LayoutDashboard, FolderKanban, Users, Settings, LogOut, ChevronLeft, Menu, Activity } from 'lucide-react';", "import { LayoutDashboard, FolderKanban, Users, Settings, LogOut, ChevronLeft, Menu, Activity, Calendar } from 'lucide-react';")

with open("src/components/portal/Sidebar.tsx", "w", encoding="utf-8") as f:
    f.write(ts)

print("Sidebar updated")
