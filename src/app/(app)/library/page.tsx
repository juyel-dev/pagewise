import { redirect } from "next/navigation";

/** The Library merged into the Study hub (decision 36). Old URLs keep working via this redirect. */
export default function LibraryPage() {
  redirect("/study");
}
