import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Heart, 
  ShieldCheck, 
  Check, 
  Instagram, 
  MessageCircle, 
  Star, 
  Eye, 
  Crown, 
  Gem, 
  ChevronDown, 
  Compass, 
  ArrowRight,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PortfolioUpsellPopup } from "@/components/site/PortfolioUpsellPopup";

const PHONE_NUMBER = "554196048639";
const INSTAGRAM_URL = "https://www.instagram.com/renatabeautystudiio/";
const ADDRESS = "Rua Rondônia, 300 - Boneca do Iguaçu";
const MAPS_URL = "https://maps.google.com/?q=Rua+Rond%C3%B4nia,+300+-+Boneca+do+Igua%C3%A7u";

function getWhatsAppUrl(text: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function RBeautyEditorialView() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState<"cilios" | "unhas" | "sobrancelhas">("cilios");

  return (
    <div className="min-h-screen bg-[#0C0A0B] text-[#F5F2F0] font-sans selection:bg-[#D4AF37] selection:text-black relative overflow-hidden">
      
      {/* Background Ambient Lights */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-b from-[#D4AF37]/10 via-[#C07D7B]/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-10 w-[600px] h-[600px] bg-gradient-to-t from-[#C07D7B]/15 via-transparent to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Editorial Ribbon */}
      <div className="bg-[#171415] border-b border-white/5 py-2.5 px-4 text-center text-xs tracking-[0.2em] uppercase text-[#D4AF37] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" /> Edição Especial · Inauguração no Boneca do Iguaçu · Vagas Limitadas
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0C0A0B]/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <Link to="/portfolio" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center bg-white/[0.03]">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <div className="font-serif text-xl tracking-wider text-white">
                R_BEAUTY <span className="text-[#D4AF37] font-light text-sm italic">Haute Studio</span>
              </div>
              <p className="text-[9px] tracking-[0.3em] text-gray-400 uppercase">Boneca do Iguaçu</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-gray-300">
            <a href="#experiencia" className="hover:text-[#D4AF37] transition-colors">A Experiência</a>
            <a href="#comparador" className="hover:text-[#D4AF37] transition-colors">Resultados</a>
            <a href="#menu" className="hover:text-[#D4AF37] transition-colors">Menu VIP</a>
            <a href="#localizacao" className="hover:text-[#D4AF37] transition-colors">Localização</a>
          </nav>

          <a 
            href={getWhatsAppUrl("Olá Renata! Vim pela versão R_Beauty e gostaria de agendar uma sessão exclusiva ✨")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#E5C378] text-black px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Agendamento VIP</span>
          </a>

        </div>
      </header>

      {/* Hero Section with Kinetic Typography */}
      <section className="pt-16 pb-24 px-4 relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Exclusividade em Cílios & Nails
            </div>

            {/* Kinetic Heading */}
            <h1 className="text-4xl sm:text-6xl font-serif font-light text-white leading-[1.1] tracking-tight">
              A alta costura do olhar <br />
              <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C07D7B]">
                em cada detalhe milimétrico.
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed font-light">
              Uma atmosfera acolhedora onde a técnica precisa do visagismo e produtos de padrão internacional transformam sua rotina em puro encanto.
            </p>

            {/* Offer Callout Card */}
            <div className="p-6 rounded-3xl bg-[#171315] border border-[#D4AF37]/30 shadow-2xl space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Condição de Abertura</span>
                  <h3 className="text-lg font-serif font-semibold text-white">Cílios Volume Egípcio ou Brasileiro</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 line-through">R$ 180,00</span>
                  <div className="text-2xl font-serif font-bold text-[#D4AF37]">R$ 100,00</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a 
                  href={getWhatsAppUrl("Olá Renata! Quero reservar meu horário com valor promocional de R$ 100 no R_Beauty ✨")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Reservar Meu Horário
                </a>
                <a 
                  href="#comparador"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider border border-white/10 transition-all"
                >
                  Ver Resultados
                </a>
              </div>
            </div>

            {/* 3 Pillars */}
            <div className="flex items-center gap-6 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Retenção até 30 dias
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Biossegurança 100%
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Visagismo sob medida
              </div>
            </div>

          </motion.div>

          {/* Hero Visual Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl p-2 bg-[#171315]/80 backdrop-blur-xl">
              <div className="rounded-2xl overflow-hidden relative group h-[460px]">
                <img 
                  src="/images/renata-beauty-flyer.jpg" 
                  alt="Espaço R_Beauty Studio" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/r-beauty-cilios.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest block font-bold">Localização</span>
                    <strong className="text-xs text-white">Rua Rondônia, 300 · Boneca do Iguaçu</strong>
                  </div>
                  <a 
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#D4AF37] text-black hover:scale-105 transition-all"
                  >
                    <Compass className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Interactive Before & After Showcase Slider */}
      <section id="comparador" className="py-20 px-4 bg-[#120F10] border-y border-white/10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Transformação Real</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white">
              Arraste para comparar o efeito antes e depois
            </h2>
            <p className="text-gray-400 text-sm">
              Veja como o mapeamento correto e a curvatura precisa valorizam o formato natural do olhar.
            </p>
          </div>

          {/* Interactive Before/After Card */}
          <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl relative select-none h-80 sm:h-96">
            
            {/* After Image (Full background) */}
            <img 
              src="/images/volume-egipcio-fios-w.jpg" 
              alt="Cílios Depois" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/30 z-10">
              DEPOIS (Volume Egípcio)
            </span>

            {/* Before Image (Clipped) */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden" 
              style={{ width: `${sliderPosition}%` }}
            >
              <img 
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80" 
                alt="Cílios Antes" 
                className="absolute inset-0 w-[800px] sm:w-[1000px] max-w-none h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-300 border border-white/20 z-10">
                ANTES (Fios Naturais)
              </span>
            </div>

            {/* Drag Divider Line */}
            <div 
              className="absolute inset-y-0 w-1 bg-[#D4AF37] cursor-ew-resize z-20 shadow-[0_0_15px_#D4AF37]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-lg">
                <Sliders className="w-4 h-4" />
              </div>
            </div>

            {/* Hidden native range input for frictionless touch & mouse interaction */}
            <input 
              type="range" 
              min="5" 
              max="95" 
              value={sliderPosition} 
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
              aria-label="Controle de antes e depois"
            />
          </div>

        </div>
      </section>

      {/* Menu of Services */}
      <section id="menu" className="py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Menu de Procedimentos</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white">
              Cuidados pensados para cada momento
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-3xl bg-[#171315] border border-white/10 hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xl font-bold">
                  👁️
                </div>
                <h3 className="text-xl font-serif font-semibold text-white">Extensão de Cílios</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Volume Egípcio, Brasileiro e Híbrido com retenção prolongada e mapeamento sob medida para seu olhar.
                </p>
                <div className="text-sm font-bold text-[#D4AF37]">
                  A partir de R$ 100,00 na inauguração
                </div>
              </div>
              <a 
                href={getWhatsAppUrl("Olá! Gostaria de agendar Cílios no R_Beauty Studio ✨")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                Agendar Horário <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-[#171315] border border-white/10 hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xl font-bold">
                  💅
                </div>
                <h3 className="text-xl font-serif font-semibold text-white">Unhas & Fibra de Vidro</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Alongamento com curvatura C impecável, acabamento fino e esmaltação de alta resistência.
                </p>
                <div className="text-sm font-bold text-[#D4AF37]">
                  Alongamento, Manutenção & Blindagem
                </div>
              </div>
              <a 
                href={getWhatsAppUrl("Olá! Gostaria de agendar Alongamento de Unhas no R_Beauty Studio ✨")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                Agendar Horário <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-[#171315] border border-white/10 hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xl font-bold">
                  🌸
                </div>
                <h3 className="text-xl font-serif font-semibold text-white">Sobrancelhas & Spa</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Design com visagismo, henna de alta fixação e spa dos pés revitalizante para seu momento de descanso.
                </p>
                <div className="text-sm font-bold text-[#D4AF37]">
                  Design, Henna & Spa dos Pés
                </div>
              </div>
              <a 
                href={getWhatsAppUrl("Olá! Gostaria de agendar Sobrancelhas / Spa no R_Beauty Studio ✨")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                Agendar Horário <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#080707] border-t border-white/10 text-xs text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="font-serif text-base font-bold text-white">R_BEAUTY Haute Studio</div>
            <p className="text-[11px] text-gray-400">Rua Rondônia, 300 · Boneca do Iguaçu</p>
          </div>

          <div className="flex items-center gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37]">
              Instagram @renatabeautystudiio
            </a>
            <span>•</span>
            <a href={getWhatsAppUrl("Olá Renata!")} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37]">
              WhatsApp Direct
            </a>
          </div>

          <div className="text-[11px]">
            Vitrine do <Link to="/portfolio" className="text-[#D4AF37] hover:underline">0WEB Portfólio</Link>
          </div>
        </div>
      </footer>

      <PortfolioUpsellPopup pageName="r_beauty" />
    </div>
  );
}
