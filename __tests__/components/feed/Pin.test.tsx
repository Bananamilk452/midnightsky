// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeFeedViewPost, makeReasonPin } from "@/__tests__/helpers/feed";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => (key === "pinned" ? "Pinned" : key),
}));

vi.mock("lucide-react", () => ({
  PinIcon: () => <svg data-testid="pin-icon" />,
}));

describe("FeedPin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedPin } = await import("@/components/feed/Pin");
    return FeedPin;
  }

  it("should render pinned indicator", async () => {
    const FeedPin = await importComponent();
    const feed = makeFeedViewPost({
      reason: makeReasonPin(),
    });

    render(<FeedPin feed={feed} />);

    expect(screen.getByTestId("pin-icon")).toBeInTheDocument();
    expect(screen.getByText("Pinned")).toBeInTheDocument();
  });

  it("should not render when reason is not pin", async () => {
    const FeedPin = await importComponent();
    const feed = makeFeedViewPost({
      reason: { $type: "other" } as never,
    });
    const { container } = render(<FeedPin feed={feed} />);

    expect(container.innerHTML).toBe("");
  });
});
