import logoAsset from "@/assets/logo-0web.png.asset.json";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * Altura do logo em px. A largura é derivada automaticamente da proporção
   * natural do wordmark (≈ 3.25:1), evitando que ele apareça espremido em
   * qualquer container.
   */
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

/**
 * Logo 0WEB (wordmark). Mantém a proporção natural da imagem em todos os
 * breakpoints — NÃO força 1:1, senão o wordmark fica achatado/letterboxed.
 * Usa `object-contain` + altura fixa + largura auto para preservar o aspect
 * ratio e nunca causar reflow do cabeçalho durante o carregamento.
 */
// Proporção real do asset: 900x277 (≈ 3.249).
export const LOGO_ASPECT_RATIO = 900 / 277;

export function BrandLogo({ size = 32, className, alt = "0WEB", priority }: Props) {
  const width = Math.round(size * LOGO_ASPECT_RATIO);
  return (
    <img
      src={logoAsset.url}
      alt={alt}
      width={width}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-contain shrink-0 block max-w-full", className)}
      style={{ height: size, width, aspectRatio: `${width} / ${size}` }}
    />
  );
}
