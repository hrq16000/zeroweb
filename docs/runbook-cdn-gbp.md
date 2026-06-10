# Runbook · CDN (Cloudflare) + Google Business Profile + Lighthouse

Atualizado: Phase 2 (Schemas) + Phase 3 (Performance) + Phase 4 (Checklist) do plano `.lovable/plan.md`.

---

## 1. Cloudflare — Cache agressivo, WebP, Brotli

### 1.1 DNS + SSL
- DNS do domínio `0web.com.br` apontando para Cloudflare (nameservers oficiais).
- Registros A/CNAME do app com **proxy laranja ativo** (não cinza).
- SSL/TLS → **Full (strict)**.
- Edge Certificates → Always Use HTTPS = ON, Automatic HTTPS Rewrites = ON, Min TLS = 1.2.
- HSTS: max-age=31536000, includeSubDomains, preload (ativar só depois de validar HTTPS em todos os subdomínios).

### 1.2 Speed → Optimization
- **Brotli**: ON.
- **Early Hints**: ON.
- **Rocket Loader**: OFF (quebra React hidratação).
- **Auto Minify** (JS/CSS/HTML): OFF (Vite já minifica e o auto-minify pode quebrar `import.meta`).
- **Polish**: Lossy + WebP. (Plano Pro+; converte imagens automaticamente.)
- **Mirage**: ON (Pro+).

### 1.3 Cache Rules (Rules → Cache Rules)
Criar nesta ordem (primeira que casar vence):

| # | Match                                                             | Edge TTL | Browser TTL |
|---|-------------------------------------------------------------------|----------|-------------|
| 1 | `URI Path matches regex ^/assets/.*` ou `^/_build/.*`             | 1 ano    | 1 ano       |
| 2 | `URI Path ends with` ∈ {.js .css .woff2 .webp .avif .ico}         | 1 ano    | 1 ano       |
| 3 | `URI Path ends with` ∈ {.jpg .jpeg .png .svg}                     | 30 dias  | 30 dias     |
| 4 | `URI Path matches regex ^/sitemap.*\.xml$`                        | 1 hora   | 1 hora      |
| 5 | `URI Path eq /robots.txt`                                         | 1 hora   | 1 hora      |
| 6 | `URI Path matches regex ^/(api|_server|__l5e)/`                   | **Bypass cache** | Respect origin |
| 7 | Tudo o resto (HTML)                                               | 5 min    | 0 (respect) |

`public/_headers` já replica essas regras para hospedagens que leem o arquivo (Netlify, Cloudflare Pages). Em Workers/Proxy o `_headers` é ignorado — use Cache Rules.

### 1.4 Page Rules / Origin
- Origin Cache Control: ON.
- Crawler Hints: ON (Pro+).
- Tiered Cache: Smart Tiered Cache → ON.

### 1.5 Validação
Após cada deploy, rodar:
```bash
curl -I https://0web.com.br/assets/<hash>.js | grep -i 'cf-cache-status\|cache-control'
# esperado: cf-cache-status: HIT  | cache-control: public, max-age=31536000, immutable
```

---

## 2. Google Business Profile (GBP) — 3 posts/semana, fotos, Q&A

### 2.1 Setup
1. Reivindicar/verificar perfil em https://business.google.com.
2. Categoria primária: **Agência de marketing**. Secundárias: Web Designer, Consultor de SEO, Agência de Publicidade.
3. Área de atendimento: Curitiba + 100km (ou cidades específicas). Marque "ocultar endereço" se atende remoto.
4. Telefone WhatsApp `+55 41 99745-2053`. Site `https://0web.com.br`.
5. Horário, link de agendamento, atributos (atendimento online, LGBTQ+ friendly, etc).

### 2.2 Calendário editorial (3 posts/semana)
Segunda · Quarta · Sexta. Tipos:

| Dia    | Tipo de post     | Gancho                                                   | CTA                  |
|--------|------------------|----------------------------------------------------------|----------------------|
| Seg    | Novidade / Oferta| "Diagnóstico SEO gratuito esta semana"                   | Saiba mais → /solicitar-diagnostico |
| Qua    | Atualização      | Bastidor: print de campanha, antes/depois de SEO          | Ligar / WhatsApp     |
| Sex    | Evento / Conteúdo| Mini-artigo: dica de 1 minuto (vinheta + 1 imagem real)   | Reservar / Site      |

Regras:
- 1 imagem real por post (≥720×720). Sem stock genérico.
- 150–300 caracteres. Hashtag local: `#Curitiba` `#SEOCuritiba`.
- UTM nos links: `?utm_source=gbp&utm_medium=post&utm_campaign=<slug>`.

### 2.3 Fotos (8 categorias mínimas, 3 por categoria)
1. Fachada / logo no prédio  
2. Equipe trabalhando  
3. Bastidor (estação, dois monitores)  
4. Antes/depois (caso real autorizado)  
5. Reunião com cliente  
6. Escritório (panorâmica)  
7. Logo oficial 1:1  
8. Capa 16:9 com proposta de valor

### 2.4 Q&A pré-publicado (faça você mesmo as 10 perguntas mais comuns e responda)
Quanto custa um site, prazo, atende todo BR, vocês fazem SEO, qual o investimento mínimo em tráfego, como funciona o diagnóstico, integra com CRM, tem fidelidade, emite NF, como começar.

### 2.5 Reviews
- Resposta em até **24h** para 100% das avaliações.
- Template para 5★: agradecer pelo nome + reforçar serviço prestado.
- Template para ≤3★: pedir desculpas, oferecer canal direto (`contato@0web.com.br`), sem entrar em mérito público.

### 2.6 Monitoramento mensal
- Insights → impressões, ligações, cliques no site, solicitações de rota.
- Comparar com mês anterior e anotar no histórico.

---

## 3. Lighthouse CI — auditoria contínua

`/.github/workflows/lighthouse.yml` já roda em push/PR `main` + manual.

### 3.1 Metas (mobile)
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- Performance ≥ 85
- SEO ≥ 95
- Acessibilidade ≥ 95
- Best Practices ≥ 95

### 3.2 Relatórios
- Após cada deploy: ver action no GitHub.
- Relatórios JSON ficam em `seo-reports/` (rodar `bun run scripts/validate-jsonld.mjs` localmente).
- Comparar com `seo-reports/HISTORY.md`.

### 3.3 Quando falhar
1. Abrir o report do LH (anexo do workflow).
2. Identificar maior ofensor (LCP image, CLS por banner, INP por handler).
3. Aplicar correção (preload, dimensões explícitas, debounce).
4. Reabrir PR — gate só passa se voltar dentro da meta.

---

## 4. Próximas ações sugeridas

- [ ] Executar 1.1 a 1.5 no painel Cloudflare.
- [ ] Validar com `curl -I` os headers.
- [ ] Criar/agendar primeiros 6 posts GBP (2 semanas).
- [ ] Subir 24 fotos reais (3 × 8 categorias).
- [ ] Publicar 10 perguntas Q&A respondidas.
- [ ] Rodar `bun run scripts/validate-jsonld.mjs` após o próximo deploy para confirmar Phase 2 (schemas) verde.
