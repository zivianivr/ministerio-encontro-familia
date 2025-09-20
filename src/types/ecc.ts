export interface Casal {
  id: string;
  numeroInscricao: number;
  
  // Dados do homem
  nomeEle: string;
  religiaoEle: string;
  contatoEle: string;
  
  // Dados da mulher
  nomeEla: string;
  religiaoEla: string;
  contatoEla: string;
  
  // Dados gerais
  paroquia: string;
  comunidade: string;
  bairro: string;
  endereco: string;
  
  // ECC
  eccPrimeiraEtapa: string;
  dataEcc: string;
  localEcc: string;
  
  // Foto
  fotoUrl?: string;
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Equipe {
  id: string;
  nome: string;
  coordenador: {
    casal: Casal;
    numeroInscricao: number;
  };
  casais: {
    casal: Casal;
    numeroInscricao: number;
  }[];
  descricao?: string;
}

export interface EquipeType {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
}

export const TIPOS_EQUIPES: EquipeType[] = [
  { id: "coordenacao", nome: "Coordenação Geral", descricao: "Coordenação geral do encontro", cor: "sacred" },
  { id: "sala", nome: "Equipe de Sala", descricao: "Responsável pela organização das salas", cor: "primary" },
  { id: "cafezinho", nome: "Cafezinho e Mini Mercado", descricao: "Cafezinho e vendas", cor: "gold" },
  { id: "cozinha", nome: "Cozinha", descricao: "Preparo das refeições", cor: "green-600" },
  { id: "liturgia", nome: "Liturgia", descricao: "Organização litúrgica", cor: "purple-600" },
  { id: "ordem", nome: "Equipe de Ordem", descricao: "Manutenção da ordem", cor: "blue-600" },
  { id: "acolhida", nome: "Acolhida", descricao: "Recepção dos participantes", cor: "pink-600" },
  { id: "secretaria", nome: "Secretaria", descricao: "Atividades administrativas", cor: "gray-600" },
  { id: "visitacao", nome: "Visitação", descricao: "Visitas e acompanhamento", cor: "indigo-600" },
  { id: "circulo", nome: "Círculo", descricao: "Atividades em círculo", cor: "teal-600" },
  { id: "compras", nome: "Compras", descricao: "Responsável pelas compras", cor: "orange-600" },
];

export interface EccStats {
  totalCasais: number;
  totalEquipes: number;
  casaisAtivos: number;
  proximoEcc: {
    data: string;
    local: string;
    casaisInscritos: number;
  } | null;
}