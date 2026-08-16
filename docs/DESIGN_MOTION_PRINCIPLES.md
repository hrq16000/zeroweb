# 🎨 Guia Prático de Princípios de Animação & Motion (Design Motion Principles)

Este guia consolida as melhores práticas de **Motion Design, TanStack Router e Microinterações** para você reutilizar e salvar em qualquer projeto.

---

## 1. Os 5 Pilares do Motion Design Moderno

### A. Intenção e Significado (Purpose-Driven Motion)
* **Nunca anime por animar:** Toda animação deve comunicar algo: hierarquia, feedback de toque, mudança de estado ou carregamento.
* **Durações Padrão:**
  * Microinterações (botões, toggles, hover): `150ms - 250ms`
  * Modais, menus e gavetas (drawers): `250ms - 350ms`
  * Transições de página e entrada de seções: `400ms - 600ms`

### B. Curvas de Aceleração (Easing)
* Use curvas naturais em vez de animações lineares duras:
  * **Entrada (Ease-Out):** `cubic-bezier(0.16, 1, 0.3, 1)` ou `easeOut` — o elemento desacelera suavemente ao chegar.
  * **Saída (Ease-In):** `cubic-bezier(0.7, 0, 0.84, 0)` ou `easeIn` — o elemento acelera ao sair da tela.
  * **Molas (Springs):** Ideais para botões, switches e cards: `stiffness: 300, damping: 25`.

---

## 2. Padrões de Código com `motion/react` (Framer Motion)

### Entrada Escalonada (Staggered Animation)
```tsx
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export function FeatureGrid({ items }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-6">
      {items.map(item => (
        <motion.div key={item.id} variants={itemVariants} className="p-6 bg-card rounded-2xl">
          {item.title}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Animações de Troca e Saída (`AnimatePresence` + `layout`)
```tsx
import { AnimatePresence, motion } from "motion/react";

<AnimatePresence mode="wait">
  <motion.div
    key={selectedTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

---

## 3. Skeletons e Lazy Loading
1. **Skeleton States:** Nunca deixe a tela branca ou com saltos de layout (CLS). Use componentes `<Skeleton className="h-6 w-3/4 rounded-md animate-pulse" />`.
2. **Lazy Loading de Imagens:** Sempre declare `loading="lazy"` e utilize fallbacks suaves para que o usuário tenha sensação de velocidade instantânea.
3. **Acessibilidade:** Respeite `prefers-reduced-motion` no CSS e no React para usuários que desativam animações no sistema operacional.
