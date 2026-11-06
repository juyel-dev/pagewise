import { Suspense, type ReactNode } from "react";
import ShellBody, { ShellFallback } from "@/components/app/shell-body";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <ShellBody mainClassName="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</ShellBody>
    </Suspense>
  );
}
