"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useState } from "react";

/** Digita e apaga palavras em sequência ("sites", "músicas", "videoclipes"...). */
export function TypeRotator({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState(words[0] ?? "");
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!words.length) return;
    if (reduced) {
      const t = setTimeout(() => {
        setI((n) => (n + 1) % words.length);
        setText(words[(i + 1) % words.length]);
      }, 2200);
      return () => clearTimeout(t);
    }
    const word = words[i];
    let delay = deleting ? 45 : 85;
    if (!deleting && text === word) delay = 1600;
    if (deleting && text === "") delay = 250;
    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setI((n) => (n + 1) % words.length);
      } else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, words, reduced]);

  return (
    <span className={className}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden="true">
        {text}
        <span className="ml-0.5 inline-block w-[3px] translate-y-[0.1em] animate-pulse bg-green align-baseline" style={{ height: "0.9em" }} />
      </span>
    </span>
  );
}
