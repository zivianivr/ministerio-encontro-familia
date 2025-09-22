# Sistema ECC - Instalação Completa Ubuntu Server 22.04

## Visão Geral
Este é o Sistema de Gerenciamento de Encontros de Casais com Cristo (ECC) das Paróquias Santo Antônio e São Sebastião. Sistema desenvolvido em React com TypeScript, utilizando PostgreSQL como banco de dados local.

## Arquitetura do Sistema

### Frontend
- React 18.3+ com TypeScript
- Vite como bundler
- Tailwind CSS para estilização
- Shadcn/ui para componentes
- React Router para navegação
- Supabase JS para cliente de banco

### Backend
- PostgreSQL 15+ como banco principal
- Nginx como proxy reverso
- PM2 para gerenciamento de processos
- Node.js 18+ para runtime

### Funcionalidades Principais
- ✅ Autenticação de usuários com roles
- ✅ Cadastro e gerenciamento de casais
- ✅ Sistema de equipes com organograma visual
- ✅ Aniversariantes com filtros por período
- ✅ Dashboard com estatísticas em tempo real
- ✅ Upload e importação de planilhas Excel
- ✅ Sistema de permissões (admin/usuário)
- ✅ Backup automático do banco de dados

## Pré-requisitos do Sistema

### Hardware Mínimo
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Rede: 100Mbps

### Software Base
- Ubuntu Server 22.04 LTS (fresh install)
- Acesso root ou sudo
- Conexão estável com a internet

## 1. Preparação Inicial do Servidor

### 1.1 Atualizar Sistema
```bash
# Atualizar lista de pacotes
sudo apt update && sudo apt upgrade -y

# Instalar ferramentas essenciais
sudo apt install -y curl wget git build-essential software-properties-common \
  ufw htop nano vim unzip zip tree
```

### 1.2 Configurar Timezone
```bash
sudo timedatectl set-timezone America/Sao_Paulo
timedatectl status
```

### 1.3 Configurar Usuário para Aplicação
```bash
# Criar usuário específico para a aplicação
sudo adduser ecc-app
sudo usermod -aG sudo ecc-app

# Mudar para o usuário da aplicação
su - ecc-app
```

## 2. Instalação do Node.js 18+

### 2.1 Instalar via NodeSource Repository
```bash
# Adicionar repositório oficial do Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # deve retornar v18.x.x
npm --version   # deve retornar 9.x.x ou superior

# Instalar Yarn (opcional, mas recomendado)
sudo npm install -g yarn
```

### 2.2 Configurar npm para usuário
```bash
# Configurar diretório global do npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Adicionar ao PATH (adicionar no ~/.bashrc também)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 3. Instalação e Configuração PostgreSQL

### 3.1 Instalar PostgreSQL 15
```bash
# Adicionar repositório oficial PostgreSQL
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Atualizar e instalar
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Verificar instalação
sudo systemctl status postgresql
```

### 3.2 Configurar PostgreSQL
```bash
# Configurar senha do usuário postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'sua_senha_postgres_forte';"

# Criar banco e usuário para aplicação
sudo -u postgres psql << EOF
CREATE USER ecc_user WITH PASSWORD 'senha_ecc_user_forte';
CREATE DATABASE ecc_sistema OWNER ecc_user;
GRANT ALL PRIVILEGES ON DATABASE ecc_sistema TO ecc_user;
GRANT ALL ON SCHEMA public TO ecc_user;
ALTER DATABASE ecc_sistema SET timezone TO 'America/Sao_Paulo';
\q
EOF
```

### 3.3 Configurar Arquivo de Configuração PostgreSQL
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Configurações recomendadas (adicionar/modificar):
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 3.4 Configurar Autenticação
```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Adicionar/modificar as linhas:
local   all             postgres                                md5
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

## 4. Instalação do Nginx

### 4.1 Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar status
sudo systemctl status nginx
```

### 4.2 Configuração Básica de Segurança
```bash
# Backup da configuração padrão
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Editar configuração principal
sudo nano /etc/nginx/nginx.conf

# Adicionar dentro do bloco http {}:
server_tokens off;
client_max_body_size 50M;
```

## 5. Configuração do Firewall UFW

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (IMPORTANTE fazer antes de habilitar!)
sudo ufw allow OpenSSH

# Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'

# Permitir acesso ao PostgreSQL apenas local (opcional)
sudo ufw allow from 127.0.0.1 to any port 5432

# Verificar status
sudo ufw status verbose
```

## 6. Instalação do PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Configurar inicialização automática
pm2 startup
# Executar o comando que o PM2 sugerir (sudo env PATH=$PATH...)

# Verificar instalação
pm2 --version
```

## 7. Clonagem e Configuração da Aplicação

### 7.1 Clonar Repositório
```bash
# Navegar para diretório de aplicações
cd /home/ecc-app

# Clonar o repositório
git clone https://github.com/seu-usuario/sistema-ecc.git
cd sistema-ecc

# Verificar se está na branch correta
git branch -a
```

### 7.2 Instalar Dependências
```bash
# Instalar dependências do projeto
npm install

# Ou usando Yarn (se preferir)
yarn install
```

### 7.3 Configurar Variáveis de Ambiente
```bash
# Criar arquivo de ambiente
cp .env.example .env
nano .env

# Configurar variáveis (exemplo):
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://ecc_user:senha_ecc_user_forte@localhost:5432/ecc_sistema"
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=uma_chave_secreta_muito_forte_aqui
```

## 8. Configuração do Banco de Dados

### 8.1 Executar Migrações do Schema
```bash
# Navegar para pasta de scripts SQL
cd /home/ecc-app/sistema-ecc

# Executar script de criação das tabelas
psql -h localhost -U ecc_user -d ecc_sistema -f database/schema.sql

# Se houver dados iniciais (seeds)
psql -h localhost -U ecc_user -d ecc_sistema -f database/seeds.sql
```

### 8.2 Script Completo do Banco (schema.sql)
```sql
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de casais
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

-- Tabela de tipos de equipes
CREATE TABLE public.tipos_equipes (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cor TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0
);

-- Inserir tipos de equipes padrão
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

-- Tabela de equipes
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

-- Tabela de membros das equipes
CREATE TABLE public.equipe_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  posicao TEXT DEFAULT 'membro',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, casal_id)
);

-- Tabela de encontros
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

-- Tabela de usuários do sistema
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de sessões de usuários
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de importações de planilhas
CREATE TABLE public.importacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  status TEXT DEFAULT 'processando' CHECK (status IN ('processando', 'concluida', 'erro')),
  total_registros INTEGER DEFAULT 0,
  registros_processados INTEGER DEFAULT 0,
  erros JSONB,
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_casais_numero_inscricao ON public.casais(numero_inscricao);
CREATE INDEX idx_casais_paroquia ON public.casais(paroquia);
CREATE INDEX idx_casais_nome_ele ON public.casais(nome_ele);
CREATE INDEX idx_casais_data_nascimento_ele ON public.casais(data_nascimento_ele);
CREATE INDEX idx_casais_data_nascimento_ela ON public.casais(data_nascimento_ela);

CREATE INDEX idx_equipes_tipo ON public.equipes(tipo_equipe_id);
CREATE INDEX idx_equipes_coordenador ON public.equipes(coordenador_casal_id);
CREATE INDEX idx_equipes_ativa ON public.equipes(ativa);

CREATE INDEX idx_equipe_membros_equipe ON public.equipe_membros(equipe_id);
CREATE INDEX idx_equipe_membros_casal ON public.equipe_membros(casal_id);

CREATE INDEX idx_encontros_data_inicio ON public.encontros(data_inicio);
CREATE INDEX idx_encontros_status ON public.encontros(status);

CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_casais_updated_at
  BEFORE UPDATE ON public.casais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipes_updated_at
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encontros_updated_at
  BEFORE UPDATE ON public.encontros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário administrador padrão
INSERT INTO public.usuarios (nome, email, senha_hash, role) VALUES 
('Administrador', 'admin@sistema-ecc.com', crypt('admin123456', gen_salt('bf')), 'admin');
```

## 9. Build da Aplicação

### 9.1 Executar Build de Produção
```bash
cd /home/ecc-app/sistema-ecc

# Executar build
npm run build

# Verificar se foi gerado corretamente
ls -la dist/
```

### 9.2 Configurar PM2
```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js

# Conteúdo do arquivo:
module.exports = {
  apps: [{
    name: 'sistema-ecc',
    script: 'npm',
    args: 'start',
    cwd: '/home/ecc-app/sistema-ecc',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/ecc-app/logs/ecc-error.log',
    out_file: '/home/ecc-app/logs/ecc-out.log',
    log_file: '/home/ecc-app/logs/ecc-combined.log',
    time: true
  }]
};

# Criar diretório de logs
mkdir -p /home/ecc-app/logs

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
```

## 10. Configuração do Nginx

### 10.1 Criar Configuração do Site
```bash
sudo nano /etc/nginx/sites-available/sistema-ecc

# Conteúdo do arquivo:
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Logs
    access_log /var/log/nginx/sistema-ecc.access.log;
    error_log /var/log/nginx/sistema-ecc.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Servir arquivos estáticos
    location /assets {
        alias /home/ecc-app/sistema-ecc/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Servir outros arquivos estáticos
    location /static {
        alias /home/ecc-app/sistema-ecc/dist/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Favicon e robots.txt
    location = /favicon.ico {
        alias /home/ecc-app/sistema-ecc/dist/favicon.ico;
        expires 1y;
        access_log off;
    }

    location = /robots.txt {
        alias /home/ecc-app/sistema-ecc/dist/robots.txt;
        access_log off;
    }

    # Upload de arquivos
    location /uploads {
        client_max_body_size 50M;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Proxy para aplicação Node.js
    location / {
        try_files $uri $uri/ @proxy;
    }

    location @proxy {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Rate limiting
    location /api {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configurações globais no nginx.conf
http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # ... resto da configuração
}
```

### 10.2 Ativar Site
```bash
# Testar configuração
sudo nginx -t

# Ativar site
sudo ln -s /etc/nginx/sites-available/sistema-ecc /etc/nginx/sites-enabled/

# Desabilitar site padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Recarregar nginx
sudo systemctl reload nginx
```

## 11. SSL com Let's Encrypt (Recomendado)

### 11.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 11.2 Obter Certificado SSL
```bash
# Obter certificado SSL (substitua pelo seu domínio)
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### 11.3 Configurar Renovação Automática
```bash
# Adicionar cron job para renovação
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 12. Scripts de Backup Automático

### 12.1 Criar Script de Backup
```bash
sudo mkdir -p /opt/scripts
sudo nano /opt/scripts/backup-sistema-ecc.sh

# Conteúdo do script:
#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/sistema-ecc"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ecc_sistema"
DB_USER="ecc_user"
APP_DIR="/home/ecc-app/sistema-ecc"
RETENTION_DAYS=7

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
echo "$(date): Iniciando backup do banco de dados..."
PGPASSWORD="senha_ecc_user_forte" pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo "$(date): Backup do banco concluído com sucesso"
    
    # Comprimir backup do banco
    gzip $BACKUP_DIR/db_backup_$DATE.sql
else
    echo "$(date): ERRO no backup do banco de dados"
    exit 1
fi

# Backup dos arquivos da aplicação
echo "$(date): Iniciando backup dos arquivos..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $(dirname $APP_DIR) $(basename $APP_DIR) \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='logs'

if [ $? -eq 0 ]; then
    echo "$(date): Backup dos arquivos concluído com sucesso"
else
    echo "$(date): ERRO no backup dos arquivos"
fi

# Backup dos logs do PM2
mkdir -p $BACKUP_DIR/logs
cp /home/ecc-app/logs/*.log $BACKUP_DIR/logs/ 2>/dev/null

# Limpeza de backups antigos
echo "$(date): Removendo backups antigos (mais de $RETENTION_DAYS dias)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Relatório do backup
echo "$(date): Backup concluído!"
echo "Espaço usado em $BACKUP_DIR:"
du -sh $BACKUP_DIR/*

# Enviar log para syslog
logger "Sistema ECC: Backup concluído - $DATE"
```

### 12.2 Tornar Script Executável e Agendar
```bash
# Tornar executável
sudo chmod +x /opt/scripts/backup-sistema-ecc.sh

# Testar script
sudo /opt/scripts/backup-sistema-ecc.sh

# Agendar execução diária às 2h
sudo crontab -e

# Adicionar linha:
0 2 * * * /opt/scripts/backup-sistema-ecc.sh >> /var/log/backup-ecc.log 2>&1
```

### 12.3 Script de Restauração
```bash
sudo nano /opt/scripts/restore-sistema-ecc.sh

# Conteúdo:
#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Uso: $0 <data_backup_YYYYMMDD_HHMMSS>"
    echo "Exemplo: $0 20241220_140000"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="/var/backups/sistema-ecc"
DB_NAME="ecc_sistema"
DB_USER="ecc_user"

echo "ATENÇÃO: Este script irá SOBRESCREVER os dados atuais!"
echo "Backup selecionado: $BACKUP_DATE"
read -p "Tem certeza? (digite 'CONFIRMO'): " confirmacao

if [ "$confirmacao" != "CONFIRMO" ]; then
    echo "Operação cancelada."
    exit 1
fi

# Parar aplicação
pm2 stop sistema-ecc

# Restaurar banco de dados
if [ -f "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz" ]; then
    echo "Restaurando banco de dados..."
    
    # Criar backup do estado atual antes de restaurar
    PGPASSWORD="senha_ecc_user_forte" pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_before_restore_$(date +%Y%m%d_%H%M%S).sql
    
    # Dropar e recriar banco
    PGPASSWORD="senha_ecc_user_forte" dropdb -h localhost -U $DB_USER $DB_NAME
    PGPASSWORD="senha_ecc_user_forte" createdb -h localhost -U $DB_USER $DB_NAME
    
    # Restaurar backup
    gunzip -c $BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz | PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U $DB_USER $DB_NAME
    
    echo "Banco de dados restaurado!"
else
    echo "ERRO: Arquivo de backup do banco não encontrado!"
    exit 1
fi

# Restaurar arquivos da aplicação
if [ -f "$BACKUP_DIR/app_backup_$BACKUP_DATE.tar.gz" ]; then
    echo "Restaurando arquivos da aplicação..."
    
    # Backup do estado atual
    tar -czf $BACKUP_DIR/app_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz -C /home/ecc-app sistema-ecc
    
    # Restaurar backup
    cd /home/ecc-app
    rm -rf sistema-ecc.old
    mv sistema-ecc sistema-ecc.old 2>/dev/null
    
    tar -xzf $BACKUP_DIR/app_backup_$BACKUP_DATE.tar.gz
    
    # Reinstalar dependências
    cd sistema-ecc
    npm install
    npm run build
    
    echo "Arquivos da aplicação restaurados!"
else
    echo "AVISO: Arquivo de backup da aplicação não encontrado, mantendo versão atual."
fi

# Reiniciar aplicação
pm2 restart sistema-ecc

echo "Restauração concluída!"
logger "Sistema ECC: Restauração concluída - backup $BACKUP_DATE"

# Tornar executável
sudo chmod +x /opt/scripts/restore-sistema-ecc.sh
```

## 13. Monitoramento e Logs

### 13.1 Configurar Logrotate
```bash
sudo nano /etc/logrotate.d/sistema-ecc

# Conteúdo:
/home/ecc-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ecc-app ecc-app
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/sistema-ecc.*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        systemctl reload nginx
    endscript
}
```

### 13.2 Script de Monitoramento
```bash
sudo nano /opt/scripts/monitor-sistema-ecc.sh

# Conteúdo:
#!/bin/bash

# Função para enviar notificação (adaptar conforme necessário)
send_alert() {
    local message="$1"
    echo "$(date): ALERTA - $message" >> /var/log/monitor-ecc.log
    logger "Sistema ECC ALERTA: $message"
    
    # Exemplo: enviar email (configurar postfix/sendmail se necessário)
    # echo "$message" | mail -s "Sistema ECC - Alerta" admin@empresa.com
}

# Verificar se aplicação está rodando
if ! pm2 list | grep -q "sistema-ecc.*online"; then
    send_alert "Aplicação Sistema ECC não está rodando!"
    pm2 restart sistema-ecc
fi

# Verificar se PostgreSQL está rodando
if ! systemctl is-active --quiet postgresql; then
    send_alert "PostgreSQL não está rodando!"
    sudo systemctl start postgresql
fi

# Verificar se Nginx está rodando
if ! systemctl is-active --quiet nginx; then
    send_alert "Nginx não está rodando!"
    sudo systemctl start nginx
fi

# Verificar espaço em disco
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 85 ]; then
    send_alert "Espaço em disco baixo: ${disk_usage}%"
fi

# Verificar uso de memória
mem_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$mem_usage > 90" | bc -l) )); then
    send_alert "Uso de memória alto: ${mem_usage}%"
fi

# Verificar conexões do banco de dados
db_connections=$(PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user -d ecc_sistema -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'ecc_sistema';" | xargs)
if [ $db_connections -gt 80 ]; then
    send_alert "Muitas conexões no banco: $db_connections"
fi

# Verificar se site responde
if ! curl -f -s http://localhost:3000 > /dev/null; then
    send_alert "Site não está respondendo na porta 3000!"
fi

# Tornar executável
sudo chmod +x /opt/scripts/monitor-sistema-ecc.sh

# Agendar execução a cada 5 minutos
sudo crontab -e
# Adicionar:
*/5 * * * * /opt/scripts/monitor-sistema-ecc.sh
```

### 13.3 Dashboard de Status
```bash
sudo nano /opt/scripts/status-sistema-ecc.sh

# Conteúdo:
#!/bin/bash

echo "=========================================="
echo "      SISTEMA ECC - STATUS GERAL"
echo "=========================================="
echo "Data/Hora: $(date)"
echo ""

# Status dos serviços
echo "=== SERVIÇOS ==="
echo -n "PostgreSQL: "
systemctl is-active --quiet postgresql && echo "✅ ATIVO" || echo "❌ INATIVO"

echo -n "Nginx: "
systemctl is-active --quiet nginx && echo "✅ ATIVO" || echo "❌ INATIVO"

echo -n "Sistema ECC: "
pm2 list | grep -q "sistema-ecc.*online" && echo "✅ ATIVO" || echo "❌ INATIVO"

echo ""

# Status do sistema
echo "=== RECURSOS DO SISTEMA ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')%"
echo "Memory Usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"

echo ""

# Status do banco de dados
echo "=== BANCO DE DADOS ==="
db_size=$(PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user -d ecc_sistema -t -c "SELECT pg_size_pretty(pg_database_size('ecc_sistema'));" | xargs)
echo "Tamanho do banco: $db_size"

db_connections=$(PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user -d ecc_sistema -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'ecc_sistema';" | xargs)
echo "Conexões ativas: $db_connections"

# Estatísticas da aplicação
echo ""
echo "=== APLICAÇÃO ==="
echo "PM2 Status:"
pm2 jlist | jq -r '.[] | select(.name=="sistema-ecc") | "PID: \(.pid) | Status: \(.pm2_env.status) | CPU: \(.monit.cpu)% | Memory: \(.monit.memory/1024/1024|floor)MB"'

echo ""

# Últimos logs
echo "=== ÚLTIMOS LOGS (últimas 5 linhas) ==="
echo "Sistema ECC:"
tail -n 5 /home/ecc-app/logs/ecc-combined.log 2>/dev/null || echo "Nenhum log disponível"

echo ""
echo "Nginx Access:"
tail -n 3 /var/log/nginx/sistema-ecc.access.log 2>/dev/null || echo "Nenhum log disponível"

echo ""
echo "=========================================="

# Tornar executável
sudo chmod +x /opt/scripts/status-sistema-ecc.sh

# Criar alias para fácil acesso
echo "alias ecc-status='/opt/scripts/status-sistema-ecc.sh'" >> ~/.bashrc
```

## 14. Atualizações e Manutenção

### 14.1 Script de Atualização
```bash
sudo nano /opt/scripts/update-sistema-ecc.sh

# Conteúdo:
#!/bin/bash

echo "=========================================="
echo "      SISTEMA ECC - ATUALIZAÇÃO"
echo "=========================================="

APP_DIR="/home/ecc-app/sistema-ecc"
BACKUP_DIR="/var/backups/sistema-ecc"

# Fazer backup antes da atualização
echo "1. Fazendo backup antes da atualização..."
/opt/scripts/backup-sistema-ecc.sh

# Parar aplicação
echo "2. Parando aplicação..."
pm2 stop sistema-ecc

# Atualizar código
echo "3. Atualizando código..."
cd $APP_DIR

# Fazer stash de mudanças locais (se houver)
git stash

# Pull das atualizações
git pull origin main

if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao atualizar código do repositório!"
    git stash pop 2>/dev/null
    pm2 start sistema-ecc
    exit 1
fi

# Instalar/atualizar dependências
echo "4. Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "ERRO: Falha na instalação das dependências!"
    exit 1
fi

# Executar build
echo "5. Executando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERRO: Falha no build da aplicação!"
    exit 1
fi

# Executar migrações de banco (se houver)
echo "6. Verificando migrações de banco..."
if [ -f "database/migrations.sql" ]; then
    echo "Executando migrações..."
    PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user -d ecc_sistema -f database/migrations.sql
fi

# Reiniciar aplicação
echo "7. Reiniciando aplicação..."
pm2 restart sistema-ecc

# Aguardar aplicação subir
sleep 10

# Verificar se está funcionando
echo "8. Verificando funcionamento..."
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Atualização concluída com sucesso!"
    
    # Recarregar nginx (por precaução)
    sudo systemctl reload nginx
    
    logger "Sistema ECC: Atualização concluída com sucesso"
else
    echo "❌ ERRO: Sistema não está respondendo após atualização!"
    echo "Tentando restaurar backup..."
    
    # Aqui você poderia implementar rollback automático
    pm2 restart sistema-ecc
    
    logger "Sistema ECC: ERRO na atualização - sistema não responde"
    exit 1
fi

echo "=========================================="

# Tornar executável
sudo chmod +x /opt/scripts/update-sistema-ecc.sh
```

### 14.2 Manutenção do Banco de Dados
```bash
sudo nano /opt/scripts/maintenance-db.sh

# Conteúdo:
#!/bin/bash

echo "Iniciando manutenção do banco de dados..."

# Executar VACUUM e ANALYZE
PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user -d ecc_sistema << EOF
-- Vacuum completo
VACUUM FULL;

-- Analyze para atualizar estatísticas
ANALYZE;

-- Reindex para otimizar índices
REINDEX DATABASE ecc_sistema;

-- Estatísticas das tabelas
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, last_vacuum, last_analyze 
FROM pg_stat_user_tables 
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;

EOF

echo "Manutenção do banco concluída!"

# Tornar executável
sudo chmod +x /opt/scripts/maintenance-db.sh

# Agendar para execução semanal
sudo crontab -e
# Adicionar:
0 3 * * 0 /opt/scripts/maintenance-db.sh >> /var/log/maintenance-ecc.log 2>&1
```

## 15. Troubleshooting e Resolução de Problemas

### 15.1 Problemas Comuns

#### Aplicação não inicia
```bash
# Verificar logs do PM2
pm2 logs sistema-ecc

# Verificar se as dependências estão instaladas
cd /home/ecc-app/sistema-ecc
npm list --depth=0

# Verificar variáveis de ambiente
cat .env

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### Banco de dados não conecta
```bash
# Testar conexão manual
PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user -d ecc_sistema -c "\l"

# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Verificar configuração pg_hba.conf
sudo cat /etc/postgresql/15/main/pg_hba.conf
```

#### Nginx retorna erro 502/504
```bash
# Verificar se aplicação está rodando na porta correta
netstat -tlnp | grep :3000

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/sistema-ecc.error.log

# Testar configuração do Nginx
sudo nginx -t

# Verificar conectividade
curl -v http://localhost:3000
```

#### Alta utilização de recursos
```bash
# Verificar processos
htop

# Verificar uso de disco
df -h
du -sh /home/ecc-app/sistema-ecc/*

# Verificar logs grandes
find /home/ecc-app/logs -name "*.log" -size +100M

# Limpar logs antigos
pm2 flush
sudo logrotate -f /etc/logrotate.d/sistema-ecc
```

### 15.2 Comandos Úteis

```bash
# Status completo do sistema
/opt/scripts/status-sistema-ecc.sh

# Reiniciar todos os serviços
sudo systemctl restart postgresql nginx
pm2 restart all

# Backup manual
/opt/scripts/backup-sistema-ecc.sh

# Verificar espaço em disco
df -h
du -sh /var/backups/sistema-ecc

# Ver logs em tempo real
pm2 logs sistema-ecc --lines 50
tail -f /var/log/nginx/sistema-ecc.access.log

# Teste de performance
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000"

# Onde curl-format.txt contém:
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### 15.3 Recuperação de Desastres

#### Perda de dados do banco
```bash
# Parar aplicação
pm2 stop sistema-ecc

# Listar backups disponíveis
ls -la /var/backups/sistema-ecc/db_backup_*.sql.gz

# Restaurar backup mais recente
latest_backup=$(ls -t /var/backups/sistema-ecc/db_backup_*.sql.gz | head -1)
echo "Restaurando: $latest_backup"

# Criar backup do estado atual (se possível)
PGPASSWORD="senha_ecc_user_forte" pg_dump -h localhost -U ecc_user ecc_sistema > /tmp/backup_before_restore.sql

# Restaurar
gunzip -c $latest_backup | PGPASSWORD="senha_ecc_user_forte" psql -h localhost -U ecc_user ecc_sistema

# Reiniciar aplicação
pm2 start sistema-ecc
```

#### Corrupção de arquivos da aplicação
```bash
# Clonar repositório novamente
cd /home/ecc-app
mv sistema-ecc sistema-ecc.corrupted
git clone https://github.com/seu-usuario/sistema-ecc.git

# Copiar configurações
cp sistema-ecc.corrupted/.env sistema-ecc/
cp -r sistema-ecc.corrupted/uploads sistema-ecc/ 2>/dev/null

# Instalar e iniciar
cd sistema-ecc
npm install
npm run build
pm2 restart sistema-ecc
```

## 16. Segurança Adicional

### 16.1 Fail2Ban
```bash
# Instalar fail2ban
sudo apt install -y fail2ban

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local

# Conteúdo:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/sistema-ecc.error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/sistema-ecc.error.log
maxretry = 10

# Iniciar fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verificar status
sudo fail2ban-client status
```

### 16.2 Configurações adicionais de SSH
```bash
# Editar configuração SSH
sudo nano /etc/ssh/sshd_config

# Modificações recomendadas:
Port 2222  # Mudar porta padrão
PermitRootLogin no
PasswordAuthentication no  # Apenas se tiver chaves SSH configuradas
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# Reiniciar SSH
sudo systemctl restart sshd

# Atualizar firewall para nova porta
sudo ufw delete allow OpenSSH
sudo ufw allow 2222/tcp
```

### 16.3 Configurar HTTPS obrigatório
```bash
# Editar configuração do Nginx para redirecionar HTTP para HTTPS
sudo nano /etc/nginx/sites-available/sistema-ecc

# Adicionar no topo:
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

## 17. Checklist Pós-Instalação

### ✅ Verificações Obrigatórias

1. **Serviços rodando:**
   - [ ] PostgreSQL ativo e acessível
   - [ ] Aplicação Node.js rodando na porta 3000
   - [ ] Nginx rodando na porta 80/443
   - [ ] PM2 configurado e salvando processos

2. **Conectividade:**
   - [ ] Site acessível via HTTP
   - [ ] SSL configurado corretamente (se aplicável)
   - [ ] Banco de dados conectando corretamente

3. **Funcionalidades:**
   - [ ] Login de administrador funcionando
   - [ ] CRUD de casais funcionando
   - [ ] Upload de planilhas funcionando
   - [ ] Dashboard carregando dados
   - [ ] Aniversariantes sendo exibidos

4. **Backups:**
   - [ ] Script de backup executando
   - [ ] Cron jobs configurados
   - [ ] Teste de restauração realizado

5. **Segurança:**
   - [ ] Firewall configurado
   - [ ] Fail2ban instalado
   - [ ] Senhas fortes definidas
   - [ ] SSH endurecido

6. **Monitoramento:**
   - [ ] Scripts de monitoramento funcionando
   - [ ] Logs sendo rotacionados
   - [ ] Alertas configurados

### 📋 Informações Importantes para Documentar

- **URLs de Acesso:** http://seu-dominio.com
- **Usuário Admin:** admin@sistema-ecc.com / admin123456 (MUDAR APÓS PRIMEIRO LOGIN!)
- **Localização Backups:** /var/backups/sistema-ecc
- **Logs Aplicação:** /home/ecc-app/logs
- **Logs Sistema:** /var/log/nginx, /var/log/postgresql

### 🔧 Comandos de Manutenção Diária

```bash
# Status completo
/opt/scripts/status-sistema-ecc.sh

# Logs da aplicação
pm2 logs sistema-ecc --lines 50

# Espaço em disco
df -h

# Backup manual (se necessário)
/opt/scripts/backup-sistema-ecc.sh

# Atualizar sistema
/opt/scripts/update-sistema-ecc.sh
```

## 18. Contatos e Suporte

### Informações do Sistema
- **Nome:** Sistema ECC - Paróquias Santo Antônio e São Sebastião
- **Versão:** 1.0.0
- **Documentação:** Este arquivo (INSTALL-UBUNTU.md)
- **Repositório:** https://github.com/seu-usuario/sistema-ecc

### Suporte Técnico
- **Email:** suporte@paroquias-sa-ss.org.br
- **Telefone:** (24) 99999-9999
- **Documentação Online:** [inserir URL se houver]

### Desenvolvedores
- **Desenvolvedor Principal:** [Nome]
- **Email:** [email@exemplo.com]
- **GitHub:** [usuario]

---

**⚠️ IMPORTANTE:**
- Sempre faça backup antes de qualquer manutenção
- Mantenha senhas seguras e atualizadas
- Monitore logs regularmente
- Aplique atualizações de segurança do sistema
- Teste backups periodicamente

**🎯 Este documento deve ser mantido atualizado conforme o sistema evolui.**