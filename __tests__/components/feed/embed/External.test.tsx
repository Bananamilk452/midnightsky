// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeEmbedExternalView } from "@/__tests__/helpers/feed";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
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

  it("should render external link card with thumbnail, title, and domain", async () => {
    const FeedExternal = await importComponent();
    render(
      <FeedExternal
        content={makeEmbedExternalView({
          external: {
            $type: "app.bsky.embed.external#viewExternal",
            uri: "https://example.com/article",
            title: "Test Article",
            description: "A test article",
            thumb: "https://example.com/thumb.jpg",
          },
        })}
      />,
    );

    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("A test article")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByAltText("Test Article")).toHaveAttribute(
      "src",
      "https://example.com/thumb.jpg",
    );
  });

  it("should render uri as title when title is empty", async () => {
    const FeedExternal = await importComponent();
    render(
      <FeedExternal
        content={makeEmbedExternalView({
          external: {
            $type: "app.bsky.embed.external#viewExternal",
            uri: "https://example.com/article",
            title: "",
            description: "A test article",
          },
        })}
      />,
    );

    expect(screen.getByText("https://example.com/article")).toBeInTheDocument();
  });
});
