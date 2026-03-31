// =============================================================================
// Tests — components/ui/Input.tsx & Textarea
// =============================================================================

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Eye: (props: any) => React.createElement("span", { "data-testid": "icon-eye", ...props }),
  EyeOff: (props: any) => React.createElement("span", { "data-testid": "icon-eyeoff", ...props }),
  AlertCircle: (props: any) => React.createElement("span", { "data-testid": "icon-alert", ...props }),
}));

import { Input, Textarea } from "../Input";

// =============================================================================
// Input
// =============================================================================

describe("Input", () => {
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("should render an input element", () => {
    render(<Input placeholder="Votre email" />);
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
  });

  it("should render label when provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should associate label with input via htmlFor", () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email-input");
  });

  it("should show required indicator when required", () => {
    render(<Input label="Nom" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should forward ref to input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  it("should display error message", () => {
    render(<Input error="Champ requis" />);
    expect(screen.getByText("Champ requis")).toBeInTheDocument();
  });

  it("should set aria-invalid when error is present", () => {
    render(<Input error="Erreur" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should show error with role=alert", () => {
    render(<Input error="Oops" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Oops");
  });

  it("should not show helper when error is present", () => {
    render(<Input error="Err" helper="Aide" />);
    expect(screen.queryByText("Aide")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Helper text
  // ---------------------------------------------------------------------------

  it("should display helper text when no error", () => {
    render(<Input helper="Entrez votre email" />);
    expect(screen.getByText("Entrez votre email")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Password toggle
  // ---------------------------------------------------------------------------

  it("should show password toggle for password type", () => {
    render(<Input type="password" label="Mot de passe" />);
    expect(screen.getByLabelText("Afficher le mot de passe")).toBeInTheDocument();
  });

  it("should toggle password visibility on click", () => {
    render(<Input type="password" />);
    const input = document.querySelector("input")!;
    const toggle = screen.getByLabelText("Afficher le mot de passe");

    // Initially password type
    expect(input).toHaveAttribute("type", "password");

    // Click to show
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Masquer le mot de passe")).toBeInTheDocument();

    // Click to hide again
    fireEvent.click(screen.getByLabelText("Masquer le mot de passe"));
    expect(input).toHaveAttribute("type", "password");
  });

  it("should not show toggle for non-password types", () => {
    render(<Input type="email" />);
    expect(screen.queryByLabelText("Afficher le mot de passe")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Icon
  // ---------------------------------------------------------------------------

  it("should render icon when provided", () => {
    render(<Input icon={<span data-testid="input-icon" />} />);
    expect(screen.getByTestId("input-icon")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // displayName
  // ---------------------------------------------------------------------------

  it("should have displayName set", () => {
    expect(Input.displayName).toBe("Input");
  });
});

// =============================================================================
// Textarea
// =============================================================================

describe("Textarea", () => {
  it("should render a textarea element", () => {
    render(<Textarea placeholder="Description" />);
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  });

  it("should render label", () => {
    render(<Textarea label="Message" />);
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("should show error message with role=alert", () => {
    render(<Textarea error="Trop court" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Trop court");
  });

  it("should set aria-invalid on error", () => {
    render(<Textarea error="Err" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should show helper when no error", () => {
    render(<Textarea helper="Max 500 caracteres" />);
    expect(screen.getByText("Max 500 caracteres")).toBeInTheDocument();
  });

  it("should not show helper when error is present", () => {
    render(<Textarea error="Err" helper="Help" />);
    expect(screen.queryByText("Help")).not.toBeInTheDocument();
  });

  it("should forward ref", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should have displayName set", () => {
    expect(Textarea.displayName).toBe("Textarea");
  });
});
