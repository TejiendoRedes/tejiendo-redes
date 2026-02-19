import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { menuItems, MenuItem } from '@/config/navigation';
import Image from 'next/image';
import { cn } from '@/components/ui/utils';
import { useAuth } from '@/contexts/AuthContext';


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  variant?: 'sidebar' | 'drawer';
  hideToggle?: boolean;
  className?: string;
}

export function Sidebar({ collapsed, onToggle, variant = 'sidebar', hideToggle = false, className }: SidebarProps) {
  const pathname = usePathname();
  const { hasRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string, items?: MenuItem[]) => {
    const isMatch = pathname === path || pathname.startsWith(path + '/');
    if (!isMatch) return false;

    // If peer items are provided, check if any peer is a more specific (longer) match
    if (items) {
      const moreSpecificMatch = items.some(peer =>
        peer.path !== path &&
        peer.path.length > path.length &&
        (pathname === peer.path || pathname.startsWith(peer.path + '/'))
      );
      if (moreSpecificMatch) return false;
    }

    return isMatch;
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Image
              src="/minilogo.png"
              alt="Logo"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="font-bold text-lg text-foreground">Tejiendo Redes</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <Image
              src="/minilogo.png"
              alt="Logo"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.filter(item => !item.roles || hasRole(item.roles)).map(item => {
            // Resolve path for Dashboard item dynamically
            let finalPath = item.path;
            if (item.label === 'Inicio') {
              const user = (hasRole as any).user; // Hack for now if user is available or use a hook
              // Better approach: use a helper or get from context
            }

            // Re-evaluating: The middleware already handles the redirect for /dashboard.
            // So keeping it as /dashboard is fine, it will just redirect.
            // But for visual consistency (active state), we might want the real path.

            const visibleChildren = item.children?.filter(child => !child.roles || hasRole(child.roles));
            const hasChildren = visibleChildren && visibleChildren.length > 0;
            const isExpanded = expandedMenus.includes(item.path);
            const itemActive = isActive(finalPath);

            return (
              <li key={item.path}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.path)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        itemActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {item.icon}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight
                            className={cn(
                              'w-4 h-4 transition-transform duration-200',
                              isExpanded && 'rotate-90'
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {visibleChildren?.map(child => (
                          <li key={child.path}>
                            <Link
                              href={child.path}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive(child.path, visibleChildren)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      itemActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  if (variant === 'drawer') {
    return (
      <aside className={cn('h-full w-full bg-card flex flex-col', className)}>
        <NavContent />
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <NavContent />

      {/* Toggle Button */}
      {!hideToggle && (
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute -right-3 top-20 bg-card border border-border rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}
    </aside>
  );
}

