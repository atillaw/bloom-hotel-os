import { LayoutDashboard, BedDouble, Users, Calendar, DollarSign, ClipboardList, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, adminOnly: false },
  { title: "Odalar", url: "/rooms", icon: BedDouble, adminOnly: false },
  { title: "Misafirler", url: "/guests", icon: Users, adminOnly: false },
  { title: "Rezervasyonlar", url: "/reservations", icon: Calendar, adminOnly: false },
  { title: "Faturalama", url: "/billing", icon: DollarSign, adminOnly: false },
  { title: "Kat Hizmetleri", url: "/housekeeping", icon: ClipboardList, adminOnly: false },
  { title: "Admin Paneli", url: "/admin", icon: Shield, adminOnly: true },
];

export function AppSidebar() {
  const { isAdmin } = useAuth();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-semibold">Yönetim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
