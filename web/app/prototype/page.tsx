import Link from "next/link";

export default function PrototypeIndexPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf2f8,_#eef2ff_45%,_#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3">
          <span className="inline-flex w-fit rounded-full border border-fuchsia-200 bg-white/80 px-3 py-1 text-sm font-medium text-fuchsia-700 shadow-sm">
            Prototype omgeving
          </span>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              Frontend prototypes voor Juf AImee
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Hier zetten we de losse paginas neer die we eerst visueel uitwerken.
              Daarna kunnen we per scherm backend, data en interacties toevoegen.
            </p>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/prototype/hoogbegaafde-leerlingen"
            className="group rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-30px_rgba(217,70,239,0.32)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-sm font-semibold text-white">
              HL
            </div>
            <h2 className="text-2xl font-semibold">Hoogbegaafde Leerlingen</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Overzichtspagina met leerlingkaarten, voortgang, interesses en
              een introductie van Juf AImee.
            </p>
            <span className="mt-5 inline-flex text-sm font-medium text-fuchsia-700 transition group-hover:translate-x-1">
              Open prototype
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
