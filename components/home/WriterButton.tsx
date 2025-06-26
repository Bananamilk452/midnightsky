import { SquarePenIcon } from "lucide-react";

export function WriterButton({ onClick }: { onClick?: () => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 cursor-pointer rounded-full bg-indigo-700 p-4 shadow-lg hover:bg-indigo-800"
      onClick={onClick}
    >
      <SquarePenIcon className="size-6 text-white" />
    </div>
  );
}
