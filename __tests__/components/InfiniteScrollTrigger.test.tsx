// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRef = { current: null };
const mockIsIntersecting = { value: false };

vi.mock("usehooks-ts", () => ({
  useIntersectionObserver: () => ({
    isIntersecting: mockIsIntersecting.value,
    ref: (el: HTMLElement | null) => {
      mockRef.current = el;
    },
  }),
}));

describe("InfiniteScrollTrigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsIntersecting.value = false;
  });

  async function importComponent() {
    const { InfiniteScrollTrigger } = await import(
      "@/components/InfiniteScrollTrigger"
    );
    return InfiniteScrollTrigger;
  }

  it("should render a trigger div element", async () => {
    const InfiniteScrollTrigger = await importComponent();
    const { container } = render(
      <InfiniteScrollTrigger
        onTrigger={vi.fn()}
        hasNextPage={true}
        isFetching={false}
      />,
    );

    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should show Spinner when isFetching is true", async () => {
    const InfiniteScrollTrigger = await importComponent();
    const { container } = render(
      <InfiniteScrollTrigger
        onTrigger={vi.fn()}
        hasNextPage={true}
        isFetching={true}
      />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should not show Spinner when isFetching is false", async () => {
    const InfiniteScrollTrigger = await importComponent();
    const { container } = render(
      <InfiniteScrollTrigger
        onTrigger={vi.fn()}
        hasNextPage={true}
        isFetching={false}
      />,
    );

    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });

  it("should call onTrigger when intersecting with hasNextPage and not fetching", async () => {
    const onTrigger = vi.fn();
    mockIsIntersecting.value = true;

    const InfiniteScrollTrigger = await importComponent();
    render(
      <InfiniteScrollTrigger
        onTrigger={onTrigger}
        hasNextPage={true}
        isFetching={false}
      />,
    );

    expect(onTrigger).toHaveBeenCalled();
  });
});
