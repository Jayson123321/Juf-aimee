"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function updateStudent(studentId: string, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string | null;
  const gender = formData.get("gender") as string | null;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName,
      email: email || null,
      gender: gender || null,
    },
  });

  redirect(`/student/${studentId}`);
}
