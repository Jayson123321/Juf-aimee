import { prisma } from "@/lib/db";
import {
  deriveStudentPresentation,
  calculateStudentProgress,
  getBloomAppearance,
  getBloomLevelLabel,
  getStudentAge,
} from "@/lib/student-profile";

export type PrototypeBloomLevel =
  | "Onthouden"
  | "Begrijpen"
  | "Toepassen"
  | "Analyseren"
  | "Evalueren"
  | "Creëren";

export type PrototypeSubjectScore = {
  subject: string;
  currentScore: number;
  bloomLevel: PrototypeBloomLevel;
  trend: "up" | "down" | "steady";
  lastAssessment: string;
};

export type PrototypeSubmission = {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  uploadedAt: Date;
};

export type PrototypeAssignment = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  illustrationUrl?: string | null;
  illustrationPrompt?: string | null;
  rationale: string;
  feedback?: string;
  bloomLevel: string;
  status: "completed" | "in_progress" | "not_started";
  createdAt: string;
  studentWork?: string | null;
  teacherFeedback?: { content: string } | null;
  reflection?: { content: string } | null;
  submissions?: PrototypeSubmission[];
};

export type PrototypeStudent = {
  id: string;
  name: string;
  age: number | null;
  emoji: string;
  interests: string[];
  progress: number;
  status: string;
  badgeEmoji: string;
  badgeClassName: string;
  completedAssignments: number;
  totalAssignments: number;
  learningStyle: string;
  workMethod: string;
  concentration: string;
  motivationFactors: string[];
  strengths: string[];
  supportNeeds: string[];
  didacticTips: string[];
  currentTeacher: string;
  schoolYear: string;
  avatarLabel: string;
  profileSummary: string;
  subjectScores: PrototypeSubjectScore[];
};

export const bloomOptions: PrototypeBloomLevel[] = [
  "Onthouden",
  "Begrijpen",
  "Toepassen",
  "Analyseren",
  "Evalueren",
  "Creëren",
];

function mapAssignmentStatus(
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
): PrototypeAssignment["status"] {
  if (status === "COMPLETED") return "completed";
  if (status === "IN_PROGRESS") return "in_progress";
  return "not_started";
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createFallbackSubjectScores(student: PrototypeStudent): PrototypeSubjectScore[] {
  return student.interests.slice(0, 3).map((interest, index) => ({
    subject: toTitleCase(interest),
    currentScore: Number((7.8 + index * 0.4).toFixed(1)),
    bloomLevel: (student.status as PrototypeBloomLevel) ?? "Toepassen",
    trend: index === 0 ? "up" : index === 1 ? "steady" : "up",
    lastAssessment: new Date(Date.now() - (index + 3) * 86400000).toISOString(),
  }));
}

function mapStudent(student: {
  id: string;
  fullName: string;
  dateOfBirth: Date | null;
  groep: string | null;
  bloomNiveau: number | null;
  profile: {
    currentSchoolYearGroup: string | null;
    currentTeacher: string | null;
    schoolHistory: string | null;
  } | null;
  oppChunks: Array<{
    tekst: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    description: string | null;
    illustrationUrl: string | null;
    illustrationPrompt: string | null;
    uitleg: string | null;
    bloomLevel: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    createdAt: Date;
  }>;
}): PrototypeStudent {
  const presentation = deriveStudentPresentation({
    fullName: student.fullName,
    schoolHistory: student.profile?.schoolHistory,
    assignments: student.assignments,
    oppTexts: student.oppChunks.map((chunk) => chunk.tekst),
  });
  const status = getBloomLevelLabel(student.bloomNiveau);
  const badge = getBloomAppearance(status);
  const completedAssignments = student.assignments.filter(
    (assignment) => assignment.status === "COMPLETED",
  ).length;

  const prototypeStudent: PrototypeStudent = {
    id: student.id,
    name: student.fullName,
    age: getStudentAge(student.dateOfBirth),
    emoji: presentation.emoji,
    interests: presentation.interests,
    progress: calculateStudentProgress(student.assignments),
    status,
    badgeEmoji: badge.badgeEmoji,
    badgeClassName: badge.badgeClassName,
    completedAssignments,
    totalAssignments: student.assignments.length,
    learningStyle: presentation.learningStyle,
    workMethod: presentation.workMethod,
    concentration: presentation.concentration,
    motivationFactors: ["Autonomie", ...presentation.interests.slice(0, 2).map(toTitleCase)],
    strengths: presentation.strengths,
    supportNeeds: [
      "Heldere succescriteria",
      "Ruimte voor verdieping",
      "Regelmatige reflectie",
    ],
    didacticTips: presentation.smartTips,
    currentTeacher: student.profile?.currentTeacher ?? "Nog niet gekoppeld",
    schoolYear:
      student.profile?.currentSchoolYearGroup ??
      (student.groep ? `Groep ${student.groep}` : "Groep onbekend"),
    avatarLabel: student.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    profileSummary:
      student.profile?.schoolHistory ??
      `Prototype-profiel op basis van live databasegegevens voor ${student.fullName}.`,
    subjectScores: [],
  };

  prototypeStudent.subjectScores = createFallbackSubjectScores(prototypeStudent);
  return prototypeStudent;
}

function mapAssignments(
  studentId: string,
  assignments: Array<{
    id: string;
    title: string;
    description: string | null;
    illustrationUrl: string | null;
    illustrationPrompt: string | null;
    uitleg: string | null;
    bloomLevel: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    createdAt: Date;
    studentWork?: string | null;
    teacherFeedback?: { content: string } | null;
    reflection?: { content: string } | null;
  }>,
): PrototypeAssignment[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    studentId,
    title: assignment.title,
    description: assignment.description ?? "Nog geen beschrijving beschikbaar.",
    illustrationUrl: assignment.illustrationUrl ?? null,
    illustrationPrompt: assignment.illustrationPrompt ?? null,
    rationale: assignment.uitleg ?? "Gegenereerde opdracht op basis van leerlingcontext en OPP.",
    feedback: assignment.teacherFeedback?.content,
    bloomLevel: assignment.bloomLevel ?? "Toepassen",
    status: mapAssignmentStatus(assignment.status),
    createdAt: assignment.createdAt.toISOString(),
    studentWork: assignment.studentWork ?? null,
    teacherFeedback: assignment.teacherFeedback ?? null,
    reflection: assignment.reflection ?? null,
  }));
}

export async function getPrototypeDashboardStudents() {
  const students = await prisma.student.findMany({
    include: {
      profile: {
        select: {
          currentSchoolYearGroup: true,
          currentTeacher: true,
          schoolHistory: true,
        },
      },
      oppChunks: {
        select: {
          tekst: true,
        },
        take: 12,
      },
      assignments: {
        select: {
          id: true,
          title: true,
          description: true,
          illustrationUrl: true,
          illustrationPrompt: true,
          uitleg: true,
          bloomLevel: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return students.map(mapStudent);
}

export async function getPrototypeDashboardStats() {
  const students = await getPrototypeDashboardStudents();
  const averageProgress =
    students.length === 0
      ? 0
      : Math.round(
          students.reduce((total, student) => total + student.progress, 0) / students.length,
        );

  const bloomCountMap = new Map<string, number>();
  const interestCountMap = new Map<string, number>();
  let activeAssignments = 0;
  let completedAssignments = 0;
  let aiAssignments = 0;
  let longRunningAssignments = 0;

  const rawStudents = await prisma.student.findMany({
    include: {
      assignments: {
        select: { status: true, createdAt: true },
      },
    },
  });

  for (const student of students) {
    bloomCountMap.set(student.status, (bloomCountMap.get(student.status) ?? 0) + 1);
    for (const interest of student.interests) {
      interestCountMap.set(interest, (interestCountMap.get(interest) ?? 0) + 1);
    }
  }

  for (const student of rawStudents) {
    for (const assignment of student.assignments) {
      aiAssignments += 1;
      if (assignment.status === "IN_PROGRESS") activeAssignments += 1;
      if (assignment.status === "COMPLETED") completedAssignments += 1;
      if (
        assignment.status !== "COMPLETED" &&
        Date.now() - assignment.createdAt.getTime() > 7 * 24 * 60 * 60 * 1000
      ) {
        longRunningAssignments += 1;
      }
    }
  }

  return {
    averageProgress,
    bloomCounts: [...bloomCountMap.entries()].map(([label, count]) => ({ label, count })),
    topInterests: [...interestCountMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count })),
    longRunningAssignments,
    totalStudents: students.length,
    activeAssignments,
    completedAssignments,
    aiAssignments,
  };
}

export async function getPrototypeStudent(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: {
        select: {
          currentSchoolYearGroup: true,
          currentTeacher: true,
          schoolHistory: true,
        },
      },
      oppChunks: {
        select: {
          tekst: true,
        },
        take: 20,
      },
      assignments: {
        select: {
          id: true,
          title: true,
          description: true,
          illustrationUrl: true,
          illustrationPrompt: true,
          uitleg: true,
          bloomLevel: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return student ? mapStudent(student) : null;
}

export async function getPrototypeAssignments(studentId: string) {
  const assignments = await prisma.assignment.findMany({
    where: { studentId },
    select: {
      id: true,
      title: true,
      description: true,
      illustrationUrl: true,
      illustrationPrompt: true,
      uitleg: true,
      bloomLevel: true,
      status: true,
      createdAt: true,
      studentWork: true,
      teacherFeedback: {
        select: { content: true },
      },
      reflection: {
        select: { content: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return mapAssignments(studentId, assignments);
}

export async function getPrototypeAssignment(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      title: true,
      description: true,
      illustrationUrl: true,
      illustrationPrompt: true,
      uitleg: true,
      bloomLevel: true,
      status: true,
      createdAt: true,
      studentId: true,
      studentWork: true,
      teacherFeedback: { select: { content: true } },
      submissions: {
        select: {
          id: true,
          fileName: true,
          filePath: true,
          mimeType: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!assignment) return null;

  return {
    ...mapAssignments(assignment.studentId, [assignment])[0],
    submissions: assignment.submissions,
  };
}
