-- Verificar se há dados de teste e inserir se necessário
INSERT INTO tipos_equipes (id, nome, descricao, cor, ordem) VALUES
('coordenacao', 'Coordenação', 'Equipe de coordenação geral', 'sacred', 1),
('liturgia', 'Liturgia', 'Responsável pela liturgia dos encontros', 'primary', 2),
('secretaria', 'Secretaria', 'Organização e documentação', 'gold', 3),
('cozinha', 'Cozinha', 'Preparo das refeições', 'primary', 4),
('limpeza', 'Limpeza', 'Organização do espaço', 'primary', 5),
('montagem', 'Montagem', 'Montagem e desmontagem', 'primary', 6)
ON CONFLICT (id) DO NOTHING;

-- Inserir alguns casais de exemplo se a tabela estiver vazia
INSERT INTO casais (numero_inscricao, nome_ele, nome_ela, paroquia, data_ecc, ecc_primeira_etapa) VALUES 
(1, 'João Silva', 'Maria Silva', 'Santo Antônio', '2024-03-15', 'ECC VII'),
(2, 'Pedro Santos', 'Ana Santos', 'São Sebastião', '2024-06-20', 'ECC VIII'),
(3, 'Carlos Oliveira', 'Lucia Oliveira', 'Santo Antônio', '2024-09-10', 'ECC IX')
ON CONFLICT (numero_inscricao) DO NOTHING;

-- Inserir um encontro de exemplo
INSERT INTO encontros (nome, local, data_inicio, data_fim, status, casais_inscritos, etapa) VALUES
('ECC X', 'CIEP Glória Roussin', '2024-10-21', '2024-10-23', 'planejando', 45, 'ECC X')
ON CONFLICT DO NOTHING;