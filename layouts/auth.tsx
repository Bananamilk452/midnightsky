import { Meteor } from "@/components/layouts/Meteor";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-linear-to-br h-dvh w-dvw from-violet-600 from-10% to-indigo-950">
      <Meteor />
      <div className="absolute inset-0 z-10 flex size-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
