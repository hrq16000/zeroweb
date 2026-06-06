# SEO / JSON-LD reports

Gerado por `scripts/validate-jsonld.mjs`. Cada execução cria:

- `<timestamp>.json` — relatório completo (rotas, blocos, nós, checks).
- `HISTORY.md` — append-only com o resumo de cada rodada (data, falhas, link).

## Como rodar

```bash
# Produção
node scripts/validate-jsonld.mjs

# Preview / outro host
node scripts/validate-jsonld.mjs https://zeroweb.lovable.app
```

## Checklist coberto (por rota)

- **Open Graph**: `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`
- **Canonical & hreflang**: `<link rel="canonical">`, `<link rel="alternate" hreflang="pt-BR">`
- **JSON-LD parse**: todos os blocos parseiam sem erro
- **Sem `@id` duplicado** dentro de `@graph`
- **BreadcrumbList**: único, com `itemListElement` e posições sequenciais
- **FAQPage**: até 1 em rotas de serviço (até 2 em `/servicos` — agregado + Site Express); `mainEntity` não-vazio; perguntas/respostas preenchidas
- **Service**: campos obrigatórios (`name`, `description`, `serviceType`, `url`)

Validação manual complementar:

- Rich Results: <https://search.google.com/test/rich-results?url=https%3A%2F%2F0web.com.br%2Fservicos>
- Schema Validator: <https://validator.schema.org/#url=https%3A%2F%2F0web.com.br%2Fservicos%2Fcriacao-de-sites>
