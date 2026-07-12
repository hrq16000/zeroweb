import { useRef, useState } from "react";

export type ProductImage = { url: string; alt?: string };

type Props = {
  images: ProductImage[];
  productName: string;
};

/**
 * Galeria estilo loja virtual: imagem principal grande + coluna de miniaturas.
 * No desktop, ao passar o mouse sobre a imagem principal, aplica um zoom
 * seguindo a posição do cursor (transform-origin dinâmico). No mobile, o
 * toque abre a imagem original em nova aba.
 */
export function ProductGallery({ images, productName }: Props) {
  const valid = images.filter((i) => i && i.url);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement | null>(null);

  if (valid.length === 0) return null;

  const current = valid[Math.min(active, valid.length - 1)];

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="grid grid-cols-[72px_1fr] gap-3 sm:gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
        {valid.map((img, i) => {
          const selected = i === active;
          return (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1} de ${valid.length}`}
              aria-pressed={selected}
              className={`w-[72px] h-[72px] rounded-lg overflow-hidden border-2 bg-muted flex-shrink-0 transition ${
                selected ? "border-primary" : "border-border hover:border-primary/50"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `${productName} — miniatura ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Main image */}
      <a
        href={current.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir imagem em tamanho real: ${current.alt || productName}`}
        className="block"
      >
        <div
          ref={frameRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMove}
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted cursor-zoom-in"
        >
          <img
            src={current.url}
            alt={current.alt || productName}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-contain transition-transform duration-200 ease-out"
            style={{
              transform: zoom ? "scale(2)" : "scale(1)",
              transformOrigin: origin,
            }}
          />
        </div>
      </a>
    </div>
  );
}
