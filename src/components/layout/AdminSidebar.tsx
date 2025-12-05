import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  Home,
  FileText,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  Layers,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/admin/dashboard",
  },
  {
    label: "Achievement Tests",
    icon: FileText,
    path: "/admin/tests/achievement",
  },
  {
    label: "A-DTM Templates",
    icon: Layers,
    path: "/admin/adtm/templates",
  },
  {
    label: "Teachers",
    icon: Users,
    path: "/admin/teachers",
  },
  {
    label: "Students",
    icon: GraduationCap,
    path: "/admin/students",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/admin/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-secondary-900 text-white flex flex-col">
      <div className="p-6 border-b border-secondary-800">
        <h2 className="text-lg font-bold text-white">Admin Panel</h2>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                active
                  ? "bg-primary-600 text-white"
                  : "text-secondary-300 hover:bg-secondary-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
