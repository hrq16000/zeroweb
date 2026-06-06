/**
 * Lighthouse CI config.
 *
 * Runs against the published / preview URL and fails CI when Performance or
 * SEO scores drop below the targets, or when Core Web Vitals regress.
 *
 * Local: `bun run lhci` (requires LHCI_TARGET_URL env or defaults to preview).
 * CI:    .github/workflows/lighthouse.yml
 */
const TARGET_URL =
  process.env.LHCI_TARGET_URL || "https://grow-evolution-engine.lovable.app";

module.exports = {
  ci: {
    collect: {
      url: [
        `${TARGET_URL}/`,
        `${TARGET_URL}/blog`,
        `${TARGET_URL}/blog/3-palavras-chatgpt-respostas-inteligentes`,
        `${TARGET_URL}/servicos`,
        `${TARGET_URL}/servicos/criacao-de-sites`,
      ],
      numberOfRuns: 2,
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertions: {
        // Category scores
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],

        // Core Web Vitals (lab proxies; INP estimated via TBT)
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],

        // SEO musts
        "meta-description": "error",
        "document-title": "error",
        "html-has-lang": "error",
        "canonical": "error",
        "robots-txt": "error",
        "image-alt": "error",
        "http-status-code": "error",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
