import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock framer-motion to render children directly without animation
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: React.forwardRef(
      ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) => {
        // Filter out framer-motion-specific props
        const {
          initial, animate, exit, transition, variants,
          whileHover, whileTap, whileFocus, whileInView,
          ...htmlProps
        } = props as any;
        return <div ref={ref} {...htmlProps}>{children}</div>;
      }
    ),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: (props: Record<string, unknown>) => <span data-testid="icon-x" {...props} />,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Modal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Visibility
  // -------------------------------------------------------------------------

  it('does not render content when open=false', () => {
    render(
      <Modal open={false} onClose={onClose}>
        <p>Hidden content</p>
      </Modal>
    );

    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('renders content when open=true', () => {
    render(
      <Modal open={true} onClose={onClose}>
        <p>Visible content</p>
      </Modal>
    );

    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Title and children
  // -------------------------------------------------------------------------

  it('renders the title when provided', () => {
    render(
      <Modal open={true} onClose={onClose} title="Confirmer la suppression">
        <p>Contenu</p>
      </Modal>
    );

    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Modal open={true} onClose={onClose}>
        <div data-testid="custom-child">Custom child element</div>
      </Modal>
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Modal open={true} onClose={onClose} title="Titre" description="Une description">
        <p>Body</p>
      </Modal>
    );

    expect(screen.getByText('Une description')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // ARIA attributes
  // -------------------------------------------------------------------------

  it('has role="dialog" and aria-modal="true"', () => {
    render(
      <Modal open={true} onClose={onClose} title="Test modal">
        <p>Content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby when title is provided', () => {
    render(
      <Modal open={true} onClose={onClose} title="Mon titre">
        <p>Content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(labelledBy).toContain('modal-title');

    const titleEl = screen.getByText('Mon titre');
    expect(titleEl.id).toContain('modal-title');
  });

  it('has aria-describedby when description is provided', () => {
    render(
      <Modal open={true} onClose={onClose} title="Titre" description="Description">
        <p>Content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain('modal-description');
  });

  // -------------------------------------------------------------------------
  // Close interactions
  // -------------------------------------------------------------------------

  it('calls onClose when clicking the overlay', () => {
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    // The overlay has aria-hidden="true"
    const overlay = document.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', () => {
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when open=false', () => {
    render(
      <Modal open={false} onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders close button with aria-label "Fermer"', () => {
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Fermer');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides close button when hideClose=true', () => {
    render(
      <Modal open={true} onClose={onClose} hideClose={true}>
        <p>Content</p>
      </Modal>
    );

    expect(screen.queryByLabelText('Fermer')).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Footer
  // -------------------------------------------------------------------------

  it('renders footer when provided', () => {
    render(
      <Modal open={true} onClose={onClose} footer={<button>Confirmer</button>}>
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByText('Confirmer')).toBeInTheDocument();
  });
});
