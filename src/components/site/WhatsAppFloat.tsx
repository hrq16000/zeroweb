import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

export function WhatsAppFloat() {
  const { open } = useWaFunnel();
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 220, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => open("floating")}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-glow-primary"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <MessageCircle className="relative w-6 h-6" />
    </motion.button>
  );
}
