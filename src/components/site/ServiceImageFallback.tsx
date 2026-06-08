import { Sparkles } from "lucide-react";

/**
 * Placeholder visual determinístico para produtos sem imagem.
 *
 * Em vez de mostrar o mesmo "Imagem pendente" genérico, gera um gradiente
 * único + iniciais (nome do serviço ou categoria) derivados de um hash do
 * slug. Resultado: cada card tem uma capa visual coerente e reconhecível
 * mesmo enquanto a imagem oficial não é cadastrada — sem precisar fazer
 * upload manual para cada serviço.
 */
type Props = {
  slug: string;
  name: string;
  category?: string;
  className?: string;
};

// Paleta inspirada no design system (oklch tokens), com pares harmônicos.
const GRADIENTS: Array<[string, string]> = [
  ["from-primary/25", "to-primary/5"],
  ["from-emerald-500/25", "to-emerald-500/5"],
  ["from-violet-500/25", "to-violet-500/5"],
  ["from-amber-500/25", "to-amber-500/5"],
  ["from-rose-500/25", "to-rose-500/5"],
  ["from-sky-500/25", "to-sky-500/5"],
  ["from-fuchsia-500/25", "to-fuchsia-500/5"],
  ["from-teal-500/25", "to-teal-500/5"],
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getServiceInitials(name: string, fallback?: string): string {
  const source = (name || fallback || "0WEB").trim();
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "0W";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ServiceImageFallback({ slug, name, category, className }: Props) {
  const idx = hashStr(slug || name) % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];
  const initials = getServiceInitials(name, category);

  return (
    <div
      aria-hidden="true"
      className={`aspect-video relative overflow-hidden bg-gradient-to-br ${from} ${to} ${className ?? ""}`}
    >
      {/* Padrão decorativo sutil para não parecer placeholder vazio. */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, currentColor 1px, transparent 1.5px), radial-gradient(circle at 75% 70%, currentColor 1px, transparent 1.5px)",
          backgroundSize: "24px 24px, 32px 32px",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display font-black text-4xl sm:text-5xl tracking-tight text-foreground/80 drop-shadow-sm">
            {initials}
          </span>
          {category ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-sm text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              <Sparkles className="w-2.5 h-2.5" /> {category}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
