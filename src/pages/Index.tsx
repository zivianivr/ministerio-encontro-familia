import { Dashboard } from "@/components/dashboard/Dashboard";
import { CasalCard } from "@/components/casais/CasalCard";
import { EquipeCard } from "@/components/equipes/EquipeCard";
import { AniversariantesSection } from "@/components/aniversariantes/AniversariantesSection";
import { OrganogramaEquipes } from "@/components/organograma/OrganogramaEquipes";
import { mockCasais, mockEquipes } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/ecc-hero-banner.jpg";

const Index = () => {
  return (
    <div className="space-y-8">{/* O background é aplicado no AuthenticatedLayout */}
      {/* Hero Section */}
      <section className="relative h-64 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Bem-vindos ao Sistema ECC
            </h1>
            <p className="text-lg opacity-90">
              Paróquias Santo Antônio e São Sebastião - Gerenciamento completo dos 
              Encontros de Casais com Cristo
            </p>
          </div>
        </div>
      </section>
        
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Painel de Controle
          </h2>
          <p className="text-muted-foreground">
            Gerencie os casais, equipes e encontros da sua comunidade
          </p>
        </div>
        
        <Dashboard />
        
        {/* Seção de Aniversariantes */}
        <section className="mt-8">
          <AniversariantesSection />
        </section>
        
        {/* Organograma das Equipes */}
        <section className="mt-8">
          <OrganogramaEquipes />
        </section>
        
        {/* Seção de Casais Recentes */}
        <section className="mt-12">
          <Card className="shadow-gentle">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Casais Recentes</CardTitle>
              <p className="text-muted-foreground">
                Últimos casais cadastrados no sistema
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCasais.slice(0, 3).map((casal) => (
                  <CasalCard key={casal.id} casal={casal} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Seção de Equipes */}
        <section className="mt-8">
          <Card className="shadow-gentle">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Equipes Ativas</CardTitle>
              <p className="text-muted-foreground">
                Principais equipes organizadas para os encontros
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockEquipes.map((equipe, index) => {
                  const cores = ["sacred", "primary", "gold", "primary"];
                  return (
                    <EquipeCard 
                      key={equipe.id} 
                      equipe={equipe} 
                      cor={cores[index]} 
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
    </div>
  );
};

export default Index;