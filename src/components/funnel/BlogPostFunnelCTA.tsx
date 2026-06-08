import { Sparkles } from "lucide-react";
import { FunnelCTAButton } from "./FunnelCTAButton";

/**
 * Caixa CTA inline para posts de blog — chama o funil 'funnel-post'.
 * Usar antes dos posts relacionados.
 */
export function BlogPostFunnelCTA({ postSlug }: { postSlug?: string }) {
  return (
    <aside className="mx-auto max-w-3xl px-5 mt-16">
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center">
        <Sparkles className="mx-auto w-6 h-6 text-primary" />
        <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight">
          Quer colocar isso em prática?
        </h3>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Conte rapidinho o seu cenário e nossa equipe responde com o próximo passo.
        </p>
        <div className="mt-5 flex justify-center">
          <FunnelCTAButton
            pageType="post"
            label="Quero ajuda com isso"
            location={postSlug ? `blog_post_${postSlug}` : "blog_post"}
          />
        </div>
      </div>
    </aside>
  );
}
