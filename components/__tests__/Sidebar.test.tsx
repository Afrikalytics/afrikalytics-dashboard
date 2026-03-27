import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { makeUser } from '@/__tests__/helpers';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
const mockPathname = jest.fn().mockReturnValue('/dashboard');
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock framer-motion to render children directly
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: React.forwardRef(
      ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) => {
        const {
          initial, animate, exit, transition, variants,
          whileHover, whileTap, whileFocus, whileInView,
          ...htmlProps
        } = props as any;
        return <div ref={ref} {...htmlProps}>{children}</div>;
      }
    ),
    aside: React.forwardRef(
      ({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref: React.Ref<HTMLElement>) => {
        const {
          initial, animate, exit, transition, variants,
          whileHover, whileTap, whileFocus, whileInView,
          ...htmlProps
        } = props as any;
        return <aside ref={ref} {...htmlProps}>{children}</aside>;
      }
    ),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart3: (props: Record<string, unknown>) => <span data-testid="icon-barchart3" {...props} />,
  FileText: (props: Record<string, unknown>) => <span data-testid="icon-filetext" {...props} />,
  TrendingUp: (props: Record<string, unknown>) => <span data-testid="icon-trendingup" {...props} />,
  LogOut: (props: Record<string, unknown>) => <span data-testid="icon-logout" {...props} />,
  User: (props: Record<string, unknown>) => <span data-testid="icon-user" {...props} />,
  Settings: (props: Record<string, unknown>) => <span data-testid="icon-settings" {...props} />,
  Menu: (props: Record<string, unknown>) => <span data-testid="icon-menu" {...props} />,
  X: (props: Record<string, unknown>) => <span data-testid="icon-x" {...props} />,
  ChevronDown: (props: Record<string, unknown>) => <span data-testid="icon-chevrondown" {...props} />,
  Users: (props: Record<string, unknown>) => <span data-testid="icon-users" {...props} />,
  Lightbulb: (props: Record<string, unknown>) => <span data-testid="icon-lightbulb" {...props} />,
  Download: (props: Record<string, unknown>) => <span data-testid="icon-download" {...props} />,
}));

// Mock Avatar and Badge UI components
jest.mock('@/components/ui/Avatar', () => ({
  Avatar: ({ name }: { name: string }) => <span data-testid="avatar">{name}</span>,
}));

jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const regularUser = makeUser({
  full_name: 'Amadou Diallo',
  email: 'amadou@example.com',
  is_admin: false,
  admin_role: null,
  plan: 'basic',
});

const adminUser = makeUser({
  full_name: 'Fatou Sow',
  email: 'fatou@example.com',
  is_admin: true,
  admin_role: 'super_admin',
  plan: 'entreprise',
});

const enterpriseOwner = makeUser({
  full_name: 'Moussa Ba',
  email: 'moussa@example.com',
  plan: 'entreprise',
  parent_user_id: null,
  is_admin: false,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Sidebar', () => {
  const onLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  // -------------------------------------------------------------------------
  // Navigation links
  // -------------------------------------------------------------------------

  it('renders main navigation links', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Études').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Insights').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Profil').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Datatym AI brand name', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.getAllByText('Datatym AI').length).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------------------
  // Active link highlighting
  // -------------------------------------------------------------------------

  it('highlights the active link based on currentPath', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    // The desktop sidebar is the one visible; find dashboard links with aria-current
    const activeLinks = document.querySelectorAll('[aria-current="page"]');
    expect(activeLinks.length).toBeGreaterThanOrEqual(1);

    // At least one active link should point to /dashboard
    const hrefs = Array.from(activeLinks).map((el) => el.getAttribute('href'));
    expect(hrefs).toContain('/dashboard');
  });

  it('does not highlight non-active links', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    // Etudes link should not be active
    const etudesLinks = screen.getAllByText('Études');
    etudesLinks.forEach((link) => {
      expect(link.closest('a')).not.toHaveAttribute('aria-current', 'page');
    });
  });

  // -------------------------------------------------------------------------
  // User info
  // -------------------------------------------------------------------------

  it('displays the user full_name', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.getAllByText('Amadou Diallo').length).toBeGreaterThanOrEqual(1);
  });

  it('displays the user email', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.getAllByText('amadou@example.com').length).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------------------
  // Admin section
  // -------------------------------------------------------------------------

  it('shows the Administration section when user is admin', () => {
    render(
      <Sidebar currentPath="/dashboard" user={adminUser} onLogout={onLogout} />
    );

    expect(screen.getAllByText('Administration').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Gérer').length).toBeGreaterThanOrEqual(1);
  });

  it('does not show the Administration section for non-admin users', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('shows admin sub-items after expanding the admin menu', () => {
    render(
      <Sidebar currentPath="/dashboard" user={adminUser} onLogout={onLogout} />
    );

    // Click the "Gérer" button to expand admin submenu (click the first one — desktop)
    const gererButtons = screen.getAllByText('Gérer');
    fireEvent.click(gererButtons[0].closest('button')!);

    // super_admin should see Utilisateurs
    expect(screen.getAllByText('Utilisateurs').length).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------------------
  // Mon Équipe (enterprise plan owners)
  // -------------------------------------------------------------------------

  it('shows Mon Équipe link for enterprise plan owners', () => {
    render(
      <Sidebar currentPath="/dashboard" user={enterpriseOwner} onLogout={onLogout} />
    );

    expect(screen.getAllByText('Mon Équipe').length).toBeGreaterThanOrEqual(1);
  });

  it('does not show Mon Équipe for basic plan users', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.queryByText('Mon Équipe')).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Logout button
  // -------------------------------------------------------------------------

  it('renders the Déconnexion button', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.getAllByText('Déconnexion').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onLogout when Déconnexion button is clicked', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    // Click the first Déconnexion button (desktop sidebar)
    const logoutButtons = screen.getAllByText('Déconnexion');
    fireEvent.click(logoutButtons[0].closest('button')!);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  it('renders a nav element with aria-label', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    const navElements = document.querySelectorAll('nav[aria-label="Navigation principale"]');
    expect(navElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders skip navigation link', () => {
    render(
      <Sidebar currentPath="/dashboard" user={regularUser} onLogout={onLogout} />
    );

    expect(screen.getByText('Aller au contenu principal')).toBeInTheDocument();
  });
});
