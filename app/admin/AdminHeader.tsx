"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/admin/students": { title: "Studenten", description: "Manage all students" },
  "/admin/teachers": { title: "Leraren", description: "Manage all teachers" },
  "/admin/settings": { title: "Instellingen", description: "System settings" },
};

export default function AdminHeader({ userName }: { userName: string }) {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: "General Dashboard", description: "" };

  const description = pathname === "/admin"
    ? `Welcome back, ${userName}`
    : page.description;

  return (
    <header className="w-full text-white px-8 py-6 border-b border-white/10" style={{ backgroundColor: "oklch(0.18 0.07 255)" }}>
      <h1 className="text-2xl font-bold tracking-tight">{page.title}</h1>
      {description && (
        <p className="text-sm text-white/60 mt-0.5">{description}</p>
      )}
    </header>
  );
}
