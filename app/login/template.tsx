import AuthTransition from "@/components/AuthTransition";

export default function LoginTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthTransition>{children}</AuthTransition>;
}
