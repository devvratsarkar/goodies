import { LuTriangleAlert } from "react-icons/lu";

export default function CheckoutAlert({ message, className = "" }: { message: string; className?: string }) {
  return (
    <p role="alert" className={`flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2.5 text-sm font-medium leading-5 text-primary ${className}`}>
      <LuTriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
