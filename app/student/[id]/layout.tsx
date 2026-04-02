import { Nav, NavLink } from "@/components/Nav";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Nav>
        <NavLink href={`/student/${id}`}>Profiel</NavLink>
        <NavLink href={`/student/${id}/assignments`}>Opdrachten</NavLink>
      </Nav>
      <div className="w-full px-6 py-8">{children}</div>
    </>
  );
}
