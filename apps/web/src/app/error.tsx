"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Error reporting hook (Sentry lands in a later phase); keeps the digest findable in server logs.
    console.error(error);
  }, [error]);
  return (
    <StatusPage
      title="Something went wrong"
      actions={<><Button onClick={() => retry()}>Try again</Button><ButtonLink href="/" variant="secondary">Go home</ButtonLink></>}
    >
      We could not load this page. Your progress is safe. Try again, or head back home.
    </StatusPage>
  );
}
