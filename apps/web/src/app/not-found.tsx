import { ButtonLink } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="This page isn't in the chapter"
      actions={<><ButtonLink href="/study">Go to Study</ButtonLink><ButtonLink href="/" variant="secondary">Home</ButtonLink></>}
    >
      The link may be old, or the chapter is not published yet.
    </StatusPage>
  );
}
