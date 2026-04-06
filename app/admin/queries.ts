"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function addTeacher(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      
      password: hashedPassword,
      role: "TEACHER",
    },
  });
}

export async function deleteTeacher(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function updateTeacher(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const data: { name: string; email: string; password?: string } = { name, email };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  return prisma.user.update({ where: { id }, data });
}
