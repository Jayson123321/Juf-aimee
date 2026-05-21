import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import resourcesImage from "@/app/Images/resources.png";
import mathImage from "@/app/Images/math-assignment-numbers.png";
import { BackLink } from "@/components/BackLink";
import { studentResources } from "@/lib/student-resources";
import {
  Brain,
  CheckCircle2,
  Compass,
  ExternalLink,
  Library,
  Sparkles,
  Target,
} from "lucide-react";

const perfecteOpdrachtTips = [
  {
    t: "Sluit aan bij interesses",
    d: "Gebruik waar de leerling enthousiast van wordt als ingang van de opdracht.",
  },
  {
    t: "Daag uit op het juiste niveau",
    d: "Vermijd herhaling. Voor hoogbegaafde leerlingen: mik op analyseren, evalueren en creëren.",
  },
  {
    t: "Maak het doel concreet",
    d: "Beschrijf duidelijk wat de leerling aan het eind kan, weet of gemaakt heeft.",
  },
  {
    t: "Geef eigenaarschap",
    d: "Laat ruimte voor eigen keuzes in onderwerp, aanpak en eindvorm.",
  },
  {
    t: "Houd het behapbaar",
    d: "Werk met duidelijke stappen en een realistische tijdsinschatting.",
  },
  {
    t: "Bouw reflectie in",
    d: "Laat de leerling terugkijken op het proces, niet alleen op het resultaat.",
  },
];

const genererenChecklist = [
  "Voeg context toe: interesses, OPP en het niveau van de leerling.",
  "Kies bewust een Bloom-niveau dat past bij de leerling.",
  "Controleer of de tijdsinschatting realistisch is.",
  "Lees de gegenereerde opdracht altijd na vóór je hem deelt.",
  "Pas taal en toon aan op de leeftijd van de leerling.",
  "Combineer vakgebieden voor extra uitdaging en samenhang.",
  "Check of het eindresultaat meetbaar en zichtbaar is.",
];

const bloomLevels = [
  { n: "Onthouden", d: "Feiten en begrippen herkennen en herinneren.", soft: true },
  { n: "Begrijpen", d: "Informatie uitleggen in eigen woorden.", soft: true },
  { n: "Toepassen", d: "Kennis gebruiken in een nieuwe situatie.", soft: false },
  { n: "Analyseren", d: "Verbanden leggen en onderdelen onderzoeken.", soft: false },
  { n: "Evalueren", d: "Oordelen vormen en keuzes onderbouwen.", soft: false },
  { n: "Creëren", d: "Iets nieuws ontwerpen, bedenken of maken.", soft: false },
];

function GuideSection({
  id,
  icon,
  chip,
  title,
  intro,
  children,
}: {
  id: string;
  icon: ReactNode;
  chip: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-5 flex items-start gap-4">
        <span
          className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${chip}`}
        >
          {icon}
        </span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{intro}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function BronnenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-slate-50">
      <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
        <BackLink />

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-7 shadow-xl shadow-orange-200/50 md:p-9">
          <div className="pointer-events-none absolute -left-8 -top-10 size-44 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-32 rounded-full bg-pink-300/30 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="max-w-xl text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/85">
                Bronnen &amp; Hulp
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">
                Sterke opdrachten maken
              </h1>
              <p className="mt-2 text-sm text-white/90 md:text-base">
                Praktische tips en lesmateriaal om opdrachten op maat te maken
                voor je hoogbegaafde leerlingen.
              </p>
            </div>
            <div className="relative size-40 shrink-0 md:size-48">
              <div className="absolute inset-0 rounded-full bg-white/90 shadow-2xl ring-8 ring-white/25" />
              <Image
                src={resourcesImage}
                alt="Juf Aimee"
                fill
                sizes="(min-width: 768px) 192px, 160px"
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* De perfecte opdracht */}
        <GuideSection
          id="perfecte-opdracht"
          icon={<Target className="size-6 text-orange-600" />}
          chip="bg-orange-100"
          title="De perfecte opdracht maken"
          intro="Zes bouwstenen voor een opdracht die uitdaagt én motiveert."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {perfecteOpdrachtTips.map(({ t, d }, i) => (
              <div
                key={t}
                className="flex gap-3 rounded-xl border border-gray-100 bg-orange-50/50 p-4"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{t}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </GuideSection>

        {/* Tips bij genereren */}
        <GuideSection
          id="genereren"
          icon={<Sparkles className="size-6 text-violet-600" />}
          chip="bg-violet-100"
          title="Tips bij het genereren van een AI-opdracht"
          intro="Waar je op let voordat je een AI-opdracht met een leerling deelt."
        >
          <ul className="space-y-2.5">
            {genererenChecklist.map((tip) => (
              <li key={tip} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-violet-500" />
                <span className="text-sm text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-violet-50 p-4">
            <Image
              src={mathImage}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 object-contain"
            />
            <p className="text-sm text-violet-900">
              <span className="font-bold">Onthoud:</span> de AI levert een
              startpunt. Jouw kennis van de leerling maakt de opdracht écht
              passend.
            </p>
          </div>
        </GuideSection>

        {/* Bloom-niveaus */}
        <GuideSection
          id="bloom"
          icon={<Brain className="size-6 text-emerald-600" />}
          chip="bg-emerald-100"
          title="Bloom-niveaus uitgelegd"
          intro="Van onthouden tot creëren — kies bewust het denkniveau."
        >
          <div className="space-y-2">
            {bloomLevels.map(({ n, d, soft }, i) => (
              <div
                key={n}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{n}</p>
                  <p className="text-sm text-gray-600">{d}</p>
                </div>
                {!soft && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    Ideaal voor hoogbegaafd
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <span className="font-bold">Tip:</span> hoogbegaafde leerlingen
            bloeien op de hogere niveaus. Sla herhaling over en begin waar de
            uitdaging zit.
          </p>
        </GuideSection>

        {/* Lesmateriaal */}
        <GuideSection
          id="lesmateriaal"
          icon={<Library className="size-6 text-sky-600" />}
          chip="bg-sky-100"
          title="Lesmateriaal & bronnen"
          intro="De bibliotheek waar Juf Aimee uit put bij het genereren."
        >
          <p className="text-sm text-gray-600">
            Juf Aimee gebruikt een bronnenbibliotheek (RAG) om opdrachten te
            baseren op echt lesmateriaal. Hoe rijker en actueler dit materiaal,
            hoe beter de gegenereerde opdrachten aansluiten op het curriculum.
          </p>
          <Link
            href="/students"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          >
            <Library className="size-4" />
            Naar de bibliotheek
          </Link>
        </GuideSection>

        {/* Bronnen voor leerlingen */}
        <GuideSection
          id="leerling-bronnen"
          icon={<Compass className="size-6 text-emerald-600" />}
          chip="bg-emerald-100"
          title="Bronnen voor leerlingen"
          intro="Leerzame websites om met je leerlingen te delen — dezelfde lijst die zij in hun eigen portaal zien."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {studentResources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-emerald-50/50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm"
              >
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ExternalLink className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    {resource.name}
                    {resource.lang === "EN" && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                        Engels
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                    {resource.description}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </GuideSection>
      </div>
    </div>
  );
}
