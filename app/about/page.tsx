import Image from "next/image";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { BackLink } from "@/components/BackLink";
import heroImage from "@/app/Images/online-assistance.png";
import { GraduationCap, Heart, ShieldCheck, Sparkles, Target } from "lucide-react";

export const metadata = {
  title: "Over ons — Juf Aimee",
};

const values = [
  {
    icon: Target,
    chip: "bg-orange-100 text-orange-600",
    title: "Persoonlijk leren",
    text: "Elke opdracht sluit aan op de interesses, het niveau en de leerstijl van de leerling.",
  },
  {
    icon: GraduationCap,
    chip: "bg-sky-100 text-sky-600",
    title: "De leraar aan het stuur",
    text: "Juf Aimee denkt mee en doet voorstellen, maar de leerkracht houdt altijd de regie.",
  },
  {
    icon: ShieldCheck,
    chip: "bg-emerald-100 text-emerald-600",
    title: "Verantwoorde AI",
    text: "Transparant, met bronvermelding en veilig — AI die je kunt vertrouwen in de klas.",
  },
  {
    icon: Heart,
    chip: "bg-rose-100 text-rose-600",
    title: "Plezier in leren",
    text: "Speels en motiverend, zodat uitdaging weer leuk wordt voor hoogbegaafde leerlingen.",
  },
];

function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm md:p-8">
      {children}
    </section>
  );
}

/** Where "back to the app" should land, based on who is logged in. */
async function getAppHref() {
  const cookieStore = await cookies();

  const studentId = cookieStore.get("session_student_id")?.value;
  if (studentId) return `/student/${studentId}/profiel`;

  const userId = cookieStore.get("session_user_id")?.value;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === "ADMIN" ? "/admin" : "/dashboard";
  }

  return "/login";
}

export default async function AboutPage() {
  const appHref = await getAppHref();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-slate-50">
      <div className="mx-auto max-w-4xl space-y-8 px-6 pb-16 pt-6">
        <BackLink href={appHref} label="Terug naar applicatie" />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-8 shadow-xl shadow-orange-200/50 md:p-10">
          <div className="pointer-events-none absolute -left-8 -top-10 size-44 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-12 size-36 rounded-full bg-pink-300/30 blur-2xl" />

          <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="max-w-lg text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/85">
                Over ons
              </p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white md:text-4xl">
                Slimme leerlingen verdienen slim onderwijs
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/90 md:text-base">
                Juf Aimee is een AI-onderwijsassistent die leerkrachten helpt om
                hoogbegaafde leerlingen écht uit te dagen met opdrachten op maat.
              </p>
            </div>
            <div className="relative size-40 shrink-0 md:size-48">
              <div className="absolute inset-0 rounded-full bg-white/90 shadow-2xl ring-8 ring-white/25" />
              <Image
                src={heroImage}
                alt="Juf Aimee"
                fill
                sizes="(min-width: 768px) 192px, 160px"
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Mission */}
        <Card>
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Target className="size-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-800">Onze missie</h2>
          </div>
          <div className="space-y-3 text-sm leading-7 text-gray-600 md:text-base">
            <p>
              Hoogbegaafde leerlingen hebben onderwijs nodig dat hen écht
              uitdaagt. Te vaak krijgen zij stof die ze allang beheersen,
              waardoor motivatie en plezier langzaam verdwijnen. Wij geloven dat
              dat anders kan.
            </p>
            <p>
              Juf Aimee genereert opdrachten op maat — afgestemd op de
              interesses, het niveau en de leerstijl van elke leerling, en op
              het juiste niveau van Bloom&apos;s taxonomie. Zo blijft leren
              uitdagend, persoonlijk en leuk. De leerkracht houdt daarbij altijd
              de regie: Juf Aimee denkt mee, maar de leraar beslist.
            </p>
          </div>
        </Card>

        {/* Who we are */}
        <Card>
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Sparkles className="size-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-800">Wie wij zijn</h2>
          </div>
          <div className="space-y-3 text-sm leading-7 text-gray-600 md:text-base">
            <p>
              Wij zijn een team van studenten van de Hogeschool van Amsterdam.
              Juf Aimee is ontstaan als studioproject binnen{" "}
              <span className="font-semibold text-gray-800">
                Responsible Applied Artificial Intelligence
              </span>{" "}
              — een omgeving waarin we leren hoe AI op een verantwoorde manier
              echte maatschappelijke problemen kan helpen oplossen.
            </p>
            <p>
              We combineren onze interesse in onderwijs, techniek en
              verantwoorde AI om een platform te bouwen dat leerkrachten
              ondersteunt en hoogbegaafde leerlingen laat groeien. Geen AI die
              de leraar vervangt, maar AI die de leraar superkrachten geeft.
            </p>
          </div>
        </Card>

        {/* Values */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-6 w-1.5 rounded-full bg-orange-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Waar wij in geloven
              </h2>
              <p className="text-sm text-gray-500">
                De principes die elke beslissing in Juf Aimee sturen.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map(({ icon: Icon, chip, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`inline-flex size-11 items-center justify-center rounded-xl ${chip}`}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3 font-bold text-gray-800">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-7 text-center md:p-8">
          <p className="text-base font-bold text-gray-800">
            Samen maken we onderwijs dat met leerlingen meegroeit. 🌱
          </p>
          <p className="mx-auto mt-1 max-w-xl text-sm text-gray-600">
            Juf Aimee — een AI-onderwijsassistent voor hoogbegaafde leerlingen,
            gebouwd met zorg door studenten.
          </p>
        </section>
      </div>
    </div>
  );
}
