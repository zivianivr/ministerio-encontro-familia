-- Inserir dados de exemplo na tabela casais
INSERT INTO public.casais (
  numero_inscricao, nome_ele, religiao_ele, contato_ele, nome_ela, religiao_ela, contato_ela,
  paroquia, comunidade, bairro, endereco, ecc_primeira_etapa, data_ecc, local_ecc
) VALUES 
  (1, 'João Silva', 'Católica', '(24) 99999-1111', 'Maria Silva', 'Católica', '(24) 99999-2222', 
   'Santo Antônio', 'Santa Rita', 'Centro', 'Rua das Flores, 123', 'VII ECC', '2024-03-15', 'CIEP Glória Roussin'),
  (2, 'Pedro Santos', 'Católica', '(24) 88888-1111', 'Ana Santos', 'Católica', '(24) 88888-2222',
   'São Sebastião', 'São José', 'Vila Nova', 'Rua do Comércio, 456', 'VI ECC', '2023-11-20', 'Casa Paroquial'),
  (3, 'Carlos Oliveira', 'Católica', '(24) 77777-1111', 'Lucia Oliveira', 'Católica', '(24) 77777-2222',
   'Santo Antônio', 'Nossa Senhora', 'Bela Vista', 'Av. Principal, 789', 'VIII ECC', '2024-06-10', 'Salão Paroquial');

-- Criar usuário administrador padrão
INSERT INTO public.usuarios (nome, email, role, auth_user_id) 
VALUES ('Administrador', 'admin@sistema-ecc.com', 'admin', null);

-- Atualizar o usuário existente para ter role admin se for o email especial
UPDATE public.usuarios 
SET role = 'admin' 
WHERE email = 'rafael.ziviani@live.com';