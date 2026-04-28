// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
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
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardFooter: ({ children }: React.PropsWithChildren) => (
    <div data-testid="card-footer">{children}</div>
  ),
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
}));

describe("ErrorBoundaryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { ErrorBoundaryPage } = await import(
      "@/components/ErrorBoundaryPage"
    );
    return ErrorBoundaryPage;
  }

  it("should render error message", async () => {
    const ErrorBoundaryPage = await importComponent();
    render(
      <ErrorBoundaryPage
        error={{ message: "Something went wrong" } as Error}
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("should render try again button when onReset is provided", async () => {
    const ErrorBoundaryPage = await importComponent();
    const onReset = vi.fn();
    render(
      <ErrorBoundaryPage
        error={{ message: "Error" } as Error}
        onReset={onReset}
      />,
    );

    const button = screen.getByText("Try Again");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("should not render try again button when onReset is not provided", async () => {
    const ErrorBoundaryPage = await importComponent();
    render(<ErrorBoundaryPage error={{ message: "Error" } as Error} />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("should render within a card", async () => {
    const ErrorBoundaryPage = await importComponent();
    render(<ErrorBoundaryPage error={{ message: "Error" } as Error} />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });
});
