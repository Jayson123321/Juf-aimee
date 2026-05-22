"use client";

import { motion } from "motion/react";

/**
 * Entrance animation for the auth pages. Lives in a `template.tsx`, which
 * re-mounts on every navigation — so this replays each time the user moves
 * between /login and /register.
 *
 * The outer div is an always-opaque dark backdrop: it matches the pages'
 * `bg-[#1b2338]` so the content can fade in from 0 without a white flash.
 */
export default function AuthTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1b2338]">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24, rotateY: -10, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 1200 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
