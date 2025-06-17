export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-violet-600 to-indigo-950 from-30%">
      {children}
    </div>
  );
}
