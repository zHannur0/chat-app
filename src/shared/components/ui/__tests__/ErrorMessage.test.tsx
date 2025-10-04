import { render, screen } from "@testing-library/react";
import ErrorMessage from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("renders error message", () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<ErrorMessage message="Error" className="custom-class" />);
    expect(screen.getByText("Error")).toHaveClass("custom-class");
  });

  it("renders with default styling", () => {
    render(<ErrorMessage message="Error message" />);
    expect(screen.getByText("Error message")).toHaveClass("text-red-500");
  });

  it("handles empty message gracefully", () => {
    render(<ErrorMessage message="" />);
    // Should not crash or render anything for empty message
    expect(screen.queryByText("Error message")).not.toBeInTheDocument();
  });
});
