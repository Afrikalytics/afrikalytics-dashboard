'use client';

// =============================================================================
// Datatym AI Dashboard — Sidebar Component (Corporate Premium)
// =============================================================================
// White sidebar with refined typography, framer-motion animations
// Style: Bloomberg / McKinsey corporate
// =============================================================================

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  TrendingUp,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
  ChevronDown,
  Users,
  Lightbulb,
  Download,
} from 'lucide-react';
import type { User } from '@/lib/types';
import type { AdminRolePermissions } from '@/lib/types';
import { ADMIN_PERMISSIONS, ROUTES } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SidebarProps {
  currentPath: string;
  user: User | null;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show?: boolean;
  badge?: string;
}

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------

function hasPermission(user: User | null, permission: keyof AdminRolePermissions): boolean {
  if (!user?.is_admin) return false;
  const role = user.admin_role || 'super_admin';
  return ADMIN_PERMISSIONS[role]?.[permission] ?? false;
}

// -----------------------------------------------------------------------------
// Animation variants
// -----------------------------------------------------------------------------

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: -256 },
  visible: {
    x: 0,
    transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
  },
  exit: {
    x: -256,
    transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
  },
};

const submenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

// -----------------------------------------------------------------------------
// Sidebar Content (shared between desktop & mobile)
// -----------------------------------------------------------------------------

function SidebarContent({
  currentPath,
  user,
  onLogout,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const mainNavItems: NavItem[] = [
    { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: BarChart3 },
    { href: ROUTES.ETUDES, label: 'Études', icon: FileText },
    { href: ROUTES.INSIGHTS, label: 'Insights', icon: TrendingUp },
    { href: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell },
    { href: ROUTES.FACTURATION, label: 'Facturation', icon: CreditCard },
    { href: ROUTES.PROFILE, label: 'Profil', icon: UserIcon },
    {
      href: ROUTES.EQUIPE,
      label: 'Mon Équipe',
      icon: Users,
      show: user?.plan === 'entreprise' && !user?.parent_user_id,
      badge: '5',
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      href: ROUTES.ADMIN,
      label: 'Études',
      icon: FileText,
      show: hasPermission(user, 'studies'),
    },
    {
      href: ROUTES.ADMIN_INSIGHTS,
      label: 'Insights',
      icon: Lightbulb,
      show: hasPermission(user, 'insights'),
    },
    {
      href: ROUTES.ADMIN_REPORTS,
      label: 'Rapports',
      icon: Download,
      show: hasPermission(user, 'reports'),
    },
    {
      href: ROUTES.ADMIN_USERS,
      label: 'Utilisateurs',
      icon: Users,
      show: hasPermission(user, 'users'),
    },
  ];

  const isActive = (href: string) => currentPath === href;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-surface-900">
              Datatym AI
            </span>
            <span className="text-primary-600 text-lg font-bold">.</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar"
        aria-label="Navigation principale"
      >
        {mainNavItems
          .filter((item) => item.show === undefined || item.show)
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium tracking-wide
                  transition-all duration-200
                  ${
                    active
                      ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50 border-l-2 border-transparent'
                  }
                `}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="accent" size="sm" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </a>
            );
          })}

        {/* Admin Menu */}
        {user?.is_admin && (
          <>
            <div className="border-t border-surface-200 my-3" />
            <p className="px-3 text-2xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
              Administration
            </p>

            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              aria-expanded={adminMenuOpen}
              className={`
                flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                text-sm font-medium tracking-wide
                text-surface-600 hover:text-surface-900 hover:bg-surface-50
                transition-all duration-200
                border-l-2 border-transparent
              `}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-surface-400" />
                <span>Gérer</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-surface-400 transition-transform duration-300 ${
                  adminMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {adminMenuOpen && (
                <motion.div
                  key="admin-submenu"
                  variants={submenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <div className="pl-4 space-y-0.5 mt-1">
                    {adminNavItems
                      .filter((item) => item.show)
                      .map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg
                              text-sm font-medium tracking-wide
                              transition-all duration-200
                              ${
                                active
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                              }
                            `}
                          >
                            <Icon
                              className={`h-3.5 w-3.5 ${
                                active ? 'text-primary-600' : 'text-surface-400'
                              }`}
                            />
                            <span>{item.label}</span>
                          </a>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-surface-200">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <Avatar name={user?.full_name || ''} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">{user?.full_name}</p>
            <p className="text-2xs text-surface-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-3 px-3 pt-3 mt-2 border-t border-surface-100">
          <Link
            href="/legal/cgu"
            onClick={onNavigate}
            className="text-2xs text-surface-400 hover:text-primary-600 transition-colors"
          >
            CGU
          </Link>
          <span className="text-surface-300 text-2xs" aria-hidden="true">
            |
          </span>
          <Link
            href="/legal/confidentialite"
            onClick={onNavigate}
            className="text-2xs text-surface-400 hover:text-primary-600 transition-colors"
          >
            Confidentialité
          </Link>
          <span className="text-surface-300 text-2xs" aria-hidden="true">
            |
          </span>
          <Link
            href="/legal/cookies"
            onClick={onNavigate}
            className="text-2xs text-surface-400 hover:text-primary-600 transition-colors"
          >
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Sidebar Component
// -----------------------------------------------------------------------------

export function Sidebar({ currentPath, user, onLogout }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Aller au contenu principal
      </a>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          lg:hidden fixed top-4 left-4 z-50
          p-2.5 rounded-lg shadow-sm
          transition-all duration-200
          ${
            sidebarOpen
              ? 'bg-white text-surface-900 border border-surface-200'
              : 'bg-white text-surface-700 border border-surface-200'
          }
        `}
        aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-surface-900/30 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar-mobile"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden fixed h-full z-40 w-64 bg-white border-r border-surface-200 flex flex-col"
          >
            <SidebarContent
              currentPath={currentPath}
              user={user}
              onLogout={onLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed h-full z-40 w-64 bg-white border-r border-surface-200 flex-col">
        <SidebarContent currentPath={currentPath} user={user} onLogout={onLogout} />
      </aside>
    </>
  );
}
