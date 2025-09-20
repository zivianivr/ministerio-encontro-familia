-- Criar tabela de casais
CREATE TABLE public.casais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_inscricao INTEGER NOT NULL UNIQUE,
  
  -- Dados do homem
  nome_ele TEXT NOT NULL,
  religiao_ele TEXT,
  contato_ele TEXT,
  data_nascimento_ele DATE,
  
  -- Dados da mulher
  nome_ela TEXT NOT NULL,
  religiao_ela TEXT,
  contato_ela TEXT,
  data_nascimento_ela DATE,
  
  -- Dados gerais
  paroquia TEXT NOT NULL,
  comunidade TEXT,
  bairro TEXT,
  endereco TEXT,
  
  -- ECC
  ecc_primeira_etapa TEXT,
  data_ecc DATE,
  local_ecc TEXT,
  
  -- Foto
  foto_url TEXT,
  
  -- Metadados
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tipos de equipes
CREATE TABLE public.tipos_equipes (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cor TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0
);

-- Inserir tipos de equipes
INSERT INTO public.tipos_equipes (id, nome, descricao, cor, ordem) VALUES
  ('coordenacao', 'Coordenação Geral', 'Coordenação geral do encontro', 'sacred', 1),
  ('sala', 'Equipe de Sala', 'Responsável pela organização das salas', 'primary', 2),
  ('cafezinho', 'Cafezinho e Mini Mercado', 'Cafezinho e vendas', 'gold', 3),
  ('cozinha', 'Cozinha', 'Preparo das refeições', 'green-600', 4),
  ('liturgia', 'Liturgia', 'Organização litúrgica', 'purple-600', 5),
  ('ordem', 'Equipe de Ordem', 'Manutenção da ordem', 'blue-600', 6),
  ('acolhida', 'Acolhida', 'Recepção dos participantes', 'pink-600', 7),
  ('secretaria', 'Secretaria', 'Atividades administrativas', 'gray-600', 8),
  ('visitacao', 'Visitação', 'Visitas e acompanhamento', 'indigo-600', 9),
  ('circulo', 'Círculo', 'Atividades em círculo', 'teal-600', 10),
  ('compras', 'Compras', 'Responsável pelas compras', 'orange-600', 11);

-- Criar tabela de equipes
CREATE TABLE public.equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_equipe_id TEXT NOT NULL REFERENCES public.tipos_equipes(id),
  coordenador_casal_id UUID REFERENCES public.casais(id),
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de membros das equipes
CREATE TABLE public.equipe_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  posicao TEXT DEFAULT 'membro',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, casal_id)
);

-- Criar tabela de encontros
CREATE TABLE public.encontros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  local TEXT NOT NULL,
  etapa TEXT,
  status TEXT DEFAULT 'planejando',
  casais_inscritos INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.casais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipe_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encontros ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (church community system)
CREATE POLICY "Casais são visíveis para todos" ON public.casais FOR SELECT USING (true);
CREATE POLICY "Tipos de equipes são visíveis para todos" ON public.tipos_equipes FOR SELECT USING (true);
CREATE POLICY "Equipes são visíveis para todos" ON public.equipes FOR SELECT USING (true);
CREATE POLICY "Membros das equipes são visíveis para todos" ON public.equipe_membros FOR SELECT USING (true);
CREATE POLICY "Encontros são visíveis para todos" ON public.encontros FOR SELECT USING (true);

-- Policies para inserção/edição (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem inserir casais" ON public.casais FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem atualizar casais" ON public.casais FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem deletar casais" ON public.casais FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir equipes" ON public.equipes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem atualizar equipes" ON public.equipes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem deletar equipes" ON public.equipes FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir membros" ON public.equipe_membros FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem atualizar membros" ON public.equipe_membros FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem deletar membros" ON public.equipe_membros FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir encontros" ON public.encontros FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem atualizar encontros" ON public.encontros FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem deletar encontros" ON public.encontros FOR DELETE USING (auth.uid() IS NOT NULL);

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_casais_updated_at
  BEFORE UPDATE ON public.casais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipes_updated_at
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_encontros_updated_at
  BEFORE UPDATE ON public.encontros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();