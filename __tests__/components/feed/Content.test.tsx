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

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("FeedContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedContent } = await import("@/components/feed/Content");
    return FeedContent;
  }

  it("should render plain text", async () => {
    const FeedContent = await importComponent();
    render(<FeedContent text="Hello world" facets={undefined} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("should render text with link facet", async () => {
    const FeedContent = await importComponent();
    render(
      <FeedContent
        text="Check this https://example.com out"
        facets={[
          {
            index: { byteStart: 11, byteEnd: 30 },
            features: [{ $type: "app.bsky.richtext.facet#link", uri: "https://example.com" }],
          },
        ]}
      />,
    );

    const link = screen.getByText("https://example.com");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com");
  });

  it("should render text with mention facet", async () => {
    const FeedContent = await importComponent();
    render(
      <FeedContent
        text="Hello @alice.bsky.social"
        facets={[
          {
            index: { byteStart: 6, byteEnd: 24 },
            features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:abc123" }],
          },
        ]}
      />,
    );

    const mention = screen.getByText("@alice.bsky.social");
    expect(mention).toBeInTheDocument();
    expect(mention.closest("a")).toHaveAttribute("href", "/profile/did:plc:abc123");
  });

  it("should render empty text", async () => {
    const FeedContent = await importComponent();
    const { container } = render(<FeedContent text="" facets={undefined} />);

    const p = container.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p).toBeEmptyDOMElement();
  });

  it("should render text with tag facet", async () => {
    const FeedContent = await importComponent();
    render(
      <FeedContent
        text="Hello #test"
        facets={[
          {
            index: { byteStart: 6, byteEnd: 11 },
            features: [{ $type: "app.bsky.richtext.facet#tag", tag: "test" }],
          },
        ]}
      />,
    );

    const tag = screen.getByText("#test");
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass("text-blue-500");
  });
});
