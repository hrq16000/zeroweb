import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const TITLE = "Política de Privacidade · 0WEB";
const DESC = "Como a 0WEB coleta, usa e protege seus dados pessoais em conformidade com a LGPD.";

export const Route = createFileRoute("/politica-privacidade")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "https://grow-evolution-engine.lovable.app/politica-privacidade" },
    ],
    links: [{ rel: "canonical", href: "https://grow-evolution-engine.lovable.app/politica-privacidade" }],
  }),
  component: PoliticaPage,
});

function PoliticaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <article className="mx-auto max-w-3xl px-5 lg:px-8 prose-like">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Legal</p>
          <h1 className="mt-3 text-4xl font-bold font-display">Política de Privacidade</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 4 de junho de 2026.</p>

          <div className="mt-8 space-y-6 text-foreground/85 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold font-display">1. Quem somos</h2>
              <p>Esta política descreve como a <strong>0WEB</strong> (CNPJ 41.723.708/0001-58), com sede em Curitiba/PR, coleta, utiliza, armazena e protege os dados pessoais dos visitantes do site <strong>0web.com.br</strong>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display">2. Dados que coletamos</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dados de contato</strong>: nome, e-mail, telefone e empresa enviados via formulários.</li>
                <li><strong>Dados de navegação</strong>: páginas visitadas, origem (UTMs), dispositivo e tempo de leitura, via GA4 e GTM.</li>
                <li><strong>Cookies</strong>: utilizados apenas após consentimento, conforme banner exibido na primeira visita.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display">3. Como usamos</h2>
              <p>Utilizamos os dados para: responder seu contato, enviar propostas comerciais, melhorar nosso site e mensurar campanhas de marketing.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display">4. Compartilhamento</h2>
              <p>Não vendemos seus dados. Compartilhamos apenas com prestadores essenciais (ex.: Google Analytics, hospedagem, e-mail) sob obrigação contratual de sigilo.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display">5. Seus direitos (LGPD)</h2>
              <p>Você pode solicitar acesso, correção, exclusão, anonimização ou portabilidade dos seus dados a qualquer momento pelo e-mail <a href="mailto:contato@0web.com.br" className="text-primary hover:underline">contato@0web.com.br</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display">6. Segurança</h2>
              <p>Aplicamos medidas técnicas e organizacionais (HTTPS, controle de acesso, criptografia em trânsito) para proteger seus dados contra acessos não autorizados.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display">7. Alterações</h2>
              <p>Esta política pode ser atualizada. Recomendamos a revisão periódica. Mudanças relevantes serão comunicadas no próprio site.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
