"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStudent(formData: FormData) {
  const fullName = formData.get("fullName")?.toString().trim();
  if (!fullName) {
    redirect("/students?error=naam");
  }

  const email = formData.get("email")?.toString().trim() || null;
  const gender = formData.get("gender")?.toString() || null;
  const groep = formData.get("groep")?.toString().trim() || null;
  const dob = formData.get("dateOfBirth")?.toString();

  let created = false;
  try {
    await prisma.student.create({
      data: {
        fullName,
        email,
        gender,
        groep,
        dateOfBirth: dob ? new Date(dob) : null,
      },
    });
    created = true;
  } catch {
    // e.g. duplicate e-mail (the column is unique)
    created = false;
  }

  if (!created) {
    redirect("/students?error=opslaan");
  }

  revalidatePath("/students");
  redirect("/students");
}
