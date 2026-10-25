import type { Metadata } from "next";
import { ViewerLab } from "../../../components/lab/viewer-lab";

export const metadata: Metadata = { title: "Viewer lab", robots: { index: false, follow: false } };

export default function Page() {
  return <ViewerLab />;
}
