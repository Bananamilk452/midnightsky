// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => ({
  EarthIcon: () => <svg data-testid="earth-icon" />,
}));

describe("FeedExternal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedExternal } = await import("@/components/feed/embed/External");
    return FeedExternal;
  }

  const mockContent = (overrides?: Partial<any>) => ({
    external: {
      uri: "https://example.com/article",
      title: "Test Article",
      description: "A test article",
      thumb: "https://example.com/thumb.jpg",
      ...overrides,
    },
  });

  it("should render external link card with thumbnail, title, and domain", async () => {
    const FeedExternal = await importComponent();
    render(<FeedExternal content={mockContent()} />);

    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("A test article")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByAltText("Test Article")).toHaveAttribute("src", "https://example.com/thumb.jpg");
  });

  it("should render uri as title when title is empty", async () => {
    const FeedExternal = await importComponent();
    render(<FeedExternal content={mockContent({ title: "" })} />);

    expect(screen.getByText("https://example.com/article")).toBeInTheDocument();
  });
});
