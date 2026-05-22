import AuthTransition from "@/components/AuthTransition";

export default function RegisterTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthTransition>{children}</AuthTransition>;
}
