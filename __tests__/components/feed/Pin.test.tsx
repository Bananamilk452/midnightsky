// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key === "pinned" ? "Pinned" : key,
}));

vi.mock("lucide-react", () => ({
  PinIcon: () => <svg data-testid="pin-icon" />,
}));

vi.mock("@atproto/api/dist/client/types/app/bsky/feed/defs", () => ({
  isReasonPin: (reason: any) => reason?.$type === "app.bsky.feed.defs#reasonPin",
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
    const feed = {
      reason: { $type: "app.bsky.feed.defs#reasonPin" },
    } as any;

    render(<FeedPin feed={feed} />);

    expect(screen.getByTestId("pin-icon")).toBeInTheDocument();
    expect(screen.getByText("Pinned")).toBeInTheDocument();
  });

  it("should not render when reason is not pin", async () => {
    const FeedPin = await importComponent();
    const feed = { reason: { $type: "other" } } as any;
    const { container } = render(<FeedPin feed={feed} />);

    expect(container.innerHTML).toBe("");
  });
});
