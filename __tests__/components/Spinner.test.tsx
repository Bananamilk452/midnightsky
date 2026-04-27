// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "@/components/Spinner";

describe("Spinner", () => {
  it("should render an SVG element", () => {
    const { container } = render(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should pass additional props to SVG", () => {
    const { container } = render(<Spinner className="test-class" data-testid="spinner" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("test-class");
    expect(svg).toHaveAttribute("data-testid", "spinner");
  });

  it("should have default width and height of 1em", () => {
    const { container } = render(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "1em");
    expect(svg).toHaveAttribute("height", "1em");
  });

  it("should have animate transform element", () => {
    const { container } = render(<Spinner />);

    const animate = container.querySelector("animateTransform");
    expect(animate).toBeInTheDocument();
  });
});
