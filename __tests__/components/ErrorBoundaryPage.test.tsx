// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      title: "Error",
      tryAgain: "Try Again",
    };
    return map[key] || key;
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}));

describe("ErrorBoundaryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { ErrorBoundaryPage } = await import("@/components/ErrorBoundaryPage");
    return ErrorBoundaryPage;
  }

  it("should render error message", async () => {
    const ErrorBoundaryPage = await importComponent();
    render(<ErrorBoundaryPage error={{ message: "Something went wrong" }} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should render try again button when onReset is provided", async () => {
    const ErrorBoundaryPage = await importComponent();
    const onReset = vi.fn();
    render(<ErrorBoundaryPage error={{ message: "Error" }} onReset={onReset} />);

    const button = screen.getByText("Try Again");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("should not render try again button when onReset is not provided", async () => {
    const ErrorBoundaryPage = await importComponent();
    render(<ErrorBoundaryPage error={{ message: "Error" }} />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("should render within a card", async () => {
    const ErrorBoundaryPage = await importComponent();
    render(<ErrorBoundaryPage error={{ message: "Error" }} />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });
});
