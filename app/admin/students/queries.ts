"use server";

import { prisma } from "@/lib/db";

export async function addStudent(formData: FormData) {
  const fullName = formData.get("fullName")?.toString().trim();
  const email = formData.get("email")?.toString().trim() || null;
  const gender = formData.get("gender")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;
  const groep = formData.get("groep")?.toString().trim() || null;

  if (!fullName) throw new Error("Full name is required");

  return prisma.student.create({
    data: { fullName, email, gender, city, groep },
  });
}

export async function updateStudent(id: string, formData: FormData) {
  const fullName = formData.get("fullName")?.toString().trim();
  const email = formData.get("email")?.toString().trim() || null;
  const gender = formData.get("gender")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;
  const groep = formData.get("groep")?.toString().trim() || null;

  if (!fullName) throw new Error("Full name is required");

  return prisma.student.update({
    where: { id },
    data: { fullName, email, gender, city, groep },
  });
}

export async function deleteStudent(id: string) {
  return prisma.student.delete({ where: { id } });
}
