import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import LoginClient from "./LoginClient";

async function login(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  // Check User table (teachers & admins)
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && (await bcrypt.compare(password, user.password))) {
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", String(user.id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/dashboard");
  }

  // Check Student table
  const student = email ? await prisma.student.findUnique({ where: { email } }) : null;
  if (student?.password && (await bcrypt.compare(password, student.password))) {
    const cookieStore = await cookies();
    cookieStore.set("session_student_id", String(student.id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect(`/student/${student.id}/profiel`);
  }

  redirect("/login?error=invalid");
}

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  return <LoginClient action={login} error={error} />;
}
