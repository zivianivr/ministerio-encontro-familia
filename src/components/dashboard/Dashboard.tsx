import { Users, Heart, Calendar, UserCheck } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIPOS_EQUIPES } from "@/types/ecc";

// Mock data - em produção viria de uma API
const mockStats = {
  totalCasais: 247,
  totalEquipes: 11,
  casaisAtivos: 198,
  proximoEcc: {
    data: "21/10/2024",
    local: "CIEP Glória Roussin",
    casaisInscritos: 45
  }
};

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Casais"
          value={mockStats.totalCasais}
          icon={Heart}
          gradient="bg-gradient-celestial"
          description="Casais cadastrados no sistema"
        />
        <StatsCard
          title="Equipes Ativas"
          value={mockStats.totalEquipes}
          icon={Users}
          gradient="bg-gradient-sacred"
          description="Equipes organizadas"
        />
        <StatsCard
          title="Casais Ativos"
          value={mockStats.casaisAtivos}
          icon={UserCheck}
          gradient="bg-gradient-gold"
          description="Participando atualmente"
        />
        <StatsCard
          title="Próximo ECC"
          value={mockStats.proximoEcc?.casaisInscritos || 0}
          icon={Calendar}
          gradient="bg-gradient-divine"
          description="Casais inscritos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximo Encontro */}
        <Card className="shadow-gentle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximo Encontro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockStats.proximoEcc ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{mockStats.proximoEcc.data}</p>
                    <p className="text-muted-foreground">{mockStats.proximoEcc.local}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ECC VII
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mockStats.proximoEcc.casaisInscritos} casais inscritos
                  </span>
                  <Button size="sm" className="bg-gradient-celestial">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum encontro programado</p>
            )}
          </CardContent>
        </Card>

        {/* Equipes */}
        <Card className="shadow-gentle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Equipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TIPOS_EQUIPES.slice(0, 6).map((equipe) => (
                <div key={equipe.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${equipe.cor === 'sacred' ? 'sacred' : equipe.cor === 'primary' ? 'primary' : equipe.cor === 'gold' ? 'gold' : 'primary'}`} />
                    <span className="text-sm font-medium">{equipe.nome}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.floor(Math.random() * 20) + 5} casais
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2">
                Ver Todas as Equipes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="shadow-gentle">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-celestial hover:shadow-divine transition-all">
              <Heart className="h-4 w-4 mr-2" />
              Cadastrar Novo Casal
            </Button>
            <Button variant="outline" className="hover:shadow-gentle transition-all">
              <Users className="h-4 w-4 mr-2" />
              Organizar Equipes
            </Button>
            <Button variant="outline" className="hover:shadow-gentle transition-all">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Encontro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};