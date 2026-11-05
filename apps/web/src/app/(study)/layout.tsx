import { Suspense, type ReactNode } from "react";
import ShellBody, { ShellFallback } from "@/components/app/shell-body";

/** Study layout: the P1 shell; the workspace manages its own full-height padding. */
export default function StudyLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <ShellBody>{children}</ShellBody>
    </Suspense>
  );
}
