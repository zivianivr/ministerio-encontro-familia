import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Casal {
  id: string;
  numero_inscricao: number;
  nome_ele: string;
  nome_ela: string;
  paroquia: string;
  data_ecc?: string;
  ecc_primeira_etapa?: string;
  endereco?: string;
  contato_ele?: string;
  contato_ela?: string;
  comunidade?: string;
}

const Casais = () => {
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCasal, setEditingCasal] = useState<Casal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numero_inscricao: '',
    nome_ele: '',
    nome_ela: '',
    paroquia: '',
    data_ecc: '',
    ecc_primeira_etapa: '',
    endereco: '',
    contato_ele: '',
    contato_ela: '',
    comunidade: ''
  });

  useEffect(() => {
    fetchCasais();
  }, []);

  const fetchCasais = async () => {
    try {
      const { data, error } = await supabase
        .from('casais')
        .select('*')
        .order('numero_inscricao', { ascending: true });

      if (error) throw error;
      setCasais(data || []);
    } catch (error) {
      console.error('Erro ao buscar casais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os casais",
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
        numero_inscricao: parseInt(formData.numero_inscricao),
        data_ecc: formData.data_ecc || null
      };

      if (editingCasal) {
        const { error } = await supabase
          .from('casais')
          .update(dataToSubmit)
          .eq('id', editingCasal.id);
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Casal atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('casais')
          .insert(dataToSubmit);
        if (error) throw error;
        toast({
          title: "Sucesso", 
          description: "Casal cadastrado com sucesso"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchCasais();
    } catch (error) {
      console.error('Erro ao salvar casal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o casal",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (casal: Casal) => {
    setEditingCasal(casal);
    setFormData({
      numero_inscricao: casal.numero_inscricao.toString(),
      nome_ele: casal.nome_ele,
      nome_ela: casal.nome_ela,
      paroquia: casal.paroquia,
      data_ecc: casal.data_ecc || '',
      ecc_primeira_etapa: casal.ecc_primeira_etapa || '',
      endereco: casal.endereco || '',
      contato_ele: casal.contato_ele || '',
      contato_ela: casal.contato_ela || '',
      comunidade: casal.comunidade || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este casal?')) return;
    
    try {
      const { error } = await supabase
        .from('casais')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Casal excluído com sucesso"
      });
      fetchCasais();
    } catch (error) {
      console.error('Erro ao excluir casal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o casal",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      numero_inscricao: '',
      nome_ele: '',
      nome_ela: '',
      paroquia: '',
      data_ecc: '',
      ecc_primeira_etapa: '',
      endereco: '',
      contato_ele: '',
      contato_ela: '',
      comunidade: ''
    });
    setEditingCasal(null);
  };

  const filteredCasais = casais.filter(casal =>
    casal.nome_ele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    casal.nome_ela.toLowerCase().includes(searchTerm.toLowerCase()) ||
    casal.paroquia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Casais</h1>
          <p className="text-muted-foreground">Gerencie os casais cadastrados no sistema</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-celestial">
              <Plus className="h-4 w-4 mr-2" />
              Novo Casal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCasal ? 'Editar Casal' : 'Cadastrar Novo Casal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_inscricao">Número de Inscrição *</Label>
                  <Input
                    id="numero_inscricao"
                    type="number"
                    value={formData.numero_inscricao}
                    onChange={(e) => setFormData({...formData, numero_inscricao: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paroquia">Paróquia *</Label>
                  <Input
                    id="paroquia"
                    value={formData.paroquia}
                    onChange={(e) => setFormData({...formData, paroquia: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_ele">Nome Dele *</Label>
                  <Input
                    id="nome_ele"
                    value={formData.nome_ele}
                    onChange={(e) => setFormData({...formData, nome_ele: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nome_ela">Nome Dela *</Label>
                  <Input
                    id="nome_ela"
                    value={formData.nome_ela}
                    onChange={(e) => setFormData({...formData, nome_ela: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contato_ele">Contato Dele</Label>
                  <Input
                    id="contato_ele"
                    value={formData.contato_ele}
                    onChange={(e) => setFormData({...formData, contato_ele: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contato_ela">Contato Dela</Label>
                  <Input
                    id="contato_ela"
                    value={formData.contato_ela}
                    onChange={(e) => setFormData({...formData, contato_ela: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="comunidade">Comunidade</Label>
                  <Input
                    id="comunidade"
                    value={formData.comunidade}
                    onChange={(e) => setFormData({...formData, comunidade: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_ecc">Data do ECC</Label>
                  <Input
                    id="data_ecc"
                    type="date"
                    value={formData.data_ecc}
                    onChange={(e) => setFormData({...formData, data_ecc: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ecc_primeira_etapa">ECC de Primeira Etapa</Label>
                  <Input
                    id="ecc_primeira_etapa"
                    value={formData.ecc_primeira_etapa}
                    onChange={(e) => setFormData({...formData, ecc_primeira_etapa: e.target.value})}
                    placeholder="Ex: ECC VII"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-celestial">
                  {editingCasal ? 'Atualizar' : 'Cadastrar'}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Casais ({filteredCasais.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome do casal ou paróquia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredCasais.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'Nenhum casal encontrado com esse filtro.' : 'Nenhum casal cadastrado ainda'}
            </p>
          ) : (
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
                  {filteredCasais.map((casal) => (
                    <TableRow key={casal.id}>
                      <TableCell className="font-medium">
                        {casal.numero_inscricao}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{casal.nome_ele} & {casal.nome_ela}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {casal.contato_ele && (
                              <span>{casal.contato_ele}</span>
                            )}
                            {casal.contato_ela && (
                              <span>{casal.contato_ela}</span>
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
                        {casal.ecc_primeira_etapa ? (
                          <Badge variant="secondary">{casal.ecc_primeira_etapa}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(casal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(casal.id)}>
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

export default Casais;