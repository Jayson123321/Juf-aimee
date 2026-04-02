import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Cylinder,
  Database,
  Lightbulb,
  Lock,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { bloomOptions, getPrototypeStudent } from "../../prototype-data";

function SectionCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[28px] border bg-white/90 p-8 shadow-[0_18px_50px_rgba(92,114,180,0.08)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

function CriteriaRow({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white px-5 py-4 shadow-[0_8px_22px_rgba(109,123,166,0.08)] ring-1 ring-slate-100">
      <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-500" />
      <div className="space-y-1">
        <p className="text-[1.05rem] leading-7 text-slate-900">
          <span className="font-semibold">{label}:</span>{" "}
          <span className="text-violet-700">{value}</span>
        </p>
        <p className="text-[1.05rem] leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function RagStep({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_5px_12px_rgba(15,23,42,0.03)]">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-[1.05rem] font-semibold text-slate-950">{title}</p>
        <p className="text-[1.05rem] leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

export default async function PrototypeAiAssignmentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = getPrototypeStudent(studentId);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.2),transparent_30%),linear-gradient(180deg,#f7f9ff_0%,#eef4ff_100%)] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <Link
          className="inline-flex items-center gap-3 text-[1.05rem] font-medium text-slate-900 transition hover:text-slate-700"
          href="/prototype/hoogbegaafde-leerlingen"
        >
          <ArrowLeft className="size-5" />
          Terug naar profiel
        </Link>

        <SectionCard className="border-slate-200/80">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-[0_14px_24px_rgba(98,101,255,0.2)]">
                <Sparkles className="size-7" />
              </div>
              <div>
                <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-950">
                  AI Opdracht Genereren
                </h1>
                <p className="text-[1.2rem] text-slate-500">Voor {student.name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-3xl bg-slate-100 px-8 py-7">
              <div className="flex items-center gap-5">
                <div className="text-5xl">{student.emoji}</div>
                <div>
                  <p className="text-[1.1rem] font-semibold text-slate-950">
                    {student.name}, {student.age} jaar
                  </p>
                  <p className="text-[1.05rem] text-slate-600">
                    Interesses: {student.interests.join(", ")}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-5 py-3 text-[1.05rem] font-semibold text-rose-600">
                <span>{student.badgeEmoji}</span>
                {student.status}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[1.05rem] font-semibold text-slate-950">
                  Bloom&apos;s Taxonomie Niveau
                </label>
                <div className="relative">
                  <select
                    className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                    defaultValue={student.status}
                  >
                    {bloomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[1.05rem] text-slate-500">
                  Huidig niveau van {student.name}: {student.status}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-[1.05rem] font-semibold text-slate-950">
                  Specifiek Focusgebied (optioneel)
                </label>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none placeholder:text-slate-400"
                  defaultValue={student.interests[0]}
                  placeholder="Bijv. onderzoeken"
                />
                <p className="text-[1.05rem] text-slate-500">
                  Laat leeg voor een willekeurige interesse van de leerling
                </p>
              </div>

              <div className="space-y-4">
                <button className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600">
                  <Brain className="size-5" />
                  Zoek Bronnen met AI
                </button>
                <button className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600">
                  <Sparkles className="size-5" />
                  Genereer Opdracht met AI
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.95),rgba(247,243,255,0.88))]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Brain className="size-6 text-violet-600" />
              <h2 className="text-[1.15rem] font-semibold text-slate-950">
                AI-Criteria voor Opdracht Generatie
              </h2>
            </div>

            <p className="text-[1.1rem] leading-8 text-slate-700">
              De AI gebruikt de volgende criteria om een passende opdracht te genereren voor{" "}
              {student.name}:
            </p>

            <div className="space-y-4">
              <CriteriaRow
                description="Opdracht sluit aan bij wat de leerling motiveert"
                label="Leerling Interesse"
                value={student.interests[0]}
              />
              <CriteriaRow
                description={`Past bij huidig niveau (${student.status}) of daagt uit naar hoger niveau`}
                label="Bloom Niveau"
                value={student.status}
              />
              <CriteriaRow
                description="Opdracht is aangepast aan de voorkeurs-leerstijl"
                label="Leerstijl"
                value={student.learningStyle}
              />
              <CriteriaRow
                description="Opdracht kan op de gewenste manier uitgevoerd worden"
                label="Werkmethode"
                value={student.workMethod}
              />
              <CriteriaRow
                description="Omvang opdracht past bij concentratievermogen"
                label="Concentratieboog"
                value={student.concentration}
              />
            </div>

            <div className="rounded-[18px] bg-sky-50 px-5 py-4 text-[1.03rem] leading-7 text-slate-700">
              <span className="font-semibold text-slate-900">Leraar Regie:</span> U behoudt
              volledige controle. U kunt de opdracht aanpassen, opnieuw genereren of afwijzen
              voordat deze aan de leerling wordt gegeven.
            </div>
          </div>
        </SectionCard>

        <SectionCard className="border-blue-200 bg-[linear-gradient(180deg,rgba(250,253,255,0.96),rgba(243,249,255,0.92))]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="size-6 text-blue-500" />
              <h2 className="text-[1.15rem] font-semibold text-slate-950">
                Snelle Didactische Tips voor {student.name}
              </h2>
            </div>

            <ul className="space-y-3 text-[1.05rem] leading-7 text-slate-700">
              {student.didacticTips.map((tip) => (
                <li className="flex items-start gap-3" key={tip}>
                  <span className="mt-1 text-lg">{"\uD83D\uDCA1"}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <SectionCard className="border-emerald-200 bg-[linear-gradient(180deg,rgba(251,255,253,0.96),rgba(244,255,248,0.92))]">
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <Cylinder className="size-6 text-emerald-600" />
              <h2 className="text-[1.15rem] font-semibold text-slate-950">
                RAG Proces - Retrieval-Augmented Generation
              </h2>
            </div>

            <p className="text-[1.1rem] leading-8 text-slate-700">
              Het AI-systeem gebruikt bestaande onderwijsmaterialen om nieuwe, gepersonaliseerde
              opdrachten te creeren.
            </p>

            <div className="space-y-5">
              <RagStep
                description="AI zoekt relevante onderwijsmaterialen in de database"
                icon={<Search className="size-7" />}
                title="1. Zoeken (Retrieval)"
              />
              <RagStep
                description="Gevonden materialen worden geanalyseerd en gecombineerd"
                icon={<Database className="size-7" />}
                title="2. Context Verrijken (Augmented)"
              />
              <RagStep
                description="Nieuwe opdracht wordt gecreeerd op basis van bronnen"
                icon={<Sparkles className="size-7" />}
                title="3. Genereren (Generation)"
              />
            </div>

            <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[1.02rem] leading-7 text-slate-600">
              <span className="font-semibold text-slate-900">Transparantie:</span> Alle
              gegenereerde opdrachten zijn gebaseerd op geverifieerde onderwijsmaterialen uit de
              database. Bronnen worden altijd vermeld.
            </div>
          </div>
        </SectionCard>

        <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.96),rgba(247,243,255,0.92))]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="size-6 text-amber-500" />
              <h2 className="text-[1.15rem] font-semibold text-slate-950">Verantwoorde AI</h2>
            </div>

            <p className="text-[1.1rem] leading-8 text-slate-700">
              Juf Aimee gebruikt uitlegbare AI om transparantie te bieden over waarom opdrachten
              worden gegenereerd. De leraar houdt altijd de regie en kan opdrachten aanpassen of
              opnieuw genereren.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[1rem] text-slate-700 ring-1 ring-slate-200">
                <Lock className="size-4 text-amber-500" />
                Privacy (AVG)
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[1rem] text-slate-700 ring-1 ring-slate-200">
                <Target className="size-4 text-rose-500" />
                Gepersonaliseerd
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[1rem] text-slate-700 ring-1 ring-slate-200">
                <Brain className="size-4 text-fuchsia-500" />
                Bloom&apos;s Taxonomie
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
