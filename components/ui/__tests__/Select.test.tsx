// =============================================================================
// Tests — components/ui/Select.tsx
// =============================================================================

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronDown: (props: any) => React.createElement("span", { "data-testid": "icon-chevron", ...props }),
  AlertCircle: (props: any) => React.createElement("span", { "data-testid": "icon-alert", ...props }),
}));

import { Select } from "../Select";

const defaultOptions = [
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Professionnel" },
  { value: "ent", label: "Entreprise" },
];

describe("Select", () => {
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("should render a select element with options", () => {
    render(<Select options={defaultOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Professionnel")).toBeInTheDocument();
    expect(screen.getByText("Entreprise")).toBeInTheDocument();
  });

  it("should render placeholder as disabled option", () => {
    render(<Select options={defaultOptions} placeholder="Choisir un plan" />);
    const placeholder = screen.getByText("Choisir un plan") as HTMLOptionElement;
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it("should render label when provided", () => {
    render(<Select options={defaultOptions} label="Plan" />);
    expect(screen.getByText("Plan")).toBeInTheDocument();
  });

  it("should associate label with select via htmlFor", () => {
    render(<Select options={defaultOptions} label="Plan" id="plan-select" />);
    expect(screen.getByText("Plan")).toHaveAttribute("for", "plan-select");
  });

  it("should show required indicator", () => {
    render(<Select options={defaultOptions} label="Plan" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  it("should display error message", () => {
    render(<Select options={defaultOptions} error="Selection requise" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Selection requise");
  });

  it("should set aria-invalid on error", () => {
    render(<Select options={defaultOptions} error="Err" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should not show helper when error is present", () => {
    render(<Select options={defaultOptions} error="Err" helper="Help" />);
    expect(screen.queryByText("Help")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Helper text
  // ---------------------------------------------------------------------------

  it("should display helper text when no error", () => {
    render(<Select options={defaultOptions} helper="Choisissez votre plan" />);
    expect(screen.getByText("Choisissez votre plan")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Disabled options
  // ---------------------------------------------------------------------------

  it("should render disabled options correctly", () => {
    const opts = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
    ];
    render(<Select options={opts} />);
    const bOption = screen.getByText("B") as HTMLOptionElement;
    expect(bOption).toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // Change events
  // ---------------------------------------------------------------------------

  it("should call onChange when selection changes", () => {
    const handleChange = jest.fn();
    render(<Select options={defaultOptions} onChange={handleChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "pro" } });
    expect(handleChange).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Forward ref
  // ---------------------------------------------------------------------------

  it("should forward ref to select element", () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<Select ref={ref} options={defaultOptions} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  // ---------------------------------------------------------------------------
  // Chevron icon
  // ---------------------------------------------------------------------------

  it("should render chevron icon", () => {
    render(<Select options={defaultOptions} />);
    expect(screen.getByTestId("icon-chevron")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // displayName
  // ---------------------------------------------------------------------------

  it("should have displayName set", () => {
    expect(Select.displayName).toBe("Select");
  });
});
