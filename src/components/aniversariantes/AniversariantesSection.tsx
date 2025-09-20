import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cake, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { mockCasais } from "@/data/mockData";

interface AniversariantesProps {
  viewMode?: 'mensal' | 'semanal' | 'diario';
}

export const AniversariantesSection = ({ viewMode = 'mensal' }: AniversariantesProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'mensal' | 'semanal' | 'diario'>(viewMode);

  // Simular datas de aniversário (em produção virão do banco)
  const casaisComAniversarios = mockCasais.map(casal => ({
    ...casal,
    aniversarioEle: `1980-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
    aniversarioEla: `1985-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`
  }));

  const getAniversariantes = () => {
    const today = new Date();
    let startDate, endDate;

    switch (view) {
      case 'mensal':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case 'semanal':
        startDate = startOfWeek(currentDate, { locale: ptBR });
        endDate = endOfWeek(currentDate, { locale: ptBR });
        break;
      case 'diario':
        startDate = currentDate;
        endDate = currentDate;
        break;
    }

    const aniversariantes = [];
    
    casaisComAniversarios.forEach(casal => {
      // Verificar aniversário do homem
      const anivEle = parseISO(casal.aniversarioEle);
      const anivEleThisYear = new Date(currentDate.getFullYear(), anivEle.getMonth(), anivEle.getDate());
      
      if (anivEleThisYear >= startDate && anivEleThisYear <= endDate) {
        aniversariantes.push({
          nome: casal.nomeEle,
          data: anivEleThisYear,
          tipo: 'ele',
          casal: casal
        });
      }

      // Verificar aniversário da mulher
      const anivEla = parseISO(casal.aniversarioEla);
      const anivElaThisYear = new Date(currentDate.getFullYear(), anivEla.getMonth(), anivEla.getDate());
      
      if (anivElaThisYear >= startDate && anivElaThisYear <= endDate) {
        aniversariantes.push({
          nome: casal.nomeEla,
          data: anivElaThisYear,
          tipo: 'ela',
          casal: casal
        });
      }
    });

    return aniversariantes.sort((a, b) => a.data.getTime() - b.data.getTime());
  };

  const aniversariantes = getAniversariantes();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'mensal':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'semanal':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'diario':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'mensal':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      case 'semanal':
        const start = startOfWeek(currentDate, { locale: ptBR });
        const end = endOfWeek(currentDate, { locale: ptBR });
        return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM yyyy', { locale: ptBR })}`;
      case 'diario':
        return format(currentDate, 'dd MMMM yyyy', { locale: ptBR });
    }
  };

  return (
    <Card className="shadow-gentle">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" />
            Aniversariantes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'mensal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('mensal')}
            >
              Mês
            </Button>
            <Button
              variant={view === 'semanal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('semanal')}
            >
              Semana
            </Button>
            <Button
              variant={view === 'diario' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('diario')}
            >
              Dia
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <p className="text-lg font-medium capitalize">
            {getDateRangeText()}
          </p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {aniversariantes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum aniversariante no período selecionado
          </p>
        ) : (
          <div className="space-y-4">
            {aniversariantes.map((aniversariante, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-subtle border"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Cake className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {aniversariante.nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Casal #{aniversariante.casal.numeroInscricao} - {aniversariante.casal.paroquia}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {format(aniversariante.data, 'dd/MM', { locale: ptBR })}
                  </p>
                  <Badge 
                    variant={isSameDay(aniversariante.data, new Date()) ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {isSameDay(aniversariante.data, new Date()) ? 'Hoje!' : 
                     format(aniversariante.data, 'EEEE', { locale: ptBR })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};