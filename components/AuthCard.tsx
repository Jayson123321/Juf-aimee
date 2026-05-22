"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AimeeImage from "@/app/Images/Aimee.png";
import WelcomeImage from "@/app/juf-aimee-welcome.png";
import BouncyText from "@/components/BouncyText";
import { login } from "@/app/login/actions";
import { register } from "@/app/register/actions";

type Mode = "login" | "register";

type Props = {
  /** Which form is shown first — set per route (/login vs /register). */
  initialMode: Mode;
  error?: string;
};

const slide = { type: "spring", stiffness: 200, damping: 28 } as const;

// Decorative bubbles that dissolve the orange panel edge into the white form.
// `out` = how far each bubble pokes past the seam (kept within the form's padding).
const seamBubbles = [
  { d: 58, top: "7%", out: 6, o: 1 },
  { d: 26, top: "20%", out: 30, o: 0.8 },
  { d: 78, top: "37%", out: 2, o: 1 },
  { d: 16, top: "50%", out: 34, o: 0.65 },
  { d: 44, top: "61%", out: 14, o: 0.95 },
  { d: 20, top: "74%", out: 28, o: 0.75 },
  { d: 50, top: "87%", out: 8, o: 1 },
];

export default function AuthCard({ initialMode, error }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";

  // The error only belongs to the form the route landed on.
  const showError = error && mode === initialMode;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1b2338] p-4 sm:p-6">
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-white md:min-h-[640px]">
        {/* ---------------- LOGIN FORM (desktop: right half) ---------------- */}
        <motion.div
          inert={!isLogin}
          initial={false}
          animate={{ opacity: isLogin ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`${isLogin ? "flex" : "hidden"} md:flex flex-col justify-center gap-6 p-8 sm:p-10 md:absolute md:top-0 md:right-0 md:w-1/2 md:h-full`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-xl overflow-hidden flex-shrink-0">
              <Image src={AimeeImage} alt="Juf Aimee" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-gray-900 text-lg font-bold leading-tight">Juf Aimee</h1>
              <p className="text-gray-500 text-xs">AI-onderwijsassistent</p>
            </div>
          </div>

          {/* Mobile illustration */}
          <div className="md:hidden relative w-40 h-40 mx-auto">
            <Image src={WelcomeImage} alt="Juf Aimee verwelkomt je" fill className="object-contain" priority />
          </div>

          <div>
            <h3 className="text-gray-900 text-xl font-bold">Welkom terug</h3>
            <p className="text-gray-500 text-sm mt-1">Log in met je account</p>
          </div>

          {showError && isLogin && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error === "missing"
                ? "Vul alle velden in."
                : "Ongeldig e-mailadres of wachtwoord."}
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  placeholder="jouw@email.nl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="remember" className="w-4 h-4 rounded accent-orange-400" />
                <span className="text-gray-700">Onthoud mij</span>
              </label>
              <a href="#" className="text-orange-400 hover:underline text-sm">
                Wachtwoord vergeten?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 transition text-white font-semibold py-3 text-sm mt-1"
            >
              Inloggen
            </button>
          </form>

          {/* Mobile toggle (desktop uses the panel button) */}
          <p className="md:hidden text-center text-sm text-gray-500">
            Nog geen account?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="text-orange-500 font-medium hover:underline"
            >
              Registreren
            </button>
          </p>
        </motion.div>

        {/* ---------------- REGISTER FORM (desktop: left half) ---------------- */}
        <motion.div
          inert={isLogin}
          initial={false}
          animate={{ opacity: isLogin ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className={`${!isLogin ? "flex" : "hidden"} md:flex flex-col justify-center gap-6 p-8 sm:p-10 md:absolute md:top-0 md:left-0 md:w-1/2 md:h-full`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-xl overflow-hidden flex-shrink-0">
              <Image src={AimeeImage} alt="Juf Aimee" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-gray-900 text-lg font-bold leading-tight">Juf Aimee</h1>
              <p className="text-gray-500 text-xs">AI-onderwijsassistent</p>
            </div>
          </div>

          {/* Mobile illustration */}
          <div className="md:hidden relative w-40 h-40 mx-auto">
            <Image src={WelcomeImage} alt="Juf Aimee verwelkomt je" fill className="object-contain" priority />
          </div>

          <div>
            <h3 className="text-gray-900 text-xl font-bold">Account aanmaken</h3>
            <p className="text-gray-500 text-sm mt-1">Maak een leraaraccount aan</p>
          </div>

          {showError && !isLogin && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error === "missing"
                ? "Vul alle velden in."
                : "Dit e-mailadres is al in gebruik."}
            </div>
          )}

          <form action={register} className="flex flex-col gap-4">
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  placeholder="jouw@email.nl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 transition text-white font-semibold py-3 text-sm mt-1"
            >
              Registreren
            </button>
          </form>

          {/* Mobile toggle (desktop uses the panel button) */}
          <p className="md:hidden text-center text-sm text-gray-500">
            Al een account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-orange-500 font-medium hover:underline"
            >
              Inloggen
            </button>
          </p>
        </motion.div>

        {/* ---------------- ILLUSTRATION PANEL (slides between sides) ---------------- */}
        <motion.div
          initial={false}
          animate={{ x: isLogin ? "0%" : "100%" }}
          transition={slide}
          className="hidden md:flex md:absolute md:top-0 md:left-0 md:w-1/2 md:h-full z-10 flex-col items-center justify-center gap-6 p-10 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 shadow-[0_0_50px_16px_rgba(251,146,60,0.5)]"
        >
          {/* Decorative blobs */}
          <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-white/40 blur-xl" />
          <div className="absolute bottom-12 right-10 w-28 h-28 rounded-full bg-pink-300/50 blur-2xl" />
          <div className="absolute top-1/3 right-12 w-12 h-12 rounded-full bg-sky-300/40 blur-lg" />

          {/* Bubbly seam — the orange edge fizzes into the white form */}
          {seamBubbles.map((b, i) => (
            <motion.span
              key={i}
              aria-hidden
              animate={{ y: [0, i % 2 ? -7 : -4, 0] }}
              transition={{
                duration: 3.4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-orange-400"
              style={{
                width: b.d,
                height: b.d,
                top: b.top,
                opacity: b.o,
                [isLogin ? "right" : "left"]: -b.out,
              }}
            />
          ))}

          {/* Corner logo — rides the panel as it slides */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 13 }}
            className="absolute left-7 top-7 flex items-center gap-2"
          >
            <motion.span
              animate={{ y: [0, -16, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                repeatDelay: 0.15,
                ease: ["easeOut", "easeIn"],
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
            >
              <span className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={AimeeImage} alt="" fill className="object-contain" />
              </span>
            </motion.span>
            <span className="text-orange-700 text-sm font-extrabold leading-tight">
              Juf Aimee
            </span>
          </motion.div>

          <div className="relative w-100 h-100 rounded-3xl overflow-hidden drop-shadow-2xl">
            <Image src={WelcomeImage} alt="Juf Aimee verwelkomt je" fill className="object-contain" priority />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="relative text-center"
            >
              <h2 className="text-[#1b2338] text-2xl font-extrabold">
                <BouncyText
                  text={isLogin ? "Leuk dat je er bent!" : "Word vandaag lid!"}
                  highlight={isLogin ? "Leuk" : "Word"}
                  highlightClassName="text-orange-700"
                />
              </h2>
              <p className="text-[#1b2338]/70 text-sm mt-1 font-medium">
                <BouncyText
                  text={isLogin ? "Jouw briljante AI-onderwijsassistent" : "Start je avontuur met Juf Aimee"}
                  delay={2.6}
                  highlight={isLogin ? "AI-onderwijsassistent" : "Juf Aimee"}
                  highlightClassName="text-orange-700"
                />
              </p>
            </motion.div>
          </AnimatePresence>

          {/* The toggle that triggers the slide */}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="relative mt-1 rounded-full border-2 border-[#1b2338] px-8 py-2.5 text-sm font-bold text-[#1b2338] transition hover:bg-[#1b2338] hover:text-white"
          >
            {isLogin ? "Nog geen account? Registreren" : "Al een account? Inloggen"}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
