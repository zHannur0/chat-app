import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../Input";

describe("Input", () => {
  it("renders input with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test input" } });

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("test input");
  });

  it("applies disabled state", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("renders with different types", () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");

    rerender(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });
});
