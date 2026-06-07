import logoAsset from "@/assets/logo-0web.png.asset.json";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

/**
 * Logo 0WEB com proporção 1:1 garantida em todos os breakpoints.
 * Usa object-contain + aspect-ratio explícito para nunca achatar,
 * mesmo dentro de flex containers apertados.
 */
export function BrandLogo({ size = 32, className, alt = "0WEB", priority }: Props) {
  return (
    <img
      src={logoAsset.url}
      alt={alt}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-contain shrink-0 block", className)}
      style={{ width: size, height: size, aspectRatio: "1 / 1" }}
    />
  );
}
