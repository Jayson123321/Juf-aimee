import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ArrowLeft,
  Check,
  Info,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  deriveStudentPresentation,
  getBloomLevelLabel,
  getStudentAge,
} from "@/lib/student-profile";

export const dynamic = "force-dynamic";

export default async function AssignmentGenerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          subject: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
      profile: true,
      oppChunks: {
        select: {
          tekst: true,
        },
        take: 12,
      },
    },
  });

  if (!student) notFound();

  const presentation = deriveStudentPresentation({
    fullName: student.fullName,
    schoolHistory: student.profile?.schoolHistory,
    assignments: student.assignments,
    oppTexts: student.oppChunks.map((chunk) => chunk.tekst),
  });
  const bloomLevel = getBloomLevelLabel(student.bloomNiveau);
  const age = getStudentAge(student.dateOfBirth);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl space-y-6 p-8">
        <Link
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-800"
          href={`/student/${id}`}
        >
          <ArrowLeft className="size-4" />
          Terug naar profiel
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100">
              <Sparkles className="size-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-800">AI Opdracht Genereren</h1>
              <p className="mt-1 text-sm text-gray-500">Voor {student.fullName}</p>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{presentation.emoji}</span>
              <div>
                <h2 className="font-semibold text-gray-800">
                  {student.fullName}
                  {age ? `, ${age} jaar` : ""}
                </h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  {presentation.interests.map((interest) => (
                    <span
                      className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
                      key={interest}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="bloom">
                Bloom&apos;s Taxonomie Niveau
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                defaultValue={bloomLevel}
                id="bloom"
              >
                {[
                  "Onthouden",
                  "Begrijpen",
                  "Toepassen",
                  "Analyseren",
                  "Evalueren",
                  "Creëren",
                ].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Huidig niveau van {student.fullName}: {bloomLevel}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="focus">
                Specifiek focusgebied (optioneel)
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                defaultValue={presentation.interests[0]}
                id="focus"
                placeholder="Bijv. onderzoeken"
                type="text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Laat leeg voor een breder onderwerp, of gebruik een van de interesses van de
                leerling
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 font-medium text-white transition hover:from-gray-700 hover:to-gray-800">
                <Search className="size-5" />
                Zoek bronnen met AI
              </button>
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition hover:from-blue-700 hover:to-blue-800">
                <Sparkles className="size-5" />
                Genereer opdracht met AI
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <Info className="mt-0.5 size-5 text-gray-600" />
            <div>
              <h3 className="mb-1 font-semibold text-gray-800">
                AI-criteria voor opdrachtgeneratie
              </h3>
              <p className="text-sm text-gray-600">
                De AI gebruikt de volgende criteria om een passende opdracht te genereren voor{" "}
                {student.fullName}:
              </p>
            </div>
          </div>

          <div className="ml-8 space-y-3">
            <CriteriaRow
              title={`Leerlinginteresses: ${presentation.interests.join(", ")}`}
              description="Gebruikt dit om de opdracht motiverend en herkenbaar te maken."
            />
            <CriteriaRow
              title={`Bloom niveau: ${bloomLevel}`}
              description="Past de moeilijkheid en het type denkopdracht aan op het actuele niveau."
            />
            <CriteriaRow
              title={`Leerstijl: ${presentation.learningStyle}`}
              description="De opdracht sluit aan op de voorkeur voor verwerken en leren."
            />
            <CriteriaRow
              title={`Werkmethode: ${presentation.workMethod}`}
              description="De opbouw van de opdracht past bij de gewenste manier van werken."
            />
            <CriteriaRow
              title={`Concentratievermogen: ${presentation.concentration}`}
              description="Helpt bij het bepalen van lengte, zelfstandigheid en complexiteit."
            />
            <CriteriaRow
              title={`Sterke punten: ${presentation.strengths.join(", ")}`}
              description="De opdracht speelt in op de sterktes van de leerling."
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-gray-100 p-6">
          <div className="mb-4 flex items-start gap-3">
            <Zap className="mt-0.5 size-5 text-gray-700" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Slimme detectietips voor {student.fullName}
              </h3>
            </div>
          </div>

          <div className="ml-8 space-y-2 text-sm text-gray-700">
            {presentation.smartTips.map((tip) => (
              <p className="flex items-start gap-2" key={tip}>
                <span className="mt-0.5 text-gray-500">•</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Sparkles className="size-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-800">
                RAG proces - Retrieval-Augmented Generation
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                Het AI-systeem gebruikt bestaande onderwijsmaterialen en leerlingcontext om een
                passende opdracht op te bouwen:
              </p>
            </div>
          </div>

          <div className="ml-12 space-y-3">
            <StepRow
              number="1"
              title="Zoeken (Retrieval)"
              description="AI haalt relevante bronnen, methodes en bestaande context uit de database."
            />
            <StepRow
              number="2"
              title="Context verrijken (Augmented)"
              description="De leerlinginformatie wordt toegevoegd zodat de opdracht beter aansluit."
            />
            <StepRow
              number="3"
              title="Genereren (Generation)"
              description="Er ontstaat een nieuwe opdracht op basis van bronmateriaal en profieldata."
            />
          </div>

          <p className="ml-12 mt-4 text-xs text-gray-500">
            Transparantie: AI-gegenereerde opdrachten zijn afgeleid uit bestaande bronnen. De
            gebruikte context blijft altijd uitlegbaar.
          </p>
        </div>

        {student.assignments.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 flex-shrink-0 text-blue-600" />
              <div>
                <h4 className="mb-1 text-sm font-semibold text-blue-900">Recente opdrachten</h4>
                <div className="space-y-1 text-xs text-blue-800">
                  {student.assignments.map((assignment) => (
                    <p key={assignment.id}>
                      {assignment.title}
                      {assignment.subject?.name ? ` · ${assignment.subject.name}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CriteriaRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="mt-0.5 size-4 flex-shrink-0 text-green-600" />
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function StepRow({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
        {number}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
