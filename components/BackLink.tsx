import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Consistent "back" link used across the app.
 * Defaults to the teacher dashboard; pass `href`/`label` to point elsewhere.
 */
export function BackLink({
  href = "/dashboard",
  label = "Terug naar dashboard",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-orange-600"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}
