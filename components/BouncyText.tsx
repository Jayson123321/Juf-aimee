"use client";

import { motion, type Variants } from "motion/react";

const item: Variants = {
  hidden: { opacity: 0, y: 0 },
  show: {
    opacity: 1,
    y: [0, -12, 0],
    transition: {
      // Bounce loops forever; opacity fades in just once.
      y: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

type BouncyTextProps = {
  text: string;
  className?: string;
  /** Seconds to wait before the bounce wave starts. */
  delay?: number;
  /** Substring of `text` to color differently (e.g. an accent word). */
  highlight?: string;
  /** Classes applied to the letters of `highlight`. */
  highlightClassName?: string;
};

export default function BouncyText({
  text,
  className,
  delay = 0,
  highlight,
  highlightClassName = "",
}: BouncyTextProps) {
  // Index range of the highlighted word, if present.
  const hiStart = highlight ? text.indexOf(highlight) : -1;
  const hiEnd = hiStart >= 0 ? hiStart + highlight!.length : -1;
  // Defined here so each instance can hold its bounce by `delay`.
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: 0.06,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="show"
      className={`inline-flex ${className ?? ""}`}
      aria-label={text}
    >
      {text.split("").map((char, i) => {
        const isHighlighted = i >= hiStart && i < hiEnd;
        return (
          <motion.span
            key={i}
            variants={item}
            aria-hidden
            // inline-block so y-transforms apply; whitespace-pre keeps spaces.
            className={`inline-block whitespace-pre ${
              isHighlighted ? highlightClassName : ""
            }`}
          >
            {char}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
