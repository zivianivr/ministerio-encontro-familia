import { Heart, Phone, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Casal } from "@/types/ecc";

interface CasalCardProps {
  casal: Casal;
}

export const CasalCard = ({ casal }: CasalCardProps) => {
  return (
    <Card className="shadow-gentle hover:shadow-divine transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-celestial p-2 rounded-full">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-muted-foreground">
                Nº {casal.numeroInscricao}
              </p>
              <Badge variant="outline" className="text-xs">
                {casal.eccPrimeiraEtapa}
              </Badge>
            </div>
          </div>
          {casal.fotoUrl && (
            <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
              <img 
                src={casal.fotoUrl} 
                alt={`Foto do casal ${casal.nomeEle} e ${casal.nomeEla}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Nomes do casal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="font-medium">{casal.nomeEle}</p>
            <span className="text-xs text-muted-foreground">({casal.religiaoEle})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sacred" />
            <p className="font-medium">{casal.nomeEla}</p>
            <span className="text-xs text-muted-foreground">({casal.religiaoEla})</span>
          </div>
        </div>
        
        {/* Informações de contato e localização */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{casal.contatoEle || casal.contatoEla}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{casal.bairro}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{casal.dataEcc}</span>
          </div>
        </div>
        
        {/* Informações da paróquia */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">{casal.paroquia}</span>
            {casal.comunidade && ` • ${casal.comunidade}`}
          </p>
        </div>
        
        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            Editar
          </Button>
          <Button size="sm" variant="celestial" className="flex-1">
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};