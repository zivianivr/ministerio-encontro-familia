# Documentação do Banco de Dados - Sistema ECC

## Visão Geral
O Sistema ECC utiliza PostgreSQL como banco de dados principal. Este documento descreve a estrutura completa do banco, relacionamentos, políticas de segurança e procedimentos de migração.

## Estrutura do Banco de Dados

### Tabela: `casais`
Armazena informações dos casais participantes dos encontros.

```sql
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
```

**Índices:**
```sql
CREATE INDEX idx_casais_numero_inscricao ON public.casais(numero_inscricao);
CREATE INDEX idx_casais_paroquia ON public.casais(paroquia);
CREATE INDEX idx_casais_nome_ele ON public.casais(nome_ele);
CREATE INDEX idx_casais_data_ecc ON public.casais(data_ecc);
```

### Tabela: `tipos_equipes`
Define os tipos de equipes disponíveis no sistema.

```sql
CREATE TABLE public.tipos_equipes (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cor TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0
);
```

**Dados iniciais:**
```sql
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
```

### Tabela: `equipes`
Armazena as equipes organizadas para cada encontro.

```sql
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
```

**Índices:**
```sql
CREATE INDEX idx_equipes_tipo ON public.equipes(tipo_equipe_id);
CREATE INDEX idx_equipes_coordenador ON public.equipes(coordenador_casal_id);
CREATE INDEX idx_equipes_ativa ON public.equipes(ativa);
```

### Tabela: `equipe_membros`
Relaciona casais com suas respectivas equipes.

```sql
CREATE TABLE public.equipe_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  posicao TEXT DEFAULT 'membro',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, casal_id)
);
```

**Índices:**
```sql
CREATE INDEX idx_equipe_membros_equipe ON public.equipe_membros(equipe_id);
CREATE INDEX idx_equipe_membros_casal ON public.equipe_membros(casal_id);
```

### Tabela: `encontros`
Armazena informações sobre os encontros organizados.

```sql
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
```

**Índices:**
```sql
CREATE INDEX idx_encontros_data_inicio ON public.encontros(data_inicio);
CREATE INDEX idx_encontros_status ON public.encontros(status);
CREATE INDEX idx_encontros_etapa ON public.encontros(etapa);
```

## Relacionamentos

### Diagrama de Relacionamentos
```
casais (1) ←→ (N) equipe_membros (N) ←→ (1) equipes
casais (1) ←→ (N) equipes [coordenador]
tipos_equipes (1) ←→ (N) equipes
```

## Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado para controle de acesso:

### Políticas para Visualização (SELECT)
```sql
-- Dados visíveis para todos (sistema comunitário)
CREATE POLICY "Casais são visíveis para todos" ON public.casais FOR SELECT USING (true);
CREATE POLICY "Tipos de equipes são visíveis para todos" ON public.tipos_equipes FOR SELECT USING (true);
CREATE POLICY "Equipes são visíveis para todos" ON public.equipes FOR SELECT USING (true);
CREATE POLICY "Membros das equipes são visíveis para todos" ON public.equipe_membros FOR SELECT USING (true);
CREATE POLICY "Encontros são visíveis para todos" ON public.encontros FOR SELECT USING (true);
```

### Políticas para Modificação (INSERT/UPDATE/DELETE)
```sql
-- Apenas usuários autenticados podem modificar dados
CREATE POLICY "Usuários autenticados podem inserir casais" ON public.casais FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem atualizar casais" ON public.casais FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuários autenticados podem deletar casais" ON public.casais FOR DELETE USING (auth.uid() IS NOT NULL);

-- Mesmo padrão para outras tabelas...
```

## Funções e Triggers

### Função para Atualização Automática de Timestamps
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
```

### Triggers para Timestamps
```sql
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
```

## Consultas Importantes

### Buscar Casais com Equipes
```sql
SELECT 
  c.*,
  e.nome as equipe_nome,
  te.nome as tipo_equipe,
  em.posicao
FROM casais c
LEFT JOIN equipe_membros em ON c.id = em.casal_id
LEFT JOIN equipes e ON em.equipe_id = e.id
LEFT JOIN tipos_equipes te ON e.tipo_equipe_id = te.id
ORDER BY c.numero_inscricao;
```

### Organograma Completo
```sql
WITH equipe_info AS (
  SELECT 
    e.id,
    e.nome,
    te.nome as tipo,
    te.cor,
    te.ordem,
    -- Coordenador
    cc.nome_ele as coord_nome_ele,
    cc.nome_ela as coord_nome_ela,
    cc.numero_inscricao as coord_numero,
    -- Membros
    COUNT(em.id) as total_membros
  FROM equipes e
  LEFT JOIN tipos_equipes te ON e.tipo_equipe_id = te.id
  LEFT JOIN casais cc ON e.coordenador_casal_id = cc.id
  LEFT JOIN equipe_membros em ON e.id = em.equipe_id
  WHERE e.ativa = true
  GROUP BY e.id, e.nome, te.nome, te.cor, te.ordem, cc.nome_ele, cc.nome_ela, cc.numero_inscricao
)
SELECT * FROM equipe_info ORDER BY ordem;
```

### Aniversariantes do Mês
```sql
SELECT 
  c.nome_ele,
  c.nome_ela,
  c.numero_inscricao,
  c.paroquia,
  EXTRACT(DAY FROM c.data_nascimento_ele) as dia_aniv_ele,
  EXTRACT(DAY FROM c.data_nascimento_ela) as dia_aniv_ela
FROM casais c
WHERE 
  EXTRACT(MONTH FROM c.data_nascimento_ele) = EXTRACT(MONTH FROM CURRENT_DATE)
  OR EXTRACT(MONTH FROM c.data_nascimento_ela) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY 
  LEAST(
    EXTRACT(DAY FROM c.data_nascimento_ele),
    EXTRACT(DAY FROM c.data_nascimento_ela)
  );
```

### Estatísticas Gerais
```sql
WITH stats AS (
  SELECT 
    COUNT(*) as total_casais,
    COUNT(DISTINCT paroquia) as total_paroquias,
    COUNT(DISTINCT comunidade) as total_comunidades
  FROM casais
),
equipe_stats AS (
  SELECT COUNT(*) as total_equipes_ativas
  FROM equipes WHERE ativa = true
),
proximo_encontro AS (
  SELECT 
    nome,
    data_inicio,
    local,
    casais_inscritos
  FROM encontros 
  WHERE data_inicio >= CURRENT_DATE
  ORDER BY data_inicio 
  LIMIT 1
)
SELECT 
  s.*,
  es.total_equipes_ativas,
  pe.nome as proximo_encontro_nome,
  pe.data_inicio as proximo_encontro_data,
  pe.local as proximo_encontro_local,
  pe.casais_inscritos as proximo_encontro_inscritos
FROM stats s
CROSS JOIN equipe_stats es
LEFT JOIN proximo_encontro pe ON true;
```

## Migração do Supabase para PostgreSQL Local

### 1. Exportar Dados do Supabase
```bash
# Usando pg_dump (se tiver acesso direto)
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" > supabase_backup.sql

# Ou usando a API do Supabase para extrair dados
curl -X GET 'https://[PROJECT_REF].supabase.co/rest/v1/casais' \
  -H "apikey: [ANON_KEY]" \
  -H "Authorization: Bearer [JWT_TOKEN]" > casais.json
```

### 2. Criar Banco Local
```bash
# Criar banco
createdb sistema_ecc

# Executar schema
psql -d sistema_ecc -f schema.sql

# Importar dados
psql -d sistema_ecc -f supabase_backup.sql
```

### 3. Script de Migração de Dados
```sql
-- Exemplo de inserção de dados migrados
INSERT INTO casais (
  numero_inscricao, nome_ele, religiao_ele, contato_ele,
  nome_ela, religiao_ela, contato_ela, paroquia, comunidade,
  bairro, endereco, ecc_primeira_etapa, data_ecc, local_ecc
) VALUES 
  (1, 'Vando José de Amorim', 'Católico', '999051789',
   'Elizangela Silva de S. Amorim', 'Católica', '999861218',
   'Santo Antônio', 'Santa Rita de Cassia', 'Santa Rita do Zarur',
   'Rua Cruzeiro nº 95', 'VII', '2022-09-22', 'Ciep Gloria Roussin'),
  -- ... outros registros
ON CONFLICT (numero_inscricao) DO UPDATE SET
  nome_ele = EXCLUDED.nome_ele,
  nome_ela = EXCLUDED.nome_ela;
```

## Backup e Restauração

### Backup Completo
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U ecc_user -d sistema_ecc > backup_ecc_$DATE.sql
```

### Backup por Tabela
```bash
pg_dump -h localhost -U ecc_user -d sistema_ecc -t casais > backup_casais_$DATE.sql
pg_dump -h localhost -U ecc_user -d sistema_ecc -t equipes > backup_equipes_$DATE.sql
```

### Restauração
```bash
# Restaurar backup completo
psql -h localhost -U ecc_user -d sistema_ecc < backup_ecc_20241220_140000.sql

# Restaurar tabela específica
psql -h localhost -U ecc_user -d sistema_ecc < backup_casais_20241220_140000.sql
```

## Otimização de Performance

### Análise de Consultas
```sql
-- Habilitar log de consultas lentas
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analisar plano de execução
EXPLAIN ANALYZE SELECT * FROM casais WHERE paroquia = 'Santo Antônio';

-- Estatísticas de uso de índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### Índices Recomendados
```sql
-- Para buscas frequentes
CREATE INDEX CONCURRENTLY idx_casais_paroquia_comunidade ON casais(paroquia, comunidade);
CREATE INDEX CONCURRENTLY idx_casais_data_nascimento ON casais(data_nascimento_ele, data_nascimento_ela);

-- Para relatórios
CREATE INDEX CONCURRENTLY idx_casais_ecc_data ON casais(ecc_primeira_etapa, data_ecc);
```

## Monitoramento

### Consultas de Monitoramento
```sql
-- Tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Atividade atual
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Segurança

### Configurações Recomendadas
```sql
-- Criar usuário específico para aplicação
CREATE USER app_ecc WITH PASSWORD 'senha_forte_aqui';
GRANT CONNECT ON DATABASE sistema_ecc TO app_ecc;
GRANT USAGE ON SCHEMA public TO app_ecc;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_ecc;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_ecc;

-- Revogar privilégios desnecessários
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

### Auditoria
```sql
-- Criar tabela de log de auditoria
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Função de auditoria (exemplo para tabela casais)
CREATE OR REPLACE FUNCTION audit_casais_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name, operation, old_values, user_id)
    VALUES ('casais', TG_OP, row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(table_name, operation, old_values, new_values, user_id)
    VALUES ('casais', TG_OP, row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, operation, new_values, user_id)
    VALUES ('casais', TG_OP, row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger de auditoria
CREATE TRIGGER casais_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON casais
  FOR EACH ROW EXECUTE FUNCTION audit_casais_changes();
```

## Considerações Finais

1. **Performance**: Monitore regularmente o desempenho das consultas
2. **Backup**: Configure backups automáticos diários
3. **Segurança**: Use conexões SSL e senhas fortes
4. **Manutenção**: Execute VACUUM e ANALYZE periodicamente
5. **Monitoramento**: Configure alertas para problemas de performance

Para mais informações ou suporte, consulte a documentação oficial do PostgreSQL ou entre em contato com a equipe de desenvolvimento.