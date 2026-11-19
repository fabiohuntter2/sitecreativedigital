/**
 * Verdadeiro quando o visitante pediu "reduzir movimento" no sistema.
 * Para testes, `localStorage.setItem("hp-force-motion", "1")` força as animações neste navegador.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("hp-force-motion") === "1") return false;
  } catch {
    /* armazenamento bloqueado */
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
