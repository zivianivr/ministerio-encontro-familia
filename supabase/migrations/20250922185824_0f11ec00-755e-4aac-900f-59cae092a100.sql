-- Criar tabela de usuários do sistema (para autenticação)
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policies para usuários
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.usuarios FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Admins podem ver todos os usuários" ON public.usuarios FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins podem inserir usuários" ON public.usuarios FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar usuários" ON public.usuarios FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins podem deletar usuários" ON public.usuarios FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Criar tabela de importações de planilhas
CREATE TABLE public.importacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'casais', 'equipes', etc.
  status TEXT DEFAULT 'processando' CHECK (status IN ('processando', 'concluida', 'erro')),
  total_registros INTEGER DEFAULT 0,
  registros_processados INTEGER DEFAULT 0,
  erros JSONB,
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.importacoes ENABLE ROW LEVEL SECURITY;

-- Policies para importações
CREATE POLICY "Usuários autenticados podem ver importações" ON public.importacoes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem criar importações" ON public.importacoes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para atualizar timestamp de usuários
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar usuário automático no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_user_id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    CASE WHEN NEW.email = 'admin@sistema-ecc.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automático
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();