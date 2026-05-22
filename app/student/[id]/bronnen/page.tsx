import { BackLink } from "@/components/BackLink";
import { studentResources, type StudentResource } from "@/lib/student-resources";
import {
  BookOpen,
  Compass,
  ExternalLink,
  Info,
  PencilRuler,
  Video,
} from "lucide-react";

const CATEGORY_ICON = {
  "Video's": Video,
  Lesmateriaal: BookOpen,
  Oefenen: PencilRuler,
} as const;

/** Rotating accent palette so the resource grid is colourful. */
const ACCENTS = [
  {
    strip: "from-violet-400 to-purple-400",
    chip: "bg-violet-100 text-violet-600",
    tag: "bg-violet-50 text-violet-700",
    hoverBorder: "hover:border-violet-300",
    link: "text-violet-600",
  },
  {
    strip: "from-sky-400 to-blue-400",
    chip: "bg-sky-100 text-sky-600",
    tag: "bg-sky-50 text-sky-700",
    hoverBorder: "hover:border-sky-300",
    link: "text-sky-600",
  },
  {
    strip: "from-emerald-400 to-teal-400",
    chip: "bg-emerald-100 text-emerald-600",
    tag: "bg-emerald-50 text-emerald-700",
    hoverBorder: "hover:border-emerald-300",
    link: "text-emerald-600",
  },
  {
    strip: "from-amber-400 to-orange-400",
    chip: "bg-amber-100 text-amber-600",
    tag: "bg-amber-50 text-amber-700",
    hoverBorder: "hover:border-amber-300",
    link: "text-amber-600",
  },
  {
    strip: "from-rose-400 to-pink-400",
    chip: "bg-rose-100 text-rose-600",
    tag: "bg-rose-50 text-rose-700",
    hoverBorder: "hover:border-rose-300",
    link: "text-rose-600",
  },
  {
    strip: "from-indigo-400 to-violet-400",
    chip: "bg-indigo-100 text-indigo-600",
    tag: "bg-indigo-50 text-indigo-700",
    hoverBorder: "hover:border-indigo-300",
    link: "text-indigo-600",
  },
] as const;

function ResourceCard({
  resource,
  accent,
}: {
  resource: StudentResource;
  accent: (typeof ACCENTS)[number];
}) {
  const Icon = CATEGORY_ICON[resource.category];

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${accent.hoverBorder}`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${accent.strip}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex size-11 items-center justify-center rounded-xl ${accent.chip}`}
          >
            <Icon className="size-5" />
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${accent.tag}`}
            >
              {resource.category}
            </span>
            {resource.lang === "EN" && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                Engels
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900">
          {resource.name}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {resource.description}
        </p>

        <span
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-bold ${accent.link}`}
        >
          Bezoek website
          <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}

export default async function StudentBronnenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.28),transparent_34%),linear-gradient(180deg,#f3f1ff_0%,#e7e3fb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <BackLink href={`/student/${id}/profiel`} label="Terug naar profiel" />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 p-7 text-white shadow-xl shadow-violet-300/60">
          <div className="pointer-events-none absolute -left-8 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-36 rounded-full bg-sky-300/30 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20">
              <Compass className="size-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Handige Bronnen
              </h1>
              <p className="mt-1 text-sm text-white/85">
                Leuke en leerzame websites die jou helpen bij het leren.
              </p>
            </div>
          </div>
        </section>

        {/* Resource grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {studentResources.map((resource, i) => (
            <ResourceCard
              key={resource.url}
              resource={resource}
              accent={ACCENTS[i % ACCENTS.length]}
            />
          ))}
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-white/70 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-violet-500" />
          <p className="text-sm text-slate-600">
            Deze websites zijn van anderen en openen in een nieuw tabblad. Vraag
            je juf of meester als je iets niet snapt.
          </p>
        </div>
      </div>
    </div>
  );
}
