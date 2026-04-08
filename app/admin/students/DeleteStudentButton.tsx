"use client";

import { useRouter } from "next/navigation";
import { deleteStudent } from "./queries";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteStudentButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this student?")) return;
    await deleteStudent(id);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={handleDelete}>
      <Trash2 className="size-3.5" />
    </Button>
  );
}
