import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit, Trash2, MapPin, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Encontro {
  id: string;
  nome: string;
  local: string;
  data_inicio: string;
  data_fim?: string;
  status: string;
  casais_inscritos: number;
  etapa?: string;
}

const Encontros = () => {
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEncontro, setEditingEncontro] = useState<Encontro | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    data_inicio: '',
    data_fim: '',
    status: 'planejando',
    casais_inscritos: '0',
    etapa: ''
  });

  const statusOptions = [
    { value: 'planejando', label: 'Planejando' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  useEffect(() => {
    fetchEncontros();
  }, []);

  const fetchEncontros = async () => {
    try {
      const { data, error } = await supabase
        .from('encontros')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setEncontros(data || []);
    } catch (error) {
      console.error('Erro ao buscar encontros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os encontros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        casais_inscritos: parseInt(formData.casais_inscritos),
        data_fim: formData.data_fim || null
      };

      if (editingEncontro) {
        const { error } = await supabase
          .from('encontros')
          .update(dataToSubmit)
          .eq('id', editingEncontro.id);
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Encontro atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('encontros')
          .insert(dataToSubmit);
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Encontro cadastrado com sucesso"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchEncontros();
    } catch (error) {
      console.error('Erro ao salvar encontro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o encontro",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (encontro: Encontro) => {
    setEditingEncontro(encontro);
    setFormData({
      nome: encontro.nome,
      local: encontro.local,
      data_inicio: encontro.data_inicio,
      data_fim: encontro.data_fim || '',
      status: encontro.status,
      casais_inscritos: encontro.casais_inscritos.toString(),
      etapa: encontro.etapa || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este encontro?')) return;
    
    try {
      const { error } = await supabase
        .from('encontros')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Encontro excluído com sucesso"
      });
      fetchEncontros();
    } catch (error) {
      console.error('Erro ao excluir encontro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o encontro",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      local: '',
      data_inicio: '',
      data_fim: '',
      status: 'planejando',
      casais_inscritos: '0',
      etapa: ''
    });
    setEditingEncontro(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      'planejando': 'secondary',
      'confirmado': 'default',
      'em_andamento': 'destructive',
      'concluido': 'outline',
      'cancelado': 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'planejando': 'Planejando',
      'confirmado': 'Confirmado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  const totalEncontros = encontros.length;
  const encontrosPlanejando = encontros.filter(e => e.status === 'planejando').length;
  const encontrosConcluidos = encontros.filter(e => e.status === 'concluido').length;
  const totalCasaisInscritos = encontros.reduce((total, e) => total + e.casais_inscritos, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Encontros</h1>
          <p className="text-muted-foreground">Gerencie os encontros de casais com Cristo</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-celestial">
              <Plus className="h-4 w-4 mr-2" />
              Novo Encontro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEncontro ? 'Editar Encontro' : 'Cadastrar Novo Encontro'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Encontro *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: ECC X"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="etapa">Etapa</Label>
                  <Input
                    id="etapa"
                    value={formData.etapa}
                    onChange={(e) => setFormData({...formData, etapa: e.target.value})}
                    placeholder="Ex: ECC X"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="local">Local *</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                  placeholder="Ex: CIEP Glória Roussin"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="casais_inscritos">Casais Inscritos</Label>
                  <Input
                    id="casais_inscritos"
                    type="number"
                    value={formData.casais_inscritos}
                    onChange={(e) => setFormData({...formData, casais_inscritos: e.target.value})}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-celestial">
                  {editingEncontro ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
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
                <p className="text-2xl font-bold">{totalEncontros}</p>
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
                <p className="text-2xl font-bold">{encontrosPlanejando}</p>
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
                <p className="text-2xl font-bold">{totalCasaisInscritos}</p>
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
                <p className="text-2xl font-bold">{encontrosConcluidos}</p>
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
            Lista de Encontros ({totalEncontros})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {encontros.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum encontro cadastrado ainda
            </p>
          ) : (
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
                  {encontros.map((encontro) => (
                    <TableRow key={encontro.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{encontro.nome}</p>
                          {encontro.etapa && (
                            <Badge variant="outline" className="mt-1">
                              {encontro.etapa}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {new Date(encontro.data_inicio).toLocaleDateString('pt-BR')}
                          </p>
                          {encontro.data_fim && encontro.data_fim !== encontro.data_inicio && (
                            <p className="text-muted-foreground">
                              até {new Date(encontro.data_fim).toLocaleDateString('pt-BR')}
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
                          <span className="font-medium">{encontro.casais_inscritos}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(encontro.status) as any}>
                          {getStatusLabel(encontro.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(encontro)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(encontro.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Encontros;