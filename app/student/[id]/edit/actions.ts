"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function updateStudent(studentId: string, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string | null;
  const phoneNumber = formData.get("phoneNumber") as string | null;
  const gender = formData.get("gender") as string | null;
  const dateOfBirthRaw = formData.get("dateOfBirth") as string | null;
  const addressLine = formData.get("addressLine") as string | null;
  const postalCode = formData.get("postalCode") as string | null;
  const city = formData.get("city") as string | null;

  const dateOfBirth =
    dateOfBirthRaw ? new Date(dateOfBirthRaw) : null;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName,
      email: email || null,
      phoneNumber: phoneNumber || null,
      gender: gender || null,
      dateOfBirth,
      addressLine: addressLine || null,
      postalCode: postalCode || null,
      city: city || null,
    },
  });

  redirect(`/student/${studentId}`);
}
