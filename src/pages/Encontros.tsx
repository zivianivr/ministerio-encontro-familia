import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, MapPin, Users, Clock } from 'lucide-react';

// Mock data - em produção viria de uma API
const mockEncontros = [
  {
    id: '1',
    nome: 'VII ECC - Santo Antônio',
    etapa: 'VII',
    dataInicio: '2024-10-21',
    dataFim: '2024-10-22',
    local: 'CIEP Glória Roussin',
    casaisInscritos: 45,
    status: 'planejando'
  },
  {
    id: '2',
    nome: 'VI ECC - São Sebastião',
    etapa: 'VI',
    dataInicio: '2024-08-15',
    dataFim: '2024-08-16',
    local: 'Casa Paroquial',
    casaisInscritos: 38,
    status: 'concluido'
  },
  {
    id: '3',
    nome: 'VIII ECC - Unidos',
    etapa: 'VIII',
    dataInicio: '2024-12-07',
    dataFim: '2024-12-08',
    local: 'Salão Paroquial',
    casaisInscritos: 0,
    status: 'planejando'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planejando':
      return 'bg-blue-100 text-blue-800';
    case 'em_andamento':
      return 'bg-green-100 text-green-800';
    case 'concluido':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'planejando':
      return 'Planejando';
    case 'em_andamento':
      return 'Em Andamento';
    case 'concluido':
      return 'Concluído';
    default:
      return 'Desconhecido';
  }
};

const Encontros = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Encontros</h1>
          <p className="text-muted-foreground">
            Organize e acompanhe todos os Encontros de Casais com Cristo
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-celestial">
              <Plus className="h-4 w-4 mr-2" />
              Novo Encontro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Novo Encontro</DialogTitle>
              <DialogDescription>
                Preencha os dados para agendar um novo ECC
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Formulário de agendamento será implementado em breve
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{mockEncontros.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planejando</p>
                <p className="text-2xl font-bold">
                  {mockEncontros.filter(e => e.status === 'planejando').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Casais Inscritos</p>
                <p className="text-2xl font-bold">
                  {mockEncontros.reduce((total, e) => total + e.casaisInscritos, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">
                  {mockEncontros.filter(e => e.status === 'concluido').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Encontros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Lista de Encontros
          </CardTitle>
          <CardDescription>
            Todos os encontros organizados pela comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Encontro</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Casais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEncontros.map((encontro) => (
                  <TableRow key={encontro.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{encontro.nome}</p>
                        <Badge variant="outline" className="mt-1">
                          {encontro.etapa} ECC
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {new Date(encontro.dataInicio).toLocaleDateString('pt-BR')}
                        </p>
                        {encontro.dataFim !== encontro.dataInicio && (
                          <p className="text-muted-foreground">
                            até {new Date(encontro.dataFim).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{encontro.local}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{encontro.casaisInscritos}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(encontro.status)}>
                        {getStatusText(encontro.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Encontros;