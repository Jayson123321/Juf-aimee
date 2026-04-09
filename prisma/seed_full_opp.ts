import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- Admin user ----------
  const hashedPassword = await bcrypt.hash("123456789", 10);
  await prisma.user.upsert({
    where: { email: "email@admin.nl" },
    update: {},
    create: {
      email: "email@admin.nl",
      name: "SUPERUSER",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // ---------- Teachers ----------
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teachersData = [
    { id: "teacher-bakker", name: "Mevrouw Bakker", email: "bakker@school.nl" },
    { id: "teacher-visser", name: "Meneer Visser",  email: "visser@school.nl" },
    { id: "teacher-smit",   name: "Mevrouw Smit",   email: "smit@school.nl"   },
    { id: "teacher-dejong", name: "Meneer de Jong", email: "dejong@school.nl" },
  ];
  for (const teacher of teachersData) {
    await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: { ...teacher, password: teacherPassword, role: "TEACHER" },
    });
  }

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
  // Based on the 6 fictional student profiles defined by the client (docs/Prototype/dashboard.md)
  const studentPassword = await bcrypt.hash("student123", 10);
  const studentsData = [
    {
      id: "student-julia",
      fullName: "Julia van Loon",
      dateOfBirth: new Date("2013-09-30"),
      gender: "Vrouw",
      email: "julia.vanloon@school.nl",
      phoneNumber: "06-55667788",
      addressLine: "Havenstraat 12",
      postalCode: "9711 EK",
      city: "Groningen",
      groep: "Groep 6",
      bloomNiveau: 5,
      primaryTeacherId: "teacher-bakker",
      profile: {
        registrationNumber: "STU-2024-001",
        currentSchoolYearGroup: "Groep 6",
        currentTeacher: "Mevrouw Bakker",
        schoolOfOrigin: "Basisschool De Beuk",
      },
    },
    {
      id: "student-milan",
      fullName: "Milan de Groot",
      dateOfBirth: new Date("2013-05-14"),
      gender: "Man",
      email: "milan.degroot@school.nl",
      phoneNumber: "06-11223344",
      addressLine: "Zonnebloemstraat 4",
      postalCode: "1011 AA",
      city: "Amsterdam",
      groep: "Groep 6",
      bloomNiveau: 4,
      primaryTeacherId: "teacher-visser",
      profile: {
        registrationNumber: "STU-2024-002",
        currentSchoolYearGroup: "Groep 6",
        currentTeacher: "Meneer Visser",
        schoolOfOrigin: "Basisschool Het Kompas",
      },
    },
    {
      id: "student-sophie",
      fullName: "Sophie Meijer",
      dateOfBirth: new Date("2014-11-05"),
      gender: "Vrouw",
      email: "sophie.meijer@school.nl",
      phoneNumber: "06-33445566",
      addressLine: "Tulpenlaan 7",
      postalCode: "3021 CK",
      city: "Rotterdam",
      groep: "Groep 5",
      bloomNiveau: 3,
      primaryTeacherId: "teacher-bakker",
      profile: {
        registrationNumber: "STU-2024-003",
        currentSchoolYearGroup: "Groep 5",
        currentTeacher: "Mevrouw Bakker",
        schoolOfOrigin: "Basisschool De Regenboog",
      },
    },
    {
      id: "student-daan",
      fullName: "Daan Verbeek",
      dateOfBirth: new Date("2013-07-22"),
      gender: "Man",
      email: "daan.verbeek@school.nl",
      phoneNumber: "06-22334455",
      addressLine: "Kerkstraat 19",
      postalCode: "2512 BX",
      city: "Den Haag",
      groep: "Groep 6",
      bloomNiveau: 4,
      primaryTeacherId: "teacher-visser",
      profile: {
        registrationNumber: "STU-2024-004",
        currentSchoolYearGroup: "Groep 6",
        currentTeacher: "Meneer Visser",
        schoolOfOrigin: "Basisschool De Linde",
      },
    },
    {
      id: "student-emma",
      fullName: "Emma Koster",
      dateOfBirth: new Date("2015-03-12"),
      gender: "Vrouw",
      email: "emma.koster@school.nl",
      phoneNumber: "06-44556677",
      addressLine: "Molenweg 33",
      postalCode: "5611 DA",
      city: "Eindhoven",
      groep: "Groep 4",
      bloomNiveau: 3,
      primaryTeacherId: "teacher-smit",
      profile: {
        registrationNumber: "STU-2024-005",
        currentSchoolYearGroup: "Groep 4",
        currentTeacher: "Mevrouw Smit",
        schoolOfOrigin: "Basisschool De Zon",
      },
    },
    {
      id: "student-noah",
      fullName: "Noah Smit",
      dateOfBirth: new Date("2013-08-18"),
      gender: "Man",
      email: "noah.smit@school.nl",
      phoneNumber: "06-66778899",
      addressLine: "Brugstraat 5",
      postalCode: "6811 EM",
      city: "Arnhem",
      groep: "Groep 6",
      bloomNiveau: 4,
      primaryTeacherId: "teacher-smit",
      profile: {
        registrationNumber: "STU-2024-006",
        currentSchoolYearGroup: "Groep 6",
        currentTeacher: "Mevrouw Smit",
        schoolOfOrigin: "Basisschool De Eik",
      },
    },
  ];

  for (const { profile, ...studentData } of studentsData) {
    const student = await prisma.student.upsert({
      where: { id: studentData.id },
      update: { password: studentPassword, bloomNiveau: studentData.bloomNiveau, email: studentData.email },
      create: { ...studentData, password: studentPassword },
    });

    await prisma.studentProfile.upsert({
      where: { studentId: student.id },
      update: {},
      create: { studentId: student.id, ...profile },
    });
  }

  // ---------- Assignments ----------
  // Tailored to each student's profile and interests (docs/Prototype/dashboard.md)
  const assignments = [
    // Julia van Loon — verbaal sterk, perfectionistisch, faalangst → Taal, Evalueren/Creëren
    { id: "a-1",  title: "Boekbespreking: eigen keuze",          studentId: "student-julia", subjectId: taal.id,            status: "COMPLETED"   as const, bloomLevel: "Evalueren",  dueDate: new Date("2026-03-05") },
    { id: "a-2",  title: "Gedicht schrijven over een herinnering", studentId: "student-julia", subjectId: taal.id,           status: "IN_PROGRESS" as const, bloomLevel: "Creëren",    dueDate: new Date("2026-04-03") },
    { id: "a-3",  title: "Geschiedenis van Amsterdam",            studentId: "student-julia", subjectId: wereldorientatie.id, status: "PENDING"    as const, bloomLevel: "Analyseren", dueDate: new Date("2026-04-17") },

    // Milan de Groot — logisch/analytisch, techniek, dominant in samenwerking → Techniek, Rekenen, Toepassen
    { id: "a-4",  title: "Robot bouwen met instructiekaart",      studentId: "student-milan", subjectId: techniek.id,        status: "IN_PROGRESS" as const, bloomLevel: "Creëren",    dueDate: new Date("2026-04-07") },
    { id: "a-5",  title: "Oplossingsstrategieën in wiskunde",     studentId: "student-milan", subjectId: rekenen.id,         status: "COMPLETED"   as const, bloomLevel: "Toepassen",  dueDate: new Date("2026-03-15") },
    { id: "a-6",  title: "Conflicten aanpakken: plan schrijven",  studentId: "student-milan", subjectId: taal.id,            status: "PENDING"     as const, bloomLevel: "Toepassen",  dueDate: new Date("2026-04-21") },

    // Sophie Meijer — taalsterk, gevoelig, onzeker → Taal, Kunst, Begrijpen/Toepassen
    { id: "a-7",  title: "Zelfportret schilderen",                studentId: "student-sophie", subjectId: kunst.id,          status: "COMPLETED"   as const, bloomLevel: "Creëren",    dueDate: new Date("2026-03-20") },
    { id: "a-8",  title: "Verslag schrijven over een kunstenaar", studentId: "student-sophie", subjectId: taal.id,           status: "IN_PROGRESS" as const, bloomLevel: "Begrijpen",  dueDate: new Date("2026-04-05") },
    { id: "a-9",  title: "Klokkijken en tijdrekening",           studentId: "student-sophie", subjectId: rekenen.id,        status: "COMPLETED"   as const, bloomLevel: "Toepassen",  dueDate: new Date("2026-03-08") },

    // Daan Verbeek — analytisch, bouwen/natuur, frustratiegevoelig → Techniek, Wereldoriëntatie
    { id: "a-10", title: "Dieren in hun ecosysteem",              studentId: "student-daan",  subjectId: wereldorientatie.id, status: "PENDING"    as const, bloomLevel: "Analyseren", dueDate: new Date("2026-04-10") },
    { id: "a-11", title: "Brug bouwen: sterkterapport",           studentId: "student-daan",  subjectId: techniek.id,        status: "IN_PROGRESS" as const, bloomLevel: "Evalueren",  dueDate: new Date("2026-03-28") },
    { id: "a-12", title: "Breuken vergelijken",                   studentId: "student-daan",  subjectId: rekenen.id,         status: "COMPLETED"   as const, bloomLevel: "Toepassen",  dueDate: new Date("2026-03-10") },

    // Emma Koster — creatief, taalsterk, dromerig bij makkelijke stof → Kunst, Taal, Creëren
    { id: "a-13", title: "Verhaal schrijven met eigen einde",     studentId: "student-emma",  subjectId: taal.id,            status: "PENDING"     as const, bloomLevel: "Creëren",    dueDate: new Date("2026-04-14") },
    { id: "a-14", title: "Kunstinstallatie ontwerpen",            studentId: "student-emma",  subjectId: kunst.id,           status: "IN_PROGRESS" as const, bloomLevel: "Creëren",    dueDate: new Date("2026-04-01") },
    { id: "a-15", title: "Optellen en aftrekken tot 1000",        studentId: "student-emma",  subjectId: rekenen.id,         status: "COMPLETED"   as const, bloomLevel: "Onthouden",  dueDate: new Date("2026-03-12") },

    // Noah Smit — wetenschappelijk nieuwsgierig, experimenten → Techniek, Wereldoriëntatie
    { id: "a-16", title: "Experiment: water zuiveren",            studentId: "student-noah",  subjectId: techniek.id,        status: "COMPLETED"   as const, bloomLevel: "Analyseren", dueDate: new Date("2026-03-18") },
    { id: "a-17", title: "Spreekbeurt: planeten van ons zonnestelsel", studentId: "student-noah", subjectId: wereldorientatie.id, status: "IN_PROGRESS" as const, bloomLevel: "Begrijpen", dueDate: new Date("2026-04-08") },
    { id: "a-18", title: "Tafels t/m 12 automatiseren",          studentId: "student-noah",  subjectId: rekenen.id,         status: "PENDING"     as const, bloomLevel: "Onthouden",  dueDate: new Date("2026-04-22") },
  ];

  for (const assignment of assignments) {
    await prisma.assignment.upsert({
      where: { id: assignment.id },
      update: {},
      create: assignment,
    });
  }

  console.log("Seeded: 1 admin, 4 teachers, 6 students, 5 subjects, 18 assignments");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
