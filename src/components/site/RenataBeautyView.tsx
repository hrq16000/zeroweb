import { useState, useEffect } from "react";
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
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Compass, 
  Phone,
  ArrowRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";

// WhatsApp direct contact
const PHONE_NUMBER = "554196048639";
const INSTAGRAM_URL = "https://www.instagram.com/renatabeautystudiio/";
const ADDRESS = "Rua Rondônia, 300 - Boneca do Iguaçu";
const MAPS_URL = "https://maps.google.com/?q=Rua+Rond%C3%B4nia,+300+-+Boneca+do+Igua%C3%A7u";

function getWhatsAppUrl(text: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function RenataBeautyView() {
  const [selectedService, setSelectedService] = useState<string>("egipcio");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const services = [
    {
      id: "egipcio",
      name: "Volume Egípcio",
      tag: "Destaque Inauguração",
      promoPrice: "100,00",
      normalPrice: "180,00",
      desc: "Fios tecnológicos em formato W que oferecem volume marcante, preenchimento impecável e extremo conforto aos olhos.",
      benefits: ["Leveza absoluta sem peso nas pálpebras", "Retenção superior de até 30 dias", "Efeito volumoso e elegante"],
      duration: "1h45 a 2h",
      image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "brasileiro",
      name: "Volume Brasileiro",
      tag: "Destaque Inauguração",
      promoPrice: "100,00",
      normalPrice: "170,00",
      desc: "Fios especiais em formato Y que conferem curvatura acentuada, efeito delineador e aspecto volumoso com acabamento natural.",
      benefits: ["Olhar aberto e marcante no dia a dia", "Ideal para quem ama efeito rímel volumoso", "Não danifica os fios naturais"],
      duration: "1h30 a 2h",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "unhas",
      name: "Alongamento em Fibra de Vidro",
      tag: "Nails Design",
      promoPrice: "140,00",
      normalPrice: "190,00",
      desc: "Unhas resistentes, estruturadas e com curvatura fina e acabamento natural imperceptível. Alta durabilidade.",
      benefits: ["Extrema resistência a quebras", "Acabamento slim e delicado", "Esmaltação que não descasca"],
      duration: "2h a 2h30",
      image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "sobrancelhas",
      name: "Design de Sobrancelhas & Henna",
      tag: "Visagismo",
      promoPrice: "50,00",
      normalPrice: "75,00",
      desc: "Mapeamento facial personalizado para encontrar a simetria ideal que valoriza a expressão natural do seu rosto.",
      benefits: ["Alinhamento e visagismo facial", "Aplicação de henna personalizada", "Limpeza minuciosa com pinça"],
      duration: "40 min",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "spa",
      name: "Spa dos Pés Relaxante",
      tag: "Autocuidado",
      promoPrice: "60,00",
      normalPrice: "90,00",
      desc: "Protocolo completo de renovação com esfoliação, lixamento suave, hidratação profunda e massagem relaxante.",
      benefits: ["Pés macios e livres de ressecamento", "Massagem relaxante com óleos", "Alívio imediato do cansaço"],
      duration: "50 min",
      image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const currentServiceObj = services.find(s => s.id === selectedService) || services[0];

  const faqs = [
    {
      q: "A aplicação de cílios dói ou danifica os cílios naturais?",
      a: "Não! O procedimento é 100% indolor, relaxante e muitas clientes chegam a adormecer. Utilizamos fios ultraleves e cola hipoalergênica de alta performance, isolando cada fio individualmente sem prejudicar o ciclo natural de crescimento."
    },
    {
      q: "Como funciona a promoção de inauguração de R$ 100?",
      a: "Para comemorar a abertura do nosso novo espaço no Boneca do Iguaçu, os procedimentos de Cílios Volume Egípcio ou Brasileiro estão com valor promocional de R$ 100,00 mediante agendamento prévio pelo WhatsApp enquanto durarem os horários disponíveis da semana."
    },
    {
      q: "Qual a durabilidade da extensão de cílios?",
      a: "A durabilidade média é de 20 a 30 dias, dependendo dos cuidados diários e do ciclo natural dos seus cílios. Recomendamos a manutenção a cada 15 a 21 dias para mantê-los sempre volumosos e preenchidos."
    },
    {
      q: "Quais são as formas de pagamento aceitas?",
      a: "Aceitamos PIX, cartões de crédito e débito, e dinheiro no local."
    }
  ];

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0E090C] text-[#F9F5F7] font-sans selection:bg-[#E6007A] selection:text-white relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#E6007A]/20 via-[#FF2E93]/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-[#D4AF37]/15 via-[#E6007A]/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Banner Promo Bar */}
      <div className="bg-gradient-to-r from-[#1A0C14] via-[#E6007A] to-[#1A0C14] border-b border-pink-500/30 text-white text-xs sm:text-sm py-2.5 px-4 sticky top-0 z-50 shadow-lg backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300" /> Inauguração
            </span>
            <span>Cílios Volume Egípcio ou Brasileiro por apenas <strong>R$ 100,00</strong>!</span>
          </div>
          <a 
            href={getWhatsAppUrl("Olá Renata! Quero agendar os Cílios na Promoção de Inauguração de R$ 100 ✨")}
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-yellow-200 hover:text-white transition-colors underline decoration-yellow-300/60 underline-offset-4 text-xs uppercase tracking-wider"
          >
            Garantir Vaga <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#0E090C]/80 backdrop-blur-xl sticky top-[38px] z-40">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6007A] to-[#8C0045] p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#12080E] flex flex-col items-center justify-center">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="text-[11px] font-serif font-bold text-pink-400 -mt-1 tracking-tighter">RB</span>
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-wide text-white flex items-center gap-1">
                Renata <span className="text-[#FF2E93] italic font-normal">Beauty</span>
              </div>
              <p className="text-[10px] tracking-[0.25em] text-pink-300/70 font-semibold uppercase">Lash & Nails Studio</p>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300 font-medium">
            <a href="#promocao" className="hover:text-pink-400 transition-colors text-pink-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Promoção R$ 100
            </a>
            <a href="#procedimentos" className="hover:text-pink-400 transition-colors">Procedimentos</a>
            <a href="#espaco" className="hover:text-pink-400 transition-colors">O Espaço</a>
            <a href="#localizacao" className="hover:text-pink-400 transition-colors">Localização</a>
          </nav>

          {/* WhatsApp Primary CTA */}
          <div className="flex items-center gap-3">
            <a 
              href={getWhatsAppUrl("Olá Renata! Vim pelo site e gostaria de agendar um horário no novo espaço ✨")}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E6007A] to-[#FF2E93] hover:from-[#FF2E93] hover:to-[#E6007A] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 hover:scale-105 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Agendar no WhatsApp</span>
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> Novo Endereço no Boneca do Iguaçu
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.15]">
              Realce seu olhar e suas mãos com quem <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-yellow-200 italic font-normal">entende de detalhes.</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              O novo <strong>Espaço Renata Beauty</strong> está de portas abertas. Um ambiente aconchegante, moderno e pensado em cada detalhe para oferecer a você uma experiência VIP de beleza e autocuidado.
            </p>

            {/* Launch Promo Ribbon Badge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-950/60 via-[#1C0F17] to-pink-950/60 border border-pink-500/40 shadow-xl max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-2xl flex-shrink-0">
                    👑
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">Promoção Especial</span>
                    <h2 className="text-base font-bold text-white leading-tight">Cílios Volume Egípcio ou Brasileiro</h2>
                    <p className="text-xs text-pink-200/80">De <span className="line-through text-gray-400">R$ 180,00</span> por apenas <strong className="text-white text-sm font-bold">R$ 100,00</strong></p>
                  </div>
                </div>

                <a 
                  href={getWhatsAppUrl("Olá Renata! Quero garantir minha vaga na Promoção de Inauguração de R$ 100 antes que acabe! ✨")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 hover:scale-105 transition-all whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Garantir Horário
                </a>
              </div>
            </div>

            {/* 3 Core Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <Eye className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Leveza</span>
                <span className="text-[11px] text-gray-400">Sem peso nos fios</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <Clock className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Duração</span>
                <span className="text-[11px] text-gray-400">Até 30 dias de retenção</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <Gem className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Olhar Marcante</span>
                <span className="text-[11px] text-gray-400">Visagismo exclusivo</span>
              </div>
            </div>

          </motion.div>

          {/* Hero Right Visuals & Official Flyer Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[380px] sm:max-w-[420px] rounded-3xl p-3 bg-gradient-to-b from-pink-500/40 via-pink-500/10 to-transparent border border-pink-500/30 shadow-2xl shadow-pink-900/40 backdrop-blur-xl">
              
              {/* Flyer Showcase Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img 
                  src="/images/renata-beauty-flyer.jpg" 
                  alt="Promoção Inauguração Renata Beauty Studio" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to high quality lash extension photography if local asset is loading
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E090C] via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Floating Action Overlay on Hover */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 p-3 rounded-xl bg-[#140810]/90 backdrop-blur-md border border-pink-500/30">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-pink-400" />
                    <div>
                      <span className="block text-xs font-bold text-white">@renatabeautystudiio</span>
                      <span className="text-[10px] text-pink-300">Acompanhe nossos resultados</span>
                    </div>
                  </div>
                  <a 
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-pink-400 hover:text-white px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 transition-all"
                  >
                    Seguir
                  </a>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Interactive Procedure Simulator & Booking Section */}
      <section id="procedimentos" className="py-20 px-4 bg-[#140B11]/70 border-y border-white/10 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-[0.2em] text-pink-400 uppercase">Menu de Procedimentos</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Escolha seu procedimento e garanta o valor especial
            </h2>
            <p className="text-gray-400 text-sm">
              Trabalhamos exclusivamente com técnicas comprovadas, materiais hipoalergênicos e esterilização hospitalar.
            </p>
          </div>

          {/* Interactive Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  selectedService === svc.id
                    ? "bg-gradient-to-r from-[#E6007A] to-[#FF2E93] text-white shadow-lg shadow-pink-600/30 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                }`}
              >
                {svc.name}
              </button>
            ))}
          </div>

          {/* Featured Service Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentServiceObj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto rounded-3xl bg-[#1B0F17] border border-pink-500/30 p-6 sm:p-10 shadow-2xl grid md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> {currentServiceObj.tag}
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {currentServiceObj.name}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentServiceObj.desc}
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-pink-300 uppercase tracking-wider block">O que está incluso:</span>
                  {currentServiceObj.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                      <div className="w-4 h-4 rounded-full bg-pink-500/30 text-pink-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 line-through block">De R$ {currentServiceObj.normalPrice}</span>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-baseline gap-1">
                      <span className="text-sm font-sans text-pink-400">R$</span>
                      <span>{currentServiceObj.promoPrice}</span>
                    </div>
                  </div>

                  <a 
                    href={getWhatsAppUrl(`Olá Renata! Quero agendar ${currentServiceObj.name} na Promoção de Inauguração por R$ ${currentServiceObj.promoPrice}! ✨`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-green-500/30 hover:scale-105 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Agendar Agora</span>
                  </a>
                </div>
              </div>

              <div className="md:col-span-6 rounded-2xl overflow-hidden border border-white/10 h-72 sm:h-80 relative group shadow-xl">
                <img 
                  src={currentServiceObj.image} 
                  alt={currentServiceObj.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B0F17] via-transparent to-transparent opacity-40" />
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-pink-200 border border-white/10 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Duração: {currentServiceObj.duration}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* The Studio & Differential Experience */}
      <section id="espaco" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold tracking-[0.2em] text-pink-400 uppercase">Nosso Diferencial</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Mais que um atendimento, um momento feito para você relaxar.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              No <strong>Espaço Renata Beauty</strong>, nós não aceleramos seu procedimento. Cada cliente recebe atendimento exclusivo em ambiente climatizado, poltronas ergonômicas de alto conforto e café especial.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Biossegurança e Higiene Rigorosa</h4>
                  <p className="text-xs text-gray-400">Materiais descartáveis e instrumentos esterilizados para total segurança da sua saúde.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mapeamento Visagista Personalizado</h4>
                  <p className="text-xs text-gray-400">Análise do formato dos seus olhos e rosto para desenhar o mapeamento perfeito para você.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Café e Acolhimento VIP</h4>
                  <p className="text-xs text-gray-400">Música ambiente relaxante e café fresco para seu momento de autocuidado.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a 
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-pink-500/40 hover:border-pink-400 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Instagram className="w-4 h-4" /> Conhecer Feed do Instagram
              </a>
            </div>

          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl h-48 sm:h-56">
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80" 
                  alt="Espaço Aconchegante Renata Beauty" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl h-56 sm:h-64">
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" 
                  alt="Resultado de Extensão de Cílios" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl h-56 sm:h-64">
                <img 
                  src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80" 
                  alt="Alongamento de Unhas Studio" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl h-48 sm:h-56 bg-gradient-to-br from-[#E6007A]/40 to-[#12080E] p-5 flex flex-col justify-between border-pink-500/30">
                <Crown className="w-8 h-8 text-yellow-300" />
                <div>
                  <span className="text-2xl font-serif font-bold text-white block">100%</span>
                  <span className="text-xs text-pink-200">Dedicação aos detalhes da sua beleza</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Location & Map Interactive */}
      <section id="localizacao" className="py-20 px-4 bg-[#140B11]/70 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-[0.2em] text-pink-400 uppercase">Localização & Acesso</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Fácil acesso no Boneca do Iguaçu
            </h2>
            <p className="text-gray-400 text-sm">
              Venha conhecer nosso novo espaço físico preparado com todo carinho para você.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto rounded-3xl bg-[#1B0F17] border border-pink-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Endereço Físico
                </span>
                <h3 className="text-2xl font-serif font-bold text-white leading-snug">
                  Rua Rondônia, 300
                </h3>
                <p className="text-sm text-gray-300">
                  Bairro Boneca do Iguaçu — São José dos Pinhais e Região
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Atendimento:</span>
                  <span className="text-white font-semibold">Segunda a Sábado</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Agendamento:</span>
                  <span className="text-pink-300 font-semibold">Exclusivo via WhatsApp</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">WhatsApp:</span>
                  <span className="text-white font-semibold">+55 41 9604-8639</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E6007A] to-[#FF2E93] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-600/30 hover:scale-105 transition-all"
                >
                  <Compass className="w-4 h-4" /> Abrir no Maps / Waze
                </a>

                <button
                  onClick={copyAddressToClipboard}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
                >
                  {copiedAddress ? "Copiado com Sucesso! ✓" : "Copiar Endereço"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/10 h-72 sm:h-80 shadow-xl relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.294240368367!2d-49.1945!3d-25.5348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfba23c8340db%3A0x8bb11c1d0be6!2sR.+Rond%C3%B4nia%2C+300+-+Boneca+do+Igua%C3%A7u!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa Renata Beauty Boneca do Iguaçu"
              />
            </div>

          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-[0.2em] text-pink-400 uppercase">Dúvidas Frequentes</span>
            <h2 className="text-3xl font-serif font-bold text-white">Tire suas dúvidas antes de agendar</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-2xl bg-[#180E15] border border-pink-500/20 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-left font-semibold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-pink-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-pink-400 transition-transform duration-300 flex-shrink-0 ${activeFaq === index ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Callout Ribbon */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#200A17] via-[#E6007A] to-[#200A17] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-yellow-200 text-xs font-bold uppercase tracking-wider">
            Vagas Limitadas por Semana
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
            Pronta para realçar sua beleza e viver uma experiência única?
          </h2>
          <p className="text-pink-100 text-sm sm:text-base max-w-xl mx-auto">
            Aproveite a promoção especial de inauguração e agende seu horário com quem ama cuidar de cada detalhe.
          </p>
          <div className="pt-2">
            <a 
              href={getWhatsAppUrl("Olá Renata! Quero garantir meu horário na promoção de inauguração! ✨")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#12080E] hover:bg-yellow-100 px-8 py-4 rounded-full font-bold text-base shadow-2xl hover:scale-105 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
              Falar Direto no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Minimal Luxury Footer */}
      <footer className="py-12 px-4 bg-[#090508] border-t border-white/10 text-xs text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="space-y-1">
            <div className="font-serif text-lg font-bold text-white">
              Renata <span className="text-pink-400 italic">Beauty</span> Studio
            </div>
            <p className="text-[11px] text-gray-400">Rua Rondônia, 300 - Boneca do Iguaçu</p>
          </div>

          <div className="flex items-center gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 flex items-center gap-1.5">
              <Instagram className="w-4 h-4" /> @renatabeautystudiio
            </a>
            <span>•</span>
            <a href={getWhatsAppUrl("Olá Renata!")} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> +55 41 9604-8639
            </a>
          </div>

          <div className="text-[11px] text-gray-400">
            Hospedado no <Link to="/" className="text-pink-400 hover:underline">0web.com.br</Link> · Do Zero à Web
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        <div className="hidden sm:block bg-[#1B0F17]/90 backdrop-blur-md border border-pink-500/30 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xl group-hover:block transition-all">
          <span className="text-pink-400">Online agora</span> · Agende no WhatsApp ✨
        </div>
        <a 
          href={getWhatsAppUrl("Olá Renata! Quero aproveitar a promoção de inauguração de R$ 100! 💖")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center shadow-2xl shadow-green-500/50 hover:scale-110 transition-transform relative"
          aria-label="Agendar no WhatsApp"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 border-2 border-[#0E090C] flex items-center justify-center text-[9px] font-bold">1</span>
          <MessageCircle className="w-7 h-7 fill-white" />
        </a>
      </div>

    </div>
  );
}
