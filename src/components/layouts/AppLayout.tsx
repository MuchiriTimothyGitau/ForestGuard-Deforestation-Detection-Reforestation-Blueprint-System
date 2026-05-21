import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Map,
  TreePine,
  BarChart3,
  FileText,
  Menu,
  Leaf,
  AlertTriangle,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Forest Map', icon: Map, description: 'Live deforestation dashboard' },
  { path: '/site/:id', label: 'Site Detail', icon: AlertTriangle, description: 'Satellite comparison', hidden: true },
  { path: '/blueprint/:id', label: 'Blueprint', icon: TreePine, description: 'Reforestation plans', hidden: true },
  { path: '/report', label: 'Carbon Report', icon: BarChart3, description: 'Aggregate projections' },
];

const visibleNavItems = navItems.filter(item => !item.hidden);

interface SidebarContentProps {
  onNavigate?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onNavigate }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.replace(':id', ''));
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded bg-sidebar-primary">
          <Leaf className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm text-sidebar-foreground tracking-wide">ForestGuard</p>
          <p className="text-xs text-sidebar-foreground/60">Kenya Reforestation System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-widest">
          Navigation
        </p>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path === '/site/:id' || item.path === '/blueprint/:id' ? '#' : item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors min-h-10 ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate">{item.label}</p>
                <p className="text-xs text-sidebar-foreground/40 truncate">{item.description}</p>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Sentinel-2 · Open-Meteo · IPCC Tier 2</span>
        </div>
      </div>
    </div>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border shrink-0 z-30">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="border border-white/60 text-white hover:bg-white/10 p-2 h-9 w-9"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Leaf className="w-4 h-4 text-sidebar-primary shrink-0" />
            <span className="font-bold text-sm text-white truncate">ForestGuard</span>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
