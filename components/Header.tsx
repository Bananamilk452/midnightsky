export function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex w-full items-center justify-start bg-black/30 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}
