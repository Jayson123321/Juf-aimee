export type StudentCardData = {
  id: string;
  name: string;
  age: number;
  progress: number;
  interests: string[];
  completedAssignments: number;
  totalAssignments: number;
  bloomLevel: "Onthouden" | "Begrijpen" | "Toepassen" | "Analyseren" | "Evalueren" | "Creëren";
};

export const mockStudents: StudentCardData[] = [
  {
    id: "student-1",
    name: "Emma de Vries",
    age: 9,
    progress: 75,
    interests: ["ruimtevaart", "planeten", "wetenschappelijke experimenten"],
    completedAssignments: 0,
    totalAssignments: 2,
    bloomLevel: "Analyseren",
  },
  {
    id: "student-2",
    name: "Julia van Loon",
    age: 10,
    progress: 68,
    interests: ["lezen", "creatief schrijven", "verhalen"],
    completedAssignments: 1,
    totalAssignments: 3,
    bloomLevel: "Begrijpen",
  },
  {
    id: "student-3",
    name: "Noah Bakker",
    age: 9,
    progress: 82,
    interests: ["robots", "techniek", "programmeren"],
    completedAssignments: 2,
    totalAssignments: 3,
    bloomLevel: "Toepassen",
  },
  {
    id: "student-4",
    name: "Liam Janssen",
    age: 8,
    progress: 55,
    interests: ["dieren", "natuur", "biologie"],
    completedAssignments: 1,
    totalAssignments: 4,
    bloomLevel: "Onthouden",
  },
  {
    id: "student-5",
    name: "Sofia Meijer",
    age: 10,
    progress: 90,
    interests: ["kunst", "schilderen", "creatief ontwerpen"],
    completedAssignments: 3,
    totalAssignments: 3,
    bloomLevel: "Creëren",
  },
  {
    id: "student-6",
    name: "Daan Visser",
    age: 9,
    progress: 60,
    interests: ["geschiedenis", "oude beschavingen", "archeologie"],
    completedAssignments: 1,
    totalAssignments: 2,
    bloomLevel: "Evalueren",
  },
];

