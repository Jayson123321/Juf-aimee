"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudent } from "./queries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";

type Props = {
  student: {
    id: string;
    fullName: string;
    email: string | null;
    gender: string | null;
    city: string | null;
    groep: string | null;
  };
};

export default function EditStudentButton({ student }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    try {
      await updateStudent(student.id, formData);
      setOpen(false);
      setError(null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7" >
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={student.fullName} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={student.email ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" name="gender" defaultValue={student.gender ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={student.city ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="groep">Groep</Label>
            <Input id="groep" name="groep" defaultValue={student.groep ?? ""} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
