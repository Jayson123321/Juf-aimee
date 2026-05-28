"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Wand2,
  Brain,
  Rocket,
  Star,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";
import aimeePortrait from "@/app/Images/Aimee.png";
import resourcesImage from "@/app/Images/resources-2.png";

type AudienceKey = "leerlingen" | "leerkrachten" | "scholen";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>("leerlingen");
  const [demoTopic, setDemoTopic] = useState("Fotosynthese bij planten");

  const features = [
    {
      icon: Brain,
      title: "AI-tutor, altijd beschikbaar",
      desc: "Een geduldige uitleg-buddy die nooit zegt: 'kom later terug'. Huiswerkhulp en uitleg, direct.",
      color: "bg-amber-300",
      rotate: "-rotate-2",
    },
    {
      icon: Wand2,
      title: "Opdrachten die zichzelf maken",
      desc: "Leerkrachten: typ een onderwerp, krijg een opdracht. Met antwoordsleutel. In een paar seconden.",
      color: "bg-pink-300",
      rotate: "rotate-1",
    },
    {
      icon: Rocket,
      title: "Leerpaden die meegroeien",
      desc: "Elke leerling krijgt zijn eigen route. Juf Aimee merkt wat klikt en wat nog niet.",
      color: "bg-sky-300",
      rotate: "-rotate-1",
    },
    {
      icon: Check,
      title: "Nakijken zonder gedoe",
      desc: "Lever 30 werkjes in, krijg suggesties voor feedback en cijfers. Jij blijft de baas.",
      color: "bg-lime-300",
      rotate: "rotate-2",
    },
    {
      icon: BookOpen,
      title: "Aandacht voor hoogbegaafden",
      desc: "Bloom-niveaus, interesses en OPP-context komen samen in opdrachten op maat.",
      color: "bg-violet-300",
      rotate: "-rotate-2",
    },
    {
      icon: Sparkles,
      title: "Inzicht voor de hele school",
      desc: "Patronen per klas of groep. Zie wie extra uitdaging nodig heeft, niet pas bij het rapport.",
      color: "bg-orange-300",
      rotate: "rotate-1",
    },
  ];

  const audiences: Record<
    AudienceKey,
    { title: string; sub: string; bullets: string[]; emoji: string }
  > = {
    leerlingen: {
      title: "Voor leerlingen",
      sub: "Jouw brein, maar met een leerbuddy.",
      bullets: [
        "Stel alles, krijg heldere uitleg",
        "Opdrachten die passen bij jouw niveau",
        "Zie wat je al kunt en wat nog even mag",
        "Het is eigenlijk best leuk. Echt waar.",
      ],
      emoji: "🎒",
    },
    leerkrachten: {
      title: "Voor leerkrachten",
      sub: "Uren terug in jouw week. Elke week.",
      bullets: [
        "Genereer opdrachten, werkbladen en differentiatie",
        "Nakijkhulp met jouw oordeel als laatste woord",
        "Zie wie hulp of juist meer uitdaging nodig heeft",
        "Gebouwd mét leerkrachten, niet alleen voor ze",
      ],
      emoji: "🍎",
    },
    scholen: {
      title: "Voor scholen",
      sub: "Inzicht op schoolniveau, zonder de chaos.",
      bullets: [
        "Dashboard over klassen en groepen heen",
        "AVG-bewust en transparant in AI-gebruik",
        "Uitrol in weken, niet in schooljaren",
        "Echte ondersteuning door echte mensen",
      ],
      emoji: "🏫",
    },
  };

  return (
    <div
      className="min-h-screen bg-[#FFF8E7] text-[#030213] overflow-x-hidden"
      style={{ fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Nunito:wght@400;600;700;800&display=swap');
        .display-font { font-family: 'Fraunces', Georgia, serif; font-variation-settings: "opsz" 144, "SOFT" 100; }
        .squiggle { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='8' viewBox='0 0 100 8'%3E%3Cpath d='M0 4 Q 12.5 0, 25 4 T 50 4 T 75 4 T 100 4' stroke='%23FB923C' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: repeat-x; background-position: bottom; padding-bottom: 8px; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; }
        @keyframes glassShine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .glass-shine {
          background-image: linear-gradient(
            110deg,
            #030213 0%,
            #030213 35%,
            rgba(251, 146, 60, 0.9) 46%,
            #ffffff 50%,
            rgba(251, 146, 60, 0.9) 54%,
            #030213 65%,
            #030213 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: glassShine 5.5s linear infinite;
          padding: 0 0.05em;
        }
      `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#FFF8E7]/80 border-b-4 border-[#030213]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 overflow-hidden rounded-2xl border-2 border-[#030213] -rotate-6">
              <Image alt="Juf Aimee" src={aimeePortrait} fill sizes="64px" className="object-cover" />
            </div>
            <span className="display-font text-4xl font-black">Juf Aimee</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold">
            <a href="#features" className="hover:text-orange-500">Functies</a>
            <a href="#how" className="hover:text-orange-500">Hoe het werkt</a>
            <a href="#audiences" className="hover:text-orange-500">Voor wie</a>
            <a href="#stats" className="hover:text-orange-500">Resultaten</a>
            <Link href="/login" className="px-4 py-2 font-bold hover:text-orange-500">
              Inloggen
            </Link>
            <Link
              href="/register"
              className="px-5 py-3 bg-[#030213] text-white rounded-full font-bold border-2 border-[#030213] hover:bg-orange-500 hover:text-[#030213] transition"
            >
              Registreren →
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t-2 border-[#030213] bg-[#FFF8E7] px-6 py-4 flex flex-col gap-3 font-bold">
            <a href="#features">Functies</a>
            <a href="#how">Hoe het werkt</a>
            <a href="#audiences">Voor wie</a>
            <a href="#stats">Resultaten</a>
            <Link href="/login">Inloggen</Link>
            <Link
              href="/register"
              className="px-5 py-3 bg-[#030213] text-white rounded-full font-bold w-fit"
            >
              Registreren →
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-20">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 right-10 w-20 h-20 rounded-full border-4 border-[#030213] shadow-[4px_4px_0px_0px_rgba(3,2,19,1)] hidden md:block"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #fb923c 0%, #ea580c 45%, #1c1917 100%)",
          }}
        />

        {/* Floating "polaroid" with resources image, tucked under the ball */}
        <motion.div
          initial={{ opacity: 0, y: -10, rotate: 8 }}
          animate={{
            opacity: 1,
            y: [0, -6, 0],
            rotate: [8, 11, 8],
          }}
          transition={{
            opacity: { delay: 0.5, duration: 0.4 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
          whileHover={{ rotate: 0, scale: 1.05 }}
          className="absolute top-36 right-0 w-36 h-36 lg:w-40 lg:h-40 z-20 hidden md:block"
        >
          <div className="relative w-full h-full bg-white border-4 border-[#030213] rounded-2xl p-2 shadow-[6px_6px_0px_0px_rgba(3,2,19,1)]">
            <div className="relative w-full h-full overflow-hidden rounded-lg bg-amber-50">
              <Image
                src={resourcesImage}
                alt="Bronnen en lesmateriaal"
                fill
                sizes="(min-width: 1024px) 192px, 176px"
                className="object-contain p-1"
              />
            </div>
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-amber-300 border-2 border-[#030213] rounded-sm rotate-2"
              aria-hidden
            />
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-14 left-4 w-12 h-12 bg-sky-400 border-4 border-[#030213] hidden md:block"
          style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-16 h-16 hidden md:block"
        >
          <Star className="w-full h-full text-orange-400 fill-orange-400" strokeWidth={2.5} />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-lime-300 border-2 border-[#030213] rounded-full font-bold text-sm mb-6 ml-10 -rotate-1"
            >
              <Sparkles className="w-4 h-4" /> Gemaakt met leerkrachten, voor iedereen
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="display-font text-5xl md:text-[4rem] font-black leading-[0.9] mb-6"
            >
              <span className="glass-shine">Leren dat echt bij jij past.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-stone-700 mb-8 max-w-lg leading-relaxed"
            >
              Een{" "}
              <span className="font-black text-orange-500">leerbuddy</span>{" "}
              voor leerlingen, een{" "}
              <span className="font-black text-orange-500">copilot</span>{" "}
              voor leerkrachten en een{" "}
              <span className="font-black text-orange-500 squiggle">dashboard</span>{" "}
              voor scholen. Drie rollen, één platform.{" "}
              <span className="font-black bg-amber-300 px-1.5 rounded border-2 border-[#030213] inline-block -rotate-1 translate-y-2">
                Uren terug
              </span>{" "}
              in je week. Nieuwsgierigheid,{" "}
              <span className="italic font-extrabold text-orange-500">op aanvraag</span>.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/register"
                className="px-7 py-4 bg-orange-500 text-white rounded-full font-bold text-lg border-4 border-[#030213] shadow-[6px_6px_0px_0px_rgba(3,2,19,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(3,2,19,1)] transition-all"
              >
                Registreren →
              </Link>
              <Link
                href="/login"
                className="px-7 py-4 bg-white rounded-full font-bold text-lg border-4 border-[#030213] shadow-[6px_6px_0px_0px_rgba(3,2,19,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(3,2,19,1)] transition-all"
              >
                Inloggen
              </Link>
            </motion.div>
            <div className="mt-8 flex items-center gap-3 text-sm font-bold text-stone-600">
              <div className="flex -space-x-2">
                {["bg-pink-400", "bg-sky-400", "bg-amber-400", "bg-lime-400"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-[#030213]`} />
                ))}
              </div>
              <span>Gebruikt door 12.000+ leerlingen & 400+ leerkrachten</span>
            </div>
          </div>

          {/* DEMO CARD - placeholder for now */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-full h-full bg-orange-300 rounded-3xl border-4 border-[#030213]" />
            <div className="relative bg-white rounded-3xl border-4 border-[#030213] p-6 shadow-[8px_8px_0px_0px_rgba(3,2,19,1)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-24 h-24 overflow-hidden rounded-2xl border-2 border-[#030213] -rotate-6 bg-amber-100">
                  <Image
                    alt="Juf Aimee"
                    src={aimeePortrait}
                    fill
                    sizes="96px"
                    className="object-contain"
                    style={{ objectPosition: "center 80%" }}
                  />
                </div>
                <div>
                  <div className="font-black display-font text-lg">Probeer me!</div>
                  <div className="text-xs text-stone-500 font-bold">
                    Vraag Juf Aimee straks alles →
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Fotosynthese bij planten", "Breuken vermenigvuldigen", "De waterkringloop", "Tweede Wereldoorlog"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDemoTopic(t)}
                    className={`px-3 py-1 rounded-full border-2 border-[#030213] text-sm font-bold ${
                      demoTopic === t
                        ? "bg-[#030213] text-white"
                        : "bg-white hover:bg-amber-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 rounded-2xl border-2 border-dashed border-stone-400 p-5 text-sm text-stone-600 text-center font-semibold leading-relaxed"
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                  Laat Juf Aimee een opdracht voor je maken — kies groep, vak en
                  onderwerp en zie de magie.
                  <Link
                    href="/probeer-me"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full border-2 border-[#030213] font-bold text-sm hover:bg-[#030213] hover:text-white transition"
                  >
                    Probeer de demo →
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 px-4 py-3 bg-[#030213] text-white rounded-2xl border-2 border-[#030213] font-bold text-center hover:bg-orange-500 hover:text-[#030213] transition text-sm"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="flex-1 px-4 py-3 bg-white rounded-2xl border-2 border-[#030213] font-bold text-center hover:bg-amber-100 transition text-sm"
                >
                  Account maken
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[#030213] text-white py-6 border-y-4 border-[#030213] overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap font-black display-font text-2xl">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex gap-12 items-center shrink-0">
                <span>★ VERTROUWD DOOR 400+ SCHOLEN</span>
                <span className="text-orange-400">✦</span>
                <span>★ AVG-BEWUST</span>
                <span className="text-orange-400">✦</span>
                <span>★ LEERKRACHTEN ZIJN FAN</span>
                <span className="text-orange-400">✦</span>
                <span>★ KINDEREN GEBRUIKEN HET ECHT</span>
                <span className="text-orange-400">✦</span>
              </div>
            ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-violet-300 border-2 border-[#030213] rounded-full font-bold text-sm mb-4 rotate-1">
            Wat zit erin
          </div>
          <h2 className="display-font text-5xl md:text-6xl font-black mb-4">
            Zes superkrachten. <br />
            Eén platform.
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            AI-tutoring, opdrachten genereren, adaptieve leerpaden en nakijkhulp — alles
            werkt samen, niets staat in de weg.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`${f.color} ${f.rotate} hover:rotate-0 transition-all duration-300 rounded-3xl border-4 border-[#030213] p-7 shadow-[6px_6px_0px_0px_rgba(3,2,19,1)]`}
            >
              <div className="w-14 h-14 bg-white rounded-2xl border-2 border-[#030213] flex items-center justify-center mb-5">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="display-font text-2xl font-black mb-2">{f.title}</h3>
              <p className="font-semibold text-stone-800 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="bg-[#030213] text-[#FFF8E7] py-24 border-y-4 border-[#030213] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #FFF8E7 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white text-[#030213] border-2 border-white rounded-full font-bold text-sm mb-4 -rotate-1">
              Hoe het werkt
            </div>
            <h2 className="display-font text-5xl md:text-6xl font-black">
              Van aanmelden tot <span className="text-orange-400">"WoW"</span>
              <br />
              in drie stappen.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                t: "Aanmelden in 30 seconden",
                d: "Kies je rol — leerling, leerkracht of school. Geen creditcard nodig.",
                c: "bg-pink-300",
              },
              {
                n: "02",
                t: "Vertel wat je geeft (of leert)",
                d: "Groep, vakken, leerdoelen. Juf Aimee stemt alles daarop af.",
                c: "bg-sky-300",
              },
              {
                n: "03",
                t: "Laat AI het saaie werk doen",
                d: "Genereren, nakijken, uitleggen, volgen. Jij houdt de regie.",
                c: "bg-lime-300",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className={`${s.c} text-[#030213] rounded-3xl border-4 border-[#FFF8E7] p-7 h-full`}>
                  <div className="display-font text-6xl font-black mb-3 opacity-20">{s.n}</div>
                  <h3 className="display-font text-2xl font-black mb-3">{s.t}</h3>
                  <p className="font-semibold leading-relaxed">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCE TABS */}
      <section id="audiences" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-pink-300 border-2 border-[#030213] rounded-full font-bold text-sm mb-4 rotate-1">
            Voor wie je ook bent
          </div>
          <h2 className="display-font text-5xl md:text-6xl font-black">
            Gemaakt voor de hele school.
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(Object.keys(audiences) as AudienceKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setActiveAudience(k)}
              className={`px-6 py-3 rounded-full border-4 border-[#030213] font-bold transition ${
                activeAudience === k
                  ? "bg-[#030213] text-white shadow-[4px_4px_0px_0px_rgba(3,2,19,1)]"
                  : "bg-white hover:bg-amber-100"
              }`}
            >
              {audiences[k].emoji} {audiences[k].title}
            </button>
          ))}
        </div>
        <motion.div
          key={activeAudience}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-200 rounded-3xl border-4 border-[#030213] p-10 md:p-14 shadow-[8px_8px_0px_0px_rgba(3,2,19,1)]"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-6xl mb-4">{audiences[activeAudience].emoji}</div>
              <h3 className="display-font text-4xl md:text-5xl font-black mb-3">
                {audiences[activeAudience].title}
              </h3>
              <p className="text-xl font-semibold mb-6">{audiences[activeAudience].sub}</p>
              <Link
                href="/register"
                className="px-6 py-3 bg-[#030213] text-white rounded-full font-bold border-2 border-[#030213] hover:bg-orange-500 hover:text-[#030213] transition inline-flex items-center gap-2"
              >
                Aan de slag <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="space-y-3">
              {audiences[activeAudience].bullets.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 bg-white rounded-2xl border-2 border-[#030213] p-4 font-semibold"
                >
                  <div className="w-6 h-6 bg-lime-400 rounded-full border-2 border-[#030213] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  {b}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section id="stats" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "8,5 uur", l: "Bespaard per leerkracht, per week", c: "bg-orange-300" },
            { n: "+27%", l: "Gemiddelde scoreverbetering", c: "bg-sky-300" },
            { n: "12k+", l: "Leerlingen leren dagelijks mee", c: "bg-violet-300" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${s.c} rounded-3xl border-4 border-[#030213] p-8 text-center shadow-[6px_6px_0px_0px_rgba(3,2,19,1)]`}
            >
              <div className="display-font text-6xl md:text-7xl font-black mb-2">{s.n}</div>
              <div className="font-bold">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border-4 border-[#030213] p-10 md:p-14 shadow-[8px_8px_0px_0px_rgba(3,2,19,1)] relative"
        >
          <div className="display-font text-8xl absolute top-2 left-6 text-amber-300">"</div>
          <p className="display-font text-2xl md:text-3xl font-black leading-snug mb-6 relative">
            Mijn hoogbegaafde leerlingen krijgen eindelijk uitdaging op maat.{" "}
            <span className="bg-amber-300 px-2">
              Juf Aimee legt het op vijf manieren uit
            </span>{" "}
            tot het kwartje valt. Voor het eerst zie ik kinderen vrijwillig verder werken.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-300 rounded-full border-2 border-[#030213]" />
            <div>
              <div className="font-black">Juf Sanne</div>
              <div className="text-sm text-stone-600 font-semibold">
                Groep 7 · Basisschool De Vlinder
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-orange-400 rounded-[40px] border-4 border-[#030213] p-12 md:p-20 text-center relative overflow-hidden shadow-[10px_10px_0px_0px_rgba(3,2,19,1)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10"
          >
            <Star className="w-16 h-16 text-amber-300 fill-amber-300" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 right-10"
          >
            <Sparkles className="w-20 h-20 text-pink-300" />
          </motion.div>
          <h2 className="display-font text-5xl md:text-7xl font-black mb-6 relative">
            Klaar om het kwartje
            <br />
            te laten vallen?
          </h2>
          <p className="text-xl font-semibold mb-8 max-w-xl mx-auto relative">
            Gratis voor leerlingen. Gratis proefperiode voor leerkrachten. Maatwerk voor
            scholen.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <Link
              href="/register"
              className="px-8 py-4 bg-[#030213] text-white rounded-full font-bold text-lg border-4 border-[#030213] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.6)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Registreren →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white rounded-full font-bold text-lg border-4 border-[#030213] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.6)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030213] text-[#FFF8E7] py-12 border-t-4 border-[#030213]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-10 h-10 overflow-hidden rounded-2xl border-2 border-white -rotate-6">
                  <Image alt="Juf Aimee" src={aimeePortrait} fill sizes="40px" className="object-cover" />
                </div>
                <span className="display-font text-2xl font-black">Juf Aimee</span>
              </div>
              <p className="text-sm font-semibold opacity-70">Leren dat bij je past.</p>
            </div>
            {[
              {
                t: "Product",
                l: ["Functies", "Voor leerlingen", "Voor leerkrachten", "Voor scholen"],
              },
              { t: "Bedrijf", l: ["Over ons", "Vacatures", "Blog", "Contact"] },
              { t: "Vertrouwen", l: ["Privacy", "AVG", "Beveiliging", "Voorwaarden"] },
            ].map((s) => (
              <div key={s.t}>
                <div className="font-black mb-3">{s.t}</div>
                <ul className="space-y-2 text-sm font-semibold opacity-70">
                  {s.l.map((li) => (
                    <li key={li}>
                      <a href="#" className="hover:text-white">
                        {li}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-700 pt-6 text-sm font-semibold opacity-60 flex flex-wrap justify-between gap-3">
            <span>© 2026 Juf Aimee. Gemaakt voor nieuwsgierige koppen.</span>
            <span>Gebouwd door leerkrachten, ontworpen voor kinderen.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
