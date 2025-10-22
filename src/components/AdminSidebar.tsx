import { LayoutDashboard, BedDouble, Users, Calendar, DollarSign, ClipboardList, Shield, Home } from "lucide-react";
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

const adminMenuItems = [
  { title: "Admin Paneli", url: "/admin", icon: Shield },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Odalar", url: "/rooms", icon: BedDouble },
  { title: "Misafirler", url: "/guests", icon: Users },
  { title: "Rezervasyonlar", url: "/reservations", icon: Calendar },
  { title: "Faturalama", url: "/billing", icon: DollarSign },
  { title: "Kat Hizmetleri", url: "/housekeeping", icon: ClipboardList },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-semibold">
            Admin Kontrolü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
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
