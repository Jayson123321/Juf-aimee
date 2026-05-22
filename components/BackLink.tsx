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
      className="group inline-flex items-center gap-2.5 text-sm font-semibold text-gray-600 transition hover:text-orange-600"
    >
      {/* Arrow in an orange badge with an orange shadow glow behind it */}
      <span className="flex size-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-[0_4px_12px_rgba(251,146,60,0.5)] transition-all duration-200 group-hover:-translate-x-0.5 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-[0_5px_16px_rgba(251,146,60,0.65)]">
        <ArrowLeft className="size-4" />
      </span>
      {label}
    </Link>
  );
}
