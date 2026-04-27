// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      adultContent: "Adult Content",
      nudity: "Nudity",
      graphicMedia: "Graphic Media",
      show: "Show",
      hide: "Hide",
    };
    return map[key] || key;
  },
}));

vi.mock("lucide-react", () => ({
  CircleAlertIcon: () => <svg data-testid="circle-alert" />,
}));

describe("FeedLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedLabel } = await import("@/components/feed/Label");
    return FeedLabel;
  }

  it("should render children when no labels", async () => {
    const FeedLabel = await importComponent();
    render(<FeedLabel>Content</FeedLabel>);

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render children when labels is empty array", async () => {
    const FeedLabel = await importComponent();
    render(<FeedLabel labels={[]}>Content</FeedLabel>);

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should show warning and hide content by default when labels exist", async () => {
    const FeedLabel = await importComponent();
    render(
      <FeedLabel labels={[{ val: "sexual" } as any]}>
        <span data-testid="content">Hidden content</span>
      </FeedLabel>,
    );

    expect(screen.getByText("Adult Content")).toBeInTheDocument();
    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("should toggle show/hide on button click", async () => {
    const FeedLabel = await importComponent();
    render(
      <FeedLabel labels={[{ val: "sexual" } as any]}>
        <span data-testid="content">Hidden content</span>
      </FeedLabel>,
    );

    fireEvent.click(screen.getByText("Show"));

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("Hide")).toBeInTheDocument();
  });

  it("should filter out !no-unauthenticated labels", async () => {
    const FeedLabel = await importComponent();
    render(
      <FeedLabel labels={[{ val: "!no-unauthenticated" } as any]}>
        Content
      </FeedLabel>,
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
