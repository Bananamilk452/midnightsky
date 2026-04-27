// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/feed", () => ({
  EmbedPost: ({ post, children }: any) => (
    <div data-testid="embed-post">{children}</div>
  ),
}));

vi.mock("@/components/feed/embed/Image", () => ({
  FeedImage: () => <div data-testid="feed-image" />,
}));

vi.mock("@/components/feed/embed/External", () => ({
  FeedExternal: () => <div data-testid="feed-external" />,
}));

vi.mock("@/components/feed/embed/Video", () => ({
  FeedVideo: () => <div data-testid="feed-video" />,
}));

vi.mock("@/lib/bluesky/utils", () => ({
  validateRecord: () => ({ createdAt: "2024-01-01T00:00:00Z", text: "test" }),
}));

describe("FeedEmbed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedEmbed } = await import("@/components/feed/Embed");
    return FeedEmbed;
  }

  it("should render FeedImage for image embed", async () => {
    const { AppBskyEmbedImages } = await import("@atproto/api");
    const FeedEmbed = await importComponent();

    const embed = { $type: "app.bsky.embed.images#view", images: [] };
    vi.spyOn(AppBskyEmbedImages, "isView").mockReturnValue(true);

    render(<FeedEmbed embed={embed as any} />);
    expect(screen.getByTestId("feed-image")).toBeInTheDocument();
  });

  it("should render FeedExternal for external embed", async () => {
    const { AppBskyEmbedImages, AppBskyEmbedExternal } = await import("@atproto/api");
    const FeedEmbed = await importComponent();

    const embed = {
      $type: "app.bsky.embed.external#view",
      external: { uri: "https://example.com", title: "Test" },
    };
    vi.spyOn(AppBskyEmbedImages, "isView").mockReturnValue(false);
    vi.spyOn(AppBskyEmbedExternal, "isView").mockReturnValue(true);

    render(<FeedEmbed embed={embed as any} />);
    expect(screen.getByTestId("feed-external")).toBeInTheDocument();
  });

  it("should render FeedVideo for video embed", async () => {
    const {
      AppBskyEmbedImages,
      AppBskyEmbedExternal,
      AppBskyEmbedRecord,
      AppBskyEmbedRecordWithMedia,
      AppBskyEmbedVideo,
    } = await import("@atproto/api");
    const FeedEmbed = await importComponent();

    const embed = { $type: "app.bsky.embed.video#view", playlist: "https://example.com/playlist.m3u8" };
    vi.spyOn(AppBskyEmbedImages, "isView").mockReturnValue(false);
    vi.spyOn(AppBskyEmbedExternal, "isView").mockReturnValue(false);
    vi.spyOn(AppBskyEmbedRecord, "isView").mockReturnValue(false);
    vi.spyOn(AppBskyEmbedRecordWithMedia, "isView").mockReturnValue(false);
    vi.spyOn(AppBskyEmbedVideo, "isView").mockReturnValue(true);

    render(<FeedEmbed embed={embed as any} />);
    expect(screen.getByTestId("feed-video")).toBeInTheDocument();
  });
});
