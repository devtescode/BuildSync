import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Users, Package, Wallet,
  Building2, LogOut, Menu, X, Bell, HardHat,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getNotifications, markAllNotificationsRead } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/workers", icon: Users, label: "Workers" },
  { to: "/materials", icon: Package, label: "Materials" },
  { to: "/budget", icon: Wallet, label: "Budget" },
];

const workerLinks = [
  { to: "/worker-dashboard", icon: HardHat, label: "My Projects" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const links = isAdmin ? adminLinks : workerLinks;

  const notifications = getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Nav */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 sticky top-0 z-50">
        <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 size={18} />
          </div>
          <span className="font-display font-bold text-lg text-foreground">BuildSync</span>
        </div>
        <div className="flex-1" />
        {user && (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-6" onClick={handleMarkAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 15).map(n => (
                        <div key={n.id} className={`px-3 py-2 border-b border-border last:border-0 text-sm ${!n.read ? "bg-primary/5" : ""}`}>
                          <p className="text-xs">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.date).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Badge variant="outline" className="text-xs hidden sm:flex">
              {isAdmin ? "Admin" : "Worker"}
            </Badge>
            <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-muted-foreground">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 top-14 z-40 w-60 sidebar-gradient border-r border-sidebar-border transform transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="flex flex-col h-full pt-4 pb-4">
            <div className="flex-1 space-y-1 px-3">
              {links.map(link => {
                const active = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
            <div className="px-3 pt-4 border-t border-sidebar-border">
              <p className="text-xs text-sidebar-foreground/50 text-center">BuildSync © 2026</p>
              <p className="text-xs text-sidebar-foreground/40 text-center">Ilara-Mokin, Ondo State</p>
            </div>
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 top-14 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
