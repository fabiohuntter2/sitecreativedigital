/** Transição suave a cada troca de página (o template é recriado em toda navegação). */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
