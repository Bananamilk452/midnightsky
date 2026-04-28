// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMutateCreatePost = vi.fn();
const mockMutateStatus = { value: "idle" };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, Record<string, string>> = {
      Writer: {
        cancel: "Cancel",
        post: "Post",
        writePost: "Write Post",
        body: "Body",
        placeholder: "What's happening?",
        additionalText: "Additional",
        public: "Public",
        mutualOnly: "Mutual Only",
        list: "List",
        selectList: "Select List",
        loadingEditor: "Loading...",
        failedToCreate: "Failed",
        payloadTooLarge: "Too large",
        addImage: "Add Image",
      },
      Feed: {
        maxChars: "Max 250 chars",
      },
    };
    return map[ns]?.[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("@radix-ui/react-visually-hidden", () => ({
  VisuallyHidden: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

vi.mock("@tinymce/tinymce-react", () => ({
  Editor: () => <div data-testid="tinymce-editor">Editor</div>,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("lucide-react", () => ({
  SquarePenIcon: () => <svg />,
  ImageIcon: () => <svg />,
}));

vi.mock("@/components/Spinner", () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void;
    disabled?: boolean;
  }> &
    Record<string, unknown>) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open?: boolean }>) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  FormControl: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  FormField: ({
    render,
  }: {
    render: (props: {
      field: { value: string; onChange: ReturnType<typeof vi.fn> };
    }) => React.ReactNode;
  }) => render({ field: { value: "", onChange: vi.fn() } }),
  FormItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  FormLabel: ({ children }: React.PropsWithChildren) => (
    <label>{children}</label>
  ),
  FormMessage: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({
    children,
  }: React.PropsWithChildren<{
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }>) => <div>{children}</div>,
  RadioGroupItem: ({ value }: { value: string }) => (
    <input type="radio" value={value} />
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: React.PropsWithChildren<{ value: string }>) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  SelectValue: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

vi.mock("@/components/writer/ImageButton", () => ({
  ImageButton: () => <button data-testid="image-button">Add Image</button>,
}));

vi.mock("@/lib/bluesky/types", () => ({
  createPostSchema: () =>
    require("zod").z.object({
      blueskyContent: require("zod").z.string().max(250),
      content: require("zod").z.string(),
      type: require("zod").z.string(),
      reply: require("zod").z.any().optional(),
      listId: require("zod").z.string().optional(),
    }),
}));

vi.mock("@/lib/constants", () => ({
  BLUESKY_CONTENT_LIMIT: 250,
}));

vi.mock("@/lib/hooks/useBluesky", () => ({
  useCreatePost: () => ({
    mutate: mockMutateCreatePost,
    status: mockMutateStatus.value,
  }),
  useMyLists: () => ({ data: { lists: [] }, status: "success" }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
}));

describe("Writer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateStatus.value = "idle";
  });

  async function importComponent() {
    const { Writer } = await import("@/components/Writer");
    return Writer;
  }

  it("should render dialog when open", async () => {
    const Writer = await importComponent();
    render(<Writer open={true} setOpen={vi.fn()} hideTypeSelect={false} />);

    expect(screen.getAllByText("Write Post").length).toBeGreaterThan(0);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
  });

  it("should not render dialog when closed", async () => {
    const Writer = await importComponent();
    const { container } = render(
      <Writer open={false} setOpen={vi.fn()} hideTypeSelect={false} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("should render bluesky content textarea", async () => {
    const Writer = await importComponent();
    render(<Writer open={true} setOpen={vi.fn()} hideTypeSelect={false} />);

    expect(
      screen.getByPlaceholderText("What's happening?"),
    ).toBeInTheDocument();
  });

  it("should render type radio buttons when hideTypeSelect is false", async () => {
    const Writer = await importComponent();
    render(<Writer open={true} setOpen={vi.fn()} hideTypeSelect={false} />);

    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Mutual Only")).toBeInTheDocument();
    expect(screen.getByText("List")).toBeInTheDocument();
  });

  it("should not render type radio buttons when hideTypeSelect is true", async () => {
    const Writer = await importComponent();
    render(<Writer open={true} setOpen={vi.fn()} hideTypeSelect={true} />);

    expect(screen.queryByText("Public")).not.toBeInTheDocument();
    expect(screen.queryByText("Mutual Only")).not.toBeInTheDocument();
  });

  it("should render cancel button that calls setOpen(false)", async () => {
    const setOpen = vi.fn();
    const Writer = await importComponent();
    render(<Writer open={true} setOpen={setOpen} hideTypeSelect={false} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
