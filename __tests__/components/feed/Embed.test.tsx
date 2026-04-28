// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeEmbedExternalView,
  makeEmbedImagesView,
  makeEmbedVideoView,
  wrapWithFeedContext,
} from "@/__tests__/helpers/feed";

vi.mock("@/components/feed", () => ({
  EmbedPost: ({ children }: React.PropsWithChildren) => (
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

describe("FeedEmbed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importModules() {
    const { FeedEmbed } = await import("@/components/feed/Embed");
    const { FeedContext } = await import("@/components/feed/context");
    return { FeedEmbed, FeedContext };
  }

  it("should render FeedImage for image embed", async () => {
    const { FeedEmbed } = await importModules();

    const embed = makeEmbedImagesView();

    render(wrapWithFeedContext(<FeedEmbed embed={embed} />));
    expect(screen.getByTestId("feed-image")).toBeInTheDocument();
  });

  it("should render FeedExternal for external embed", async () => {
    const { FeedEmbed } = await importModules();

    const embed = makeEmbedExternalView();

    render(wrapWithFeedContext(<FeedEmbed embed={embed} />));
    expect(screen.getByTestId("feed-external")).toBeInTheDocument();
  });

  it("should render FeedVideo for video embed", async () => {
    const { FeedEmbed } = await importModules();

    const embed = makeEmbedVideoView();

    render(wrapWithFeedContext(<FeedEmbed embed={embed} />));
    expect(screen.getByTestId("feed-video")).toBeInTheDocument();
  });
});
