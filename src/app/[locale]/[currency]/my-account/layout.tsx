import type { ReactNode } from "react";
import { MyAccountShell } from "@/components/account/MyAccountShell";

export const dynamic = "force-dynamic";

export default function MyAccountLayout({ children }: { children: ReactNode }) {
  return <MyAccountShell>{children}</MyAccountShell>;
}
