import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Upload, FileSpreadsheet, Plus, Edit, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  criado_em: string;
}

interface Importacao {
  id: string;
  nome_arquivo: string;
  tipo: string;
  status: string;
  total_registros: number;
  registros_processados: number;
  criado_em: string;
}

const Configuracoes = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [importacoes, setImportacoes] = useState<Importacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estados para formulário de usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    role: 'user'
  });
  const [dialogAberto, setDialogAberto] = useState(false);

  useEffect(() => {
    checkUserRole();
    if (isAdmin) {
      fetchUsuarios();
      fetchImportacoes();
    }
  }, [user, isAdmin]);

  const checkUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    }
  };

  const fetchImportacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('importacoes')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      setImportacoes(data || []);
    } catch (error) {
      toast.error('Erro ao carregar histórico de importações');
    }
  };

  const handleCriarUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Primeiro criar no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: novoUsuario.email,
        password: 'temp123456', // Senha temporária
        email_confirm: true,
        user_metadata: {
          full_name: novoUsuario.nome
        }
      });

      if (authError) throw authError;

      // Depois inserir na tabela usuarios
      const { error: userError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          role: novoUsuario.role
        });

      if (userError) throw userError;

      toast.success('Usuário criado com sucesso! Senha temporária: temp123456');
      setNovoUsuario({ nome: '', email: '', role: 'user' });
      setDialogAberto(false);
      fetchUsuarios();
    } catch (error: any) {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Usuário excluído com sucesso');
      fetchUsuarios();
    } catch (error: any) {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setLoading(true);
    try {
      // Ler arquivo Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Registrar importação
      const { data: importacao, error: importError } = await supabase
        .from('importacoes')
        .insert({
          nome_arquivo: file.name,
          tipo: 'casais',
          total_registros: data.length,
          status: 'processando'
        })
        .select()
        .single();

      if (importError) throw importError;

      // Processar dados
      let processados = 0;
      const erros: any[] = [];

      for (const row of data) {
        try {
          const casal = {
            numero_inscricao: row['Numero'] || row['numero'] || row['Número'],
            nome_ele: row['Nome Ele'] || row['nome_ele'] || row['NomeEle'],
            religiao_ele: row['Religiao Ele'] || row['religiao_ele'] || row['ReligiaoEle'],
            contato_ele: row['Contato Ele'] || row['contato_ele'] || row['ContatoEle'],
            nome_ela: row['Nome Ela'] || row['nome_ela'] || row['NomeEla'],
            religiao_ela: row['Religiao Ela'] || row['religiao_ela'] || row['ReligiaoEla'],
            contato_ela: row['Contato Ela'] || row['contato_ela'] || row['ContatoEla'],
            paroquia: row['Paroquia'] || row['paroquia'],
            comunidade: row['Comunidade'] || row['comunidade'],
            bairro: row['Bairro'] || row['bairro'],
            endereco: row['Endereco'] || row['endereco'] || row['Endereço'],
            ecc_primeira_etapa: row['ECC'] || row['ecc'] || row['Etapa'],
            data_ecc: row['Data ECC'] || row['data_ecc'] || row['DataECC'],
            local_ecc: row['Local ECC'] || row['local_ecc'] || row['LocalECC']
          };

          const { error } = await supabase
            .from('casais')
            .insert(casal);

          if (error) throw error;
          processados++;
        } catch (error) {
          erros.push({ linha: processados + 1, erro: error });
        }
      }

      // Atualizar status da importação
      await supabase
        .from('importacoes')
        .update({
          status: erros.length > 0 ? 'erro' : 'concluida',
          registros_processados: processados,
          erros: erros.length > 0 ? erros : null
        })
        .eq('id', importacao.id);

      toast.success(`Importação concluída! ${processados} registros processados.`);
      if (erros.length > 0) {
        toast.warning(`${erros.length} registros com erro foram ignorados.`);
      }

      fetchImportacoes();
    } catch (error: any) {
      toast.error(`Erro na importação: ${error.message}`);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Numero': 1,
        'Nome Ele': 'João da Silva',
        'Religiao Ele': 'Católica',
        'Contato Ele': '(24) 99999-9999',
        'Nome Ela': 'Maria da Silva',
        'Religiao Ela': 'Católica',
        'Contato Ela': '(24) 88888-8888',
        'Paroquia': 'Santo Antônio',
        'Comunidade': 'Santa Rita',
        'Bairro': 'Centro',
        'Endereco': 'Rua das Flores, 123',
        'ECC': 'VII',
        'Data ECC': '2024-10-21',
        'Local ECC': 'CIEP Glória Roussin'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Casais');
    XLSX.writeFile(wb, 'template_casais.xlsx');
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Acesso Restrito</h1>
          <p className="text-muted-foreground mt-2">
            Apenas administradores podem acessar as configurações do sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie usuários e configure o sistema.
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>
                    Criar, editar e excluir usuários do sistema
                  </CardDescription>
                </div>
                <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-celestial">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do novo usuário
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={novoUsuario.nome}
                          onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                          placeholder="Nome do usuário"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={novoUsuario.email}
                          onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Função</Label>
                        <Select value={novoUsuario.role} onValueChange={(value) => setNovoUsuario({...novoUsuario, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleCriarUsuario} 
                        disabled={loading}
                        className="w-full"
                      >
                        Criar Usuário
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant={usuario.role === 'admin' ? 'default' : 'secondary'}>
                          {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.ativo ? 'default' : 'destructive'}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteUsuario(usuario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Planilha de Casais
                </CardTitle>
                <CardDescription>
                  Faça upload de um arquivo Excel (.xlsx ou .xls) com dados dos casais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Template
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>O arquivo deve conter as seguintes colunas:</p>
                  <p>Numero, Nome Ele, Religiao Ele, Contato Ele, Nome Ela, Religiao Ela, Contato Ela, Paroquia, Comunidade, Bairro, Endereco, ECC, Data ECC, Local ECC</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Histórico de Importações
                </CardTitle>
                <CardDescription>
                  Acompanhe o status das importações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importacoes.map((importacao) => (
                      <TableRow key={importacao.id}>
                        <TableCell className="font-medium">{importacao.nome_arquivo}</TableCell>
                        <TableCell>{importacao.tipo}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              importacao.status === 'concluida' ? 'default' : 
                              importacao.status === 'erro' ? 'destructive' : 'secondary'
                            }
                          >
                            {importacao.status === 'concluida' ? 'Concluída' :
                             importacao.status === 'erro' ? 'Com Erro' : 'Processando'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {importacao.registros_processados} / {importacao.total_registros}
                        </TableCell>
                        <TableCell>
                          {new Date(importacao.criado_em).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;