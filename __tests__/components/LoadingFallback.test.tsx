// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("LoadingFallback", () => {
  async function importComponent() {
    const { LoadingFallback } = await import("@/components/LoadingFallback");
    return LoadingFallback;
  }

  it("should render a Spinner component", async () => {
    const LoadingFallback = await importComponent();
    const { container } = render(<LoadingFallback />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have centered layout container", async () => {
    const LoadingFallback = await importComponent();
    const { container } = render(<LoadingFallback />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "h-32", "items-center", "justify-center");
  });
});
