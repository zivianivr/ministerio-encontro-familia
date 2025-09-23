import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Heart, Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react';

const Casais = () => {
  const { casais, loading, error } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCasais = casais.filter(casal =>
    casal.nomeEle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    casal.nomeEla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    casal.paroquia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Carregando casais...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Casais</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os casais cadastrados no sistema
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-celestial">
              <Plus className="h-4 w-4 mr-2" />
              Novo Casal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Casal</DialogTitle>
              <DialogDescription>
                Preencha os dados do casal para cadastro no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Formulário de cadastro será implementado em breve
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Lista de Casais ({filteredCasais.length})
          </CardTitle>
          <CardDescription>
            Total de {casais.length} casais cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome do casal ou paróquia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Casal</TableHead>
                  <TableHead>Paróquia</TableHead>
                  <TableHead>Comunidade</TableHead>
                  <TableHead>ECC</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCasais.length > 0 ? (
                  filteredCasais.map((casal) => (
                    <TableRow key={casal.id}>
                      <TableCell className="font-medium">
                        {casal.numeroInscricao}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{casal.nomeEle} & {casal.nomeEla}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {casal.contatoEle && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {casal.contatoEle}
                              </span>
                            )}
                            {casal.contatoEla && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {casal.contatoEla}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{casal.paroquia}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {casal.comunidade || '-'}
                      </TableCell>
                      <TableCell>
                        {casal.eccPrimeiraEtapa ? (
                          <Badge variant="secondary">{casal.eccPrimeiraEtapa}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum casal encontrado com esse filtro.' : 'Nenhum casal cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Casais;