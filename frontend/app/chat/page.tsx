import { Suspense } from "react";
import ScanPageClient from "./ScanPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScanPageClient />
    </Suspense>
  );
}
