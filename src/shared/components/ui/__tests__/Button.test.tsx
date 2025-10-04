import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies disabled state", () => {
    render(<Button disabled>Disabled button</Button>);
    expect(screen.getByText("Disabled button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByText("Button")).toHaveClass("custom-class");
  });

  it("renders with default styling", () => {
    render(<Button>Default Button</Button>);
    expect(screen.getByText("Default Button")).toHaveClass("bg-primary");
  });
});
