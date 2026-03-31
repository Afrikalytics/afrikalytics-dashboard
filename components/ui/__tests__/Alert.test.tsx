// =============================================================================
// Tests — components/ui/Alert.tsx
// =============================================================================

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(
      ({ children, initial, animate, exit, transition, ...props }: any, ref: any) =>
        React.createElement("div", { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  AlertCircle: (props: any) => React.createElement("span", { "data-testid": "icon-alert-circle", ...props }),
  CheckCircle2: (props: any) => React.createElement("span", { "data-testid": "icon-check-circle", ...props }),
  AlertTriangle: (props: any) => React.createElement("span", { "data-testid": "icon-alert-triangle", ...props }),
  Info: (props: any) => React.createElement("span", { "data-testid": "icon-info", ...props }),
  X: (props: any) => React.createElement("span", { "data-testid": "icon-x", ...props }),
}));

import { Alert } from "../Alert";

describe("Alert", () => {
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("should render children content", () => {
    render(<Alert>Message important</Alert>);
    expect(screen.getByText("Message important")).toBeInTheDocument();
  });

  it("should render title when provided", () => {
    render(<Alert title="Attention">Contenu</Alert>);
    expect(screen.getByText("Attention")).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Variants
  // ---------------------------------------------------------------------------

  it("should use info variant by default with Info icon", () => {
    render(<Alert>Info message</Alert>);
    expect(screen.getByTestId("icon-info")).toBeInTheDocument();
  });

  it("should render success variant with CheckCircle2 icon", () => {
    render(<Alert variant="success">Succes</Alert>);
    expect(screen.getByTestId("icon-check-circle")).toBeInTheDocument();
  });

  it("should render warning variant with AlertTriangle icon", () => {
    render(<Alert variant="warning">Attention</Alert>);
    expect(screen.getByTestId("icon-alert-triangle")).toBeInTheDocument();
  });

  it("should render error variant with AlertCircle icon", () => {
    render(<Alert variant="error">Erreur</Alert>);
    expect(screen.getByTestId("icon-alert-circle")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  it("should have role=alert for error variant", () => {
    render(<Alert variant="error">Erreur critique</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should have role=status for non-error variants", () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should have aria-live=assertive for error", () => {
    render(<Alert variant="error">Err</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });

  it("should have aria-live=polite for info", () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  // ---------------------------------------------------------------------------
  // Dismissible
  // ---------------------------------------------------------------------------

  it("should not show dismiss button by default", () => {
    render(<Alert>Content</Alert>);
    expect(screen.queryByLabelText("Fermer le message")).not.toBeInTheDocument();
  });

  it("should show dismiss button when dismissible with onDismiss", () => {
    const onDismiss = jest.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismissible
      </Alert>
    );
    expect(screen.getByLabelText("Fermer le message")).toBeInTheDocument();
  });

  it("should call onDismiss when dismiss button clicked", () => {
    const onDismiss = jest.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Click dismiss
      </Alert>
    );
    fireEvent.click(screen.getByLabelText("Fermer le message"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should not show dismiss button when dismissible but no onDismiss", () => {
    render(<Alert dismissible>No handler</Alert>);
    expect(screen.queryByLabelText("Fermer le message")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Custom className
  // ---------------------------------------------------------------------------

  it("should merge custom className", () => {
    const { container } = render(<Alert className="my-alert">Cls</Alert>);
    expect(container.firstChild).toHaveClass("my-alert");
  });
});
