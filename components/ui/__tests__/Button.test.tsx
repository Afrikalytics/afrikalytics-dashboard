// =============================================================================
// Tests — components/ui/Button.tsx
// =============================================================================
// TDD RED phase: rendering, variants, sizes, loading, disabled, icons, a11y
// =============================================================================

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock framer-motion: render children without animation
jest.mock("framer-motion", () => ({
  motion: {
    button: React.forwardRef(
      ({ children, whileHover, whileTap, transition, ...props }: any, ref: any) =>
        React.createElement("button", { ...props, ref }, children)
    ),
    div: React.forwardRef(
      ({ children, initial, animate, exit, transition, ...props }: any, ref: any) =>
        React.createElement("div", { ...props, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Loader2: (props: any) =>
    React.createElement("span", { "data-testid": "icon-loader2", ...props }),
}));

import { Button } from "../Button";

describe("Button", () => {
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("should render children text", () => {
    render(<Button>Envoyer</Button>);
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
  });

  it("should have type=button by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("should allow type=submit override", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("should forward ref to button element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // ---------------------------------------------------------------------------
  // Variants (CSS class presence)
  // ---------------------------------------------------------------------------

  it("should apply primary variant styles by default", () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-primary-600");
  });

  it("should apply secondary variant styles", () => {
    render(<Button variant="secondary">Sec</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-white");
    expect(btn.className).toContain("border");
  });

  it("should apply ghost variant styles", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("text-surface-600");
  });

  it("should apply danger variant styles", () => {
    render(<Button variant="danger">Danger</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-danger-600");
  });

  it("should apply accent variant styles", () => {
    render(<Button variant="accent">Accent</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-accent-600");
  });

  // ---------------------------------------------------------------------------
  // Sizes
  // ---------------------------------------------------------------------------

  it("should apply md size by default", () => {
    render(<Button>Md</Button>);
    expect(screen.getByRole("button").className).toContain("py-2.5");
  });

  it("should apply sm size", () => {
    render(<Button size="sm">Sm</Button>);
    expect(screen.getByRole("button").className).toContain("py-1.5");
  });

  it("should apply lg size", () => {
    render(<Button size="lg">Lg</Button>);
    expect(screen.getByRole("button").className).toContain("py-3");
  });

  // ---------------------------------------------------------------------------
  // Full width
  // ---------------------------------------------------------------------------

  it("should not be full width by default", () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole("button").className).not.toContain("w-full");
  });

  it("should apply w-full when fullWidth is true", () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });

  // ---------------------------------------------------------------------------
  // Disabled
  // ---------------------------------------------------------------------------

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should set aria-disabled when disabled", () => {
    render(<Button disabled>Dis</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
  });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  it("should show loader icon when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByTestId("icon-loader2")).toBeInTheDocument();
  });

  it("should be disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should set aria-busy when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("should not show aria-busy when not loading", () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  // ---------------------------------------------------------------------------
  // Icons
  // ---------------------------------------------------------------------------

  it("should render left icon when not loading", () => {
    render(
      <Button icon={<span data-testid="left-icon" />}>
        With icon
      </Button>
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("should not render left icon when loading (shows loader instead)", () => {
    render(
      <Button loading icon={<span data-testid="left-icon" />}>
        Loading
      </Button>
    );
    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("icon-loader2")).toBeInTheDocument();
  });

  it("should render right icon", () => {
    render(
      <Button iconRight={<span data-testid="right-icon" />}>
        With right
      </Button>
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("should hide right icon when loading", () => {
    render(
      <Button loading iconRight={<span data-testid="right-icon" />}>
        Loading
      </Button>
    );
    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Click events
  // ---------------------------------------------------------------------------

  it("should call onClick handler", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        No click
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Custom className
  // ---------------------------------------------------------------------------

  it("should merge custom className", () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("my-custom");
  });

  // ---------------------------------------------------------------------------
  // displayName
  // ---------------------------------------------------------------------------

  it("should have displayName set", () => {
    expect(Button.displayName).toBe("Button");
  });
});
