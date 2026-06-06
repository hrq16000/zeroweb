import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion, useAnimationControls } from "motion/react";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

export function WhatsAppFloat() {
  const { open } = useWaFunnel();
  const controls = useAnimationControls();
  const [showBubble, setShowBubble] = useState(false);

  // Periodic shake + blink to call attention
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      setShowBubble(true);
      await controls.start({
        rotate: [0, -12, 10, -8, 6, -4, 0],
        scale: [1, 1.05, 0.98, 1.04, 1],
        transition: { duration: 0.9, ease: "easeInOut" },
      });
      setTimeout(() => setShowBubble(false), 2400);
    };
    const first = setTimeout(tick, 4500);
    const interval = setInterval(tick, 12000);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [controls]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end gap-2">
      {showBubble && (
        <motion.div
          initial={{ opacity: 0, x: 12, y: 6 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0 }}
          className="hidden sm:flex items-center rounded-2xl bg-card border border-border shadow-elegant px-3 py-2 text-xs font-medium mb-1"
        >
          <span>Posso te ajudar?</span>
          <span className="ml-2 inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-foreground/60 animate-bounce" />
            <span className="w-1 h-1 rounded-full bg-foreground/60 animate-bounce [animation-delay:120ms]" />
            <span className="w-1 h-1 rounded-full bg-foreground/60 animate-bounce [animation-delay:240ms]" />
          </span>
        </motion.div>
      )}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={controls}
        whileInView={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => open("floating")}
        aria-label="Falar no WhatsApp"
        className="relative grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-glow-primary"
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        {showBubble && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
        )}
        <MessageCircle className="relative w-6 h-6" />
      </motion.button>
    </div>
  );
}
