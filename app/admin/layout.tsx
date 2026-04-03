import { Nav, NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
    children: React.ReactNode;
  }>) {
  return <>
  <Nav>
    <NavLink href="/admin"> Dashboard</NavLink>
    <NavLink href="/admin/teachers"> Teachers</NavLink>
    <NavLink href="/admin/students"> Students</NavLink>
    </Nav>
    <div className="container pl-6">{children}</div>
  </>
}
