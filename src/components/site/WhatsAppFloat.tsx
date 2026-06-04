import { MessageCircle } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackConversion("whatsapp_click", { location: "floating" })}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-glow-primary hover:scale-105 transition-transform"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
