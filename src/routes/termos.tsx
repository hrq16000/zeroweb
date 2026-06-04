import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const TITLE = "Termos de Uso · 0WEB";
const DESC = "Termos e condições de uso do site e dos serviços oferecidos pela 0WEB.";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "https://grow-evolution-engine.lovable.app/termos" },
    ],
    links: [{ rel: "canonical", href: "https://grow-evolution-engine.lovable.app/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Legal</p>
          <h1 className="mt-3 text-4xl font-bold font-display">Termos de Uso</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 4 de junho de 2026.</p>

          <div className="mt-8 space-y-6 text-foreground/85 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold font-display">1. Aceitação</h2>
              <p>Ao acessar este site você concorda com estes Termos de Uso. Caso não concorde, recomendamos não utilizá-lo.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold font-display">2. Serviços</h2>
              <p>A 0WEB presta serviços de criação de sites, sistemas web, marketing digital, automação e IA. Cada contratação possui escopo, prazos e condições próprias, formalizados em proposta comercial.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold font-display">3. Propriedade intelectual</h2>
              <p>Logotipo, conteúdo, código-fonte e identidade visual deste site são de propriedade da 0WEB. Reprodução sem autorização é proibida.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold font-display">4. Limitação de responsabilidade</h2>
              <p>O conteúdo do site tem caráter informativo. A 0WEB não se responsabiliza por decisões tomadas exclusivamente com base nele.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold font-display">5. Links de terceiros</h2>
              <p>Eventuais links externos não implicam endosso ao conteúdo de terceiros.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold font-display">6. Foro</h2>
              <p>Fica eleito o foro da Comarca de Curitiba/PR para dirimir quaisquer questões oriundas destes Termos.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
