// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  VisuallyHidden: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@tinymce/tinymce-react", () => ({
  Editor: ({ onInit }: any) => {
    return <div data-testid="tinymce-editor">Editor</div>;
  },
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
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: "", onChange: vi.fn() } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, onValueChange, defaultValue }: any) => <div>{children}</div>,
  RadioGroupItem: ({ value }: any) => <input type="radio" value={value} />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
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
  useCreatePost: () => ({ mutate: mockMutateCreatePost, status: mockMutateStatus.value }),
  useMyLists: () => ({ data: { lists: [] }, status: "success" }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
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
    const { container } = render(<Writer open={false} setOpen={vi.fn()} hideTypeSelect={false} />);

    expect(container.innerHTML).toBe("");
  });

  it("should render bluesky content textarea", async () => {
    const Writer = await importComponent();
    render(<Writer open={true} setOpen={vi.fn()} hideTypeSelect={false} />);

    expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
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
