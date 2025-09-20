# Sistema ECC - Guia de Instalação Ubuntu Server

## Visão Geral
Este é o Sistema de Gerenciamento de Encontros de Casais com Cristo (ECC) das Paróquias Santo Antônio e São Sebastião. O sistema foi desenvolvido em React com TypeScript e utiliza PostgreSQL como banco de dados.

## Pré-requisitos

### Software necessário:
- Ubuntu Server 20.04 LTS ou superior
- Node.js 18.x ou superior
- PostgreSQL 14 ou superior
- Nginx (para proxy reverso)
- PM2 (para gerenciamento de processo)
- Git

## 1. Preparação do Servidor

### Atualizar o sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar dependências básicas:
```bash
sudo apt install -y curl wget git build-essential software-properties-common
```

## 2. Instalar Node.js

```bash
# Adicionar repositório Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql -c "CREATE USER ecc_user WITH PASSWORD 'sua_senha_segura';"
sudo -u postgres psql -c "CREATE DATABASE ecc_sistema OWNER ecc_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecc_sistema TO ecc_user;"
```

## 4. Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000  # Porta da aplicação (temporário para testes)
sudo ufw --force enable
```

## 5. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 6. Instalar PM2

```bash
sudo npm install -g pm2
```

## 7. Clonar e Configurar o Projeto

### Clonar repositório:
```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/sistema-ecc.git
sudo chown -R $USER:$USER /var/www/sistema-ecc
cd sistema-ecc
```

### Instalar dependências:
```bash
npm install
```

### Configurar variáveis de ambiente:
```bash
cp .env.example .env
nano .env
```

### Conteúdo do arquivo .env:
```env
# Banco de Dados
DATABASE_URL="postgresql://ecc_user:sua_senha_segura@localhost:5432/ecc_sistema"

# Configurações da Aplicação
NODE_ENV=production
PORT=3000

# URLs
VITE_APP_URL=http://seu-dominio.com
```

## 8. Configurar Banco de Dados

### Executar migrações:
```bash
# Se usando Prisma ou similar
npx prisma migrate deploy

# Ou executar scripts SQL manualmente
psql -h localhost -U ecc_user -d ecc_sistema -f database/schema.sql
```

### Inserir dados iniciais:
```bash
psql -h localhost -U ecc_user -d ecc_sistema -f database/seeds.sql
```

## 9. Build da Aplicação

```bash
npm run build
```

## 10. Configurar PM2

### Criar arquivo de configuração PM2:
```bash
nano ecosystem.config.js
```

### Conteúdo do ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'sistema-ecc',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/sistema-ecc',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Iniciar aplicação com PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 11. Configurar Nginx

### Criar configuração do site:
```bash
sudo nano /etc/nginx/sites-available/sistema-ecc
```

### Conteúdo da configuração:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Servir arquivos estáticos
    location /assets {
        alias /var/www/sistema-ecc/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para aplicação Node.js
    location / {
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

    # Logs
    access_log /var/log/nginx/sistema-ecc.access.log;
    error_log /var/log/nginx/sistema-ecc.error.log;
}
```

### Ativar site:
```bash
sudo ln -s /etc/nginx/sites-available/sistema-ecc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 12. SSL com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 13. Backup Automatizado

### Criar script de backup:
```bash
sudo nano /usr/local/bin/backup-ecc.sh
```

### Conteúdo do script:
```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/sistema-ecc"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ecc_sistema"
DB_USER="ecc_user"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C /var/www sistema-ecc

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

### Tornar executável e agendar:
```bash
sudo chmod +x /usr/local/bin/backup-ecc.sh
sudo crontab -e
# Adicionar linha para backup diário às 2h:
# 0 2 * * * /usr/local/bin/backup-ecc.sh
```

## 14. Monitoramento

### Logs da aplicação:
```bash
# Ver logs em tempo real
pm2 logs sistema-ecc

# Logs do Nginx
sudo tail -f /var/log/nginx/sistema-ecc.access.log
sudo tail -f /var/log/nginx/sistema-ecc.error.log

# Status dos serviços
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

## 15. Manutenção

### Atualizar aplicação:
```bash
cd /var/www/sistema-ecc
git pull origin main
npm install
npm run build
pm2 restart sistema-ecc
```

### Reiniciar serviços:
```bash
pm2 restart sistema-ecc
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

## 16. Solução de Problemas

### Verificar portas em uso:
```bash
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :5432
```

### Verificar logs de erro:
```bash
pm2 logs sistema-ecc --err
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

### Permissões de arquivo:
```bash
sudo chown -R $USER:$USER /var/www/sistema-ecc
sudo chmod -R 755 /var/www/sistema-ecc
```

## 17. Segurança Adicional

### Configurar fail2ban:
```bash
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### Desabilitar login root SSH:
```bash
sudo nano /etc/ssh/sshd_config
# Alterar: PermitRootLogin no
sudo systemctl restart ssh
```

## Estrutura de Arquivos

```
/var/www/sistema-ecc/
├── dist/                 # Build da aplicação
├── src/                  # Código fonte
├── database/            # Scripts SQL
├── public/              # Arquivos públicos
├── package.json         # Dependências
├── ecosystem.config.js  # Configuração PM2
└── .env                 # Variáveis de ambiente
```

## Contato e Suporte

Para dúvidas ou problemas:
- Email: suporte@paroquias-sa-ss.org.br
- Telefone: (24) 99999-9999

## Notas Importantes

1. **Segurança**: Sempre use senhas fortes e mantenha o sistema atualizado
2. **Backup**: Configure backups regulares do banco de dados e arquivos
3. **Monitoramento**: Verifique logs regularmente para identificar problemas
4. **Performance**: Monitore uso de CPU, memória e espaço em disco
5. **SSL**: Use HTTPS em produção para proteger dados sensíveis

Este guia fornece uma instalação básica. Para ambientes de alta disponibilidade, considere configurações adicionais como clustering, load balancing e replicação de banco de dados.