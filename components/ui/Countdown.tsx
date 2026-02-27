"use client";

import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: number }) {
  const [left, setLeft] = useState(target);
  useEffect(() => {
    const timer = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="text-4xl font-heading text-spark">{left}s</div>;
}
