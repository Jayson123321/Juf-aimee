type StudentCard = {
  name: string;
  age: number;
  progress: number;
  finishedAssignments: number;
  totalAssignments: number;
  interests: string[];
  action: string;
  actionAccent: string;
  initials: string;
};

const students: StudentCard[] = [
  {
    name: "Julia van Loon",
    age: 10,
    progress: 85,
    finishedAssignments: 0,
    totalAssignments: 2,
    interests: ["onderzoeken", "presenteren", "tekstanalyse"],
    action: "Evalueren",
    actionAccent: "text-rose-500",
    initials: "JL",
  },
  {
    name: "Milan de Groot",
    age: 10,
    progress: 90,
    finishedAssignments: 1,
    totalAssignments: 2,
    interests: ["programmeren", "techniek", "wiskunde", "ontwerpen"],
    action: "Creeren",
    actionAccent: "text-violet-500",
    initials: "MG",
  },
  {
    name: "Sophie Meijer",
    age: 9,
    progress: 75,
    finishedAssignments: 0,
    totalAssignments: 1,
    interests: ["creatief schrijven", "verhalen", "lezen"],
    action: "Toepassen",
    actionAccent: "text-emerald-500",
    initials: "SM",
  },
  {
    name: "Daan Verbeek",
    age: 9,
    progress: 80,
    finishedAssignments: 0,
    totalAssignments: 1,
    interests: ["natuurkunde", "bouwen", "strategie", "techniek"],
    action: "Analyseren",
    actionAccent: "text-amber-500",
    initials: "DV",
  },
];

const featureChips = [
  "Gepersonaliseerd",
  "Uitlegbare AI",
  "Privacy-bewust (AVG)",
  "Voortgangsmonitoring",
];

export default function GiftedStudentsPrototypePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_38%,_#fdf2f8_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_35px_120px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,_rgba(217,70,239,0.08),_rgba(34,211,238,0.08))]" />
            <div className="relative px-6 pb-8 pt-8 sm:px-8 lg:px-12 lg:pb-12 lg:pt-10">
              <header className="max-w-3xl space-y-3">
                <span className="inline-flex rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-700">
                  Prototype pagina
                </span>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Hoogbegaafde Leerlingen
                  </h1>
                  <p className="text-sm leading-7 text-slate-500 sm:text-base">
                    Overzicht van leerlingen en hun voortgang met AI-gegenereerde
                    opdrachten.
                  </p>
                </div>
              </header>

              <section className="mt-10 grid gap-6 lg:grid-cols-2">
                {students.map((student) => (
                  <StudentOverviewCard key={student.name} student={student} />
                ))}
              </section>

              <section className="mt-10 rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(253,242,248,0.8),_rgba(255,255,255,0.98),_rgba(236,254,255,0.8))] p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-400 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-fuchsia-200/70">
                        JA
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold">Over Juf Aimee</h2>
                        <p className="text-sm text-slate-500">
                          AI-onderwijsassistent voor verrijking en verdieping
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-slate-600 sm:text-base">
                      Juf Aimee is een AI-onderwijsassistent die speciaal is
                      ontworpen om hoogbegaafde kinderen te ondersteunen met
                      gepersonaliseerde, uitdagende opdrachten. Het systeem
                      gebruikt Bloom&apos;s Taxonomie om opdrachten te genereren die
                      hogere orde denkvaardigheden aanspreken.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {featureChips.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center justify-center rounded-full border border-white/90 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StudentOverviewCard({ student }: { student: StudentCard }) {
  return (
    <article className="group rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_-38px_rgba(34,211,238,0.35)] sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#fde68a,_#f9a8d4,_#67e8f9)] text-sm font-bold text-slate-800 shadow-lg shadow-amber-100">
              {student.initials}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{student.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{student.age} jaar</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium shadow-sm ring-1 ring-slate-200/70">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
            <span className={student.actionAccent}>{student.action}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Voortgang</span>
            <span className="font-semibold text-slate-900">{student.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,_#221552,_#8b5cf6,_#22d3ee)]"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Interesses</p>
          <div className="flex flex-wrap gap-2">
            {student.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-sm text-cyan-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500">
          {student.finishedAssignments} van {student.totalAssignments} opdrachten
          afgerond
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Profiel
          </button>

          <button
            type="button"
            className="inline-flex min-w-40 items-center justify-center rounded-full bg-[linear-gradient(90deg,_#f472b6,_#c084fc,_#67e8f9)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(168,85,247,0.8)] transition hover:scale-[1.02] hover:shadow-[0_22px_50px_-20px_rgba(34,211,238,0.7)]"
          >
            AI Opdracht
          </button>
        </div>
      </div>
    </article>
  );
}
