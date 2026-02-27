"use client";

import { motion } from "framer-motion";

export default function EmbersParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute size-1 bg-spark rounded-full"
          initial={{ x: `${i * 8}%`, y: "100%", opacity: 0.2 }}
          animate={{ y: "-10%", opacity: [0.2, 0.8, 0] }}
          transition={{ duration: 2 + i * 0.2, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}
