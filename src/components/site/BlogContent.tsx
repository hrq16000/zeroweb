import { useMemo } from "react";
import { parseBlogContent } from "@/lib/blog-cta-marker";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

type Props = {
  content: string;
  /** Slug do post — usado como origem padrão do CTA. */
  postSlug: string;
  pagePath: string;
};

/**
 * Renderiza o corpo do post como texto puro (sem HTML arbitrário) e converte
 * o marcador `{{contact_cta ...}}` em um CTA funnel-first.
 */
export function BlogContent({ content, postSlug, pagePath }: Props) {
  const segments = useMemo(
    () => parseBlogContent(content, `blog_${postSlug}`),
    [content, postSlug],
  );

  return (
    <div className="mt-10 text-lg leading-relaxed text-foreground/90">
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <div key={`t-${i}`} className="whitespace-pre-line">
            {seg.text}
          </div>
        ) : (
          <div key={`c-${i}`} className="my-8 flex justify-center" data-testid="blog-inline-cta">
            <FunnelCTAButton
              pageType="post"
              intent={{
                purpose: seg.purpose,
                source: seg.source,
                pagePath,
                placement: "article",
              }}
              label={seg.label}
              location={seg.source}
            />
          </div>
        ),
      )}
    </div>
  );
}
