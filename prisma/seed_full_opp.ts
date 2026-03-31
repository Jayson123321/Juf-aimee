import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- Subjects ----------
  const [rekenen, taal, wereldorientatie, kunst, techniek] = await Promise.all([
    prisma.subject.upsert({
      where: { id: "subject-rekenen" },
      update: {},
      create: { id: "subject-rekenen", name: "Rekenen", description: "Getallen, berekeningen en probleemoplossen" },
    }),
    prisma.subject.upsert({
      where: { id: "subject-taal" },
      update: {},
      create: { id: "subject-taal", name: "Taal", description: "Lezen, schrijven en communicatie" },
    }),
    prisma.subject.upsert({
      where: { id: "subject-wo" },
      update: {},
      create: { id: "subject-wo", name: "Wereldoriëntatie", description: "Aardrijkskunde, geschiedenis en natuur" },
    }),
    prisma.subject.upsert({
      where: { id: "subject-kunst" },
      update: {},
      create: { id: "subject-kunst", name: "Kunst & Creativiteit", description: "Tekenen, schilderen en beeldende vorming" },
    }),
    prisma.subject.upsert({
      where: { id: "subject-techniek" },
      update: {},
      create: { id: "subject-techniek", name: "Techniek", description: "Bouwen, programmeren en onderzoeken" },
    }),
  ]);

  // ---------- Students ----------
  const studentsData = [
    {
      id: "student-emma",
      fullName: "Emma de Vries",
      dateOfBirth: new Date("2015-03-12"),
      gender: "Vrouw",
      email: "emma.devries@school.nl",
      phoneNumber: "06-11223344",
      addressLine: "Zonnebloemstraat 4",
      postalCode: "1011 AA",
      city: "Amsterdam",
      profile: {
        registrationNumber: "STU-2024-001",
        currentSchoolYearGroup: "Groep 5",
        currentTeacher: "Mevrouw Bakker",
        schoolOfOrigin: "Basisschool De Zon",
      },
    },
    {
      id: "student-noah",
      fullName: "Noah Bakker",
      dateOfBirth: new Date("2014-07-28"),
      gender: "Man",
      email: "noah.bakker@school.nl",
      phoneNumber: "06-22334455",
      addressLine: "Kerkstraat 19",
      postalCode: "2512 BX",
      city: "Den Haag",
      profile: {
        registrationNumber: "STU-2024-002",
        currentSchoolYearGroup: "Groep 6",
        currentTeacher: "Meneer Visser",
        schoolOfOrigin: "Basisschool Het Kompas",
      },
    },
    {
      id: "student-sofia",
      fullName: "Sofia Meijer",
      dateOfBirth: new Date("2015-11-05"),
      gender: "Vrouw",
      email: "sofia.meijer@school.nl",
      phoneNumber: "06-33445566",
      addressLine: "Tulpenlaan 7",
      postalCode: "3021 CK",
      city: "Rotterdam",
      profile: {
        registrationNumber: "STU-2024-003",
        currentSchoolYearGroup: "Groep 5",
        currentTeacher: "Mevrouw Bakker",
        schoolOfOrigin: "Basisschool De Regenboog",
      },
    },
    {
      id: "student-liam",
      fullName: "Liam Janssen",
      dateOfBirth: new Date("2016-01-19"),
      gender: "Man",
      email: "liam.janssen@school.nl",
      phoneNumber: "06-44556677",
      addressLine: "Molenweg 33",
      postalCode: "5611 DA",
      city: "Eindhoven",
      profile: {
        registrationNumber: "STU-2024-004",
        currentSchoolYearGroup: "Groep 4",
        currentTeacher: "Meneer Visser",
        schoolOfOrigin: "Basisschool De Linde",
      },
    },
    {
      id: "student-julia",
      fullName: "Julia van Loon",
      dateOfBirth: new Date("2014-09-30"),
      gender: "Vrouw",
      email: "julia.vanloon@school.nl",
      phoneNumber: "06-55667788",
      addressLine: "Havenstraat 12",
      postalCode: "9711 EK",
      city: "Groningen",
      profile: {
        registrationNumber: "STU-2024-005",
        currentSchoolYearGroup: "Groep 6",
        currentTeacher: "Mevrouw Bakker",
        schoolOfOrigin: "Basisschool De Beuk",
      },
    },
  ];

  for (const { profile, ...studentData } of studentsData) {
    await prisma.student.upsert({
      where: { id: studentData.id },
      update: {},
      create: studentData,
    });

    await prisma.studentProfile.upsert({
      where: { studentId: studentData.id },
      update: {},
      create: { studentId: studentData.id, ...profile },
    });
  }

  // ---------- Assignments ----------
  const assignments = [
    // Emma
    { id: "a-1", title: "Breuken optellen", studentId: "student-emma", subjectId: rekenen.id, status: "COMPLETED" as const, bloomLevel: "Toepassen", dueDate: new Date("2026-03-10") },
    { id: "a-2", title: "Verslag planeten", studentId: "student-emma", subjectId: wereldorientatie.id, status: "IN_PROGRESS" as const, bloomLevel: "Analyseren", dueDate: new Date("2026-04-01") },
    { id: "a-3", title: "Verhaal schrijven", studentId: "student-emma", subjectId: taal.id, status: "PENDING" as const, bloomLevel: "Creëren", dueDate: new Date("2026-04-14") },
    // Noah
    { id: "a-4", title: "Robot bouwen", studentId: "student-noah", subjectId: techniek.id, status: "IN_PROGRESS" as const, bloomLevel: "Creëren", dueDate: new Date("2026-04-07") },
    { id: "a-5", title: "Tafels oefenen", studentId: "student-noah", subjectId: rekenen.id, status: "COMPLETED" as const, bloomLevel: "Onthouden", dueDate: new Date("2026-03-15") },
    { id: "a-6", title: "Spreekbeurt techniek", studentId: "student-noah", subjectId: taal.id, status: "PENDING" as const, bloomLevel: "Begrijpen", dueDate: new Date("2026-04-21") },
    // Sofia
    { id: "a-7", title: "Zelfportret schilderen", studentId: "student-sofia", subjectId: kunst.id, status: "COMPLETED" as const, bloomLevel: "Creëren", dueDate: new Date("2026-03-20") },
    { id: "a-8", title: "Kunstgeschiedenis werkstuk", studentId: "student-sofia", subjectId: kunst.id, status: "IN_PROGRESS" as const, bloomLevel: "Evalueren", dueDate: new Date("2026-04-05") },
    { id: "a-9", title: "Klokkijken", studentId: "student-sofia", subjectId: rekenen.id, status: "COMPLETED" as const, bloomLevel: "Toepassen", dueDate: new Date("2026-03-08") },
    // Liam
    { id: "a-10", title: "Dieren in de natuur", studentId: "student-liam", subjectId: wereldorientatie.id, status: "PENDING" as const, bloomLevel: "Begrijpen", dueDate: new Date("2026-04-10") },
    { id: "a-11", title: "Optellen tot 100", studentId: "student-liam", subjectId: rekenen.id, status: "IN_PROGRESS" as const, bloomLevel: "Onthouden", dueDate: new Date("2026-03-28") },
    // Julia
    { id: "a-12", title: "Boekbespreking", studentId: "student-julia", subjectId: taal.id, status: "COMPLETED" as const, bloomLevel: "Evalueren", dueDate: new Date("2026-03-05") },
    { id: "a-13", title: "Gedicht schrijven", studentId: "student-julia", subjectId: taal.id, status: "IN_PROGRESS" as const, bloomLevel: "Creëren", dueDate: new Date("2026-04-03") },
    { id: "a-14", title: "Geschiedenis van Amsterdam", studentId: "student-julia", subjectId: wereldorientatie.id, status: "PENDING" as const, bloomLevel: "Analyseren", dueDate: new Date("2026-04-17") },
  ];

  for (const assignment of assignments) {
    await prisma.assignment.upsert({
      where: { id: assignment.id },
      update: {},
      create: assignment,
    });
  }

  console.log("Seeded: 5 students, 5 subjects, 14 assignments");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
