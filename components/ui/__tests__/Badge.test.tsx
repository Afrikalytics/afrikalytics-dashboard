// =============================================================================
// Tests — components/ui/Badge.tsx
// =============================================================================

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("should render children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should apply default variant styles", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-surface-100");
  });

  it("should apply primary variant", () => {
    render(<Badge variant="primary">Pro</Badge>);
    expect(screen.getByText("Pro").className).toContain("bg-primary-50");
  });

  it("should apply success variant", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK").className).toContain("bg-success-50");
  });

  it("should apply warning variant", () => {
    render(<Badge variant="warning">Warn</Badge>);
    expect(screen.getByText("Warn").className).toContain("bg-warning-50");
  });

  it("should apply danger variant", () => {
    render(<Badge variant="danger">Err</Badge>);
    expect(screen.getByText("Err").className).toContain("bg-danger-50");
  });

  it("should apply accent variant", () => {
    render(<Badge variant="accent">New</Badge>);
    expect(screen.getByText("New").className).toContain("bg-accent-50");
  });

  it("should apply outline variant", () => {
    render(<Badge variant="outline">Out</Badge>);
    expect(screen.getByText("Out").className).toContain("bg-transparent");
  });

  // Sizes
  it("should apply md size by default", () => {
    render(<Badge>Md</Badge>);
    expect(screen.getByText("Md").className).toContain("text-xs");
  });

  it("should apply sm size with uppercase", () => {
    render(<Badge size="sm">Sm</Badge>);
    expect(screen.getByText("Sm").className).toContain("uppercase");
  });

  // Dot indicator
  it("should render dot indicator when dot=true", () => {
    const { container } = render(<Badge dot>Dot</Badge>);
    const dotEl = container.querySelector("[aria-hidden='true']");
    expect(dotEl).toBeInTheDocument();
    expect(dotEl?.className).toContain("rounded-full");
  });

  it("should not render dot by default", () => {
    const { container } = render(<Badge>No dot</Badge>);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots).toHaveLength(0);
  });

  // Icon
  it("should render icon when provided", () => {
    render(
      <Badge icon={<span data-testid="badge-icon" />}>
        With icon
      </Badge>
    );
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  // Accessibility
  it("should have role=status when aria-label is provided", () => {
    render(<Badge aria-label="Statut actif">Active</Badge>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should not have role when no aria-label", () => {
    render(<Badge>Plain</Badge>);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // Custom className
  it("should merge custom className", () => {
    render(<Badge className="extra-class">Class</Badge>);
    expect(screen.getByText("Class").className).toContain("extra-class");
  });
});
