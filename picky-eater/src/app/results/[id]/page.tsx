import { Suspense } from "react";
import { ItemDetail } from "@/components/ItemDetail";

// Results live in the browser (sessionStorage), so the detail view is a client
// component. Suspense lets Next prerender the page shell and fill in the dish on the client.
export default function ItemDetailPage() {
  return (
    <Suspense fallback={null}>
      <ItemDetail />
    </Suspense>
  );
}
