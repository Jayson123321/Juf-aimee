import AuthCard from "@/components/AuthCard";

type SearchParams = Promise<{ error?: string }>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  return <AuthCard initialMode="register" error={error} />;
}
