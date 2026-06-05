import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Building2, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/marketplace")({
  component: () => (
    <div>
      <h1 className="text-2xl font-display font-bold mb-2">Marketplace</h1>
      <p className="text-muted-foreground mb-8">Gerencie seu perfil profissional, empresa e moderação.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/app/marketplace/provider" className="rounded-xl border border-border p-6 hover:border-primary transition">
          <Briefcase className="w-6 h-6 text-primary mb-3" />
          <div className="font-semibold mb-1">Perfil de prestador</div>
          <p className="text-sm text-muted-foreground">Cadastre seus serviços, portfólio e regiões de atendimento.</p>
        </Link>
        <Link to="/app/marketplace/company" className="rounded-xl border border-border p-6 hover:border-primary transition">
          <Building2 className="w-6 h-6 text-primary mb-3" />
          <div className="font-semibold mb-1">Perfil de empresa</div>
          <p className="text-sm text-muted-foreground">Cadastre sua empresa, CNPJ, categorias e contatos.</p>
        </Link>
        <Link to="/app/marketplace/admin" className="rounded-xl border border-border p-6 hover:border-primary transition">
          <Shield className="w-6 h-6 text-primary mb-3" />
          <div className="font-semibold mb-1">Moderação (admin)</div>
          <p className="text-sm text-muted-foreground">Aprovar perfis, verificar selos e distribuir solicitações.</p>
        </Link>
      </div>
    </div>
  ),
});
