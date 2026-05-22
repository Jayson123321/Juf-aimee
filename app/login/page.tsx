import AuthCard from "@/components/AuthCard";

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  return <AuthCard initialMode="login" error={error} />;
}
