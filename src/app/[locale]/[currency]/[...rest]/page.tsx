import { notFound } from "next/navigation";

// A missing URL only renders not-found.tsx when some matched page calls notFound().
export default function UnknownRoute() {
  notFound();
}
