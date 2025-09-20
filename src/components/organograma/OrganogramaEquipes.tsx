import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, User, Printer, ZoomIn, ZoomOut } from "lucide-react";
import { mockEquipes } from "@/data/mockData";
import { TIPOS_EQUIPES } from "@/types/ecc";

interface OrganogramaProps {
  printable?: boolean;
}

export const OrganogramaEquipes = ({ printable = false }: OrganogramaProps) => {
  const [zoom, setZoom] = useState(100);
  const [selectedEquipe, setSelectedEquipe] = useState<string | null>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Organograma ECC - Paróquias Santo Antônio / São Sebastião</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .organograma { display: flex; flex-direction: column; gap: 20px; }
            .equipe { border: 2px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
            .equipe-header { font-weight: bold; font-size: 18px; margin-bottom: 10px; text-align: center; }
            .coordenador { background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 10px; margin-bottom: 10px; }
            .membros { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
            .membro { padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; text-align: center; }
            .coordenacao { background-color: #fef3c7; }
            .sala { background-color: #dbeafe; }
            .cafezinho { background-color: #fef3c7; }
            .cozinha { background-color: #dcfce7; }
            .liturgia { background-color: #e9d5ff; }
            .ordem { background-color: #dbeafe; }
            @media print { body { margin: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Organograma do Encontro de Casais com Cristo</h1>
            <h2>Paróquias Santo Antônio e São Sebastião</h2>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          ${document.getElementById('organograma-content')?.innerHTML || ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getEquipeColor = (tipoId: string) => {
    const tipo = TIPOS_EQUIPES.find(t => t.id === tipoId);
    return tipo?.cor || 'primary';
  };

  const getCoordenacaoGeral = () => {
    return mockEquipes.find(e => e.id === 'coordenacao');
  };

  const getOutrasEquipes = () => {
    return mockEquipes.filter(e => e.id !== 'coordenacao');
  };

  const coordenacao = getCoordenacaoGeral();
  const outrasEquipes = getOutrasEquipes();

  return (
    <Card className="shadow-gentle">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Organograma das Equipes
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium px-2">
              {zoom}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          id="organograma-content"
          className="space-y-6"
          style={{ zoom: `${zoom}%` }}
        >
          {/* Coordenação Geral */}
          {coordenacao && (
            <div className="flex justify-center">
              <div 
                className={`
                  relative p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedEquipe === coordenacao.id ? 'ring-4 ring-primary/50' : ''}
                  bg-gradient-sacred text-white shadow-divine
                `}
                onClick={() => setSelectedEquipe(selectedEquipe === coordenacao.id ? null : coordenacao.id)}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">{coordenacao.nome}</h3>
                  
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={coordenacao.coordenador.casal.fotoUrl} />
                        <AvatarFallback className="text-primary">
                          {coordenacao.coordenador.casal.nomeEle.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          {coordenacao.coordenador.casal.nomeEle}
                        </p>
                        <p className="font-semibold text-sm">
                          {coordenacao.coordenador.casal.nomeEla}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{coordenacao.coordenador.numeroInscricao}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linha conectora */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-border"></div>
          </div>

          {/* Outras Equipes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {outrasEquipes.map((equipe) => {
              const cor = getEquipeColor(equipe.id);
              const isSelected = selectedEquipe === equipe.id;
              
              return (
                <div
                  key={equipe.id}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected ? 'ring-4 ring-primary/50' : ''}
                    ${cor === 'sacred' ? 'bg-gradient-sacred text-white' :
                      cor === 'primary' ? 'bg-gradient-celestial text-white' :
                      cor === 'gold' ? 'bg-gradient-gold text-white' :
                      'bg-gradient-subtle'}
                    shadow-gentle hover:shadow-divine
                  `}
                  onClick={() => setSelectedEquipe(isSelected ? null : equipe.id)}
                >
                  <div className="text-center">
                    <h4 className="font-bold text-sm mb-3">{equipe.nome}</h4>
                    
                    {/* Coordenador */}
                    <div className={`
                      p-3 rounded-lg mb-3
                      ${cor === 'sacred' || cor === 'primary' || cor === 'gold' ? 
                        'bg-white/20' : 'bg-primary/10'}
                    `}>
                      <p className="text-xs font-medium mb-2">Coordenador</p>
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={equipe.coordenador.casal.fotoUrl} />
                          <AvatarFallback className="text-xs">
                            {equipe.coordenador.casal.nomeEle.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="text-xs font-medium leading-tight">
                            {equipe.coordenador.casal.nomeEle.split(' ')[0]}
                          </p>
                          <p className="text-xs font-medium leading-tight">
                            {equipe.coordenador.casal.nomeEla.split(' ')[0]}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-1"
                        >
                          #{equipe.coordenador.numeroInscricao}
                        </Badge>
                      </div>
                    </div>

                    {/* Membros */}
                    {equipe.casais.length > 0 && (
                      <div className={`
                        p-2 rounded-lg
                        ${cor === 'sacred' || cor === 'primary' || cor === 'gold' ? 
                          'bg-white/10' : 'bg-muted/50'}
                      `}>
                        <p className="text-xs font-medium mb-2">Membros</p>
                        <div className="space-y-1">
                          {equipe.casais.slice(0, 2).map((membro, index) => (
                            <div key={index} className="text-xs">
                              <p>{membro.casal.nomeEle.split(' ')[0]} & {membro.casal.nomeEla.split(' ')[0]}</p>
                            </div>
                          ))}
                          {equipe.casais.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{equipe.casais.length - 2} casais
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {equipe.casais.length + 1} casal{equipe.casais.length !== 0 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3 text-center">Legenda das Equipes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {TIPOS_EQUIPES.map((tipo) => (
                <div key={tipo.id} className="flex items-center gap-2">
                  <div 
                    className={`
                      w-3 h-3 rounded-full
                      ${tipo.cor === 'sacred' ? 'bg-gradient-sacred' :
                        tipo.cor === 'primary' ? 'bg-gradient-celestial' :
                        tipo.cor === 'gold' ? 'bg-gradient-gold' :
                        'bg-gradient-subtle'}
                    `}
                  ></div>
                  <span>{tipo.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};