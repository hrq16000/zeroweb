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
  ArrowRight,
  Flame,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PortfolioUpsellPopup } from "@/components/site/PortfolioUpsellPopup";
import { BeautyBookingQuiz } from "@/components/site/BeautyBookingQuiz";
import { InstagramFeedSection } from "@/components/site/InstagramFeedSection";

const INSTAGRAM_URL = "https://www.instagram.com/renatabeautystudiio/";
const ADDRESS = "Rua Rondônia, 300 - Boneca do Iguaçu";
const MAPS_URL = "https://maps.google.com/?q=Rua+Rond%C3%B4nia,+300+-+Boneca+do+Igua%C3%A7u";

export function RenataBeautyView() {
  const [selectedService, setSelectedService] = useState<string>("egipcio");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const services = [
    {
      id: "egipcio",
      name: "Cílios Volume Egípcio (Fios W)",
      tag: "🔥 Destaque Inauguração R$ 100",
      promoPrice: "100,00",
      normalPrice: "180,00",
      desc: "Técnica tecnológica com fios em formato W (3D/4D) que acoplam perfeitamente no fio natural. Cria um olhar denso, volumoso, com efeito delineador marcante e leveza incomparável.",
      benefits: [
        "Fios tecnológicos em formato W com base ultrafina",
        "Olhar marcante sem sensação de peso nos olhos",
        "Retenção superior de até 30 dias com alta durabilidade",
        "Mapeamento visagista personalizado incluso"
      ],
      duration: "1h45 a 2h",
      badgeHighlight: "Volume Intenso & Leve",
      image: "/images/volume-egipcio-fios-w.jpg"
    },
    {
      id: "brasileiro",
      name: "Cílios Volume Brasileiro (Fios Y)",
      tag: "🔥 Destaque Inauguração R$ 100",
      promoPrice: "100,00",
      normalPrice: "170,00",
      desc: "Fios especiais em formato Y que conferem curvatura acentuada, textura macia e efeito rímel exuberante todos os dias.",
      benefits: [
        "Fios especiais em formato Y com curvatura definida",
        "Efeito rímel perfeito sem precisar maquiar",
        "Preenchimento equilibrado e expressividade natural",
        "Não danifica os cílios naturais"
      ],
      duration: "1h30 a 2h",
      badgeHighlight: "Curvatura Marcante",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "unhas",
      name: "Alongamento em Fibra de Vidro",
      tag: "Nails Design VIP",
      promoPrice: "140,00",
      normalPrice: "190,00",
      desc: "Unhas ultrarresistentes, esculpidas com finura e curvatura C natural. Estrutura duradoura com esmaltação perfeita.",
      benefits: [
        "Extrema resistência a quebras no dia a dia",
        "Acabamento fino, natural e imperceptível",
        "Esmaltação de alta durabilidade que não descasca",
        "Cutilagem russa e hidratação das cutículas"
      ],
      duration: "2h a 2h30",
      badgeHighlight: "Resistência & Delicadeza",
      image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "sobrancelhas",
      name: "Design de Sobrancelhas & Henna",
      tag: "Visagismo Facial",
      promoPrice: "50,00",
      normalPrice: "75,00",
      desc: "Harmonização do desenho das sobrancelhas com base na simetria do seu rosto, preenchendo falhas com acabamento natural.",
      benefits: [
        "Mapeamento com paquímetro e linha para simetria ideal",
        "Aplicação de henna personalizada para o tom da sua pele",
        "Limpeza minuciosa sem afinamento excessivo"
      ],
      duration: "40 min",
      badgeHighlight: "Harmonia Facial",
      image: "https://images.unsplash.com/photo-1588515724527-074a7a56616c?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "spa",
      name: "Spa dos Pés Revitalizante",
      tag: "Autocuidado & Relax",
      promoPrice: "60,00",
      normalPrice: "90,00",
      desc: "Protocolo completo de renovação celular com esfoliação profunda, hidratação com óleos essenciais e massagem relaxante.",
      benefits: [
        "Pés aveludados e livres de aspereza",
        "Massagem relaxante para alívio imediato do estresse",
        "Hidratação com cosméticos de alta absorção"
      ],
      duration: "50 min",
      badgeHighlight: "Relaxamento Puro",
      image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const currentServiceObj = services.find(s => s.id === selectedService) || services[0];

  const faqs = [
    {
      q: "Qual a diferença entre o Volume Egípcio e o Volume Brasileiro (extensão de cílios)?",
      a: "O Volume Egípcio utiliza fios tecnológicos em formato W (3 a 4 pontas em uma única base), gerando mais preenchimento, densidade e efeito delineador. Já o Volume Brasileiro utiliza fios em formato Y, conferindo um efeito rímel mais texturizado e curvado. Ambos estão na promoção de R$ 100 na inauguração!"
    },
    {
      q: "A extensão de cílios dói ou danifica meus fios naturais?",
      a: "Não dói absolutamente nada! O procedimento é tão relaxante que a maioria das clientes dorme. Isolamos cada fio natural com precisão cirúrgica e cola hipoalergênica, respeitando o ciclo de crescimento dos seus cílios."
    },
    {
      q: "Como funciona a promoção de inauguração de R$ 100?",
      a: "Para comemorar nosso novo espaço na Rua Rondônia, 300 no Boneca do Iguaçu, os procedimentos de Volume Egípcio ou Brasileiro saem por apenas R$ 100,00 mediante agendamento prévio no WhatsApp."
    },
    {
      q: "Quanto tempo duram os cílios?",
      a: "A retenção média é de 20 a 30 dias. Recomendamos manutenções a cada 15 a 21 dias para manter o olhar sempre impecável."
    },
    {
      q: "Quais são as formas de pagamento?",
      a: "Aceitamos PIX, cartões de crédito e débito, e dinheiro no local."
    }
  ];

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <div 
      className="min-h-screen bg-[#0B0609] text-[#F9F5F7] font-sans selection:bg-[#E6007A] selection:text-white relative overflow-hidden"
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      
      {/* Interactive Ambient Cursor Glow */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none -z-10 blur-[150px] transition-all duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(230, 0, 122, 0.15) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%)",
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`,
        }}
      />

      {/* Top Banner Promo Bar with Shimmer Animation */}
      <div className="bg-gradient-to-r from-[#1E0916] via-[#E6007A] to-[#1E0916] border-b border-pink-500/30 text-white text-xs sm:text-sm py-2.5 px-4 sticky top-0 z-50 shadow-xl backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> INAUGURAÇÃO
            </span>
            <span>Cílios Volume Egípcio ou Brasileiro por apenas <strong>R$ 100,00</strong>!</span>
          </div>
          <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" service="Cílios — Volume Egípcio ou Brasileiro" className="hidden sm:inline-flex items-center gap-1 font-bold text-yellow-200 hover:text-white transition-all hover:translate-x-1 text-xs uppercase tracking-wider">
            Garantir Horário <ArrowRight className="w-3.5 h-3.5" />
          </BeautyBookingQuiz>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B0609]/85 backdrop-blur-xl sticky top-[38px] z-40">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <Link to="/portfolio" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6007A] to-[#8C0045] p-0.5 shadow-lg shadow-pink-600/30 group-hover:scale-105 transition-transform flex items-center justify-center">
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

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300 font-medium">
            <a href="#promocao" className="hover:text-pink-400 transition-colors text-pink-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Promoção R$ 100
            </a>
            <a href="#procedimentos" className="hover:text-pink-400 transition-colors">Procedimentos</a>
            <a href="#espaco" className="hover:text-pink-400 transition-colors">O Espaço</a>
            <a href="#localizacao" className="hover:text-pink-400 transition-colors">Localização</a>
          </nav>

          <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" service="Sobrancelhas e Spa" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E6007A] to-[#FF2E93] hover:from-[#FF2E93] hover:to-[#E6007A] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-pink-600/40 hover:scale-105 active:scale-95 transition-all">
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Agendar no WhatsApp</span>
          </BeautyBookingQuiz>

        </div>
      </header>

      {/* Hero Section */}
      <section id="promocao" className="relative pt-12 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> Novo Endereço · Rua Rondônia, 300 - Boneca do Iguaçu
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.12]">
              Transforme seu olhar com quem <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-yellow-200 italic font-normal">
                entende de cada detalhe.
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              O novo <strong>Espaço Renata Beauty</strong> está de portas abertas. Mais conforto, mais beleza e um atendimento exclusivo para realçar sua essência.
            </p>

            {/* Launch Promo Ribbon Badge */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#200D1A] via-[#160A12] to-[#200D1A] border border-pink-500/40 shadow-2xl max-w-xl mx-auto lg:mx-0 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest bg-yellow-400/10 px-2 py-0.5 rounded-md">
                      Oferta Inauguração
                    </span>
                    <span className="text-xs text-pink-300 font-semibold">Volume Egípcio ou Brasileiro</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-400 line-through">R$ 180,00</span>
                    <div className="text-3xl sm:text-4xl font-serif font-bold text-white flex items-baseline">
                      <span className="text-sm font-sans text-pink-400 mr-1">R$</span>
                      <span>100<small className="text-lg">,00</small></span>
                    </div>
                  </div>
                </div>

                <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" service="Cílios — Volume Egípcio ou Brasileiro" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Garantir Horário
                </BeautyBookingQuiz>
              </div>
            </div>

            {/* 3 Core Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <Eye className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Leveza</span>
                <span className="text-[10px] text-gray-400">Zero peso nos fios</span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <Clock className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Duração</span>
                <span className="text-[10px] text-gray-400">Até 30 dias</span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <Gem className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-white">Olhar Marcante</span>
                <span className="text-[10px] text-gray-400">Visagismo VIP</span>
              </div>
            </div>

          </motion.div>

          {/* Hero Right: Real Lash Extension Imagery & Flyer Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[380px] sm:max-w-[420px] rounded-3xl p-3 bg-gradient-to-b from-pink-500/40 via-pink-500/10 to-transparent border border-pink-500/30 shadow-2xl shadow-pink-900/50 backdrop-blur-xl">
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img 
                  src="/images/renata-beauty-flyer.jpg" 
                  alt="Espaço Renata Beauty Studio Inauguração" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0609] via-transparent to-transparent opacity-60 pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 p-3 rounded-xl bg-[#140810]/95 backdrop-blur-md border border-pink-500/30">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-pink-400" />
                    <div>
                      <span className="block text-xs font-bold text-white">@renatabeautystudiio</span>
                      <span className="text-[10px] text-pink-300">Veja fotos e resultados reais</span>
                    </div>
                  </div>
                  <a 
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-pink-300 hover:text-white px-3 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 transition-all"
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
      <section id="procedimentos" className="py-20 px-4 bg-[#130810]/80 border-y border-white/10 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-[0.25em] text-pink-400 uppercase">Menu de Procedimentos</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Selecione o procedimento e veja os detalhes
            </h2>
            <p className="text-gray-300 text-sm">
              Trabalhamos exclusivamente com fios hipoalergênicos e esterilização rigorosa.
            </p>
          </div>

          {/* Interactive Selector Tabs with Spring Animation */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedService === svc.id
                    ? "bg-gradient-to-r from-[#E6007A] to-[#FF2E93] text-white shadow-lg shadow-pink-600/40 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                }`}
              >
                {svc.name}
              </button>
            ))}
          </div>

          {/* Featured Service Card with Verified Beauty Imagery */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentServiceObj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="max-w-4xl mx-auto rounded-3xl bg-[#1A0C16] border border-pink-500/30 p-6 sm:p-10 shadow-2xl grid md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider border border-pink-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> {currentServiceObj.tag}
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {currentServiceObj.name}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentServiceObj.desc}
                </p>

                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-pink-300 uppercase tracking-wider block">O que está incluso:</span>
                  {currentServiceObj.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200">
                      <div className="w-4 h-4 rounded-full bg-pink-500/30 text-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
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

                  <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" service={currentServiceObj.name} className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-all">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Agendar Agora</span>
                  </BeautyBookingQuiz>
                </div>
              </div>

              {/* Verified Lash & Beauty Close-up Image */}
              <div className="md:col-span-6 rounded-2xl overflow-hidden border border-pink-500/30 h-72 sm:h-80 relative group shadow-2xl bg-black">
                <img 
                  src={currentServiceObj.image} 
                  alt={currentServiceObj.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C16] via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-pink-200 border border-pink-500/30 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-yellow-300" /> {currentServiceObj.badgeHighlight}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/10 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-400" /> {currentServiceObj.duration}
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
            <span className="text-xs font-bold tracking-[0.25em] text-pink-400 uppercase">Nosso Diferencial</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Mais que um atendimento, um momento feito para você relaxar.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
              No <strong>Espaço Renata Beauty</strong>, nós não aceleramos seu procedimento. Cada cliente recebe atendimento exclusivo em ambiente climatizado, poltronas ergonômicas e café especial.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Biossegurança e Higiene Rigorosa</h4>
                  <p className="text-xs text-gray-400">Materiais descartáveis e instrumentos autoclavados para total proteção.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mapeamento Visagista Personalizado</h4>
                  <p className="text-xs text-gray-400">Análise do formato dos seus olhos para desenhar a curvatura perfeita para seu rosto.</p>
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
              <div className="rounded-2xl overflow-hidden border border-pink-500/20 shadow-xl h-52">
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" 
                  alt="Resultado de Extensão de Cílios" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-pink-500/20 shadow-xl h-60">
                <img 
                  src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80" 
                  alt="Harmonia de Olhar e Sobrancelha" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="rounded-2xl overflow-hidden border border-pink-500/20 shadow-xl h-60">
                <img 
                  src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80" 
                  alt="Alongamento de Unhas Studio" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-pink-500/30 shadow-xl h-52 bg-gradient-to-br from-[#E6007A]/40 to-[#12080E] p-5 flex flex-col justify-between">
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

      <InstagramFeedSection variant="renata" />

      {/* Location & Map Interactive */}
      <section id="localizacao" className="py-20 px-4 bg-[#130810]/80 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-[0.25em] text-pink-400 uppercase">Localização & Acesso</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Fácil acesso no Boneca do Iguaçu
            </h2>
            <p className="text-gray-300 text-sm">
              Venha conhecer nosso novo espaço físico preparado com todo carinho para você.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto rounded-3xl bg-[#1A0C16] border border-pink-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
            
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

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
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
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E6007A] to-[#FF2E93] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Compass className="w-4 h-4" /> Abrir no Maps / Waze
                </a>

                <button
                  onClick={copyAddressToClipboard}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
                >
                  {copiedAddress ? "Copiado! ✓" : "Copiar Endereço"}
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
            <span className="text-xs font-bold tracking-[0.25em] text-pink-400 uppercase">Dúvidas Frequentes</span>
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
                  className="w-full p-5 text-left font-semibold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-pink-300 transition-colors cursor-pointer"
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
      <section className="py-16 px-4 bg-gradient-to-r from-[#220919] via-[#E6007A] to-[#220919] text-white text-center relative overflow-hidden">
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
            <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" className="inline-flex items-center gap-2 bg-white text-[#12080E] hover:bg-yellow-100 px-8 py-4 rounded-full font-bold text-base shadow-2xl hover:scale-105 active:scale-95 transition-all">
              <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
              Falar Direto no WhatsApp
            </BeautyBookingQuiz>
          </div>
        </div>
      </section>

      {/* Minimal Luxury Footer */}
      <footer className="py-12 px-4 bg-[#080407] border-t border-white/10 text-xs text-gray-400">
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
            <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" className="hover:text-pink-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> +55 41 9604-8639
            </BeautyBookingQuiz>
          </div>

          <div className="text-[11px] text-gray-400">
            Hospedado no <Link to="/portfolio" className="text-pink-400 hover:underline">0web.com.br Portfólio</Link>
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        <div className="hidden sm:block bg-[#1A0C16]/95 backdrop-blur-md border border-pink-500/30 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xl group-hover:block transition-all">
          <span className="text-pink-400">Online agora</span> · Agende no WhatsApp ✨
        </div>
        <BeautyBookingQuiz studioName="Renata Beauty Studio" theme="pink" service="Sobrancelhas e Spa" className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center shadow-2xl shadow-green-500/50 hover:scale-110 active:scale-95 transition-transform relative cursor-pointer" ariaLabel="Agendar no WhatsApp">
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 border-2 border-[#0E090C] flex items-center justify-center text-[9px] font-bold">1</span>
          <MessageCircle className="w-7 h-7 fill-white" />
        </BeautyBookingQuiz>
      </div>

      <PortfolioUpsellPopup pageName="renata-beauty" />
    </div>
  );
}
