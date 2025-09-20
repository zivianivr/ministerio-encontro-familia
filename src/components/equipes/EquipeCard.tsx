import { Users, UserCheck, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Equipe } from "@/types/ecc";

interface EquipeCardProps {
  equipe: Equipe;
  cor?: string;
}

export const EquipeCard = ({ equipe, cor = "primary" }: EquipeCardProps) => {
  const getGradientClass = (cor: string) => {
    switch (cor) {
      case "sacred": return "bg-gradient-sacred";
      case "gold": return "bg-gradient-gold";
      case "primary": return "bg-gradient-celestial";
      default: return "bg-gradient-celestial";
    }
  };

  return (
    <Card className="shadow-gentle hover:shadow-divine transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">{equipe.nome}</CardTitle>
          <div className={`${getGradientClass(cor)} p-2 rounded-lg`}>
            <Users className="h-4 w-4 text-white" />
          </div>
        </div>
        {equipe.descricao && (
          <p className="text-sm text-muted-foreground">{equipe.descricao}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Coordenador */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Coordenador</span>
          </div>
          <div className="pl-6 space-y-1">
            <p className="text-sm font-medium">
              {equipe.coordenador.casal.nomeEle} & {equipe.coordenador.casal.nomeEla}
            </p>
            <p className="text-xs text-muted-foreground">
              Nº {equipe.coordenador.numeroInscricao}
            </p>
          </div>
        </div>
        
        {/* Estatísticas */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{equipe.casais.length}</p>
            <p className="text-xs text-muted-foreground">Casais</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-sacred">{equipe.casais.length * 2}</p>
            <p className="text-xs text-muted-foreground">Pessoas</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Ativa
          </Badge>
        </div>
        
        {/* Ações */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Settings className="h-3 w-3 mr-1" />
            Configurar
          </Button>
          <Button size="sm" variant="celestial" className="flex-1">
            Ver Membros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};