/**
 * <Picture> — emits AVIF + WebP + original JPG/PNG fallback.
 *
 * Pairs with scripts/optimize-blog-images.mjs which generates the
 * sibling .webp/.avif files at build time. The JPG/PNG fallback is
 * kept because Google Discover prefers traditional formats for the
 * og:image surface.
 *
 * Usage:
 *   import hero from "@/assets/blog-hero.jpg";
 *   <Picture src={hero} alt="..." width={1280} height={720} priority />
 */
import { type ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "loading" | "src"> & {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Mark as LCP candidate. Disables lazy loading + adds fetchpriority="high". */
  priority?: boolean;
  /** Override the default sizes attribute. */
  sizes?: string;
  className?: string;
};

function variant(src: string, ext: "webp" | "avif"): string {
  return src.replace(/\.(jpe?g|png)(\?.*)?$/i, `.${ext}$2`);
}

export function Picture({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = "(min-width: 1024px) 960px, 100vw",
  className,
  ...rest
}: Props) {
  const avif = variant(src, "avif");
  const webp = variant(src, "webp");
  return (
    <picture>
      <source type="image/avif" srcSet={avif} sizes={sizes} />
      <source type="image/webp" srcSet={webp} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
        {...rest}
      />
    </picture>
  );
}
